from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
from flask_admin.contrib.sqla import ModelView
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

class sysAdmin(db.Model):
    __tablename__ = 'admin'
    admin_id = db.Column(db.Integer, primary_key=True)
    id_admin = db.Column(db.String(32), nullable=False)
    AdminName = db.Column(db.String(32), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)

    def __repr__(self):
        return f'<Admin {self.id}>'

class UserView(ModelView):
    can_create = True
    can_edit = True
    can_delete = True
    column_exclude_list = ['password']
    column_list = ['userid', 'username', 'email', 'gender', 'age']
    column_labels = {
        'birth_date': 'Date of Birth',
        'gender': 'Gender',
        'age': 'Age'
    }
    column_formatters = {
        'age': lambda v, c, m, p: m.age if m.age is not None else 'N/A'
    }
    form_overrides = {
        'birth_date': DateField,
        'gender': SelectField,
        'password': PasswordField
    }
    form_args = {
        'birth_date': {
            'label': 'Date of Birth',
            'validators': [DataRequired()]
        },
        'gender': {
            'label': 'Gender',
            'choices': [('M', 'Male'), ('F', 'Female'), ('O', 'Other')],
            'validators': [DataRequired()]
        },
        'password': {
            'label': 'Password',
            'validators': [DataRequired(), Length(min=6, max=60)]
        }
    }

    def on_model_change(self, form, model, is_created):
        if is_created:
            model.password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        return super().on_model_change(form, model, is_created)

class AdminView(ModelView):
    can_create = True
    can_edit = True
    can_delete = True
    column_exclude_list = ['password']
    column_list = ['admin_id', 'adminName', 'email']
    column_labels = {
        'admin_id': 'Admin ID',
        'adminName': 'Admin Name',
        'email': 'Email',
    }
    form_overrides = {
        'password': PasswordField
    }
    form_args = {
        'password': {
            'label': 'Password',
            'validators': [DataRequired(), Length(min=6, max=60)]
        }
    }

    def on_model_change(self, form, model, is_created):
        if is_created:
            model.password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        return super().on_model_change(form, model, is_created)