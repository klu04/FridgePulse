import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function ImageScanner() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const workerRef = useRef(null);
  const isModelLoadingRef = useRef(true);

  const [cameraError, setCameraError] = useState(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelProgress, setModelProgress] = useState(0);
  const [modelError, setModelError] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [cameraKey, setCameraKey] = useState(0);

  async function handleCapture() {
    if (!videoRef.current || !canvasRef.current || !workerRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.drawImage(video, 0, 0);

    setDetecting(true);
    setError(null);
    setResult(null);

    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
      if (workerRef.current && blob) {
        workerRef.current.postMessage({ type: "CLASSIFY", payload: { image: blob } });
      } else {
        throw new Error("Failed to generate image blob.");
      }
    } catch (err) {
        console.error("Image capture failed:", err);
      setError("Failed to capture image. Please try again.");
      setDetecting(false);
    }
  }

  function handleScanAgain() {
    setResult(null);
    setError(null);
    setCameraError(null);
    setDetecting(false);
    setCameraKey((k) => k + 1); // Forces React to recreate the <video> DOM node
  }

  function handleRetryCamera() {
    setCameraError(null);
    setCameraKey((k) => k + 1);
  }

  // Web Worker Setup for vision model
  useEffect(() => {
    const worker = new Worker(new URL("../workers/classifier.worker.js", import.meta.url), { type: "module" });

    worker.onmessage = (event) => {
      const { type, payload } = event.data;

      if (type === "PROGRESS") {
        if (payload.status === "download" && payload.progress != null) {
          setModelProgress(Math.round(payload.progress));
        }
      } else if (type === "MODEL_READY") {
        isModelLoadingRef.current = false;
        setModelLoading(false);
      } else if (type === "RESULT") {
        if (Array.isArray(payload) && payload.length > 0) {
          const top = payload[0];
          const cleanName = top.label
            ? top.label.replace(/_/g, " ").split(",")[0].trim().toLowerCase()
            : "unknown";

          if (top.score >= 0.4) {
            setResult({ name: cleanName, confidence: top.score });
          } else {
            setError("No clear object detected. Try again.");
          }
        } else {
          setError("No results returned from the model.");
        }
        setDetecting(false);
      } else if (type === "ERROR") {
        const msg = typeof payload === "string" ? payload : payload?.message || "Unknown error";
        if (isModelLoadingRef.current) {
          setModelError(msg);
          setModelLoading(false);
        } else {
          setError(msg);
        }
        setDetecting(false);
      }
    };

    worker.onerror = (err) => {
      console.error("Worker error:", err);
      setModelError("Failed to load the worker script.");
      setModelLoading(false);
    };

    workerRef.current = worker;
    worker.postMessage({ type: "LOAD_MODEL" });

    return () => {
      worker.terminate();
      isModelLoadingRef.current = true;
    };
  }, []);


  const shouldCameraBeActive = !modelLoading && !modelError && !result && !cameraError && !error;

  // Camera Lifecycle (Syncs with browser's external media system)
  useEffect(() => {
    if (!shouldCameraBeActive) return;

    const videoNode = videoRef.current;
    let ignore = false; // Prevents race conditions on rapid unmounts/remounts
    let localStream = null;

    async function setupCamera() {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        if (!ignore && videoNode) {
          streamRef.current = localStream;
          videoNode.srcObject = localStream;
        } else if (localStream) {
          localStream.getTracks().forEach((t) => t.stop());
        }
      } catch (err) {
        console.error("Camera setup error:", err);
        if (!ignore) setCameraError("Camera permission denied or unavailable.");
      }
    }

    setupCamera();

    return () => {
      ignore = true; // Mark as stale so async setupCamera ignores the result
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoNode) videoNode.srcObject = null;
    };
  }, [shouldCameraBeActive, cameraKey]);


  return (
    <>
      {/* Camera Feed */}
      {shouldCameraBeActive && (
        <div key={cameraKey} className="fixed inset-0 bg-black z-9999">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover bg-black"
            onLoadedMetadata={(e) => {
              e.target.play().catch((err) => console.warn("Autoplay prevented:", err));
            }}
          />

          {/* Viewfinder */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-72 h-72 border-2 border-emerald-400 rounded-xl opacity-70" />
          </div>

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 text-white text-2xl z-10 p-2"
            aria-label="Go back"
          >
            &larr;
          </button>

          {/* Detecting overlay */}
          {detecting && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center space-y-2 z-10">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
              <p className="text-white text-sm">Analyzing image...</p>
            </div>
          )}

          {/* Capture button */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/70 to-transparent">
            <Button
              onClick={handleCapture}
              disabled={detecting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl disabled:opacity-50"
            >
              {detecting ? "Thinking..." : "Capture & Identify"}
            </Button>
          </div>
        </div>
      )}

      {/* Non-camera states (loading, errors, result) */}
      {!shouldCameraBeActive && (
        <div className="p-6 max-w-2xl mx-auto space-y-6 font-sans">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 text-lg hover:text-gray-600 transition-colors"
              aria-label="Go back"
            >
              &larr;
            </button>
            <h1 className="text-2xl font-bold">Scan Object</h1>
          </div>

          {modelLoading && !modelError && (
            <div className="text-center py-8 space-y-2">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-600">Loading Model... {modelProgress}%</p>
            </div>
          )}

          {modelError && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-center space-y-2">
              <p className="text-red-700 font-medium">Failed to load AI model</p>
              <p className="text-sm text-red-500">{modelError}</p>
            </div>
          )}

          {cameraError && !modelError && (
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-center space-y-2">
              <p className="text-yellow-800 font-medium">Camera Unavailable</p>
              <p className="text-sm text-yellow-700">{cameraError}</p>
              <Button onClick={handleRetryCamera} className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm py-1 px-3 rounded">
                Try Again
              </Button>
            </div>
          )}

          {error && (
            <div className="text-center space-y-3">
              <p className="text-red-500">{error}</p>
              <Button onClick={handleScanAgain} className="bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded-lg">
                Try Again
              </Button>
            </div>
          )}

          {result && (
            <div className="border border-emerald-300 bg-emerald-50 p-5 rounded-lg space-y-4 text-center">
              <h2 className="text-xl font-bold text-emerald-800">
                Detected: <span className="capitalize">{result.name}</span>
              </h2>
              <p className="text-sm text-gray-600">Confidence: {Math.round(result.confidence * 100)}%</p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => navigate("/add-item", { state: { name: result.name } })}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg"
                >
                  Add to Form &rarr;
                </Button>
                <Button onClick={handleScanAgain} className="bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded-lg">
                  Scan Again
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}

export default ImageScanner;
export const Component = ImageScanner;