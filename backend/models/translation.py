from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from database import Base


class Translation(Base):
    __tablename__ = "translations"

    id = Column(Integer, primary_key=True, index=True)
    transcript_id = Column(Integer, ForeignKey("transcripts.id"), nullable=False)
    original_text = Column(Text, nullable=False)
    translated_text = Column(Text, nullable=False)
    target_language = Column(String(10), default="en")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "transcript_id": self.transcript_id,
            "original_text": self.original_text,
            "translated_text": self.translated_text,
            "target_language": self.target_language,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
