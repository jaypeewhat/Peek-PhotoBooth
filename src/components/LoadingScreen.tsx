import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Logo } from './Logo';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);

  const loadingMessages = [
    "Initializing camera system...",
    "Loading photo templates...",
    "Preparing photobooth magic...",
    "Setting up developer credits...",
    "Ready to create memories!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onLoadingComplete(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % loadingMessages.length);
    }, 1000);

    return () => clearInterval(messageInterval);
  }, [loadingMessages.length]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {/* Logo with animation */}
        <div className="mb-8 animate-pulse">
          <div className="flex justify-center">
            <Logo size="xl" />
          </div>
        </div>

        {/* Loading animation */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center animate-bounce">
              <div className="w-6 h-6 bg-white rounded-sm"></div>
            </div>
            <div className="w-8 h-8 bg-yellow-400 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="glass-card p-6 max-w-md mx-auto mb-8">
          <div className="mb-4">
            <div className="flex justify-between text-white/80 text-sm mb-2">
              <span>Loading</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {/* Loading message */}
          <p className="text-white/70 text-sm animate-pulse">
            {loadingMessages[currentMessage]}
          </p>
        </div>

        {/* Developer credits */}
        <div className="glass-card p-6 max-w-sm mx-auto">
          <h3 className="text-white font-semibold mb-3 flex items-center justify-center">
            <Star className="w-4 h-4 text-yellow-400 mr-2" />
            Developed by
            <Star className="w-4 h-4 text-yellow-400 ml-2" />
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                T
              </div>
              <span className="text-white/90 font-medium">Trisha</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                J
              </div>
              <span className="text-white/90 font-medium">JayPee</span>
            </div>
          </div>
          <p className="text-white/60 text-xs mt-3">
            Creating magical photobooth experiences
          </p>
        </div>
      </div>
    </div>
  );
}
