from flask import Blueprint, jsonify, request, current_app
from werkzeug.utils import secure_filename
import os
from models import db, AudioRecord
from datetime import datetime
import tempfile
from flask_cors import CORS
from ModelASR.modelWav import AudioTranscriber, AudioTranscriberMic, convert_to_wav, process_and_save_audio, convert_and_save_audio_file
from ModelASR.Translator import Translator
from uuid import uuid4

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
    language = request.form.get('language', 'th')  # เปลี่ยนค่าเริ่มต้นเป็น 'th'

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file.content_length > MAX_FILE_SIZE:
        return jsonify({'error': 'File size exceeds the maximum limit'}), 400

    if file and allowed_file(file.filename):
        try:
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                file.save(temp_file.name)
                wav_file_path = convert_to_wav(temp_file.name)
                
                transcriber = AudioTranscriber()
                transcript = transcriber.transcribe_audio(wav_file_path, language)

                return jsonify({'transcription': transcript})
        except Exception as e:
            current_app.logger.error(f"Transcription error: {str(e)}")
            return jsonify({'error': 'Transcription failed', 'details': str(e)}), 500
        finally:
            if os.path.exists(temp_file.name):
                os.remove(temp_file.name)
            if os.path.exists(wav_file_path):
                os.remove(wav_file_path)

    return jsonify({'error': 'Invalid file type'}), 400

@service_bp.route('/translate', methods=['POST'])
def translate():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON'}), 400

    text = data.get('text')
    source_lang = data.get('source_lang', 'th')  # เปลี่ยนค่าเริ่มต้นเป็น 'th'
    target_lang = data.get('target_lang', 'km')  # เปลี่ยนค่าเริ่มต้นเป็น 'km'

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    try:
        if source_lang == 'th' and target_lang == 'km':
            translation = thai_translator.translate_sentence(text)
        elif source_lang == 'km' and target_lang == 'th':
            translation = km_translator.translate_sentence(text)
        else:
            return jsonify({'error': 'Unsupported language pair'}), 400

        return jsonify({'translation': translation})
    except Exception as e:
        current_app.logger.error(f"Translation error: {str(e)}")
        return jsonify({'error': 'Translation failed', 'details': str(e)}), 500

@service_bp.route('/transcribe_Mic', methods=['POST'])
def transcribe_mic():
    if 'audio_file' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio_file']
    language = request.form.get('language', 'ไทย')

    # แปลงภาษาให้สอดคล้องกับ frontend
    if language == 'ไทย':
        language = 'th'
    elif language == 'คำเมือง':
        language = 'km'

    if audio_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_file:
            audio_file.save(temp_file.name)
            temp_file_path = temp_file.name

        # แปลงไฟล์ webm เป็น wav
        wav_file_path = convert_to_wav(temp_file_path)

        transcriber = AudioTranscriberMic()
        transcript = transcriber.transcribe_audio_from_microphone(wav_file_path, language)

        return jsonify({'transcription': transcript})
    except Exception as e:
        current_app.logger.error(f"Microphone transcription error: {str(e)}")
        return jsonify({'error': 'Transcription failed', 'details': str(e)}), 500
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        if os.path.exists(wav_file_path):
            os.remove(wav_file_path)

@service_bp.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Service is running'})

# เพิ่ม error handler สำหรับ 404 และ 500 errors
@service_bp.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Not found'}), 404

@service_bp.errorhandler(500)
def internal_error(error):
    current_app.logger.error(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

@service_bp.route('/record_audio', methods=['POST'])
def record_audio():
    try:
        if 'audio_file' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio_file']
        user_id = request.form.get('user_id')
        language = request.form.get('language')
        transcription = request.form.get('transcription')
        duration = request.form.get('duration')

        if not audio_file or not user_id or not language or not transcription or not duration:
            return jsonify({"error": "Missing required data"}), 400

        # กำหนดประเภทผู้ใช้
        user_type = 'g' if user_id == 'guest' else 'u'

        # หา ID ถัดไป
        last_record = AudioRecord.query.order_by(AudioRecord.id.desc()).first()
        next_id = (last_record.id + 1) if last_record else 1

        # แปลงและบันทึกไฟล์เสียง
        file_path = convert_and_save_audio_file(audio_file, user_type, next_id)

        # สร้างและบันทึกรายการในฐานข้อมูล
        new_record = AudioRecord(
            user_id=user_id,
            audio_url=f"/uploads/audio/{os.path.basename(file_path)}",
            transcription=transcription,
            time=datetime.now(),
            duration=int(duration),
            language=language
        )
        db.session.add(new_record)
        db.session.commit()

        return jsonify({"message": "Audio record saved successfully", "record_id": new_record.id}), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in record_audio: {str(e)}")
        return jsonify({"error": str(e)}), 500