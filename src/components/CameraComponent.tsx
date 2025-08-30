import { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, Square } from 'lucide-react';

interface CameraComponentProps {
  onCapture: (photoDataUrl: string) => void;
  isCapturing: boolean;
}

export function CameraComponent({ onCapture, isCapturing }: CameraComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Flip the canvas horizontally to match the mirrored video display
    context.save();
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    context.restore();

    // Get the image data as base64
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCapture(photoDataUrl);
  }, [onCapture]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    startCamera();

    return () => {
      // Cleanup function will use the stream from closure
    };
  }, []);

  // Cleanup effect for stream
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Auto-capture when isCapturing becomes true (after countdown finishes)
  useEffect(() => {
    if (isCapturing && isReady) {
      // Capture immediately when triggered (countdown already finished)
      capturePhoto();
    }
  }, [isCapturing, isReady, capturePhoto]);

  const handleVideoReady = () => {
    setIsReady(true);
  };

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-xl shadow-2xl bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={handleVideoReady}
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        
        {!isReady && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-white text-center">
              <Camera className="w-12 h-12 mx-auto mb-4 animate-pulse" />
              <p>Initializing camera...</p>
            </div>
          </div>
        )}

        {/* Camera overlay grid */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-20">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-white/30" />
            ))}
          </div>
        </div>

        {/* Capture indicator */}
        {isCapturing && (
          <div className="absolute inset-0 bg-white animate-pulse opacity-50" />
        )}
      </div>

      {/* Capture button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={capturePhoto}
          disabled={!isReady || isCapturing}
          className="relative group"
        >
          <div className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 shadow-lg flex items-center justify-center group-hover:border-gold-400 transition-all duration-200 group-active:scale-95">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-renaissance-500 flex items-center justify-center shadow-inner">
              <Square className="w-6 h-6 text-white fill-current" />
            </div>
          </div>
          {isCapturing && (
            <div className="absolute inset-0 rounded-full border-4 border-gold-400 animate-ping" />
          )}
        </button>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
