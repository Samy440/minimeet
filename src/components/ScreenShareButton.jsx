import React, { useState, useEffect, useRef } from 'react';

// --- Définitions des Icônes SVG pour ScreenShareButton ---
const IconScreenShare = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><path d="M16 3h5v5"/><path d="M10 14L21 3"/></svg>
);

const IconScreenShareStop = ({ className = "w-5 h-5" }) => (
  // Utilisation d'une croix ou d'un écran barré simple
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><path d="M16 3h5v5"/><path d="M10 14L21 3"/><line x1="2" y1="2" x2="22" y2="22"/></svg> // Écran partagé avec une barre diagonale
);
// --- Fin Définitions des Icônes SVG ---

const ScreenShareButton = ({ onStreamChanged, onShareEnded, localStream, buttonClassName: propButtonClassName, iconClassName: propIconClassName }) => {
  const [isSharing, setIsSharing] = useState(false);
  const screenStreamRef = useRef(null); // Utiliser useRef pour le screenStream afin d'éviter des re-render inutiles et garder une référence stable

  const startScreenShare = async () => {
    console.log('[ScreenShareButton] Attempting to start screen share...');
    if (isSharing) {
      console.log('[ScreenShareButton] Already sharing, aborting startScreenShare.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 }
      });
      
      console.log('[ScreenShareButton] getDisplayMedia SUCCESS. Stream:', stream);

      if (stream.getVideoTracks().length > 0) {
        const videoTrack = stream.getVideoTracks()[0];
        console.log('[ScreenShareButton] Video track obtained:', videoTrack, 'readyState:', videoTrack.readyState);
        videoTrack.onended = () => {
          console.log('[ScreenShareButton] videoTrack.onended TRIGGERED. Track readyState:', videoTrack.readyState);
          setIsSharing(false); 
        };
        console.log('[ScreenShareButton] videoTrack.onended handler assigned.');
      } else {
        console.warn('[ScreenShareButton] getDisplayMedia stream has NO video tracks!');
        // Arrêter toutes les pistes du flux (s'il y en a, par exemple audio seulement) et ne pas continuer
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      
      screenStreamRef.current = stream;
      setIsSharing(true);
      onStreamChanged(stream, 'screen'); 
      console.log('[ScreenShareButton] Screen sharing STARTED. isSharing: true');
    } catch (error) {
      console.error("[ScreenShareButton] Error during startScreenShare:", error.name, error.message, error);
      if (error.name === 'NotAllowedError') {
        alert("Vous n'avez pas autorisé le partage d'écran.");
      } else {
        alert("Impossible de démarrer le partage d'écran. Vérifiez les permissions ou réessayez.");
      }
      setIsSharing(false); 
      screenStreamRef.current = null; // S'assurer que la réf est nulle en cas d'erreur
    }
  };

  const performStopScreenShare = (streamToStop) => {
    console.log('[ScreenShareButton] performStopScreenShare CALLED. Stream to stop:', streamToStop);
    if (streamToStop) {
      streamToStop.getTracks().forEach(track => {
        console.log(`[ScreenShareButton] Stopping track: ${track.kind}, id: ${track.id}, readyState: ${track.readyState}`);
        track.stop();
        console.log(`[ScreenShareButton] Track ${track.id} readyState after stop(): ${track.readyState}`);
      });
      console.log('[ScreenShareButton] All tracks from streamToStop have been stopped.');
    }
    screenStreamRef.current = null; 
    
    // On notifie le parent pour qu'il repasse au flux de la caméra
    if (localStream) { 
      console.log('[ScreenShareButton] performStopScreenShare: Calling onStreamChanged to switch back to camera.');
      onStreamChanged(localStream, 'camera'); 
    } else { 
      console.warn('[ScreenShareButton] performStopScreenShare: No localStream (camera) to switch back to. Calling onShareEnded.');
      onShareEnded(); // Fallback si le flux caméra d'origine n'est pas disponible
    }
    console.log('[ScreenShareButton] Screen sharing STOPPED.');
  };

  useEffect(() => {
    console.log(`[ScreenShareButton useEffect for isSharing] isSharing changed to: ${isSharing}. screenStreamRef.current exists: ${!!screenStreamRef.current}`);
    if (!isSharing && screenStreamRef.current) { 
      console.log('[ScreenShareButton useEffect for isSharing] Condition met: !isSharing && screenStreamRef.current. Calling performStopScreenShare.');
      performStopScreenShare(screenStreamRef.current);
    }
    // Le cleanup de cet effet ne doit pas arrêter le partage si le composant est démonté alors qu'on partage encore.
    // L'arrêt doit être géré par le changement d'état de isSharing ou un cleanup global du composant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSharing]); 

  // Cleanup global si le composant est démonté alors que le partage est actif.
  useEffect(() => {
    const currentScreenStream = screenStreamRef.current; // Capturer la valeur actuelle pour le cleanup
    return () => {
      if (isSharing && currentScreenStream) { 
        console.log('[ScreenShareButton global cleanup useEffect] Component unmounting while sharing. Stopping screen share.');
        // Attention: setIsSharing(false) ici pourrait ne pas déclencher l'autre useEffect à temps.
        // Il est plus sûr d'appeler directement performStopScreenShare si on sait qu'il faut arrêter.
        performStopScreenShare(currentScreenStream); // Arrêter directement le flux
        // setIsSharing(false); // Peut être redondant ou trop tardif ici
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSharing]); // S'exécute aussi quand isSharing change, pour capturer le bon currentScreenStream si isSharing devient true.

  const handleToggleShare = () => {
    console.log(`[ScreenShareButton] handleToggleShare called. Current isSharing: ${isSharing}`);
    if (isSharing) {
      // Si l'utilisateur clique sur notre bouton pour arrêter
      console.log('[ScreenShareButton] handleToggleShare: User clicked to stop. Setting isSharing to false.');
      setIsSharing(false); // Ceci va déclencher l'useEffect qui appelle performStopScreenShare
      // Alternativement, si le flux a déjà été arrêté par le navigateur (onended), isSharing est déjà false.
      // Et si onended n'a pas encore tiré, on peut forcer l'arrêt des pistes ici :
      if (screenStreamRef.current) { performStopScreenShare(screenStreamRef.current); }
    } else {
      startScreenShare(); 
    }
  };
  
  const baseButtonClassName = "p-2 xs:p-2.5 sm:p-3 rounded-minimeet-full transition-colors";
  const currentButtonClassName = propButtonClassName 
    ? `${propButtonClassName} ${isSharing ? 'bg-minimeet-primary text-white' : ''}`
    : `${baseButtonClassName} ${isSharing ? 'bg-minimeet-primary text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`;
  const currentIconClassName = propIconClassName || "w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6";

  return (
    <button
      onClick={handleToggleShare}
      title={isSharing ? "Arrêter le partage d'écran" : "Partager l'écran"}
      className={currentButtonClassName}
    >
      {isSharing ? <IconScreenShareStop className={currentIconClassName} /> : <IconScreenShare className={currentIconClassName} />}
    </button>
  );
};

export default ScreenShareButton; 