import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Secret key for session management and CSRF protection
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-change-in-production'
    
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', '').replace('postgres://', 'postgresql://') or 'sqlite:///truck_maintenance.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # PostgreSQL specific settings
    if SQLALCHEMY_DATABASE_URI.startswith('postgresql://'):
        SQLALCHEMY_ENGINE_OPTIONS = {
            'pool_pre_ping': True,
            'pool_recycle': 300,
        }
    
    # Application settings
    DEBUG = os.environ.get('FLASK_DEBUG', 'False') == 'True'
    
    # Pagination
    ITEMS_PER_PAGE = 10

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True  # Log SQL queries

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False

class ProductionConfig(Config):
    DEBUG = False
    # Use environment variables for production
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("No SECRET_KEY set for production")

# Dictionary to map config names to classes
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Get the appropriate config class based on environment"""
    env = os.environ.get('FLASK_ENV', 'development')
    return config.get(env, 'development')
