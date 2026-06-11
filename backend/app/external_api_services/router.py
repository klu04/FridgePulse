import base64
import tempfile
import os

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from . import google_vision

router = APIRouter()


def create_temp_path(image_bytes):
    """Creates temporary file to store uploaded image and returns path"""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        temp_file.write(image_bytes)
        temp_path = temp_file.name
    return temp_path


@router.post("/identify-base64")
async def identify_item_base64(image_data: str = Form(...)):
    """Identify item from a base64-encoded image."""
    try:
        # Strip data URL prefix if present
        if "," in image_data:
            image_data = image_data.split(",", 1)[1]
        image_bytes = base64.b64decode(image_data)
    except Exception:
        raise HTTPException(status_code=400, detail="image data is not valid base64")

    try:
        # Create temporary file to store image
        temp_path = create_temp_path(image_bytes)

        # Process image with vision service
        detected_object = google_vision.localize_objects(temp_path)

        # Clean up temporary file
        os.unlink(temp_path)

        return {"name": detected_object}

    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(error)}",
        )


@router.post("/detect-items")
async def detect_items_from_image(image: UploadFile = File(...)):
    """Detect food items from an uploaded image using Google Cloud Vision API. returns a
    dictionary withthe detected object"""

    # Validate file type
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image.",
        )

    try:
        # Create temporary file to store uploaded image
        content = await image.read()
        temp_path = create_temp_path(content)

        # Process image with vision service
        detected_object = google_vision.localize_objects(temp_path)

        # Clean up temporary file
        os.unlink(temp_path)

        return {"name": detected_object}

    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(error)}",
        )
