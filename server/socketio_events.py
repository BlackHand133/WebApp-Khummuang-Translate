from flask_socketio import SocketIO, emit
from flask import session

from ModelASR import modelWav

def init_socketio_events(socketio: SocketIO):
    @socketio.on('start_transcription')
    def handle_start_transcription():
        def transcribe_audio_stream():
            while True:
                try:
                    audio_data = yield
                    text = modelWav.process_audio(audio_data)
                    emit('transcription_result', {'text': text})
                except GeneratorExit:
                    break

        socketio.start_background_task(target=transcribe_audio_stream)

    @socketio.on('audio_data')
    def handle_audio_data(data):
        audio_generator = session.get('audio_generator')
        if audio_generator:
            audio_generator.send(data)

    @socketio.on('stop_transcription')
    def handle_stop_transcription():
        audio_generator = session.get('audio_generator')
        if audio_generator:
            audio_generator.close()
            session.pop('audio_generator', None)

    @socketio.on('connect')
    def handle_connect():
        print('Client connected')
        emit('response', {'data': 'Connected successfully'})

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')

    @socketio.on('message')
    def handle_message(data):
        print('Received message:', data)
        emit('response', {'data': 'Message received'})
