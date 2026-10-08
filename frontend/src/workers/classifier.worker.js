import { pipeline, env } from "@huggingface/transformers";

env.allowLocalModels = false;
env.useBrowserCache = true;

class ImageClassificationPipeline {
    static task = "zero-shot-image-classification";
    static model = "Xenova/clip-vit-base-patch32";
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            try {
                this.instance = await pipeline(this.task, this.model, { progress_callback });
            } catch (error) {
                this.instance = null;
                throw error;
            }
        }
        return this.instance;
    }
}

const PRODUCE_LABELS = [
    "apple", "apricot", "avocado", "banana", "bell pepper",
    "blackberry", "blueberry", "broccoli", "cabbage", "carrot",
    "cauliflower", "celery", "cherry", "coconut", "corn",
    "cucumber", "eggplant", "garlic", "grapes", "green beans",
    "kiwi", "lemon", "lettuce", "lime", "mango",
    "mushroom", "onion", "orange", "peach", "pear",
    "peas", "pineapple", "plum", "potato", "pumpkin",
    "raspberry", "spinach", "strawberry", "sweet potato", "tomato",
    "watermelon", "zucchini"
];

self.onmessage = async (event) => {
    const { type, payload } = event.data;

    if (type === "LOAD_MODEL") {
        try {
            await ImageClassificationPipeline.getInstance((progress) => {
                self.postMessage({ type: "PROGRESS", payload: progress });
            });
            self.postMessage({ type: "MODEL_READY" });
        } catch (error) {
            self.postMessage({ type: "ERROR", payload: `Failed to load model: ${error.message}` });
        }
    }

    if (type === "CLASSIFY") {
        try {
            const classifier = await ImageClassificationPipeline.getInstance();
            const imageUrl = URL.createObjectURL(payload.image);
            try {
                const predictions = await classifier(imageUrl, PRODUCE_LABELS, {
                    hypothesis_template: "This is a photo of {}"
                });
                self.postMessage({ type: "RESULT", payload: predictions });
            } finally {
                URL.revokeObjectURL(imageUrl);
            }
        } catch (error) {
            self.postMessage({ type: "ERROR", payload: `Classification failed: ${error.message}` });
        }
    }
};