from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Float
from sqlalchemy.sql import func
from database import Base


class Phrase(Base):
    __tablename__ = "phrases"

    id = Column(Integer, primary_key=True, index=True)
    transcript_id = Column(Integer, ForeignKey("transcripts.id"))
    translation_id = Column(Integer, ForeignKey("translations.id"))
    audio_id = Column(Integer, ForeignKey("audio_files.id"))
    original_text = Column(Text, nullable=False)
    translated_text = Column(Text)
    category = Column(String(50))
    embeddings = Column(Text)
    usage_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "transcript_id": self.transcript_id,
            "translation_id": self.translation_id,
            "audio_id": self.audio_id,
            "original_text": self.original_text,
            "translated_text": self.translated_text,
            "category": self.category,
            "usage_count": self.usage_count,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
