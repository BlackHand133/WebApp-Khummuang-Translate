from flask import jsonify, request
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from models import db, User, Admin
from flask import Blueprint, redirect, url_for


admin_bp = Blueprint('admin_bp', __name__)

bcrypt = Bcrypt()


@admin_bp.route('/admin')
def admin_index():
    return redirect(url_for('admin.index'))  # Redirect ไปยังหน้า admin interface

@admin_bp.route('/api/create_admin', methods=['POST'])
def create_admin():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    gender = data.get('gender')
    age = data.get('ageGroup')

    if not username or not email or not password or not gender or not age:
        return jsonify({'error': 'กรุณากรอกข้อมูลที่จำเป็น'}), 400

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({'error': 'Username or email already exists'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password=hashed_password, gender=gender, age=age)
    db.session.add(new_user)

    # สร้าง Admin
    admin_user = Admin(user=new_user)
    db.session.add(admin_user)

    db.session.commit()
    access_token = create_access_token(identity=username)

    return jsonify({'message': 'Admin created successfully', 'access_token': access_token}), 201
