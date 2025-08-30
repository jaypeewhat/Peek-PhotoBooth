import { Logo } from './Logo';
import { Star, Play } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const features = [
    {
      icon: '□',
      title: 'Choose Your Layout',
      description: 'Select from various photobooth strip formats'
    },
    {
      icon: '○',
      title: 'Capture Photos',
      description: 'Take multiple photos with countdown timer'
    },
    {
      icon: '◇',
      title: 'Select Frame',
      description: 'Add beautiful frames and templates'
    },
    {
      icon: '◉',
      title: 'Download & Share',
      description: 'Get your photobooth strip instantly'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Main Logo and Title */}
        <div className="mb-12">
          <div className="flex justify-center mb-6">
            <Logo size="xl" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-playfair font-bold text-white mb-4 text-shadow-lg">
            Welcome to Peek
          </h1>
          <p className="text-xl sm:text-2xl text-white/80 mb-6">
            Create magical photobooth memories instantly
          </p>
          <div className="flex items-center justify-center space-x-2 text-white/60">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-sm">Professional Quality • Easy to Use • Instant Results</span>
            <Star className="w-5 h-5 text-yellow-400" />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="glass-card p-6 text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-900 text-2xl font-bold">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-white/70 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Start Button */}
        <div className="mb-8">
          <button
            onClick={onStart}
            className="btn-primary text-xl px-12 py-6 group hover:scale-110 transition-all duration-300"
          >
            <Play className="w-8 h-8 mr-4 group-hover:animate-pulse" />
            Press Start
          </button>
        </div>

        {/* Additional Info */}
        <div className="glass-card p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center justify-center">
            <Star className="w-5 h-5 text-yellow-400 mr-2" />
            How It Works
            <Star className="w-5 h-5 text-yellow-400 ml-2" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-white/70 text-sm">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-yellow-500 rounded-full text-gray-900 font-bold flex items-center justify-center mb-2">
                1
              </div>
              <span>Select Layout</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-yellow-500 rounded-full text-gray-900 font-bold flex items-center justify-center mb-2">
                2
              </div>
              <span>Take Photos</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-yellow-500 rounded-full text-gray-900 font-bold flex items-center justify-center mb-2">
                3
              </div>
              <span>Choose Frame</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-yellow-500 rounded-full text-gray-900 font-bold flex items-center justify-center mb-2">
                4
              </div>
              <span>Download</span>
            </div>
          </div>
        </div>

        {/* Developer Credits */}
        <div className="mt-8">
          <div className="glass-card p-4 max-w-sm mx-auto">
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
        </div>
      </div>
    </div>
  );
}
