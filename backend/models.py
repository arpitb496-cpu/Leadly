from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from validation import SOURCE_OPTIONS, STATUS_OPTIONS

db = SQLAlchemy()

class Lead(db.Model):
    __tablename__ = 'leads'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False, index=True)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(30), nullable=True)
    company = db.Column(db.String(120), nullable=True)
    source = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(30), nullable=False, default='New', index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone or '',
            'company': self.company or '',
            'source': self.source or '',
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
