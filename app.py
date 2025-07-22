from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
import re
import uuid
import logging
from functools import wraps
from config import get_config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, static_folder='static')

# Load configuration
config = get_config()
app.config.from_object(config)
app.secret_key = config.SECRET_KEY if hasattr(config, 'SECRET_KEY') else 'dev-key-123'
app.permanent_session_lifetime = timedelta(days=7)  # Session lasts 7 days

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()

# Import models after db initialization to avoid circular imports
from models import Driver, MaintenanceReport, Workshop, Repair

# Initialize extensions with app
db.init_app(app)
jwt.init_app(app)

# Import and register blueprints
try:
    from api import api_bp as api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api/v1')
    logger.info("API Blueprint registered successfully")
except Exception as e:
    logger.error(f"Error registering API Blueprint: {str(e)}")

# CORS Headers
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/')
def home():
    if 'user_id' in session:
        return redirect(url_for('view_reports'))
    return redirect(url_for('login'))

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_id' in session:
        return redirect(url_for('view_reports'))
        
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        remember = True if request.form.get('remember') else False
        
        if not email or not password:
            flash('Please fill in all required fields', 'danger')
            return redirect(url_for('login'))
            
        user = Driver.query.filter_by(email=email).first()
        
        if not user or not check_password_hash(user.password, password):
            flash('Invalid email or password', 'danger')
            return redirect(url_for('login'))
            
        # Login successful
        session.permanent = remember
        session['user_id'] = user.id
        session['user_name'] = user.name
        session['user_email'] = user.email
        
        next_page = request.args.get('next')
        flash('Logged in successfully!', 'success')
        return redirect(next_page or url_for('view_reports'))
        
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if 'user_id' in session:
        return redirect(url_for('view_reports'))
        
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        # Validation
        if not all([name, email, password, confirm_password]):
            flash('All fields are required', 'danger')
            return redirect(url_for('signup'))
            
        if password != confirm_password:
            flash('Passwords do not match', 'danger')
            return redirect(url_for('signup'))
            
        if len(password) < 8:
            flash('Password must be at least 8 characters long', 'danger')
            return redirect(url_for('signup'))
            
        if not validate_email(email):
            flash('Please enter a valid email address', 'danger')
            return redirect(url_for('signup'))
            
        # Check if email already exists
        if Driver.query.filter_by(email=email).first():
            flash('Email already registered. Please use a different email or login.', 'warning')
            return redirect(url_for('login'))
            
        try:
            # Create new user
            new_user = Driver(
                name=name,
                email=email,
                password=generate_password_hash(password, method='pbkdf2:sha256')
            )
            
            db.session.add(new_user)
            db.session.commit()
            
            # Log the user in
            session.permanent = True
            session['user_id'] = new_user.id
            session['user_name'] = new_user.name
            session['user_email'] = new_user.email
            
            flash('Account created successfully!', 'success')
            return redirect(url_for('view_reports'))
            
        except Exception as e:
            db.session.rollback()
            flash('An error occurred. Please try again.', 'danger')
            return redirect(url_for('signup'))
    
    return render_template('signup.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))

@app.route('/api/report-issue', methods=['POST'])
def report_issue():
    data = request.get_json()
    try:
        report = MaintenanceReport(
            truck_id=data.get('truck_id'),
            issue_description=data.get('issue_description'),
            driver_id=data.get('driver_id')
        )
        db.session.add(report)
        db.session.commit()
        return jsonify({'message': 'Issue reported successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/get-reports')
def get_reports():
    reports = MaintenanceReport.query.all()
    return jsonify([{
        'id': report.id,
        'truck_id': report.truck_id,
        'issue_description': report.issue_description,
        'reported_date': report.reported_date.isoformat() if report.reported_date else None,
        'status': report.status,
        'driver_id': report.driver_id
    } for report in reports])

@app.route('/api/get-report/<int:report_id>')
def get_report(report_id):
    report = MaintenanceReport.query.get_or_404(report_id)
    return jsonify({
        'id': report.id,
        'truck_id': report.truck_id,
        'issue_description': report.issue_description,
        'reported_date': report.reported_date.isoformat() if report.reported_date else None,
        'status': report.status,
        'driver_id': report.driver_id,
        'driver_name': report.driver.name if report.driver else 'Unknown'
    })

@app.route('/reports')
@login_required
def view_reports():
    return render_template('reports.html')

@app.route('/report-issue')
@login_required
def report_issue_page():
    return render_template('report_issue.html')

def create_tables():
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Import and run database initialization if needed
        if os.environ.get('FLASK_ENV') == 'development':
            from init_db import init_db
            init_db()

if __name__ == '__main__':
    # Only create tables if we're not in a production environment
    if os.environ.get('FLASK_ENV') != 'production':
        create_tables()
    
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'False') == 'True')
