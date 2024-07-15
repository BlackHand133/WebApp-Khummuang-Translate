from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from models import db, User, Admin
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, create_refresh_token, set_access_cookies, set_refresh_cookies, unset_jwt_cookies
import secrets

from ModelASR import modelWavTH

app = Flask(__name__)   
CORS(app, resources={r"/api/*": {"origins": "*"}})
bcrypt = Bcrypt(app)

app.config['SECRET_KEY'] = 'I_am_Number_Four_Five'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///appDB.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = secrets.token_hex(16)

migrate = Migrate(app, db)
db.init_app(app)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    gender = data.get('gender')
    age_group = data.get('ageGroup')

    if not username or not email or not password or not gender or not age_group:
        return jsonify({'error': 'กรุณาตรวจสอบข้อมูลที่กรอก'}), 400

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({'error': 'Username or email already exists'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password=hashed_password, gender=gender, age_group=age_group)
    db.session.add(new_user)
    db.session.commit()
    access_token = create_access_token(identity=username)

    return jsonify({'message': 'User registered successfully', 'access_token': access_token}), 201

@app.route('/api/login', methods=['POST'])
@jwt_required(optional=True)
def login():
    current_user = get_jwt_identity()
    if current_user:
        return jsonify({'error': 'You are already logged in'}), 400

    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Please provide username and password'}), 400

    user = User.query.filter_by(username=username).first()

    if user and bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(identity=username)
        refresh_token = create_refresh_token(identity=username)
        response = jsonify({'message': 'ลงชื่อเข้าใช้งานเรียบร้อยแล้ว'})
        set_access_cookies(response, access_token, max_age=86400)
        set_refresh_cookies(response, refresh_token, max_age=86400)

        return response
    else:
        return jsonify({'error': 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'}), 401

@app.route('/api/protected', methods=['POST', 'GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

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
    set_access_cookies(response, new_access_token, max_age=86400, httponly=True, secure=True)
    
    return response

@app.route('/api/userdata', methods=['POST'])
@jwt_required()
def get_user_data():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if user:
        is_admin = Admin.query.filter_by(userid=user.userid).first() is not None
        return jsonify({'username': user.username, 'is_admin': is_admin}), 200
    else:
        return jsonify({'error': 'User not found'}), 404

@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
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

    audio_path = "audio.wav"  # Save audio file temporarily
    file.save(audio_path)

    try:
        transcription = modelWavTH.transcribe_audio(audio_path)
        #tagged_transcription = modelWavTH.tag_text(transcription)
        #print(tagged_transcription)
        print(transcription)

        # เตรียมข้อมูลเพื่อแสดงผลใน React
        formatted_transcription = [{'word': word, 'tag': None} for word in transcription.split()]
        #for word, tag in tagged_transcription:
            # กำหนดสีของเส้นใต้ตามประเภทของคำ
        #    formatted_transcription.append({'word': word, 'tag': tag,})

        return jsonify({'transcription': formatted_transcription})
    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True, port=8080)

