import React, { createContext, useState, useContext, useEffect } from 'react';

const AudioTranslationContext = createContext();

export const useAudioTranslation = () => useContext(AudioTranslationContext);

export const AudioTranslationProvider = ({ children }) => {
  const [audioData, setAudioData] = useState(() => {
    const savedData = sessionStorage.getItem('audioTranslationData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (parsedData.audioBlob) {
        parsedData.audioBlob = dataURItoBlob(parsedData.audioBlob);
      }
      return parsedData;
    }
    return {
      fileName: null,
      audioBlob: null,
      transcription: '',
      translation: '',
    };
  });

  useEffect(() => {
    const saveData = async () => {
      const dataToSave = { ...audioData };
      if (dataToSave.audioBlob instanceof Blob) {
        try {
          dataToSave.audioBlob = await blobToDataURI(dataToSave.audioBlob);
        } catch (error) {
          console.error('Error converting Blob to DataURI:', error);
          // Handle error (e.g., set audioBlob to null or don't save it)
          dataToSave.audioBlob = null;
        }
      }
      sessionStorage.setItem('audioTranslationData', JSON.stringify(dataToSave));
    };
    saveData();
  }, [audioData]);

  const updateAudioData = (newData) => {
    setAudioData(prevData => ({ ...prevData, ...newData }));
  };

  const clearAudioData = () => {
    setAudioData({
      fileName: null,
      audioBlob: null,
      transcription: '',
      translation: '',
    });
    sessionStorage.removeItem('audioTranslationData');
  };

  return (
    <AudioTranslationContext.Provider value={{ audioData, updateAudioData, clearAudioData }}>
      {children}
    </AudioTranslationContext.Provider>
  );
};

// Helper functions remain the same
function blobToDataURI(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(blob);
  });
}

function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}