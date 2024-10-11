from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request, abort, send_file, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Profile, AudioRecord, SysAdmin, AudioAnalytics
from sqlalchemy import asc, desc, func
import os

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
    
    search_query = request.args.get('query', '')
    min_age = request.args.get('min_age', type=int)
    max_age = request.args.get('max_age', type=int)
    gender = request.args.get('gender')
    is_active = request.args.get('is_active', type=bool)
    sort_by = request.args.get('sort_by', 'username')
    order = request.args.get('order', 'asc')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    query = User.query

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

    if order == 'desc':
        query = query.order_by(desc(getattr(User, sort_by)))
    else:
        query = query.order_by(asc(getattr(User, sort_by)))

    paginated_users = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'users': [user.to_dict() for user in paginated_users.items],
        'total': paginated_users.total,
        'pages': paginated_users.pages,
        'current_page': page
    }), 200

@admin_user_bp.route('/audio-records', methods=['GET'])
@jwt_required()
def get_audio_records():
    is_admin()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    sort_by = request.args.get('sort_by', 'created_at')
    order = request.args.get('order', 'desc')

    try:
        query = AudioRecord.query

        if hasattr(AudioRecord, sort_by):
            order_column = getattr(AudioRecord, sort_by)
        else:
            order_column = AudioRecord.created_at

        if order == 'desc':
            query = query.order_by(desc(order_column))
        else:
            query = query.order_by(asc(order_column))

        paginated_audio = query.paginate(page=page, per_page=per_page, error_out=False)

        audio_records = []
        for audio in paginated_audio.items:
            audio_dict = audio.to_dict()
            audio_dict.update({
                'username': audio.user.username if audio.user else None,
                'playback_url': f"/api/admin/audio/{audio.hashed_id}/stream"
            })
            audio_records.append(audio_dict)

        print(f"Total records: {paginated_audio.total}")  # Debug print
        print(f"Audio records: {audio_records}")  # Debug print

        return jsonify({
            'audio_records': audio_records,
            'total': paginated_audio.total,
            'pages': paginated_audio.pages,
            'current_page': page
        }), 200
    except Exception as e:
        print(f"Error in get_audio_records: {str(e)}")  # Debug print
        return jsonify({'error': 'An error occurred while fetching audio records'}), 500

@admin_user_bp.route('/audio-records/<string:hashed_id>', methods=['GET'])
@jwt_required()
def get_audio_record_details(hashed_id):
    is_admin()
    audio_record = AudioRecord.query.filter_by(hashed_id=hashed_id).first_or_404()
    
    audio_dict = audio_record.to_dict()
    audio_dict.update({
        'username': audio_record.user.username,
        'playback_url': f"/api/admin/audio/{audio_record.hashed_id}/stream"
    })
    if audio_record.analytics:
        audio_dict.update({
            'duration': audio_record.analytics.duration,
            'source': audio_record.analytics.source.value if audio_record.analytics.source else None,
            'rating': audio_record.analytics.rating.value if audio_record.analytics.rating else None,
            'language': audio_record.analytics.language
        })
    
    return jsonify(audio_dict), 200

@admin_user_bp.route('/audio/<string:hashed_id>/stream', methods=['GET'])
@jwt_required()
def stream_audio(hashed_id):
    is_admin()
    audio_record = AudioRecord.query.filter_by(hashed_id=hashed_id).first_or_404()
    
    audio_path = os.path.join(current_app.root_path, audio_record.audio_url)
    
    if not os.path.exists(audio_path):
        return jsonify({'error': 'Audio file not found'}), 404
    
    return send_file(audio_path, mimetype='audio/wav')

@admin_user_bp.errorhandler(404)
def file_not_found(error):
    return jsonify({'error': 'File not found'}), 404

# Initialize the blueprint
def init_app(app):
    app.register_blueprint(admin_user_bp, url_prefix='/api/admin')