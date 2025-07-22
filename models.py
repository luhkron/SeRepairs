from datetime import datetime
from app import db

class Driver(db.Model):
    __tablename__ = 'driver'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    reports = db.relationship('MaintenanceReport', back_populates='driver')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class MaintenanceReport(db.Model):
    __tablename__ = 'maintenance_report'
    
    id = db.Column(db.Integer, primary_key=True)
    truck_id = db.Column(db.String(50), nullable=False)
    issue_description = db.Column(db.Text, nullable=False)
    reported_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    status = db.Column(db.String(20), default='reported')  # reported, in_progress, completed, cancelled
    image_url = db.Column(db.String(500), nullable=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('driver.id'), nullable=False)
    
    # Relationships
    driver = db.relationship('Driver', back_populates='reports')
    repairs = db.relationship('Repair', back_populates='report')
    
    def to_dict(self):
        return {
            'id': self.id,
            'truck_id': self.truck_id,
            'issue_description': self.issue_description,
            'reported_date': self.reported_date.isoformat() if self.reported_date else None,
            'status': self.status,
            'image_url': self.image_url,
            'driver_id': self.driver_id,
            'repair': self.repairs[0].to_dict() if self.repairs else None
        }

class Workshop(db.Model):
    __tablename__ = 'workshop'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=True)
    contact = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    repairs = db.relationship('Repair', back_populates='workshop')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'contact': self.contact,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Repair(db.Model):
    __tablename__ = 'repair'
    
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.Integer, db.ForeignKey('maintenance_report.id'), nullable=False)
    workshop_id = db.Column(db.Integer, db.ForeignKey('workshop.id'), nullable=True)
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, completed, cancelled
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    report = db.relationship('MaintenanceReport', back_populates='repairs')
    workshop = db.relationship('Workshop', back_populates='repairs')
    
    def to_dict(self):
        return {
            'id': self.id,
            'report_id': self.report_id,
            'workshop_id': self.workshop_id,
            'workshop_name': self.workshop.name if self.workshop else None,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
