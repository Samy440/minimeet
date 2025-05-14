import React, { useEffect, useRef } from 'react';

const VideoPlayer = ({ stream, isLocal = false, muted = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
    // Nettoyage si le flux change ou le composant est démonté
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        // @ts-ignore srcObject n'est pas toujours reconnu comme MediaStream par TS ici
        const tracks = videoRef.current.srcObject.getTracks();
        // Ne pas arrêter les pistes ici, car le flux peut être utilisé ailleurs
        // ou sa gestion (arrêt) est faite par le composant parent (MeetRoomPage)
        // tracks.forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline // Important pour la lecture automatique sur mobile
      muted={muted || isLocal} // Les flux locaux sont généralement mis en sourdine pour éviter l'écho
      className={`w-full h-full object-cover ${isLocal ? 'transform scale-x-[-1]' : ''}`}
      // La classe pour l'effet miroir sur la vidéo locale:
      // 'transform scale-x-[-1]' 
    />
  );
};

export default VideoPlayer; 