import { useRef } from 'react';
import { Download, ArrowLeft, RotateCcw } from 'lucide-react';
import { usePhotobooth } from '../context/PhotoboothContext';

export function PhotoPreview() {
  const { state, setCurrentStep, resetPhotobooth } = usePhotobooth();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const templates = [
    { 
      id:'template-basic', 
      name:'Plain Canvas', 
      background:'#ffffff'
    },
    { 
      id:'template-parchment', 
      name:'Parchment', 
      background:'linear-gradient(135deg,#f3e4c2,#e7d4ac,#f3e4c2)', 
      frameStyle:'parchment'
    },
    { 
      id:'template-classic-white', 
      name:'Classic Ivory', 
      background:'#ece9e2', 
      frameStyle:'classic-white'
    },
    { 
      id:'template-gold', 
      name:'Gilded', 
      background:'linear-gradient(135deg,#1f1a11,#2b2416)', 
      frameStyle:'gold'
    },
    { 
      id:'template-ornate', 
      name:'Ornate Filigree', 
      background:'radial-gradient(circle at 40% 35%,#3a3327,#18140f 70%)', 
      frameStyle:'ornate'
    },
    { 
      id:'template-marble', 
      name:'Marble Hall', 
      background:'linear-gradient(135deg,#f9f9f9,#e5e6ea 60%,#f0f1f4)', 
      frameStyle:'marble'
    }
  ];

  // Function to draw the Peek logo on canvas
  const drawPeekLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, isDarkBackground: boolean = false) => {
    const logoSize = Math.min(width * 0.8, height * 0.8);
    const logoX = x + (width - logoSize) / 2;
    const logoY = y + (height - logoSize) / 2;
    
    // Main rounded rectangle background
    ctx.fillStyle = isDarkBackground ? '#f7f3e8' : '#1e3a5f';
    const cornerRadius = logoSize * 0.13;
    
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoSize, logoSize, cornerRadius);
    ctx.fill();
    
    // Inner white/light area
    const innerSize = logoSize * 0.78;
    const innerX = logoX + (logoSize - innerSize) / 2;
    const innerY = logoY + (logoSize - innerSize) / 2;
    const innerRadius = cornerRadius * 0.5;
    
    ctx.fillStyle = isDarkBackground ? '#1e3a5f' : '#ffffff';
    ctx.beginPath();
    ctx.roundRect(innerX, innerY, innerSize, innerSize, innerRadius);
    ctx.fill();
    
    // Photo/image icon - circle (sun/moon)
    const circleRadius = logoSize * 0.07;
    const circleX = innerX + innerSize * 0.28;
    const circleY = innerY + innerSize * 0.28;
    
    ctx.fillStyle = isDarkBackground ? '#f7f3e8' : '#1e3a5f';
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Mountain/landscape silhouette
    const mountainY = innerY + innerSize * 0.72;
    const mountainStartX = innerX + innerSize * 0.05;
    const mountainEndX = innerX + innerSize * 0.95;
    
    ctx.beginPath();
    ctx.moveTo(mountainStartX, mountainY);
    ctx.lineTo(innerX + innerSize * 0.2, innerY + innerSize * 0.52);
    ctx.lineTo(innerX + innerSize * 0.35, innerY + innerSize * 0.62);
    ctx.lineTo(innerX + innerSize * 0.5, innerY + innerSize * 0.45);
    ctx.lineTo(innerX + innerSize * 0.65, innerY + innerSize * 0.55);
    ctx.lineTo(innerX + innerSize * 0.8, innerY + innerSize * 0.4);
    ctx.lineTo(mountainEndX, mountainY);
    ctx.closePath();
    ctx.fill();
    
    // Add "peek" text below the logo
    const textY = logoY + logoSize + (height - logoSize) * 0.3;
    const fontSize = Math.min(width * 0.15, height * 0.08);
    
    ctx.fillStyle = isDarkBackground ? '#f7f3e8' : '#1e3a5f';
    ctx.font = `700 ${fontSize}px "Playfair Display", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('peek', x + width / 2, textY);
  };

  const selectedTemplate = templates.find(t => t.id === state.selectedFrame);

  const renderPhotosInLayout = () => {
    if (!state.selectedLayoutData) return null;
    
    const layout = state.selectedLayoutData;
    // Make the preview much bigger - scale to 500px max instead of 300px
    const scale = 500 / Math.max(layout.frameSize.pixelWidth, layout.frameSize.pixelHeight);
    
    const getPreviewBackground = () => {
      if (!selectedTemplate) return { backgroundColor: '#ffffff' };
      
      // Convert template background to CSS exactly like download
      if (selectedTemplate.background.includes('linear-gradient(135deg,#f3e4c2,#e7d4ac,#f3e4c2)')) {
        return { background: 'linear-gradient(135deg, #f3e4c2, #e7d4ac, #f3e4c2)' };
      } else if (selectedTemplate.background.includes('linear-gradient(135deg,#1f1a11,#2b2416)')) {
        return { background: 'linear-gradient(135deg, #1f1a11, #2b2416)' };
      } else if (selectedTemplate.background.includes('radial-gradient')) {
        return { background: 'radial-gradient(circle at 40% 35%, #3a3327, #18140f 70%)' };
      } else if (selectedTemplate.background.includes('linear-gradient(135deg,#f9f9f9,#e5e6ea 60%,#f0f1f4)')) {
        return { background: 'linear-gradient(135deg, #f9f9f9, #e5e6ea 60%, #f0f1f4)' };
      } else {
        return { backgroundColor: selectedTemplate.background };
      }
    };
    
    return (
      <div 
        className="relative mx-auto overflow-hidden shadow-2xl"
        style={{
          width: layout.frameSize.pixelWidth * scale,
          height: layout.frameSize.pixelHeight * scale,
          maxWidth: '500px',
          maxHeight: '700px',
          borderRadius: '8px',
          ...getPreviewBackground()
        }}
      >
        {/* Photo slots with exact same spacing as download */}
        {layout.photoSlots.map((slot, index) => {
          const gap = 8 * scale; // 8px gap scaled - exactly like download
          const photoX = slot.x * scale + gap;
          const photoY = slot.y * scale + gap;
          const photoW = slot.pixelWidth * scale - (gap * 2);
          const photoH = slot.pixelHeight * scale - (gap * 2);
          
          return (
            <div
              key={index}
              className="absolute overflow-hidden"
              style={{
                left: photoX,
                top: photoY,
                width: photoW,
                height: photoH,
              }}
            >
              {/* White border exactly like download */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: '#ffffff',
                  margin: '-2px',
                  border: '2px solid #ffffff'
                }}
              />
              {/* Photo content */}
              <div className="relative w-full h-full">
                {state.photos[index] ? (
                  <img
                    src={state.photos[index]}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                    Photo {index + 1}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Logo area - show actual logo instead of just text */}
        <div
          className="absolute flex flex-col items-center justify-center"
          style={{
            left: layout.logoArea.x * scale,
            top: layout.logoArea.y * scale,
            width: layout.logoArea.pixelWidth * scale,
            height: layout.logoArea.pixelHeight * scale,
          }}
        >
          {/* Logo Icon */}
          <div 
            style={{
              width: Math.min(layout.logoArea.pixelWidth * scale * 0.6, layout.logoArea.pixelHeight * scale * 0.6),
              height: Math.min(layout.logoArea.pixelWidth * scale * 0.6, layout.logoArea.pixelHeight * scale * 0.6),
            }}
          >
            <svg 
              viewBox="0 0 120 120" 
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Main rounded rectangle background */}
              <rect 
                x="8" 
                y="8" 
                width="104" 
                height="104" 
                rx="16" 
                ry="16" 
                fill={selectedTemplate?.background.includes('linear-gradient(135deg,#1f1a11,#2b2416)') || 
                     selectedTemplate?.background.includes('radial-gradient') ? '#f7f3e8' : '#1e3a5f'}
              />
              
              {/* Inner white/light area */}
              <rect 
                x="18" 
                y="18" 
                width="84" 
                height="84" 
                rx="8" 
                ry="8" 
                fill={selectedTemplate?.background.includes('linear-gradient(135deg,#1f1a11,#2b2416)') || 
                     selectedTemplate?.background.includes('radial-gradient') ? '#1e3a5f' : '#ffffff'}
              />
              
              {/* Photo/image icon - circle */}
              <circle 
                cx="42" 
                cy="42" 
                r="8" 
                fill={selectedTemplate?.background.includes('linear-gradient(135deg,#1f1a11,#2b2416)') || 
                     selectedTemplate?.background.includes('radial-gradient') ? '#f7f3e8' : '#1e3a5f'}
              />
              
              {/* Mountain/landscape silhouette */}
              <path 
                d="M22 78 L35 58 L48 68 L62 52 L75 62 L88 48 L98 78 Z" 
                fill={selectedTemplate?.background.includes('linear-gradient(135deg,#1f1a11,#2b2416)') || 
                     selectedTemplate?.background.includes('radial-gradient') ? '#f7f3e8' : '#1e3a5f'}
              />
            </svg>
          </div>
          
          {/* Peek text below logo */}
          <span 
            className="font-bold font-playfair mt-1"
            style={{
              fontSize: Math.min(layout.logoArea.pixelHeight * scale * 0.15, layout.logoArea.pixelWidth * scale * 0.08),
              fontWeight: 700,
              color: selectedTemplate?.background.includes('linear-gradient(135deg,#1f1a11,#2b2416)') || 
                     selectedTemplate?.background.includes('radial-gradient') ? '#f7f3e8' : '#1e3a5f'
            }}
          >
            peek
          </span>
        </div>
      </div>
    );
  };

  const downloadCollage = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !state.selectedLayoutData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const layout = state.selectedLayoutData;
    canvas.width = layout.frameSize.pixelWidth;
    canvas.height = layout.frameSize.pixelHeight;

    // Apply template background
    if (selectedTemplate) {
      if (selectedTemplate.background.includes('linear-gradient(135deg,#1f1a11,#2b2416)')) {
        const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        g.addColorStop(0, '#1f1a11');
        g.addColorStop(1, '#2b2416');
        ctx.fillStyle = g;
      } else if (selectedTemplate.background.includes('radial-gradient')) {
        const g2 = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        g2.addColorStop(0, '#3a3327');
        g2.addColorStop(1, '#18140f');
        ctx.fillStyle = g2;
      } else if (selectedTemplate.background.includes('linear-gradient(135deg,#f9f9f9,#e5e6ea 60%,#f0f1f4)')) {
        const mg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        mg.addColorStop(0, '#f9f9f9');
        mg.addColorStop(0.6, '#e5e6ea');
        mg.addColorStop(1, '#f0f1f4');
        ctx.fillStyle = mg;
      } else if (selectedTemplate.background.includes('linear-gradient(135deg,#f3e4c2,#e7d4ac,#f3e4c2)')) {
        const pg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        pg.addColorStop(0, '#f3e4c2');
        pg.addColorStop(0.5, '#e7d4ac');
        pg.addColorStop(1, '#f3e4c2');
        ctx.fillStyle = pg;
      } else {
        ctx.fillStyle = selectedTemplate.background;
      }
    } else {
      ctx.fillStyle = '#ffffff';
    }
    
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Function to draw image with cover fit
    function drawCover(img: HTMLImageElement, x: number, y: number, w: number, h: number) {
      if (!ctx) return;
      
      const iw = img.naturalWidth || 1;
      const ih = img.naturalHeight || 1;
      const scale = Math.max(w / iw, h / ih);
      const dw = iw * scale, dh = ih * scale;
      const dx = x + (w - dw) / 2;
      const dy = y + (h - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    // Load and draw all photos
    const imgs = state.photos.map(url => {
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.src = url;
      return im;
    });

    let loaded = 0;
    const allLoaded = new Promise<void>(resolve => {
      imgs.forEach(im => {
        im.onload = () => {
          if (++loaded === imgs.length) resolve();
        };
        im.onerror = () => {
          if (++loaded === imgs.length) resolve();
        };
      });
    });

    allLoaded.then(() => {
      // Draw photos with minimal spacing - no frames, just direct photo placement
      layout.photoSlots.forEach((slot, i) => {
        // Small gap between photos like your reference image
        const gap = 8; // 8px gap between photos
        const photoX = slot.x + gap;
        const photoY = slot.y + gap;
        const photoW = slot.pixelWidth - (gap * 2);
        const photoH = slot.pixelHeight - (gap * 2);
        
        const im = imgs[i];
        if (im) {
          // Draw photo directly with small white border
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(photoX - 2, photoY - 2, photoW + 4, photoH + 4);
          
          // Draw the photo
          ctx.save();
          ctx.beginPath();
          ctx.rect(photoX, photoY, photoW, photoH);
          ctx.clip();
          drawCover(im, photoX, photoY, photoW, photoH);
          ctx.restore();
        } else {
          // Draw placeholder for missing photos
          ctx.fillStyle = '#f5f5f5';
          ctx.fillRect(photoX, photoY, photoW, photoH);
          ctx.fillStyle = '#9ca3af';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`Photo ${i + 1}`, photoX + photoW / 2, photoY + photoH / 2);
        }
      });
      
      // Draw logo area - actual logo instead of just text
      const logoArea = layout.logoArea;
      
      // Determine if we're on a dark background
      const isDarkBackground = selectedTemplate && (
        selectedTemplate.background.includes('linear-gradient(135deg,#1f1a11,#2b2416)') || 
        selectedTemplate.background.includes('radial-gradient')
      );
      
      // Draw the actual Peek logo
      drawPeekLogo(ctx, logoArea.x, logoArea.y, logoArea.pixelWidth, logoArea.pixelHeight, isDarkBackground);
      
      // Download the image
      const link = document.createElement('a');
      link.download = `peek-photobooth-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  const handleBack = () => {
    setCurrentStep('frame');
  };

  const handleStartOver = () => {
    resetPhotobooth();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-playfair font-bold text-white mb-4">
          Your Photobooth Creation
        </h2>
        <p className="text-white/80">
          Here's your final creation! Download it or start over.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="glass-card p-8">
          {renderPhotosInLayout()}
        </div>
      </div>

      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={downloadCollage}
          className="btn-primary text-lg px-8 py-4"
        >
          <Download className="w-6 h-6 mr-3" />
          Download Your Creation
        </button>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={handleBack}
          className="btn-secondary"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Frames
        </button>

        <button
          onClick={handleStartOver}
          className="btn-secondary"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Start Over
        </button>
      </div>

      {/* Hidden canvas for download */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
