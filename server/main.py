from flask import Flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_login import LoginManager
from flask_principal import Principal
from flask_socketio import SocketIO
from flask_mail import Mail
from config import Config
from models import db, User
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}}, supports_credentials=True)
app.config.from_object(Config)
bcrypt = Bcrypt(app)
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*")
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
principal = Principal(app)
mail = Mail(app)

os.makedirs(app.config['UPLOAD_FOLDERURL'], exist_ok=True)

# Import blueprints
from routes_admin import admin_bp
from routes_user import user_bp, jwt as user_jwt
from routes_service import service_bp
from routes_auth import auth_bp
from admin_service import admin_user_bp

# Register blueprints
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(service_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(admin_user_bp, url_prefix='/api/admin')

user_jwt.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    socketio.run(app,host="0.0.0.0", debug=True, port=8080)