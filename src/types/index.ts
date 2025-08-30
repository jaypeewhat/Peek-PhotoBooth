export interface PhotoBoothLayout {
  id: string;
  name: string;
  description: string;
  format: '2x6' | '4x6';
  orientation: 'portrait' | 'landscape';
  totalPhotos: number;
  frameSize: {
    width: number;
    height: number;
    pixelWidth: number;
    pixelHeight: number;
  };
  photoSlots: {
    width: number;
    height: number;
    pixelWidth: number;
    pixelHeight: number;
    x: number;
    y: number;
  }[];
  logoArea: {
    width: number;
    height: number;
    pixelWidth: number;
    pixelHeight: number;
    x: number;
    y: number;
    position: 'top' | 'bottom' | 'left' | 'right';
  };
}

export const PHOTOBOOTH_LAYOUTS: PhotoBoothLayout[] = [
  // 2x6 inch layouts
  {
    id: 'strip-vertical',
    name: 'Classic Vertical Strip',
    description: '2×6 inch vertical strip with 4 photos',
    format: '2x6',
    orientation: 'portrait',
    totalPhotos: 4,
    frameSize: {
      width: 2,
      height: 6,
      pixelWidth: 600,
      pixelHeight: 1800,
    },
    photoSlots: [
      { width: 1.9, height: 1.2, pixelWidth: 570, pixelHeight: 360, x: 15, y: 20 },
      { width: 1.9, height: 1.2, pixelWidth: 570, pixelHeight: 360, x: 15, y: 390 },
      { width: 1.9, height: 1.4, pixelWidth: 570, pixelHeight: 420, x: 15, y: 760 },
      { width: 1.9, height: 1.4, pixelWidth: 570, pixelHeight: 420, x: 15, y: 1190 },
    ],
    logoArea: {
      width: 2,
      height: 0.9,
      pixelWidth: 600,
      pixelHeight: 160,
      x: 0,
      y: 1640,
      position: 'bottom',
    },
  },
  {
    id: 'strip-horizontal',
    name: 'Horizontal Strip',
    description: '6×2 inch horizontal strip with 4 photos',
    format: '2x6',
    orientation: 'landscape',
    totalPhotos: 4,
    frameSize: {
      width: 6,
      height: 2,
      pixelWidth: 1800,
      pixelHeight: 600,
    },
    photoSlots: [
      { width: 1.2, height: 1.8, pixelWidth: 360, pixelHeight: 540, x: 30, y: 30 },
      { width: 1.2, height: 1.8, pixelWidth: 360, pixelHeight: 540, x: 400, y: 30 },
      { width: 1.2, height: 1.8, pixelWidth: 360, pixelHeight: 540, x: 770, y: 30 },
      { width: 1.2, height: 1.8, pixelWidth: 360, pixelHeight: 540, x: 1140, y: 30 },
    ],
    logoArea: {
      width: 1,
      height: 2,
      pixelWidth: 300,
      pixelHeight: 600,
      x: 1500,
      y: 0,
      position: 'right',
    },
  },
  // 4x6 inch layouts
  {
    id: 'grid-2x2',
    name: '2×2 Grid',
    description: '4×6 inch with 2×2 photo grid',
    format: '4x6',
    orientation: 'portrait',
    totalPhotos: 4,
    frameSize: {
      width: 4,
      height: 6,
      pixelWidth: 1200,
      pixelHeight: 1800,
    },
    photoSlots: [
      { width: 1.8, height: 2.0, pixelWidth: 540, pixelHeight: 600, x: 60, y: 320 },
      { width: 1.8, height: 2.0, pixelWidth: 540, pixelHeight: 600, x: 600, y: 320 },
      { width: 1.8, height: 2.4, pixelWidth: 540, pixelHeight: 720, x: 60, y: 940 },
      { width: 1.8, height: 2.4, pixelWidth: 540, pixelHeight: 720, x: 600, y: 940 },
    ],
    logoArea: {
      width: 4,
      height: 1,
      pixelWidth: 1200,
      pixelHeight: 300,
      x: 0,
      y: 0,
      position: 'top',
    },
  },
  {
    id: 'vertical-collage',
    name: 'Vertical Collage',
    description: '4×6 inch with 4 vertical photos',
    format: '4x6',
    orientation: 'portrait',
    totalPhotos: 4,
    frameSize: {
      width: 4,
      height: 6,
      pixelWidth: 1200,
      pixelHeight: 1800,
    },
    photoSlots: [
      { width: 3.8, height: 1.0, pixelWidth: 1140, pixelHeight: 300, x: 30, y: 320 },
      { width: 3.8, height: 1.0, pixelWidth: 1140, pixelHeight: 300, x: 30, y: 640 },
      { width: 3.8, height: 1.2, pixelWidth: 1140, pixelHeight: 360, x: 30, y: 960 },
      { width: 3.8, height: 1.2, pixelWidth: 1140, pixelHeight: 360, x: 30, y: 1340 },
    ],
    logoArea: {
      width: 4,
      height: 1,
      pixelWidth: 1200,
      pixelHeight: 300,
      x: 0,
      y: 0,
      position: 'top',
    },
  },
  {
    id: 'horizontal-collage',
    name: 'Horizontal Collage',
    description: '4×6 inch with 4 horizontal photos',
    format: '4x6',
    orientation: 'portrait',
    totalPhotos: 4,
    frameSize: {
      width: 4,
      height: 6,
      pixelWidth: 1200,
      pixelHeight: 1800,
    },
    photoSlots: [
      { width: 2.8, height: 1.2, pixelWidth: 840, pixelHeight: 360, x: 30, y: 20 },
      { width: 2.8, height: 1.2, pixelWidth: 840, pixelHeight: 360, x: 30, y: 390 },
      { width: 2.8, height: 1.4, pixelWidth: 840, pixelHeight: 420, x: 30, y: 760 },
      { width: 2.8, height: 1.4, pixelWidth: 840, pixelHeight: 420, x: 30, y: 1190 },
    ],
    logoArea: {
      width: 1,
      height: 6,
      pixelWidth: 300,
      pixelHeight: 1800,
      x: 900,
      y: 0,
      position: 'right',
    },
  },
];

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
}

export interface PhotoBoothState {
  currentStep: 'layout' | 'capture' | 'frame' | 'preview';
  selectedLayout: PhotoBoothLayout | null;
  capturedPhotos: CapturedPhoto[];
  selectedFrame: string;
  isProcessing: boolean;
}
