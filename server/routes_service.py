from flask import Blueprint, jsonify, request
from ModelASR.modelWav import AudioTranscriberMic, AudioTranscriber
from ModelASR.Translator import Translator
import os
from werkzeug.utils import secure_filename
from config import Config
from models import db, AudioRecord
from datetime import datetime

service_bp = Blueprint('service', __name__)

ALLOWED_EXTENSIONS = {'webm', 'wav', 'mp3'}

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

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(base_dir, 'uploads', filename)
        file.save(file_path)

        transcriber = AudioTranscriber(file_path, "TH")
        transcript = transcriber.transcribe()

        return jsonify({'transcription': transcript})

    return jsonify({'error': 'Invalid file type'}), 400

@service_bp.route('/translate', methods=['POST'])
def translate():
    data = request.get_json()
    text = data.get('text')
    source_lang = data.get('source_lang', 'TH')
    target_lang = data.get('target_lang', 'KM')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    if source_lang == 'TH' and target_lang == 'KM':
        translation = thai_translator.translate(text)
    elif source_lang == 'KM' and target_lang == 'TH':
        translation = km_translator.translate(text)
    else:
        return jsonify({'error': 'Unsupported language pair'}), 400

    return jsonify({'translation': translation})

@service_bp.route('/record_audio', methods=['POST'])
def record_audio():
    file = request.files.get('file')
    language = request.form.get('language')

    if not file or not language:
        return jsonify({'error': 'No file or language provided'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(base_dir, 'uploads', filename)
        file.save(file_path)

        transcriber = AudioTranscriber(file_path, language)
        transcript = transcriber.transcribe()

        return jsonify({'transcription': transcript})

    return jsonify({'error': 'Invalid file type'}), 400

@service_bp.route('/transcribe_Mic', methods=['POST'])
def transcribe_mic():
    data = request.json
    audio_data = data.get('audio_data')
    language = data.get('language')

    if not audio_data or not language:
        return jsonify({'error': 'No audio data or language provided'}), 400

    # Handle audio data and perform transcription
    transcriber = AudioTranscriberMic(audio_data, language)
    transcript = transcriber.transcribe()

    return jsonify({'transcription': transcript})

@service_bp.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Service is running'})
