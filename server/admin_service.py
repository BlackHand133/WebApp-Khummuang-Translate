from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Profile, AudioRecord, SysAdmin
from sqlalchemy import asc, desc, func

admin_user_bp = Blueprint('admin_user', __name__)

def is_admin():
    current_user = get_jwt_identity()
    admin = SysAdmin.query.filter_by(admin_name=current_user).first()
    if not admin:
        abort(403, description="Admin access required")

@admin_user_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    is_admin()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    sort_by = request.args.get('sort_by', 'username')
    order = request.args.get('order', 'asc')
    
    query = User.query
    
    if order == 'desc':
        query = query.order_by(getattr(User, sort_by).desc())
    else:
        query = query.order_by(getattr(User, sort_by).asc())
    
    users = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'users': [user.to_dict() for user in users.items],
        'total': users.total,
        'pages': users.pages,
        'current_page': page
    }), 200

@admin_user_bp.route('/users/<string:user_id>', methods=['GET'])
@jwt_required()
def get_user_details(user_id):
    is_admin()
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict(include_audio=True)), 200

@admin_user_bp.route('/users/<string:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    is_admin()
    user = User.query.get_or_404(user_id)
    data = request.json
    
    if 'email' in data and data['email'] != user.email:
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        user.email = data['email']
    if 'username' in data and data['username'] != user.username:
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        user.username = data['username']
    if 'is_active' in data:
        user.is_active = data['is_active']
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
    return jsonify(user.to_dict()), 200

@admin_user_bp.route('/users/<string:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    is_admin()
    user = User.query.get_or_404(user_id)
    try:
        db.session.delete(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    return jsonify({'message': 'User deleted successfully'}), 200

@admin_user_bp.route('/users/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    is_admin()
    total_users = User.query.count()
    active_users = User.query.filter_by(is_active=True).count()
    inactive_users = total_users - active_users
    
    return jsonify({
        'total_users': total_users,
        'active_users': active_users,
        'inactive_users': inactive_users
    }), 200

@admin_user_bp.route('/users/<string:user_id>/audio_records', methods=['GET'])
@jwt_required()
def get_user_audio_records(user_id):
    is_admin()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    audio_records = AudioRecord.query.filter_by(user_id=user_id).paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'audio_records': [record.to_dict() for record in audio_records.items],
        'total': audio_records.total,
        'pages': audio_records.pages,
        'current_page': page
    }), 200

@admin_user_bp.route('/users/search', methods=['GET'])
@jwt_required()
def search_users():
    is_admin()
    query = request.args.get('q', '')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    users = User.query.filter(
        (User.username.ilike(f'%{query}%')) |
        (User.email.ilike(f'%{query}%'))
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'users': [user.to_dict() for user in users.items],
        'total': users.total,
        'pages': users.pages,
        'current_page': page
    }), 200

@admin_user_bp.route('/users/advanced-search', methods=['GET'])
@jwt_required()
def advanced_search_users():
    is_admin()
    
    # รับพารามิเตอร์การค้นหา
    search_query = request.args.get('query', '')
    min_age = request.args.get('min_age', type=int)
    max_age = request.args.get('max_age', type=int)
    gender = request.args.get('gender')
    is_active = request.args.get('is_active', type=bool)
    sort_by = request.args.get('sort_by', 'username')
    order = request.args.get('order', 'asc')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    # สร้างquery
    query = User.query

    # เพิ่มเงื่อนไขการค้นหา
    if search_query:
        query = query.filter(
            (User.username.ilike(f'%{search_query}%')) |
            (User.email.ilike(f'%{search_query}%')) |
            (User.profile.has(Profile.firstname.ilike(f'%{search_query}%'))) |
            (User.profile.has(Profile.lastname.ilike(f'%{search_query}%')))
        )
    
    if min_age is not None:
        min_birth_date = datetime.now() - timedelta(days=min_age*365)
        query = query.filter(User.birth_date <= min_birth_date)
    
    if max_age is not None:
        max_birth_date = datetime.now() - timedelta(days=(max_age+1)*365)
        query = query.filter(User.birth_date > max_birth_date)
    
    if gender:
        query = query.filter(User.gender == gender)
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    # จัดเรียงผลลัพธ์
    if order == 'desc':
        query = query.order_by(desc(getattr(User, sort_by)))
    else:
        query = query.order_by(asc(getattr(User, sort_by)))

    # Pagination
    paginated_users = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'users': [user.to_dict() for user in paginated_users.items],
        'total': paginated_users.total,
        'pages': paginated_users.pages,
        'current_page': page
    }), 200