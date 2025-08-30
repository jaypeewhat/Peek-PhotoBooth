import { useState, useEffect } from 'react';
import { Camera, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { CameraComponent } from './CameraComponent';
import { usePhotobooth } from '../context/PhotoboothContext';

export function PhotoCapture() {
  const { state, addPhoto, removePhoto, retakePhoto, setCurrentStep, setIsCapturing } = usePhotobooth();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);

  const getMaxPhotos = () => {
    if (state.selectedLayoutData) {
      return state.selectedLayoutData.totalPhotos;
    }
    return 4; // default fallback
  };

  const maxPhotos = getMaxPhotos();
  const isComplete = state.photos.length >= maxPhotos;

  const startCapture = () => {
    setCountdown(3);
    // Don't set isCapturing to true yet - wait for countdown to finish
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished, now trigger the photo capture
      setCountdown(null);
      setIsCapturing(true);
      // Reset isCapturing after a short delay to allow the camera to capture
      setTimeout(() => {
        setIsCapturing(false);
      }, 500);
    }
  }, [countdown, setIsCapturing]);

  const handleCapture = (photoDataUrl: string) => {
    if (retakeIndex !== null) {
      // Replace the photo at the specific index
      retakePhoto(retakeIndex, photoDataUrl);
      setRetakeIndex(null);
    } else {
      // Add new photo (only if under limit)
      addPhoto(photoDataUrl);
    }
    setIsCapturing(false);
  };

  const handleRetakePhoto = (index: number) => {
    setRetakeIndex(index);
    // Use the same countdown process as normal capture
    startCapture();
  };

  const handleBack = () => {
    setCurrentStep('layout');
  };

  const handleContinue = () => {
    if (state.photos.length > 0) {
      setCurrentStep('frame');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-playfair font-bold text-white mb-3 sm:mb-4 text-shadow-lg">
          Capture Your Photos
        </h2>
        <p className="text-white/80 text-lg sm:text-xl px-4">
          {state.selectedLayoutData?.totalPhotos === 1 
            ? 'Take your photo' 
            : `Take ${maxPhotos} photos for your ${state.selectedLayoutData?.name || 'layout'}`
          }
        </p>
        <div className="mt-3 sm:mt-4">
          <div className="inline-flex items-center space-x-2 text-base sm:text-lg text-white/70">
            <span>Progress:</span>
            <div className="flex space-x-1">
              {Array.from({ length: maxPhotos }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                    i < state.photos.length 
                      ? 'bg-yellow-500 shadow-lg shadow-yellow-400/50' 
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold">{state.photos.length}/{maxPhotos}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Camera Section */}
        <div className="relative order-2 xl:order-1">
          <div className="glass-card p-4 sm:p-6">
            <CameraComponent 
              onCapture={handleCapture}
              isCapturing={state.isCapturing}
            />
            
            {/* Countdown overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-xl z-10">
                <div className="text-center">
                  <div className="countdown-circle mb-4">
                    <span className="text-white">{countdown || '📸'}</span>
                  </div>
                  <p className="text-white text-lg font-semibold">
                    {countdown > 0 ? 'Get Ready!' : 'Capturing...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Capture button */}
          {((!isComplete && retakeIndex === null) || retakeIndex !== null) && countdown === null && (
            <div className="text-center mt-4 sm:mt-6">
              <button
                onClick={startCapture}
                disabled={state.isCapturing || (retakeIndex === null && state.photos.length >= maxPhotos)}
                className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
              >
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                {retakeIndex !== null 
                  ? `Retake Photo ${retakeIndex + 1}`
                  : `Take Photo ${state.photos.length + 1}`
                }
              </button>
              {retakeIndex !== null && (
                <button
                  onClick={() => setRetakeIndex(null)}
                  className="mt-3 sm:mt-0 sm:ml-4 btn-secondary text-base sm:text-lg px-4 sm:px-6 py-3 sm:py-4 w-full sm:w-auto"
                >
                  Cancel Retake
                </button>
              )}
            </div>
          )}
        </div>

        {/* Photos Grid */}
        <div className="glass-card p-4 sm:p-6 order-1 xl:order-2">
          <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6">
            Your Photos
          </h3>
          
          {state.photos.length === 0 ? (
            <div className="text-center text-white/60 py-12">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No photos taken yet</p>
              <p className="text-sm">Start by taking your first photo!</p>
            </div>
          ) : (
            <div className={`
              grid gap-4 
              ${state.selectedLayoutData?.format === '2x6' ? 'grid-cols-2' : 'grid-cols-2'}
            `}>
              {state.photos.map((photo, index) => (
                <div key={index} className={`relative group ${retakeIndex === index ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''}`}>
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className={`w-full h-32 object-cover rounded-lg shadow-lg border-2 transition-all duration-300 ${
                      retakeIndex === index 
                        ? 'border-yellow-400 opacity-75' 
                        : 'border-yellow-400/30 group-hover:border-yellow-400/60'
                    }`}
                  />
                  <button
                    onClick={() => handleRetakePhoto(index)}
                    className={`absolute top-2 right-2 text-white p-2 rounded-full transition-all duration-200 shadow-lg ${
                      retakeIndex === index
                        ? 'bg-yellow-500 hover:bg-yellow-600 opacity-100'
                        : 'bg-red-500 hover:bg-red-600 opacity-0 group-hover:opacity-100'
                    }`}
                    title={retakeIndex === index ? "Retaking this photo..." : "Retake this photo"}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    Photo {index + 1} {retakeIndex === index && '(Retaking...)'}
                  </div>
                </div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: maxPhotos - state.photos.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="photo-slot h-32"
                >
                  <Camera className="w-8 h-8 text-white/40" />
                  <span className="text-white/40 text-sm mt-2">
                    Photo {state.photos.length + i + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 sm:mt-8">
        <button
          onClick={handleBack}
          className="btn-secondary w-full sm:w-auto order-2 sm:order-1"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Layout
        </button>

        <button
          onClick={handleContinue}
          disabled={state.photos.length === 0}
          className={`
            w-full sm:w-auto order-1 sm:order-2
            ${state.photos.length === 0 
              ? 'opacity-50 cursor-not-allowed bg-gray-300' 
              : 'btn-primary'
            }
          `}
        >
          Continue to Frames
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
}
