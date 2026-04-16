import os
import hashlib
import uuid
from config.settings import ALLOWED_EXTENSIONS, MAX_FILE_SIZE


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def validate_file_size(file_size):
    return file_size <= MAX_FILE_SIZE


def sanitize_filename(filename):
    filename = os.path.basename(filename)
    name, ext = os.path.splitext(filename)
    safe_name = ''.join(c for c in name if c.isalnum() or c in '._- ')
    return f"{safe_name}{ext}"


def generate_unique_filename(original_filename):
    ext = os.path.splitext(original_filename)[1].lower()
    unique_id = hashlib.md5(str(uuid.uuid4()).encode()).hexdigest()[:8]
    return f"{unique_id}{ext}"


def format_response(success=True, data=None, message="", error=None):
    response = {
        "success": success,
        "data": data if data is not None else {},
        "message": message
    }
    if error:
        response["error"] = error
        response["success"] = False
    return response
