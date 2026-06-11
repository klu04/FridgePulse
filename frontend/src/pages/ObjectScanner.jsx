// ObjectScanner.jsx
// Camera-based fruit/vegetable recognition via Google Vision API backend
// Name: Zilin Xu
// Date: 5/23/2026

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { VISION_DETECT_URL } from "@/lib/api";

function ObjectScanner() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  async function startCamera() {
    setCameraError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError(
        err?.message?.includes("Permission")
          ? "Camera permission denied. Please allow camera access to scan objects."
          : "Could not start camera."
      );
      setCameraActive(false);
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }

  async function handleCapture() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    stopCamera();
    setDetecting(true);
    setError(null);
    setResult(null);

    try {
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.85)
      );

      const formData = new FormData();
      formData.append("image", blob, "capture.jpg");

      const response = await fetch(VISION_DETECT_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.name && data.name !== "No objects detected") {
        setResult(data);
      } else {
        setError("No fruit or vegetable detected. Try again with a clearer image.");
      }
    } catch (err) {
      setError(
        err.message.includes("fetch")
          ? "Could not reach the server. The image recognition API may not be running yet."
          : err.message
      );
    } finally {
      setDetecting(false);
    }
  }

  function handleAddToPantry() {
    navigate("/additem", { state: { name: result.name } });
  }

  function handleScanAgain() {
    setResult(null);
    setError(null);
    startCamera();
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-gray-700 transition-colors text-lg"
        >
          &larr;
        </button>
        <h1 className="text-3xl font-semibold text-gray-900">Scan Object</h1>
      </div>

      <p className="text-sm text-gray-500">
        Point your camera at a fruit or vegetable and tap Capture to identify it.
      </p>

      {/* Camera view */}
      {cameraActive && !result && (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-gray-300 bg-black aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-emerald-400 rounded-full opacity-70" />
            </div>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={handleCapture}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
            >
              Capture
            </Button>
          </div>
        </div>
      )}

      {/* Camera error */}
      {cameraError && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
          {cameraError}
        </div>
      )}

      {/* Detecting spinner */}
      {detecting && (
        <div className="text-center space-y-3">
          <canvas ref={canvasRef} className="mx-auto rounded-lg border border-gray-200 max-w-full" />
          <p className="text-sm text-gray-500 animate-pulse">Detecting...</p>
        </div>
      )}

      {/* Hidden canvas for non-detecting state */}
      {!detecting && <canvas ref={canvasRef} className="hidden" />}

      {/* Error message */}
      {error && (
        <div className="space-y-3">
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleScanAgain}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Result card */}
      {result && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-5 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Detected Item</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="font-medium text-gray-600 w-24">Name</dt>
              <dd className="text-gray-900 capitalize">{result.name}</dd>
            </div>
            {result.confidence != null && (
              <div className="flex gap-2">
                <dt className="font-medium text-gray-600 w-24">Confidence</dt>
                <dd className="text-gray-900">{Math.round(result.confidence * 100)}%</dd>
              </div>
            )}
          </dl>
          <div className="flex gap-3">
            <Button
              onClick={handleAddToPantry}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Add to Pantry &rarr;
            </Button>
            <Button variant="outline" onClick={handleScanAgain}>
              Scan Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ObjectScanner;
