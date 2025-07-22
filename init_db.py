from app import app, db, Driver, MaintenanceReport, Workshop, Repair
from datetime import datetime, timedelta

def init_db():
    with app.app_context():
        # Create all database tables
        db.create_all()
        
        # Check if we already have data
        if db.session.query(Driver).count() == 0:
            # Add sample drivers
            driver1 = Driver(
                name='John Doe', 
                email='john@example.com', 
                password='hashed_password_1'  # In a real app, this should be hashed
            )
            
            driver2 = Driver(
                name='Jane Smith', 
                email='jane@example.com', 
                password='hashed_password_2'  # In a real app, this should be hashed
            )
            
            db.session.add(driver1)
            db.session.add(driver2)
            db.session.flush()
            
            # Add sample workshops
            workshop1 = Workshop(
                name='City Center Garage', 
                location='123 Main St', 
                contact='555-0101'
            )
            
            workshop2 = Workshop(
                name='Northside Auto', 
                location='456 Oak Ave', 
                contact='555-0202'
            )
            
            db.session.add(workshop1)
            db.session.add(workshop2)
            db.session.flush()
            
            # Add sample maintenance reports
            report1 = MaintenanceReport(
                truck_id='TRK101',
                issue_description='Engine making strange noises and loss of power.',
                reported_date=datetime.utcnow() - timedelta(days=2),
                status='in_progress',
                driver_id=driver1.id
            )
            
            report2 = MaintenanceReport(
                truck_id='TRK102',
                issue_description='Brakes need to be replaced soon.',
                reported_date=datetime.utcnow() - timedelta(days=1),
                status='pending',
                driver_id=driver2.id
            )
            
            db.session.add(report1)
            db.session.add(report2)
            db.session.flush()
            
            # Add sample repairs
            repair1 = Repair(
                report_id=report1.id,
                workshop_id=workshop1.id,
                start_date=datetime.utcnow() - timedelta(days=1),
                status='in_progress',
                notes='Diagnosing engine issues. May need a complete overhaul.'
            )
            
            repair2 = Repair(
                report_id=report2.id,
                workshop_id=workshop2.id,
                start_date=datetime.utcnow(),
                status='pending',
                notes='Scheduled for brake inspection next week.'
            )
            
            db.session.add(repair1)
            db.session.add(repair2)
            
            # Commit all changes
            db.session.commit()
            
            print("[SUCCESS] Database initialized with sample data!")
            print(f"   - Added {db.session.query(Driver).count()} drivers")
            print(f"   - Added {db.session.query(Workshop).count()} workshops")
            print(f"   - Added {db.session.query(MaintenanceReport).count()} maintenance reports")
            print(f"   - Added {db.session.query(Repair).count()} repair records")
        else:
            print("[INFO] Database already contains data. No changes made.")

if __name__ == '__main__':
    init_db()
