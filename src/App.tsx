import { PhotoboothProvider, usePhotobooth } from './context/PhotoboothContext';
import { LayoutSelector } from './components/LayoutSelector';
import { PhotoCapture } from './components/PhotoCapture';
import { FrameSelector } from './components/FrameSelector';
import { PhotoPreview } from './components/PhotoPreview';
import { LoadingScreen } from './components/LoadingScreen';
import { StartScreen } from './components/StartScreen';
import { Logo } from './components/Logo';
import { Sparkles, Star } from 'lucide-react';

function PhotoboothSteps() {
  const { state, setIsLoading, setHasStarted } = usePhotobooth();

  const handleStart = () => {
    setHasStarted(true);
    setIsLoading(true);
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Show start screen if user hasn't started yet
  if (!state.hasStarted) {
    return <StartScreen onStart={handleStart} />;
  }

  // Show loading screen if isLoading is true
  if (state.isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 'layout':
        return <LayoutSelector />;
      case 'capture':
        return <PhotoCapture />;
      case 'frame':
        return <FrameSelector />;
      case 'preview':
        return <PhotoPreview />;
      default:
        return <LayoutSelector />;
    }
  };

  const steps = [
    { id: 'layout', name: 'Layout', icon: '□' },
    { id: 'capture', name: 'Photos', icon: '○' },
    { id: 'frame', name: 'Frame', icon: '◇' },
    { id: 'preview', name: 'Preview', icon: '◉' },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === state.currentStep);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Header with enhanced dark theme */}
      <header className="glass-card mx-4 mt-4 mb-6 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <Logo size="lg" />
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-pulse" />
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 animate-bounce" />
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Progress Steps - Horizontal flat design */}
      <div className="max-w-4xl mx-auto px-4 mb-6 relative z-10">
        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4 sm:space-x-8 w-full max-w-2xl">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center
                      text-lg sm:text-xl font-medium transition-all duration-300
                      ${index <= currentStepIndex 
                        ? 'bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-400/30' 
                        : 'bg-white/10 text-white/60 border border-white/20'
                      }
                    `}>
                      <span>{step.icon}</span>
                    </div>
                    
                    {/* Step Label */}
                    <div className="mt-2 text-center">
                      <div className={`
                        text-xs sm:text-sm font-medium
                        ${index <= currentStepIndex ? 'text-yellow-400' : 'text-white/60'}
                      `}>
                        {step.name}
                      </div>
                    </div>
                  </div>
                  
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-2 sm:mx-4">
                      <div className={`
                        h-0.5 sm:h-1 rounded-full transition-all duration-500
                        ${index < currentStepIndex 
                          ? 'bg-yellow-500 shadow-sm shadow-yellow-400/30' 
                          : 'bg-white/20'
                        }
                      `} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with proper spacing */}
      <main className="px-4 pb-8 relative z-10">
        <div className="animate-fade-in">
          {renderCurrentStep()}
        </div>
      </main>

      {/* Enhanced Footer with developer credits */}
      <footer className="text-center py-6 sm:py-8 mt-8 sm:mt-12 relative z-10">
        <div className="glass-card max-w-md mx-4 sm:mx-auto p-4 sm:p-6">
          <div className="flex items-center justify-center mb-4">
            <Logo size="sm" />
          </div>
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Star className="w-4 h-4 text-yellow-400" />
            <p className="text-white/80 font-medium text-sm sm:text-base">
              © 2025 Peek Photobooth
            </p>
            <Star className="w-4 h-4 text-yellow-400" />
          </div>
          
          {/* Developer Credits */}
          <div className="border-t border-white/20 pt-3 mb-3">
            <p className="text-white/60 text-xs mb-2">Developed by</p>
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  T
                </div>
                <span className="text-white/80 text-sm font-medium">Trisha</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  J
                </div>
                <span className="text-white/80 text-sm font-medium">JayPee</span>
              </div>
            </div>
          </div>
          
          <p className="text-white/60 text-xs">
            Create memories with timeless elegance
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <PhotoboothProvider>
      <PhotoboothSteps />
    </PhotoboothProvider>
  );
}

export default App;
