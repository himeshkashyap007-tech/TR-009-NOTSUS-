from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from database import Base


class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(Integer, primary_key=True, index=True)
    audio_id = Column(Integer, ForeignKey("audio_files.id"), nullable=False)
    text = Column(Text, nullable=False)
    language = Column(String(50))
    confidence = Column(Float)
    word_count = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "audio_id": self.audio_id,
            "text": self.text,
            "language": self.language,
            "confidence": self.confidence,
            "word_count": self.word_count,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
