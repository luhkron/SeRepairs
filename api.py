from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity,
    create_refresh_token, get_jwt
)
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import timedelta
import os
from app import db
from models import Driver, MaintenanceReport, Repair, Workshop
from PIL import Image
import io
import base64
import uuid

# Create a Blueprint for the API
api_bp = Blueprint('api', __name__)

# Helper function to save image
def save_image(base64_img, folder='reports'):
    try:
        # Remove the data:image/...;base64, part
        if ',' in base64_img:
            base64_img = base64_img.split(',')[1]
            
        img_data = base64.b64decode(base64_img)
        img = Image.open(io.BytesIO(img_data))
        
        # Create uploads directory if it doesn't exist
        upload_folder = os.path.join(current_app.static_folder, 'uploads', folder)
        os.makedirs(upload_folder, exist_ok=True)
        
        # Generate a unique filename
        filename = f"{uuid.uuid4()}.jpg"
        filepath = os.path.join(upload_folder, filename)
        
        # Save the image
        img.save(filepath, 'JPEG')
        
        return f"/static/uploads/{folder}/{filename}"
    except Exception as e:
        current_app.logger.error(f"Error saving image: {str(e)}")
        return None

# Authentication Endpoints
@api_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ['name', 'email', 'password']):
        return jsonify({"msg": "Missing required fields"}), 400
    
    # Check if user already exists
    if Driver.query.filter_by(email=data['email']).first():
        return jsonify({"msg": "Email already registered"}), 400
    
    try:
        # Create new user
        new_user = Driver(
            name=data['name'],
            email=data['email'],
            password=generate_password_hash(data['password'], method='pbkdf2:sha256')
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Generate tokens
        access_token = create_access_token(identity=new_user.id)
        refresh_token = create_refresh_token(identity=new_user.id)
        
        return jsonify({
            "msg": "User created successfully",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "email": new_user.email
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500

@api_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"msg": "Missing email or password"}), 400
    
    user = Driver.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"msg": "Invalid email or password"}), 401
    
    # Generate tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }), 200

@api_bp.route('/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_token = create_access_token(identity=current_user)
    return jsonify({"access_token": new_token}), 200

# Report Endpoints
@api_bp.route('/reports', methods=['GET'])
@jwt_required()
def get_user_reports():
    user_id = get_jwt_identity()
    reports = MaintenanceReport.query.filter_by(driver_id=user_id).all()
    
    return jsonify([{
        'id': report.id,
        'truck_id': report.truck_id,
        'issue_description': report.issue_description,
        'reported_date': report.reported_date.isoformat(),
        'status': report.status,
        'image_url': report.image_url
    } for report in reports]), 200

@api_bp.route('/reports', methods=['POST'])
@jwt_required()
def create_report():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('truck_id') or not data.get('issue_description'):
        return jsonify({"msg": "Missing required fields"}), 400
    
    try:
        image_url = None
        if data.get('image'):
            image_url = save_image(data['image'])
        
        report = MaintenanceReport(
            truck_id=data['truck_id'],
            issue_description=data['issue_description'],
            driver_id=user_id,
            image_url=image_url,
            status='reported'
        )
        
        db.session.add(report)
        db.session.commit()
        
        return jsonify({
            "msg": "Report created successfully",
            "report_id": report.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500

@api_bp.route('/reports/<int:report_id>', methods=['GET'])
@jwt_required()
def get_report(report_id):
    user_id = get_jwt_identity()
    report = MaintenanceReport.query.filter_by(id=report_id, driver_id=user_id).first()
    
    if not report:
        return jsonify({"msg": "Report not found"}), 404
    
    return jsonify({
        'id': report.id,
        'truck_id': report.truck_id,
        'issue_description': report.issue_description,
        'reported_date': report.reported_date.isoformat(),
        'status': report.status,
        'image_url': report.image_url,
        'repair': {
            'status': report.repairs[0].status if report.repairs else None,
            'workshop': report.repairs[0].workshop.name if report.repairs and report.repairs[0].workshop else None,
            'notes': report.repairs[0].notes if report.repairs else None
        } if report.repairs else None
    }), 200

# User Profile
@api_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = Driver.query.get(user_id)
    
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    return jsonify({
        'id': user.id,
        'name': user.name,
        'email': user.email
    }), 200
