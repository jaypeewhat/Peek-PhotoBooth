import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { PhotoBoothLayout } from '../types';

export interface PhotoboothState {
  photos: string[];
  selectedLayout: string | null;
  selectedLayoutData: PhotoBoothLayout | null;
  selectedFrame: string;
  isCapturing: boolean;
  isLoading: boolean;
  hasStarted: boolean;
  currentStep: 'layout' | 'capture' | 'frame' | 'preview';
}

interface PhotoboothContextType {
  state: PhotoboothState;
  addPhoto: (photo: string) => void;
  removePhoto: (index: number) => void;
  retakePhoto: (index: number, newPhoto: string) => void;
  setLayout: (layoutId: string, layoutData: PhotoBoothLayout) => void;
  setFrame: (frame: string) => void;
  setIsCapturing: (capturing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setHasStarted: (started: boolean) => void;
  setCurrentStep: (step: PhotoboothState['currentStep']) => void;
  resetPhotobooth: () => void;
}

const PhotoboothContext = createContext<PhotoboothContextType | undefined>(undefined);

const initialState: PhotoboothState = {
  photos: [],
  selectedLayout: null,
  selectedLayoutData: null,
  selectedFrame: 'template-basic',
  isCapturing: false,
  isLoading: false,
  hasStarted: false,
  currentStep: 'layout',
};

export function PhotoboothProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PhotoboothState>(initialState);

  const addPhoto = (photo: string) => {
    setState(prev => {
      const maxPhotos = prev.selectedLayoutData?.totalPhotos || 4;
      if (prev.photos.length >= maxPhotos) {
        return prev; // Don't add more photos if we've reached the limit
      }
      return {
        ...prev,
        photos: [...prev.photos, photo],
      };
    });
  };

  const removePhoto = (index: number) => {
    setState(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const retakePhoto = (index: number, newPhoto: string) => {
    setState(prev => {
      const newPhotos = [...prev.photos];
      newPhotos[index] = newPhoto;
      return {
        ...prev,
        photos: newPhotos,
      };
    });
  };

  const setLayout = (layoutId: string, layoutData: PhotoBoothLayout) => {
    setState(prev => ({ 
      ...prev, 
      selectedLayout: layoutId,
      selectedLayoutData: layoutData 
    }));
  };

  const setFrame = (frame: string) => {
    setState(prev => ({ ...prev, selectedFrame: frame }));
  };

  const setIsCapturing = (capturing: boolean) => {
    setState(prev => ({ ...prev, isCapturing: capturing }));
  };

  const setIsLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  };

  const setHasStarted = (started: boolean) => {
    setState(prev => ({ ...prev, hasStarted: started }));
  };

  const setCurrentStep = (step: PhotoboothState['currentStep']) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const resetPhotobooth = () => {
    setState(initialState);
  };

  return (
    <PhotoboothContext.Provider
      value={{
        state,
        addPhoto,
        removePhoto,
    retakePhoto,
        setLayout,
        setFrame,
        setIsCapturing,
        setIsLoading,
        setHasStarted,
        setCurrentStep,
        resetPhotobooth,
      }}
    >
      {children}
    </PhotoboothContext.Provider>
  );
}

export function usePhotobooth() {
  const context = useContext(PhotoboothContext);
  if (context === undefined) {
    throw new Error('usePhotobooth must be used within a PhotoboothProvider');
  }
  return context;
}
