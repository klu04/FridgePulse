# Name: Yasser Hernandez (hernayas)
# Citation for the ode below:
# Date: 04/28/2025
# Adapted from Google Cloud Vision API documentation.
# Source URL: https://docs.cloud.google.com/vision/docs/object-localizer
# Source URL: https://docs.cloud.google.com/vision/docs/reference/rest/v1p2beta1/images/annotate
# Source URL: https://docs.cloud.google.com/vision/docs/batch

from . import vision_filter
from dotenv import load_dotenv
import os

_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv()

CONFIDENCE_THRESHOLD = 0.6


def localize_objects(path):
    """Localize objects in the local image.

    Args:
    path: The path to the local file.
    """

    from google.cloud import vision

    client = vision.ImageAnnotatorClient()

    with open(path, "rb") as image_file:
        content = image_file.read()
    image = vision.Image(content=content)

    # Request for label detection, text detection(OCR) and web detection(searching the web for similar images)
    objects = client.annotate_image(
        {
            "image": image,
            "features": [
                {"type_": vision.Feature.Type.LABEL_DETECTION, "max_results": 15},
                {"type_": vision.Feature.Type.WEB_DETECTION, "max_results": 5},
            ],
        }
    )

    # Web entities detected in the image
    web_entities = []
    if objects.web_detection.web_entities:
        for entity in objects.web_detection.web_entities:
            if entity.description and entity.score >= CONFIDENCE_THRESHOLD:
                web_entities.append((entity.description.lower(), entity.score))

    # Web entities detected in the image
    label_entities = []
    if objects.label_annotations:
        for entity in objects.label_annotations:
            if entity.description and entity.score >= CONFIDENCE_THRESHOLD:
                label_entities.append((entity.description.lower(), entity.score))

    # all detected objects in the image
    all_detected_objects = web_entities + label_entities

    # includes fruits and vegetables name exluding other name such fruit, food
    filtered_objects = vision_filter.filter_detected_objects(all_detected_objects)

    # sorts detected objects by confidence score and returns the one with the highest score
    if filtered_objects:
        sorted_detected_objects = sorted(
            filtered_objects, key=lambda x: x[1], reverse=True
        )
        top_object = sorted_detected_objects[0][0]

    else:
        top_object = "No objects detected"

    return top_object
