# Truck Maintenance Portal

A web application for truck drivers to report maintenance issues and for workshop staff to manage repairs.

## Features

- **Driver Portal**
  - Report maintenance issues
  - View report status
  - Track repair progress

- **Workshop Portal**
  - View all maintenance requests
  - Update repair status
  - Assign technicians
  - Track completion

## Prerequisites

- Python 3.8+
- Node.js 14+ (for frontend dependencies)
- pip (Python package manager)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd truck-maintenance-portal
   ```

2. **Set up Python virtual environment**
   ```bash
   # On Windows
   python -m venv venv
   .\venv\Scripts\activate
   
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize the database**
   ```bash
   python init_db.py
   ```

## Running the Application

1. **Start the Flask backend**
   ```bash
   python app.py
   ```

2. **Access the application**
   - Open a web browser and go to `http://localhost:5000`
   - Use the following test credentials:
     - Email: admin@example.com
     - Password: password123

## Project Structure

```
truck-maintenance-portal/
├── app.py                # Main application file
├── config.py             # Configuration settings
├── requirements.txt      # Python dependencies
├── init_db.py           # Database initialization
├── static/              # Static files (CSS, JS, images)
│   ├── css/
│   └── js/
├── templates/           # HTML templates
│   ├── base.html
│   ├── login.html
│   ├── reports.html
│   └── report_issue.html
└── README.md
```

## API Endpoints

- `GET /api/reports` - Get all maintenance reports
- `POST /api/report-issue` - Submit a new maintenance report
- `GET /api/report/<int:report_id>` - Get details of a specific report
- `PUT /api/report/<int:report_id>` - Update a report
- `DELETE /api/report/<int:report_id>` - Delete a report

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Flask](https://flask.palletsprojects.com/)
- [Bootstrap](https://getbootstrap.com/)
- [SQLAlchemy](https://www.sqlalchemy.org/)
