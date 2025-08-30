import { Camera, Grid, Layout, Frame } from 'lucide-react';
import { PHOTOBOOTH_LAYOUTS, type PhotoBoothLayout } from '../types';
import { usePhotobooth } from '../context/PhotoboothContext';

export function LayoutSelector() {
  const { setLayout, setCurrentStep } = usePhotobooth();

  const getLayoutIcon = (layoutId: string) => {
    switch (layoutId) {
      case 'strip-vertical':
      case 'strip-horizontal':
        return <Layout className="w-8 h-8" />;
      case 'grid-2x2':
        return <Grid className="w-8 h-8" />;
      case 'vertical-collage':
      case 'horizontal-collage':
        return <Frame className="w-8 h-8" />;
      default:
        return <Camera className="w-8 h-8" />;
    }
  };

  const getLayoutPreview = (layout: PhotoBoothLayout) => {
    const { frameSize, photoSlots, logoArea } = layout;
    const scale = 120 / Math.max(frameSize.pixelWidth, frameSize.pixelHeight);
    
    return (
      <div 
        className="relative border-2 border-white/30 bg-dark-800 mx-auto rounded-lg overflow-hidden shadow-xl"
        style={{
          width: frameSize.pixelWidth * scale,
          height: frameSize.pixelHeight * scale,
          maxWidth: '120px',
          maxHeight: '160px'
        }}
      >
        {/* Photo slots */}
        {photoSlots.map((slot, index) => (
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
            left: logoArea.x * scale,
            top: logoArea.y * scale,
            width: logoArea.pixelWidth * scale,
            height: logoArea.pixelHeight * scale,
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 25%, #f59e0b 50%, #d97706 75%, #b45309 100%)'
          }}
        >
          {/* Mini Peek logo representation */}
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-slate-800 rounded-sm flex-shrink-0"></div>
            <span className="text-slate-800 font-bold" style={{ fontSize: '6px' }}>peek</span>
          </div>
        </div>
      </div>
    );
  };

  const handleLayoutSelect = (layout: PhotoBoothLayout) => {
    setLayout(layout.id, layout);
    setCurrentStep('capture');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="text-4xl font-playfair font-bold text-white mb-4 text-shadow-lg">
          Choose Your Layout
        </h2>
        <p className="text-xl text-white/80">
          Select the perfect format for your photobooth experience
        </p>
      </div>

      {/* 2x6 inch layouts */}
      <div className="mb-12">
        <div className="animate-fade-in">
          <h3 className="text-2xl font-semibold text-yellow-400 mb-6 text-center text-shadow">
            2×6 inch Classic Strip Formats
          </h3>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {PHOTOBOOTH_LAYOUTS.filter(layout => layout.format === '2x6').map((layout, index) => (
            <div
              key={layout.id}
              onClick={() => handleLayoutSelect(layout)}
              className="layout-card group relative animate-slide-up"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 rounded-lg text-gray-900 group-hover:shadow-lg transition-all duration-300" style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 25%, #f59e0b 50%, #d97706 75%, #b45309 100%)'
                }}>
                  {getLayoutIcon(layout.id)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                    {layout.name}
                  </h3>
                  <p className="text-white/70">{layout.description}</p>
                </div>
              </div>
              
              <div className="flex justify-center mb-4">
                {getLayoutPreview(layout)}
              </div>
              
              <div className="text-center text-sm text-white/60">
                <p>{layout.frameSize.width}" × {layout.frameSize.height}" • {layout.totalPhotos} photos</p>
                <p>{layout.frameSize.pixelWidth} × {layout.frameSize.pixelHeight} pixels</p>
              </div>
              
              <div className="absolute inset-0 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300" style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 25%, #f59e0b 50%, #d97706 75%, #b45309 100%)'
              }}></div>
            </div>
          ))}
        </div>
      </div>

      {/* 4x6 inch layouts */}
      <div>
        <div className="animate-fade-in">
          <h3 className="text-2xl font-semibold text-yellow-400 mb-6 text-center text-shadow">
            4×6 inch Postcard Formats
          </h3>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {PHOTOBOOTH_LAYOUTS.filter(layout => layout.format === '4x6').map((layout, index) => (
            <div
              key={layout.id}
              onClick={() => handleLayoutSelect(layout)}
              className="layout-card group relative animate-slide-up"
              style={{ animationDelay: `${600 + index * 100}ms` }}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 rounded-lg text-gray-900 group-hover:shadow-lg transition-all duration-300" style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 25%, #f59e0b 50%, #d97706 75%, #b45309 100%)'
                }}>
                  {getLayoutIcon(layout.id)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors">
                    {layout.name}
                  </h3>
                  <p className="text-sm text-white/70">{layout.description}</p>
                </div>
              </div>
              
              <div className="flex justify-center mb-4">
                {getLayoutPreview(layout)}
              </div>
              
              <div className="text-center text-sm text-white/60">
                <p>{layout.frameSize.width}" × {layout.frameSize.height}" • {layout.totalPhotos} photos</p>
                <p>{layout.frameSize.pixelWidth} × {layout.frameSize.pixelHeight} pixels</p>
              </div>
              
              <div className="absolute inset-0 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300" style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 25%, #f59e0b 50%, #d97706 75%, #b45309 100%)'
              }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
