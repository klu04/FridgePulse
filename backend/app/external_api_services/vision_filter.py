from .vision_filter_data import fruits, vegetables


def filter_detected_objects(detected_objects):
    """Filter the detected objects to only include fruits and vegetables name."""

    filtered_objects = []
    for objects in detected_objects:
        if objects[0] in fruits or objects[0] in vegetables:
            filtered_objects.append(objects)

    return filtered_objects
