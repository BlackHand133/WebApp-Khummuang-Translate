from datetime import datetime, timedelta
import hashlib
import os
from werkzeug.utils import secure_filename
import tempfile
import shutil
import librosa

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

def save_audio_file(audio_file, user_prefix, count):
    filename = secure_filename(f"{user_prefix}_{count}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.wav")
    upload_folder = os.path.join(os.getcwd(), 'uploads', 'audio')
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, filename)
    
    if isinstance(audio_file, str):  # If audio_file is a file path
        shutil.copy(audio_file, file_path)
    else:  # If audio_file is a file-like object
        with open(file_path, 'wb') as f:
            audio_file.seek(0)
            shutil.copyfileobj(audio_file, f)
    
    return file_path

def save_audio_record(user_id, audio_file, transcription, duration, language, source):
    from models import AudioRecord, AudioAnalytics, db, RatingEnum, SourceEnum
    
    file_path = save_audio_file(audio_file, 'u' if user_id != 'guest' else 'g', AudioRecord.query.count() + 1)
    
    with open(file_path, 'rb') as audio_content:
        audio_hash = generate_audio_hash(audio_content.read())
    
    existing_record = AudioRecord.query.filter_by(audio_hash=audio_hash).first()
    if existing_record:
        os.remove(file_path)  # Remove the duplicate file
        return existing_record.id, existing_record.hashed_id, "existing"

    try:
        new_record = AudioRecord.create(
            user_id=user_id,
            audio_url=os.path.relpath(file_path, os.getcwd()),
            transcription=transcription,
            time=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            audio_hash=audio_hash
        )
        
        # ตรวจสอบว่า source เป็น SourceEnum หรือไม่ ถ้าไม่ใช่ให้แปลงเป็น enum
        source_enum = source if isinstance(source, SourceEnum) else SourceEnum(source)
        
        new_analytics = AudioAnalytics(
            audio_record_id=new_record.id,
            user_id=user_id,
            rating=RatingEnum.UNKNOWN,
            language=language,
            duration=duration,
            source=source_enum
        )
        
        # Set expiration date with the correct arguments
        new_record.expiration_date = calculate_expiration_date(source_enum, RatingEnum.UNKNOWN)
        
        db.session.add(new_record)
        db.session.add(new_analytics)
        db.session.commit()
        return new_record.id, new_record.hashed_id, "new"
    except Exception as e:
        db.session.rollback()
        os.remove(file_path)  # Remove the file if database operation fails
        print(f"Error in save_audio_record: {str(e)}")
        raise e

def update_audio_rating(identifier, rating):
    from models import AudioRecord, AudioAnalytics, db, RatingEnum
    
    try:
        print(f"Updating rating for identifier: {identifier}, new rating: {rating}")
        
        audio_record = AudioRecord.query.filter_by(hashed_id=identifier).first()
        
        if not audio_record:
            print(f"Record not found for hashed_id: {identifier}")
            return False, "Record not found"
        
        audio_analytics = AudioAnalytics.query.filter_by(audio_record_id=audio_record.id).first()
        if not audio_analytics:
            print(f"Analytics not found for audio_record_id: {audio_record.id}")
            return False, "Analytics not found"
        
        audio_analytics.rating = RatingEnum[rating]
        
        audio_record.expiration_date = calculate_expiration_date(audio_analytics.source, audio_analytics.rating)
        db.session.commit()
        print(f"Rating updated successfully for id: {audio_record.id}, hashed_id: {audio_record.hashed_id}")
        return True, "Rating updated successfully"
    except Exception as e:
        print(f"Error updating rating: {str(e)}")
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
    from models import AudioRecord, AudioAnalytics
    
    try:
        records = AudioRecord.query.join(AudioAnalytics).filter(AudioRecord.user_id == user_id)\
                                   .order_by(AudioRecord.created_at.desc())\
                                   .paginate(page=page, per_page=per_page, error_out=False)
        
        result = []
        for record in records.items:
            record_dict = record.to_dict()
            analytics = AudioAnalytics.query.filter_by(audio_record_id=record.id).first()
            if analytics:
                record_dict.update(analytics.to_dict())
            result.append(record_dict)
        
        return {
            "records": result,
            "total": records.total,
            "pages": records.pages,
            "current_page": records.page
        }, "Audio records retrieved successfully"
    except Exception as e:
        return None, str(e)

def create_temp_file(file):
    temp_file = tempfile.NamedTemporaryFile(delete=False)
    file.save(temp_file.name)
    return temp_file.name

def get_audio_duration(file_path):
    return librosa.get_duration(path=file_path)