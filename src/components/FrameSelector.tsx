import { Crown, Scroll, Gem, Mountain, X, Palette } from 'lucide-react';
import { usePhotobooth } from '../context/PhotoboothContext';

export function FrameSelector() {
  const { state, setFrame, setCurrentStep } = usePhotobooth();

  const templates = [
    { 
      id:'template-basic', 
      name:'Plain Canvas', 
      description:'Unadorned simplicity.', 
      background:'#ffffff',
      icon: X
    },
    { 
      id:'template-parchment', 
      name:'Parchment', 
      description:'Warm aged paper tone.', 
      background:'linear-gradient(135deg,#f3e4c2,#e7d4ac,#f3e4c2)', 
      frameStyle:'parchment',
      icon: Scroll
    },
    { 
      id:'template-classic-white', 
      name:'Classic Ivory', 
      description:'Soft ivory borders.', 
      background:'#ece9e2', 
      frameStyle:'classic-white',
      icon: Palette
    },
    { 
      id:'template-gold', 
      name:'Gilded', 
      description:'Lustrous golden accents.', 
      background:'linear-gradient(135deg,#1f1a11,#2b2416)', 
      frameStyle:'gold',
      icon: Crown
    },
    { 
      id:'template-ornate', 
      name:'Ornate Filigree', 
      description:'Baroque inspired etching.', 
      background:'radial-gradient(circle at 40% 35%,#3a3327,#18140f 70%)', 
      frameStyle:'ornate',
      icon: Gem
    },
    { 
      id:'template-marble', 
      name:'Marble Hall', 
      description:'Subtle veined marble.', 
      background:'linear-gradient(135deg,#f9f9f9,#e5e6ea 60%,#f0f1f4)', 
      frameStyle:'marble',
      icon: Mountain
    }
  ];

  const handleFrameSelect = (templateId: string) => {
    setFrame(templateId);
  };

  const getPreviewStyle = (template: typeof templates[0]) => {
    // Convert CSS background to inline style
    if (template.background.includes('linear-gradient(135deg,#f3e4c2,#e7d4ac,#f3e4c2)')) {
      return {
        background: 'linear-gradient(135deg, #f3e4c2, #e7d4ac, #f3e4c2)'
      };
    } else if (template.background.includes('linear-gradient(135deg,#1f1a11,#2b2416)')) {
      return {
        background: 'linear-gradient(135deg, #1f1a11, #2b2416)'
      };
    } else if (template.background.includes('radial-gradient')) {
      return {
        background: 'radial-gradient(circle at 40% 35%, #3a3327, #18140f 70%)'
      };
    } else if (template.background.includes('linear-gradient(135deg,#f9f9f9,#e5e6ea 60%,#f0f1f4)')) {
      return {
        background: 'linear-gradient(135deg, #f9f9f9, #e5e6ea 60%, #f0f1f4)'
      };
    } else {
      return {
        background: template.background
      };
    }
  };

  const getFrameBorderStyle = (frameStyle?: string) => {
    switch(frameStyle) {
      case 'gold':
        return 'border-2 border-yellow-400';
      case 'parchment':
        return 'border-2 border-amber-400';
      case 'ornate':
        return 'border-2 border-gray-400';
      case 'marble':
        return 'border-2 border-slate-400';
      case 'classic-white':
        return 'border-2 border-gray-200';
      default:
        return 'border border-gray-300';
    }
  };

  const renderLayoutPreview = (template: typeof templates[0]) => {
    if (!state.selectedLayoutData) return null;
    
    const layout = state.selectedLayoutData;
    const scale = 120 / Math.max(layout.frameSize.pixelWidth, layout.frameSize.pixelHeight);
    
    return (
      <div 
        className={`relative mx-auto rounded-lg overflow-hidden shadow-xl ${getFrameBorderStyle(template.frameStyle)}`}
        style={{
          width: layout.frameSize.pixelWidth * scale,
          height: layout.frameSize.pixelHeight * scale,
          maxWidth: '120px',
          maxHeight: '160px',
          ...getPreviewStyle(template)
        }}
      >
        {/* Photo slots */}
        {layout.photoSlots.map((slot, index) => (
          <div
            key={index}
            className="absolute bg-white/20 border border-white/40 flex items-center justify-center text-xs font-bold text-white/80 rounded-sm"
            style={{
              left: slot.x * scale,
              top: slot.y * scale,
              width: slot.pixelWidth * scale,
              height: slot.pixelHeight * scale,
            }}
          >
            {index + 1}
          </div>
        ))}
        
        {/* Logo area */}
        <div
          className="absolute border border-yellow-400/50 flex items-center justify-center text-xs font-bold text-yellow-900 rounded-sm overflow-hidden"
          style={{
            left: layout.logoArea.x * scale,
            top: layout.logoArea.y * scale,
            width: layout.logoArea.pixelWidth * scale,
            height: layout.logoArea.pixelHeight * scale,
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 25%, #f59e0b 50%, #d97706 75%, #b45309 100%)'
          }}
        >
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-slate-800 rounded-sm flex-shrink-0"></div>
            <span className="text-slate-800 font-bold" style={{ fontSize: '6px' }}>peek</span>
          </div>
        </div>
      </div>
    );
  };

  const handleContinue = () => {
    setCurrentStep('preview');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-playfair font-bold text-white mb-4">
          Choose Your Frame Style
        </h2>
        <p className="text-white/80">
          Select a beautiful frame template for your photobooth creation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {templates.map((template) => {
          const Icon = template.icon;
          const isSelected = state.selectedFrame === template.id;
          
          return (
            <div
              key={template.id}
              onClick={() => handleFrameSelect(template.id)}
              className={`
                glass-card p-6 cursor-pointer transition-all duration-300 relative
                ${isSelected 
                  ? 'ring-4 ring-yellow-400 scale-105 shadow-2xl shadow-yellow-400/25' 
                  : 'hover:scale-105 hover:shadow-xl hover:shadow-white/10'
                }
              `}
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-lg bg-yellow-400/20 text-yellow-400">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                
                <h3 className="font-semibold text-white mb-2 text-lg">
                  {template.name}
                </h3>
                
                {/* Template preview */}
                <div className="relative mb-4">
                  {renderLayoutPreview(template)}
                </div>
                
                <p className="text-sm text-white/70 mb-4">
                  {template.description}
                </p>
                
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-yellow-400 text-slate-900 px-2 py-1 rounded text-xs font-bold">
                      SELECTED
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <button
          onClick={handleContinue}
          disabled={!state.selectedFrame}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Preview Your Creation
        </button>
      </div>
    </div>
  );
}
