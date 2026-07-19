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

const FOOD_LABELS = [
    // Fruits
    "apple", "apricot", "banana", "blackberry", "blueberry",
    "cantaloupe", "cherry", "coconut", "cranberry", "date",
    "fig", "durian", "grapefruit", "grapes", "guava", "kiwi",
    "lemon", "lime", "mango", "nectarine", "orange",
    "papaya", "passionfruit", "peach", "pear", "persimmon",
    "pineapple", "plum", "pomegranate", "raspberry", "strawberry",
    "tangerine", "watermelon",
    // Vegetables
    "artichoke", "asparagus", "beet", "bell pepper", "broccoli",
    "brussels sprout", "cabbage", "carrot", "cauliflower", "celery",
    "corn", "cucumber", "eggplant", "garlic", "ginger",
    "green beans", "kale", "leek", "lettuce", "mushroom",
    "onion", "parsnip", "potato", "pumpkin", "radish",
    "spinach", "sweet potato", "tomato", "turnip", "zucchini"
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

            const predictions = await classifier(imageUrl, FOOD_LABELS);

            URL.revokeObjectURL(imageUrl);

            self.postMessage({ type: "RESULT", payload: predictions });
        } catch (error) {
            self.postMessage({ type: "ERROR", payload: `Classification failed: ${error.message}` });
        }
    }
};