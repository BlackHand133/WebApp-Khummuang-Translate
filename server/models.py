from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
from flask_admin.contrib.sqla import ModelView
from flask_login import UserMixin
from uuid import uuid4

db = SQLAlchemy()

def get_uuid():
    return uuid4().hex

class User(UserMixin, db.Model):
    userid = db.Column(db.String(32), primary_key=True, default=get_uuid, unique=True, nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    birt_date = db.Column(db.String(10), nullable=False)

    admin = db.relationship('Admin', backref='user', uselist=False)

class Admin(db.Model):
    admin_id = db.Column(db.Integer, primary_key=True)
    userid = db.Column(db.String(32), db.ForeignKey('user.userid'))

    def __repr__(self):
        return f'<Admin {self.admin_id}>'

class AdminView(ModelView):
    can_create = True
    can_edit = True
    can_delete = True
    column_exclude_list = ['password']  # ไม่แสดง password ในหน้า admin
