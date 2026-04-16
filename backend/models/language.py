from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from database import Base


class Language(Base):
    __tablename__ = "languages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(10), unique=True, nullable=False)
    region = Column(String(100))
    is_endangered = Column(Boolean, default=False)
    speaker_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "region": self.region,
            "is_endangered": self.is_endangered,
            "speaker_count": self.speaker_count,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
