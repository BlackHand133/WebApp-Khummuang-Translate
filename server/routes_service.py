from flask import Blueprint, jsonify, request, current_app
from werkzeug.utils import secure_filename
import os
from models import db, AudioRecord, SourceEnum, RatingEnum, TranslationLog
from datetime import datetime
import tempfile
from flask_cors import CORS
from ModelASR.modelWav import AudioTranscriber, AudioTranscriberMic, convert_to_wav
from ModelASR.Translator import Translator
from audio_utils import save_audio_record, update_audio_rating, cleanup_expired_records, get_audio_records, create_temp_file, get_audio_duration

service_bp = Blueprint('service', __name__)
CORS(service_bp)

ALLOWED_EXTENSIONS = {'webm', 'wav', 'mp3'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

base_dir = os.path.dirname(os.path.abspath(__file__))

# สำหรับภาษาไทย
thai_dictionary_path = os.path.join(base_dir, 'ModelASR', 'data', 'THtoKM.txt')
thai_translator = Translator(vocab_path=None, dictionary_path=thai_dictionary_path)

# สำหรับคำเมือง
km_vocab_path = os.path.join(base_dir, 'ModelASR', 'data', 'KMcutting.txt')
km_dictionary_path = os.path.join(base_dir, 'ModelASR', 'data', 'KMtoTH.txt')
km_translator = Translator(vocab_path=km_vocab_path, dictionary_path=km_dictionary_path)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@service_bp.route('/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    language = request.form.get('language', 'th')
    user_id = request.form.get('user_id', 'guest')

    # แปลงภาษา
    if language == 'ไทย':
        language = 'th'
    elif language == 'คำเมือง':
        language = 'km'

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file.content_length > MAX_FILE_SIZE:
        return jsonify({'error': 'File size exceeds the maximum limit'}), 400

    if file and allowed_file(file.filename):
        try:
            # ตรวจสอบ MIME type
            if file.content_type not in ['audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/webm']:
                return jsonify({'error': 'Invalid file type'}), 400

            current_app.logger.info(f"Processing file: {file.filename}, Language: {language}, User ID: {user_id}")

            temp_file_path = create_temp_file(file)
            wav_file_path = convert_to_wav(temp_file_path)
            
            transcriber = AudioTranscriber()
            transcript = transcriber.transcribe_audio(wav_file_path, language)

            # บันทึกข้อมูลเสียง
            duration = get_audio_duration(wav_file_path)
            with open(wav_file_path, 'rb') as audio_file:
                record_id, hashed_id, status = save_audio_record(
                    user_id=user_id,
                    audio_file=audio_file,
                    transcription=transcript,
                    duration=int(duration),
                    language=language,
                    source=SourceEnum.UPLOAD
                )

            current_app.logger.info(f"Transcription completed. Record ID: {record_id}, Hashed ID: {hashed_id}")

            return jsonify({
                'transcription': transcript,
                'record_id': record_id,
                'hashed_id': hashed_id,
                'status': status
            })

        except Exception as e:
            current_app.logger.error(f"Transcription error: {str(e)}")
            return jsonify({'error': 'Transcription failed', 'details': str(e)}), 500
        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            if os.path.exists(wav_file_path):
                os.remove(wav_file_path)
    else:
        return jsonify({'error': 'File type not allowed'}), 400

@service_bp.route('/transcribe_Mic', methods=['POST'])
def transcribe_mic():
    if 'audio_file' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio_file']
    language = request.form.get('language', 'ไทย')
    user_id = request.form.get('user_id', 'guest')

    if language == 'ไทย':
        language = 'th'
    elif language == 'คำเมือง':
        language = 'km'

    if audio_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        temp_file_path = create_temp_file(audio_file)
        wav_file_path = convert_to_wav(temp_file_path)

        transcriber = AudioTranscriberMic()
        transcript = transcriber.transcribe_audio_from_microphone(wav_file_path, language)

        # บันทึกข้อมูลเสียง
        duration = get_audio_duration(wav_file_path)
        record_id, hashed_id, status = save_audio_record(
            user_id=user_id,
            audio_file=wav_file_path,  # ส่ง file path แทน file object
            transcription=transcript,
            duration=int(duration),
            language=language,
            source=SourceEnum.MICROPHONE  # ใช้ string แทน enum
        )
        
        print(f"Audio record saved. ID: {record_id}, Hashed ID: {hashed_id}, Status: {status}")

        return jsonify({
            'transcription': transcript,
            'record_id': record_id,
            'hashed_id': hashed_id
        })
    except Exception as e:
        current_app.logger.error(f"Microphone transcription error: {str(e)}")
        return jsonify({'error': 'Transcription failed', 'details': str(e)}), 500
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        if os.path.exists(wav_file_path):
            os.remove(wav_file_path)

@service_bp.route('/translate', methods=['POST'])
def translate():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON'}), 400

    text = data.get('text')
    source_lang = data.get('source_lang', 'th')
    target_lang = data.get('target_lang', 'km')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    try:
        if source_lang == 'th' and target_lang == 'km':
            translation = thai_translator.translate_text(text)
        elif source_lang == 'km' and target_lang == 'th':
            translation = km_translator.translate_text(text)
        else:
            return jsonify({'error': 'Unsupported language pair'}), 400

        # บันทึกลงฐานข้อมูล
        log_entry = TranslationLog(
            original_text=text,
            translated_text=translation,
            source_language=source_lang,
            target_language=target_lang
        )
        db.session.add(log_entry)
        db.session.commit()

        response = {
            'translation': translation,
            'source_lang': source_lang,
            'target_lang': target_lang
        }

        # Log successful translation
        current_app.logger.info(f"Successful translation: {source_lang} to {target_lang}")

        return jsonify(response)
    except Exception as e:
        error_message = f"Translation error: {str(e)}"
        current_app.logger.error(error_message)
        return jsonify({'error': 'Translation failed', 'details': str(e)}), 500

@service_bp.route('/unknown_words_report', methods=['GET'])
def unknown_words_report():
    source_lang = request.args.get('source_lang', 'th')
    if source_lang == 'th':
        report = thai_translator.get_unknown_word_report()
    elif source_lang == 'km':
        report = km_translator.get_unknown_word_report()
    else:
        return jsonify({'error': 'Unsupported language'}), 400
    
    return jsonify({'unknown_words': report})

@service_bp.route('/save_unknown_words_report', methods=['POST'])
def save_unknown_words_report():
    data = request.get_json()
    source_lang = data.get('source_lang', 'th')
    file_path = data.get('file_path', f'unknown_words_{source_lang}.csv')
    
    if source_lang == 'th':
        thai_translator.save_unknown_word_report(file_path)
    elif source_lang == 'km':
        km_translator.save_unknown_word_report(file_path)
    else:
        return jsonify({'error': 'Unsupported language'}), 400
    
    return jsonify({'message': f'Report saved to {file_path}'})

@service_bp.route('/get_audio_records', methods=['GET'])
def fetch_audio_records():
    try:
        user_id = request.args.get('user_id')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400

        records, message = get_audio_records(user_id, page, per_page)

        if records:
            return jsonify({"data": records, "message": message}), 200
        else:
            return jsonify({"error": message}), 400

    except Exception as e:
        current_app.logger.error(f"Error in fetch_audio_records: {str(e)}")
        return jsonify({"error": "An error occurred while fetching audio records"}), 500
    
@service_bp.route('/update_audio_rating', methods=['POST'])
def update_rating():
    try:
        data = request.json
        print("Received data:", data)
        if not data:
            return jsonify({"error": "No data provided"}), 400

        identifier = data.get('identifier')
        rating = data.get('rating')

        print(f"identifier: {identifier}, rating: {rating}")

        if not identifier or not rating:
            return jsonify({"error": "Missing identifier or rating"}), 400

        # แปลงค่า rating จาก frontend เป็นค่าที่ใช้ใน backend
        if rating == 'like':
            db_rating = 'LIKE'
        elif rating == 'dislike':
            db_rating = 'DISLIKE'
        else:
            db_rating = 'UNKNOWN'

        success, message = update_audio_rating(identifier, db_rating)

        if success:
            return jsonify({"message": message}), 200
        else:
            return jsonify({"error": message}), 400

    except Exception as e:
        current_app.logger.error(f"Error in update_rating: {str(e)}")
        return jsonify({"error": "An error occurred while updating the rating"}), 500

@service_bp.route('/cleanup_expired_records', methods=['POST'])
def cleanup_records():
    try:
        count, message = cleanup_expired_records()
        return jsonify({"message": f"{count} {message}"}), 200
    except Exception as e:
        current_app.logger.error(f"Error in cleanup_records: {str(e)}")
        return jsonify({"error": "An error occurred while cleaning up expired records"}), 500

@service_bp.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Not found'}), 404

@service_bp.errorhandler(500)
def internal_error(error):
    current_app.logger.error(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500