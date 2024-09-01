from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from uuid import uuid4
from sqlalchemy import Date
from flask_wtf import FlaskForm
from wtforms import DateField, SelectField, StringField, PasswordField
from wtforms.validators import DataRequired, Length
from flask_bcrypt import Bcrypt
from datetime import datetime

db = SQLAlchemy()
bcrypt = Bcrypt()

def get_uuid():
    return uuid4().hex

class User(UserMixin, db.Model):
    __tablename__ = 'user'
    userid = db.Column(db.String(32), primary_key=True, default=get_uuid, unique=True, nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    birth_date = db.Column(Date, nullable=False)

    def get_id(self):
        return self.userid

    @property
    def age(self):
        if not self.birth_date:
            return None
        today = datetime.today()
        age = today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))
        return age

class AudioRecord(db.Model):
    __tablename__ = 'audio_record'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(32), db.ForeignKey('user.userid'), nullable=True)
    audio_url = db.Column(db.String(200))
    transcription = db.Column(db.Text)
    time = db.Column(db.String(20), nullable=False)

    user = db.relationship('User', backref=db.backref('audio_records', lazy=True))

class sysAdmin(db.Model):
    __tablename__ = 'admin'
    admin_id = db.Column(db.Integer, primary_key=True)
    AdminName = db.Column(db.String(32), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def __repr__(self):
        return f'<sysAdmin {self.AdminName}>'

