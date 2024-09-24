from datetime import datetime, timedelta
import hashlib
import os

def calculate_expiration_date(source, rating):
    from models import SourceEnum, RatingEnum
    today = datetime.utcnow()
    
    if source == SourceEnum.MICROPHONE:
        if rating == RatingEnum.UNKNOWN:
            return today + timedelta(days=7)
        elif rating == RatingEnum.LIKE:
            return today + timedelta(days=90)
        else:  # DISLIKE
            return today + timedelta(days=30)
    elif source == SourceEnum.UPLOAD:
        if rating == RatingEnum.UNKNOWN:
            return today + timedelta(days=30)
        elif rating == RatingEnum.LIKE:
            return today + timedelta(days=180)
        else:  # DISLIKE
            return today + timedelta(days=60)

def generate_audio_hash(audio_content):
    return hashlib.sha256(audio_content).hexdigest()

def save_audio_record(user_id, audio_url, transcription, duration, language, audio_content, source):
    from models import AudioRecord, db, RatingEnum
    
    audio_hash = generate_audio_hash(audio_content)
    
    existing_record = AudioRecord.query.filter_by(audio_hash=audio_hash).first()
    if existing_record:
        return existing_record.id, "existing"

    audio_record = AudioRecord(
        user_id=user_id,
        audio_url=audio_url,
        transcription=transcription,
        time=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        duration=duration,
        language=language,
        audio_hash=audio_hash,
        source=source,
        rating=RatingEnum.UNKNOWN
    )
    audio_record.set_expiration_date()
    
    try:
        db.session.add(audio_record)
        db.session.commit()
        return audio_record.id, "new"
    except Exception as e:
        db.session.rollback()
        raise e

def update_audio_rating(audio_record_id, rating):
    from models import AudioRecord, db, RatingEnum
    
    try:
        audio_record = AudioRecord.query.get(audio_record_id)
        if not audio_record:
            return False, "Record not found"
        
        audio_record.rating = RatingEnum(rating)
        audio_record.set_expiration_date()
        db.session.commit()
        return True, "Rating updated successfully"
    except ValueError:
        return False, "Invalid rating value"
    except Exception as e:
        db.session.rollback()
        return False, str(e)

def cleanup_expired_records():
    from models import AudioRecord, db
    
    try:
        expired_records = AudioRecord.query.filter(AudioRecord.expiration_date <= datetime.utcnow()).all()
        for record in expired_records:
            if record.audio_url and os.path.exists(record.audio_url):
                os.remove(record.audio_url)
            db.session.delete(record)
        db.session.commit()
        return len(expired_records), "Expired records cleaned up successfully"
    except Exception as e:
        db.session.rollback()
        return 0, str(e)
    
def get_audio_records(user_id, page=1, per_page=10):
    from models import AudioRecord
    
    try:
        records = AudioRecord.query.filter_by(user_id=user_id)\
                                   .order_by(AudioRecord.created_at.desc())\
                                   .paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            "records": [record.to_dict() for record in records.items],
            "total": records.total,
            "pages": records.pages,
            "current_page": records.page
        }, "Audio records retrieved successfully"
    except Exception as e:
        return None, str(e)