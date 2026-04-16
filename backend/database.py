from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config.settings import DATABASE_URL

engine = create_engine(DATABASE_URL.replace("sqlite:///", "sqlite:///"), 
                       connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from models import language, audio_file, transcript, translation, phrase
    Base.metadata.create_all(bind=engine)
