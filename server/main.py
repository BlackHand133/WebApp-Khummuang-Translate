from flask import Flask, jsonify, request, redirect, session, url_for
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from models import db, User, sysAdmin, AdminView ,UserView
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity, set_access_cookies, set_refresh_cookies, unset_jwt_cookies
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_admin import Admin as FlaskAdmin
from flask_principal import Principal
from config import Config
from ModelASR import modelWavTH
from ModelASR.modelWavTH import transcribe_audio_from_microphone
from ModelASR.Translator import Translator
from admin_routes import admin_bp
from flask_socketio import SocketIO, emit
from flask_admin.base import AdminIndexView,expose
from datetime import datetime
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config.from_object(Config)
bcrypt = Bcrypt(app)

migrate = Migrate(app, db)
db.init_app(app)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*")  # เพิ่มการตั้งค่า SocketIO

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

principal = Principal(app)

ALLOWED_EXTENSIONS = {'webm', 'wav', 'mp3'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Paths to the data files
base_dir = os.path.dirname(os.path.abspath(__file__))
vocab_path = os.path.join(base_dir, 'ModelASR', 'data', 'KMcutting.txt')
dictionary_path = os.path.join(base_dir, 'ModelASR', 'data', 'KMtoTH.txt')

# Create an instance of Translator
translator = Translator(vocab_path, dictionary_path)

with app.app_context():
    db.create_all()

@login_manager.user_loader
def load_user(user_id):
    try:
        return User.query.get(int(user_id))
    except (ValueError, TypeError):
        return None

class MyAdminIndexView(AdminIndexView):
    def is_accessible(self):
        return current_user.is_authenticated and getattr(current_user, 'is_admin', False)
    
    @expose('/')
    def index(self):
        return self.render('admin/index.html')

# การตั้งค่า Flask Admin
admin = FlaskAdmin(app, name='Admin Dashboard', template_mode='bootstrap4')
admin.add_view(UserView(User, db.session))  # เพิ่มวิวสำหรับ User table
admin.add_view(AdminView(sysAdmin, db.session))  # เพิ่มวิวสำหรับ Admin table

# ลงทะเบียน Blueprint
app.register_blueprint(admin_bp)    

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    gender = data.get('gender')
    birth_date_str = data.get('birth_date')

    if not username or not email or not password or not gender or not birth_date_str:
        return jsonify({'error': 'กรุณาตรวจสอบข้อมูลที่กรอก'}), 400

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({'error': 'Username or email already exists'}), 400

    try:
        birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    new_user = User(username=username, email=email, password=hashed_password, gender=gender, birth_date=birth_date)
    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=username)
    refresh_token = create_refresh_token(identity=username)

    return jsonify({'message': 'User registered successfully', 'access_token': access_token, 'refresh_token': refresh_token}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Please provide username and password'}), 400

    user = User.query.filter_by(username=username).first()

    if user and bcrypt.check_password_hash(user.password, password):
        login_user(user)
        access_token = create_access_token(identity=username)
        refresh_token = create_refresh_token(identity=username)
        response = jsonify({'message': 'Login successful'})
        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)

        return response
    else:
        return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/api/protected', methods=['POST', 'GET'])
@jwt_required()
@login_required
def protected():
    user_identity = current_user.username
    return jsonify(logged_in_as=user_identity), 200

@app.route('/api/userdata', methods=['POST'])
@jwt_required()
@login_required
def get_user_data():
    user_identity = current_user.username
    user = User.query.filter_by(username=user_identity).first()
    if user:
        is_admin = sysAdmin.query.filter_by(userid=user.userid).first() is not None
        return jsonify({'username': user.username, 'is_admin': is_admin}), 200
    else:
        return jsonify({'error': 'User not found'}), 404

@app.route('/api/check_token', methods=['POST', 'OPTIONS'])
def check_token():
    if request.method == 'OPTIONS':
        return '', 204
    return jsonify({'message': 'Token check passed'}), 200

@app.route('/api/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_identity = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_identity)
    
    response = jsonify({'message': 'Token refreshed'})
    set_access_cookies(response, new_access_token)
    
    return response

@app.route('/api/logout', methods=['POST'])
@jwt_required()
@login_required
def logout():
    logout_user()
    response = jsonify({'message': 'Logout successful'})
    unset_jwt_cookies(response)
    return response

@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    audio_path = "audio.wav"
    file.save(audio_path)

    try:
        transcription = modelWavTH.transcribe_audio(audio_path)
        formatted_transcription = [{'word': word, 'tag': None} for word in transcription.split()]

        return jsonify({'transcription': formatted_transcription})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transcribe_Mic', methods=['POST'])
def transcribe_mic():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    # Ensure the uploads folder exists
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    try:
        # แปลงไฟล์เสียงเป็น WAV
        wav_file_path = modelWavTH.convert_to_wav(file_path)
        
        # ถอดข้อความจากไฟล์ WAV
        result = transcribe_audio_from_microphone(wav_file_path)
        return jsonify({'transcription': result}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/translate', methods=['POST'])
def translate():
    data = request.get_json()
    sentence = data.get('sentence')

    if not sentence:
        return jsonify({'error': 'No sentence provided'}), 400

    translated_sentence = translator.translate_sentence(sentence)
    return jsonify({'translated_sentence': translated_sentence}), 200

# SocketIO events

@socketio.on('start_transcription')
def handle_start_transcription():
    def transcribe_audio_stream():
        while True:
            try:
                audio_data = yield
                text = modelWavTH.process_audio(audio_data)
                emit('transcription_result', {'text': text})
            except GeneratorExit:
                break

    # เก็บ generator ไว้ใน session
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

if __name__ == "__main__":
    socketio.run(app, debug=True, port=8080)
