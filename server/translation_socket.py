from flask_socketio import SocketIO, emit
from ModelASR.Translator import Translator
from models import db, TranslationLog
import os

def setup_translation_socket(socketio, app):
    base_dir = os.path.dirname(os.path.abspath(__file__))

    # สำหรับภาษาไทย
    thai_dictionary_path = os.path.join(base_dir, 'ModelASR', 'data', 'THtoKM.txt')
    thai_translator = Translator(vocab_path=None, dictionary_path=thai_dictionary_path)

    # สำหรับคำเมือง
    km_vocab_path = os.path.join(base_dir, 'ModelASR', 'data', 'KMcutting.txt')
    km_dictionary_path = os.path.join(base_dir, 'ModelASR', 'data', 'KMtoTH.txt')
    km_translator = Translator(vocab_path=km_vocab_path, dictionary_path=km_dictionary_path)

    @socketio.on('connect')
    def handle_connect():
        print('Client connected')

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')

    @socketio.on('translate')
    def handle_translation(data):
        text = data['text']
        source_lang = data['source_lang']
        target_lang = data['target_lang']

        try:
            if source_lang == 'th' and target_lang == 'km':
                translation = thai_translator.translate_text(text)
            elif source_lang == 'km' and target_lang == 'th':
                translation = km_translator.translate_text(text)
            else:
                raise ValueError('Unsupported language pair')

            # บันทึกลงฐานข้อมูล
            with app.app_context():
                log_entry = TranslationLog(
                    original_text=text,
                    translated_text=translation,
                    source_language=source_lang,
                    target_language=target_lang
                )
                db.session.add(log_entry)
                db.session.commit()

            emit('translation_result', {
                'type': 'translation',
                'text': translation,
                'source_lang': source_lang,
                'target_lang': target_lang
            })

        except Exception as e:
            app.logger.error(f"Translation error: {str(e)}")
            emit('translation_result', {'type': 'error', 'message': str(e)})

    @socketio.on('unknown_words_report')
    def handle_unknown_words_report(data):
        source_lang = data.get('source_lang', 'th')
        if source_lang == 'th':
            report = thai_translator.get_unknown_word_report()
        elif source_lang == 'km':
            report = km_translator.get_unknown_word_report()
        else:
            emit('report_result', {'error': 'Unsupported language'})
            return

        emit('report_result', {'unknown_words': report})

    @socketio.on('save_unknown_words_report')
    def handle_save_unknown_words_report(data):
        source_lang = data.get('source_lang', 'th')
        file_path = data.get('file_path', f'unknown_words_{source_lang}.csv')

        if source_lang == 'th':
            thai_translator.save_unknown_word_report(file_path)
        elif source_lang == 'km':
            km_translator.save_unknown_word_report(file_path)
        else:
            emit('save_report_result', {'error': 'Unsupported language'})
            return

        emit('save_report_result', {'message': f'Report saved to {file_path}'})