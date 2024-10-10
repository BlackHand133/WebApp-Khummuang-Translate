from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt
from models import db, AudioRecord, AudioAnalytics, TranslationLog, User, RatingEnum, SourceEnum
from sqlalchemy import func, case, and_, or_
from datetime import datetime, timedelta
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import numpy as np
from collections import Counter
from functools import wraps
from flask_caching import Cache
import logging
from sqlalchemy.exc import SQLAlchemyError
from concurrent.futures import ThreadPoolExecutor
from celery import Celery

admin_analytics_bp = Blueprint('admin_analytics', __name__)
cache = Cache(config={'CACHE_TYPE': 'simple'})
celery = Celery(__name__)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        claims = get_jwt()
        if not claims.get('is_admin', False):
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

def handle_errors(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except SQLAlchemyError as e:
            db.session.rollback()
            logger.error(f"Database error in {f.__name__}: {str(e)}")
            return jsonify({'error': 'A database error occurred'}), 500
        except Exception as e:
            logger.error(f"Error in {f.__name__}: {str(e)}")
            return jsonify({'error': 'An unexpected error occurred'}), 500
    return decorated_function

@admin_analytics_bp.route('/audio_statistics', methods=['GET'])
@jwt_required()
@admin_required
@handle_errors
@cache.cached(timeout=300, query_string=True)
def get_audio_statistics():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = db.session.query(
        func.date(AudioRecord.created_at).label('date'),
        AudioAnalytics.source,
        AudioAnalytics.rating,
        func.count(AudioRecord.id).label('count'),
        func.avg(AudioAnalytics.duration).label('avg_duration')
    ).join(AudioAnalytics)
    
    if start_date:
        query = query.filter(AudioRecord.created_at >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(AudioRecord.created_at <= datetime.fromisoformat(end_date))
    
    results = query.group_by(
        func.date(AudioRecord.created_at),
        AudioAnalytics.source,
        AudioAnalytics.rating
    ).all()
    
    return jsonify([{
        'date': result.date.isoformat(),
        'source': result.source.value,
        'rating': result.rating.value,
        'count': result.count,
        'avg_duration': float(result.avg_duration) if result.avg_duration else 0
    } for result in results])

@admin_analytics_bp.route('/translation_trend', methods=['GET'])
@jwt_required()
@admin_required
@handle_errors
@cache.cached(timeout=300, query_string=True)
def get_translation_trend():
    days = int(request.args.get('days', 30))
    start_date = datetime.utcnow() - timedelta(days=days)
    
    query = db.session.query(
        func.date(TranslationLog.timestamp).label('date'),
        TranslationLog.source_language,
        TranslationLog.target_language,
        func.sum(TranslationLog.count).label('total_translations')
    ).filter(TranslationLog.timestamp >= start_date)
    
    results = query.group_by(
        func.date(TranslationLog.timestamp),
        TranslationLog.source_language,
        TranslationLog.target_language
    ).order_by(func.date(TranslationLog.timestamp)).all()
    
    return jsonify([{
        'date': result.date.isoformat(),
        'source_language': result.source_language,
        'target_language': result.target_language,
        'total_translations': result.total_translations
    } for result in results])

@admin_analytics_bp.route('/user_activity_summary', methods=['GET'])
@jwt_required()
@admin_required
@handle_errors
@cache.cached(timeout=300, query_string=True)
def get_user_activity_summary():
    days = int(request.args.get('days', 30))
    start_date = datetime.utcnow() - timedelta(days=days)
    
    query = db.session.query(
        User.user_id,
        User.username,
        func.count(AudioRecord.id).label('audio_count'),
        func.sum(TranslationLog.count).label('translation_count'),
        func.max(AudioRecord.created_at).label('last_audio_activity'),
        func.max(TranslationLog.timestamp).label('last_translation_activity')
    ).outerjoin(AudioRecord, User.user_id == AudioRecord.user_id)\
     .outerjoin(TranslationLog, User.user_id == TranslationLog.user_id)\
     .filter(or_(
         AudioRecord.created_at >= start_date,
         TranslationLog.timestamp >= start_date
     ))\
     .group_by(User.user_id, User.username)
    
    results = query.all()
    
    return jsonify([{
        'user_id': result.user_id,
        'username': result.username,
        'audio_count': result.audio_count or 0,
        'translation_count': result.translation_count or 0,
        'last_audio_activity': result.last_audio_activity.isoformat() if result.last_audio_activity else None,
        'last_translation_activity': result.last_translation_activity.isoformat() if result.last_translation_activity else None
    } for result in results])

@admin_analytics_bp.route('/system_performance', methods=['GET'])
@jwt_required()
@admin_required
@handle_errors
@cache.cached(timeout=300, query_string=True)
def get_system_performance():
    days = int(request.args.get('days', 30))
    start_date = datetime.utcnow() - timedelta(days=days)
    
    audio_query = db.session.query(
        func.avg(AudioAnalytics.duration).label('avg_audio_processing_time'),
        func.count(case([(AudioRecord.transcription != None, 1)])).label('successful_transcriptions'),
        func.count(AudioRecord.id).label('total_audio_records')
    ).join(AudioRecord).filter(AudioRecord.created_at >= start_date)
    
    translation_query = db.session.query(
        func.avg(TranslationLog.count).label('avg_translations_per_request'),
        func.count(TranslationLog.id).label('total_translation_requests')
    ).filter(TranslationLog.timestamp >= start_date)
    
    audio_result = audio_query.first()
    translation_result = translation_query.first()
    
    return jsonify({
        'avg_audio_processing_time': float(audio_result.avg_audio_processing_time) if audio_result.avg_audio_processing_time else 0,
        'transcription_success_rate': (audio_result.successful_transcriptions / audio_result.total_audio_records * 100) if audio_result.total_audio_records > 0 else 0,
        'avg_translations_per_request': float(translation_result.avg_translations_per_request) if translation_result.avg_translations_per_request else 0,
        'total_translation_requests': translation_result.total_translation_requests or 0
    })

@admin_analytics_bp.route('/user_segmentation', methods=['GET'])
@jwt_required()
@admin_required
@handle_errors
@cache.cached(timeout=600, query_string=True)
def get_user_segmentation():
    days = int(request.args.get('days', 30))
    start_date = datetime.utcnow() - timedelta(days=days)

    query = db.session.query(
        User.user_id,
        func.count(AudioRecord.id).label('audio_count'),
        func.sum(TranslationLog.count).label('translation_count')
    ).outerjoin(AudioRecord, User.user_id == AudioRecord.user_id)\
     .outerjoin(TranslationLog, User.user_id == TranslationLog.user_id)\
     .filter(and_(
         or_(AudioRecord.created_at >= start_date, TranslationLog.timestamp >= start_date),
         User.user_id != 'guest'
     ))\
     .group_by(User.user_id).all()

    df = pd.DataFrame([{
        'user_id': result.user_id,
        'audio_count': result.audio_count or 0,
        'translation_count': result.translation_count or 0
    } for result in query])

    if len(df) < 3:  # Not enough data for clustering
        return jsonify([])

    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(df[['audio_count', 'translation_count']])

    kmeans = KMeans(n_clusters=min(3, len(df)), random_state=42)
    df['cluster'] = kmeans.fit_predict(scaled_features)

    cluster_info = df.groupby('cluster').agg({
        'audio_count': 'mean',
        'translation_count': 'mean',
        'user_id': 'count'
    }).reset_index()

    cluster_info.columns = ['cluster', 'avg_audio_count', 'avg_translation_count', 'user_count']
    
    return jsonify(cluster_info.to_dict(orient='records'))

@admin_analytics_bp.route('/content_analysis', methods=['GET'])
@jwt_required()
@admin_required
@handle_errors
@cache.cached(timeout=600, query_string=True)
def get_content_analysis():
    days = int(request.args.get('days', 30))
    start_date = datetime.utcnow() - timedelta(days=days)

    query = db.session.query(
        AudioRecord.transcription
    ).filter(AudioRecord.created_at >= start_date).all()

    transcriptions = [record.transcription for record in query if record.transcription]
    
    if not transcriptions:
        return jsonify({'word_frequency': []})

    # Simple word frequency analysis
    words = ' '.join(transcriptions).lower().split()
    word_freq = Counter(words).most_common(20)

    return jsonify({
        'word_frequency': [{'word': word, 'count': count} for word, count in word_freq]
    })

def invalidate_analytics_cache():
    cache.delete_memoized(get_audio_statistics)
    cache.delete_memoized(get_translation_trend)
    cache.delete_memoized(get_user_activity_summary)
    cache.delete_memoized(get_system_performance)
    cache.delete_memoized(get_user_segmentation)
    cache.delete_memoized(get_content_analysis)

@celery.task
def generate_monthly_report():
    # Implement monthly report generation logic here
    pass

@admin_analytics_bp.route('/generate_monthly_report', methods=['POST'])
@jwt_required()
@admin_required
def trigger_monthly_report():
    task = generate_monthly_report.delay()
    return jsonify({'task_id': task.id}), 202

@admin_analytics_bp.route('/health', methods=['GET'])
def health_check():
    try:
        # Check database connection
        db.session.query("1").from_statement(db.text("SELECT 1")).all()
        return jsonify({'status': 'healthy'}), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500   

def init_app(app):
    cache.init_app(app)
    app.register_blueprint(admin_analytics_bp, url_prefix='/api/admin/analytics')