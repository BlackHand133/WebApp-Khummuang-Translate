from flask import Flask, jsonify, request, redirect, url_for
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from models import db, User, Admin, AdminView
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, create_refresh_token, set_access_cookies, set_refresh_cookies, unset_jwt_cookies
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_admin import Admin as FlaskAdmin
from flask_principal import Principal, Permission, RoleNeed
from config import Config
from ModelASR import modelWavTH
from flask_socketio import SocketIO
from flask_caching import Cache
from admin_routes import admin_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config.from_object(Config)
bcrypt = Bcrypt(app)
socketio = SocketIO(app, cors_allowed_origins="*")
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

migrate = Migrate(app, db)
db.init_app(app)
jwt = JWTManager(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'  # ชื่อของ route ที่จะ redirect เมื่อยังไม่ได้ลงชื่อเข้าใช้

principal = Principal(app)

with app.app_context():
    db.create_all()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

app.register_blueprint(admin_bp)

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    gender = data.get('gender')
    age = data.get('age')

    if not username or not email or not password or not gender or not age:
        return jsonify({'error': 'กรุณาตรวจสอบข้อมูลที่กรอก'}), 400

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({'error': 'Username or email already exists'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password=hashed_password, gender=gender, age_group=age)
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
        login_user(user)  # Login the user using flask-login
        access_token = create_access_token(identity=username)
        refresh_token = create_refresh_token(identity=username)
        response = jsonify({'message': 'ลงชื่อเข้าใช้งานเรียบร้อยแล้ว'})
        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)

        return response
    else:
        return jsonify({'error': 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'}), 401

@app.route('/api/protected', methods=['POST', 'GET'])
@jwt_required()
@login_required
def protected():
    user_identity = current_user.username  # ใช้ current_user จาก flask-login
    return jsonify(logged_in_as=user_identity), 200

@app.route('/api/userdata', methods=['POST'])
@jwt_required()
@login_required
def get_user_data():
    user_identity = current_user.username  # ใช้ current_user จาก flask-login
    user = User.query.filter_by(username=user_identity).first()
    if user:
        is_admin = Admin.query.filter_by(userid=user.userid).first() is not None
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
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    
    response = jsonify({'message': 'Token refreshed'})
    set_access_cookies(response, new_access_token)
    
    return response

@app.route('/api/logout', methods=['POST'])
@jwt_required()
@login_required
def logout():
    logout_user()  # Logout the current user using flask-login
    response = jsonify({'message': 'Logout successful'})
    response.delete_cookie('access_token_cookie')
    response.delete_cookie('refresh_token_cookie')
    return response

@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    audio_path = "audio.wav"  # Save audio file temporarily
    file.save(audio_path)

    try:
        transcription = modelWavTH.transcribe_audio(audio_path)
        print(transcription)

        # เตรียมข้อมูลเพื่อแสดงผลใน React
        formatted_transcription = [{'word': word, 'tag': None} for word in transcription.split()]

        return jsonify({'transcription': formatted_transcription})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('message')
def handle_message(message):
    print(f'Received message: {message}')
    socketio.send('Message received')

if __name__ == "__main__":
    socketio.run(app, debug=True, port=8080)
