import React, { useState, useEffect } from 'react';

// --- Définitions des Icônes SVG pour ScreenShareButton ---
const IconScreenShare = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><path d="M16 3h5v5"/><path d="M10 14L21 3"/></svg>
);

const IconScreenShareStop = ({ className = "w-5 h-5" }) => (
  // Utilisation d'une croix ou d'un écran barré simple
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><path d="M16 3h5v5"/><path d="M10 14L21 3"/><line x1="2" y1="2" x2="22" y2="22"/></svg> // Écran partagé avec une barre diagonale
);
// --- Fin Définitions des Icônes SVG ---

const ScreenShareButton = ({ onStreamChanged, onShareEnded, localStream }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);

  const startScreenShare = async () => {
    if (isSharing) return;
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 }
      });
      
      if (stream.getVideoTracks().length > 0) {
        stream.getVideoTracks()[0].onended = () => {
          console.log('Partage d\'écran arrêté par l\'utilisateur (via les contrôles du navigateur).');
          setIsSharing(false); 
        };
      }
      
      setScreenStream(stream);
      setIsSharing(true);
      onStreamChanged(stream, 'screen'); 
      console.log('Partage d\'écran démarré.');
    } catch (error) {
      console.error("Erreur lors du démarrage du partage d'écran:", error);
      if (error.name === 'NotAllowedError') {
        alert("Vous n'avez pas autorisé le partage d'écran.");
      } else {
        alert("Impossible de démarrer le partage d'écran. Vérifiez les permissions ou réessayez.");
      }
      setIsSharing(false); 
    }
  };

  const performStopScreenShare = (currentScreenStream) => {
    if (currentScreenStream) {
      currentScreenStream.getTracks().forEach(track => track.stop());
      console.log('Pistes du flux de partage d\'écran arrêtées.');
    }
    setScreenStream(null); 
    
    if (localStream) { 
      onStreamChanged(localStream, 'camera'); 
    } else { 
      onShareEnded();
    }
    console.log('Partage d\'écran arrêté.');
  };

  useEffect(() => {
    if (!isSharing && screenStream) {
      performStopScreenShare(screenStream);
    }
    return () => {
      if (isSharing && screenStream) { 
        console.log('Cleanup ScreenShareButton: arrêt du partage d\'écran au démontage.');
        performStopScreenShare(screenStream);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSharing]); 

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { return () => { if(screenStream) performStopScreenShare(screenStream) } }, [screenStream]);

  const handleToggleShare = () => {
    if (isSharing) {
      setIsSharing(false); 
    } else {
      startScreenShare(); 
    }
  };
  
  const buttonClassName = `p-2 sm:p-3 rounded-full ${isSharing ? 'bg-minimeet-action-red text-white' : 'bg-gray-200 hover:bg-gray-300 text-minimeet-text-dark'}`;

  return (
    <button
      onClick={handleToggleShare}
      title={isSharing ? "Arrêter le partage d'écran" : "Partager l'écran"}
      className={buttonClassName}
    >
      {isSharing ? <IconScreenShareStop /> : <IconScreenShare />}
    </button>
  );
};

export default ScreenShareButton; 