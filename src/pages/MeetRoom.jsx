import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { initializePeer, getPeer, callPeer, destroyPeer } from '../services/peerClient';

import VideoPlayer from '../components/VideoPlayer';
import ChatBox from '../components/ChatBox';
import ScreenShareButton from '../components/ScreenShareButton';
import SharedTodoList from '../components/SharedTodoList';

// --- Définitions des Icônes SVG ---
const IconArrowLeft = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);
const IconArrowRight = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);
const IconCheck = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
const IconXMark = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconMicOn = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.41 2.72 6.23 6 6.72V22h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/></svg>
);
const IconMicOff = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V6c0-1.66-1.34-3-3-3S9 4.34 9 6v.18l5.98 5.99zm-2.7 2.7L9.58 11.2c-.27.62-.43 1.31-.43 2.05H7.45c0-1.19.34-2.3.9-3.28l1.23 1.23c-.01.05-.03.11-.03.17C9.55 13.07 9 14.45 9 16v1H8v-1c0-2.54 1.58-4.72 3.79-5.62L5.51 4.11 4.22 5.4l15.66 15.66 1.29-1.29-4.19-4.19zM12 18c1.01 0 1.94-.44 2.6-.91l-1.68-1.68c-.29.04-.59.09-.91.09-.88 0-1.63-.27-2.24-.7L8.08 16.4C9.26 17.43 10.57 18 12 18z"/></svg>
);
const IconCamOn = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
);
const IconCamOff = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.55-.18L19.73 21 21 19.73 3.27 2zM6 16V8.12L13.88 16H6z"/></svg>
);
const IconRecord = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-4-4h8v-8H8v8z"/></svg>
);
const IconRecordStop = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zM8 8h8v8H8V8z"/></svg>
);
const IconLink = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
);
const IconSettings = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);
const IconPhoneHangUp = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 9c-1.6 0-3.15.25-4.62.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.26 0-.51-.1-.71-.29L.29 13.08c-.18-.2-.28-.47-.28-.73s.1-.52.28-.72C2.66 9.32 7.02 8 12 8s9.34 1.32 11.72 3.63c.18.2.28.47.28.72s-.1.52-.28.72l-2.47 2.47c-.2.19-.45.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.51-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
);
const IconDownload = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const IconUsers = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconChatBubbleLeftEllipsis = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M12 2.25c-5.122 0-9.25 3.194-9.25 7.134 0 2.304.943 4.342 2.503 5.675.981.834 2.183 1.386 3.44 1.615.16.029.298.16.337.322l.565 2.354a.75.75 0 001.408-.073l.562-2.346a.374.374 0 01.337-.322c1.257-.229 2.459-.78 3.44-1.615A8.84 8.84 0 0021.25 9.385C21.25 5.444 17.122 2.25 12 2.25zM8.25 9.75a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zm3.375 1.125a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
  </svg>
);
// --- Fin Définitions des Icônes SVG ---

const MeetRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [peerInstance, setPeerInstance] = useState(null);
  const [peerError, setPeerError] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const cameraStreamRef = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [connectedPeers, setConnectedPeers] = useState({});
  const [activeTab, setActiveTab] = useState('chat');
  const [roomParticipantsData, setRoomParticipantsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoiningRoom, setIsJoiningRoom] = useState(true);

  // État pour le flux affiché en grand
  const [mainDisplayedStreamInfo, setMainDisplayedStreamInfo] = useState({ stream: null, id: null, email: null, isLocal: true, fullName: 'Vous' });
  const carouselRef = useRef(null);

  // États pour l'enregistrement
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [downloadLink, setDownloadLink] = useState('');

  const [joiningUser, setJoiningUser] = useState(null);

  // États pour le minuteur
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0); // en secondes

  // Hook pour l'authentification
  useEffect(() => {
    const fetchUserSession = async () => {
      setIsLoadingUser(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser(session.user);
          console.log("[Auth] Session user loaded:", session.user.id);
          return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
          console.log("[Auth] User loaded via getUser:", user.id);
        } else {
          console.log("[Auth] No user session found, redirecting to login.");
          navigate('/login', { replace: true });
        }
      } catch (e) {
        console.error('MeetRoom: Exception dans fetchUserSession:', e);
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUserSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthListener] Event:', event, 'Session User ID:', session?.user?.id);
      const userFromSession = session?.user ?? null;
      setCurrentUser(userFromSession);
      setIsLoadingUser(false);

      if (!userFromSession && (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT')) {
        console.log(`[AuthListener] No user or signed out (${event}), redirecting to login.`);
        if (getPeer()) {
          console.log("[AuthListener] Cleaning up PeerJS due to user sign out or no initial user.");
          destroyPeer();
          setPeerInstance(null);
          setLocalStream(null);
          if(cameraStreamRef.current) {
            cameraStreamRef.current.getTracks().forEach(track => track.stop());
            cameraStreamRef.current = null;
          }
        }
        navigate('/login', { replace: true });
      }
    });
    return () => { 
      console.log('[AuthListener] Unsubscribing from auth changes.');
      authListener?.subscription?.unsubscribe(); 
    };
  }, [navigate]);

  // 1. Initialisation PeerJS & getUserMedia
  useEffect(() => {
    if (!currentUser?.id) {
      console.log('[Effect 1] Skipping PeerJS & Media Init: currentUser.id is null or undefined.');
      if (peerInstance) {
        console.log('[Effect 1] currentUser became null, destroying existing peerInstance (React state).');
        destroyPeer();
        setPeerInstance(null);
      }
      return;
    }

    console.log('[Effect 1] START: PeerJS & Media Init for user:', currentUser.id);
    setPeerError(null);
    setIsJoiningRoom(true);
    setIsLoading(true);

    const peerIdToInitialize = currentUser.id;
    let currentPeer = null;
    
    try {
      currentPeer = initializePeer(peerIdToInitialize);
    } catch (initError) {
      console.error("[Effect 1] EXCEPTION during initializePeer call:", initError);
      setPeerError({ message: "Exception lors de l'initialisation de PeerJS: " + initError.message });
      setIsJoiningRoom(false);
      setIsLoading(false);
      return;
    }

    if (!currentPeer) {
      console.error("[Effect 1] initializePeer returned null. PeerJS initialization failed (likely constructor error, already alerted by peerClient).");
      setPeerError({ message: "Le service PeerJS n'a pas pu être initialisé (instance nulle). Essayez d'actualiser." });
      setIsJoiningRoom(false);
      setIsLoading(false);
      return;
    }
    
    console.log("[Effect 1] Peer instance from initializePeer (currentPeer):", currentPeer.id, "Open:", currentPeer.open);
    setPeerInstance(currentPeer);

    const onOpenHandler = (id) => {
      console.log(`[Effect 1] PeerJS Event 'open': Successfully connected to PeerServer with ID: ${id}. Expected ID: ${peerIdToInitialize}`);
      setPeerError(null);

      console.log("[Effect 1] Attempting to get UserMedia...");
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(async stream => {
          console.log('[Effect 1] getUserMedia SUCCESS');
          if (stream.getAudioTracks().length > 0) {
            console.log('[Effect 1] Audio track found:', stream.getAudioTracks()[0].label, "Enabled:", stream.getAudioTracks()[0].enabled, "Muted:", stream.getAudioTracks()[0].muted);
          } else {
            console.warn('[Effect 1] NO Audio track found in getUserMedia stream!');
          }
          if (stream.getVideoTracks().length > 0) {
            console.log('[Effect 1] Video track found:', stream.getVideoTracks()[0].label, "Enabled:", stream.getVideoTracks()[0].enabled);
          } else {
            console.warn('[Effect 1] NO Video track found in getUserMedia stream!');
          }

          cameraStreamRef.current = stream;
          setLocalStream(stream);
          let userFullName = currentUser.email?.split('@')[0] || 'Vous';
          if (currentUser && currentUser.id) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', currentUser.id)
              .single();
            if (profileError) {
              console.warn(`[Effect 1] Erreur récupération profil local pour ${currentUser.id}:`, profileError.message);
            } else if (profile && profile.full_name) {
              userFullName = profile.full_name;
            }
          }
          setMainDisplayedStreamInfo({ stream: stream, id: peerIdToInitialize, email: currentUser.email, isLocal: true, fullName: userFullName });
        })
        .catch(err => {
          console.error('[Effect 1] getUserMedia ERROR:', err);
          setPeerError({ message: "Impossible d'accéder à la caméra/micro: " + err.message });
          alert("Impossible d'accéder à la caméra et/ou au microphone. Vérifiez les permissions et actualisez.");
          setIsJoiningRoom(false);
          setIsLoading(false);
          destroyPeer();
          setPeerInstance(null);
        });
    };

    const onErrorHandler = (err) => {
      console.error(`[Effect 1] PeerJS Event 'error': Type - ${err.type}`, err);
      setPeerError({ message: `Erreur PeerJS (${err.type}): ${err.message || 'Voir console pour détails'}. Essayez d'actualiser.` });
      if (err.type === 'unavailable-id') {
        alert("Erreur de connexion (PeerJS): L'identifiant de session est déjà utilisé ou invalide. Si le problème persiste, veuillez patienter quelques instants avant de réessayer ou contactez le support.");
      } else if (err.type === 'network' || err.type === 'server-error' || err.type === 'socket-error') {
        alert("Erreur de connexion au service de visioconférence (PeerJS). Vérifiez votre connexion internet ou réessayez plus tard.");
      }
      setIsJoiningRoom(false);
      setIsLoading(false);
    };
    
    const onCloseHandler = () => {
      console.log(`[Effect 1] PeerJS Event 'close': Connection for peer ${currentPeer?.id || peerIdToInitialize} has been closed.`);
      setPeerError({ message: "La connexion PeerJS a été fermée. Tentative de reconnexion ou actualisation nécessaire si cela persiste." });
      if (peerInstance?.id === (currentPeer?.id || peerIdToInitialize)) {
        setPeerInstance(null);
      }
      setIsJoiningRoom(false);
      setIsLoading(false);
    };

    currentPeer.on('open', onOpenHandler);
    currentPeer.on('error', onErrorHandler);
    currentPeer.on('close', onCloseHandler);

    if (currentPeer.open) {
      console.log("[Effect 1] Peer instance was already open. Manually triggering onOpenHandler logic.");
      onOpenHandler(currentPeer.id);
    }

    return () => { 
      console.log(`[Effect 1] CLEANUP for PeerJS init (user: ${peerIdToInitialize}, currentPeerId: ${currentPeer?.id}).`);
      if (currentPeer) {
        console.log(`[Effect 1 Cleanup] Removing event listeners from peer ${currentPeer.id}`);
        currentPeer.off('open', onOpenHandler);
        currentPeer.off('error', onErrorHandler);
        currentPeer.off('close', onCloseHandler);
      }
      // Si le composant est démonté et que nous avons encore un utilisateur valide ET une instance peer active,
      // cela signifie que le départ n'a pas été initié par handleLeaveRoom ou un changement d'auth.
      // C'est une sécurité supplémentaire pour tenter de nettoyer.
      if (currentUser?.id && getPeer()) { 
         console.log('[Effect 1 Cleanup] Component unmounting with active user/peer. Attempting leave actions as a fallback.');
         performLeaveActions().catch(err => console.error("[Effect 1 Cleanup] Error during fallback performLeaveActions:", err));
      }
      console.log("[Effect 1 Cleanup] Completed.");
    };
  }, [currentUser?.id, navigate]);

  // Effet pour démarrer le minuteur de la réunion
  useEffect(() => {
    // Démarrer le minuteur lorsque le flux local est prêt et que nous avons un utilisateur
    // (signe que la phase d'initialisation principale est terminée)
    if (localStream && currentUser && roomId && !startTime) {
      console.log("[Timer Effect] Starting meeting timer.");
      setStartTime(Date.now());
    }
    // Si l'utilisateur quitte ou que la room change, réinitialiser startTime pour permettre un redémarrage si nécessaire
    if ((!currentUser || !roomId) && startTime) {
      console.log("[Timer Effect] User left or room changed, resetting timer.");
      setStartTime(null);
      setElapsedTime(0);
    }
  }, [localStream, currentUser, roomId, startTime]);

  // Effet pour mettre à jour le temps écoulé
  useEffect(() => {
    if (!startTime) return; 

    const intervalId = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(intervalId); 
  }, [startTime]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');
    if (hours > 0) {
        return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    }
    return `${paddedMinutes}:${paddedSeconds}`;
  };

  const getNextMainDisplay = (leavingPeerId, currentRemoteStreams, currentLocalStream, currentLocalUser, currentCameraStreamRef) => {
    const remainingRemoteStreams = currentRemoteStreams.filter(s => s.id !== leavingPeerId && s.stream?.active);
    if (remainingRemoteStreams.length > 0) {
        console.log(`[getNextMainDisplay] Next main: Remote participant ${remainingRemoteStreams[0].fullName}`);
        return remainingRemoteStreams[0];
    } else if (currentLocalStream && currentLocalUser) {
        console.log(`[getNextMainDisplay] Next main: Local user`);
        const localIsScreen = currentLocalStream !== currentCameraStreamRef.current;
        const localId = localIsScreen ? currentLocalUser.id + '_screen' : currentLocalUser.id;
        const localFullName = localIsScreen
            ? `${(currentLocalUser.user_metadata?.full_name || currentLocalUser.email?.split('@')[0] || 'Utilisateur')} (Écran)`
            : (currentLocalUser.user_metadata?.full_name || currentLocalUser.email?.split('@')[0] || 'Vous');
        return {
            stream: currentLocalStream,
            id: localId,
            email: currentLocalUser.email,
            isLocal: true,
            fullName: localFullName
        };
    }
    console.log(`[getNextMainDisplay] Next main: None (no stream available)`);
    return { stream: null, id: null, email: null, isLocal: true, fullName: 'Aucun flux disponible' };
  };

  const performLeaveActions = async () => {
    console.log('[performLeaveActions] Initiating leave actions.');
    const currentUserId = currentUser?.id; // Capturer l'ID avant toute modification potentielle de currentUser
    const currentRoomId = roomId; // Capturer roomId

    if (isRecording) { // Arrêter l'enregistrement en premier
      console.log("[performLeaveActions] Stopping recording if active.");
      stopRecording();
    }

    if (currentUserId && currentRoomId) {
      try {
        console.log(`[performLeaveActions] Updating status to offline for user ${currentUserId} in room ${currentRoomId}`);
        await supabase
          .from('room_participants')
          .update({ status: 'offline', last_seen: new Date().toISOString() })
          .match({ room_id: currentRoomId, user_id: currentUserId }); 
        console.log('[performLeaveActions] Status updated to offline.');
      } catch (error) {
        console.error('[performLeaveActions] Error updating status to offline:', error);
      }
    }

    if (cameraStreamRef.current) {
      console.log('[performLeaveActions] Stopping cameraStreamRef tracks.');
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    // Le localStream est généralement soit cameraStreamRef.current, soit le flux de partage d'écran.
    // Si c'est le partage, ScreenShareButton devrait gérer son arrêt.
    // Si c'est cameraStreamRef, il vient d'être arrêté.
    // Mettre à null l'état React pour localStream est important.
    setLocalStream(null);  

    console.log('[performLeaveActions] Destroying PeerJS instance.');
    destroyPeer(); // Appel à la fonction de peerClient.js
    setPeerInstance(null); 
    
    // Nettoyage des états liés à la session de la salle
    setRemoteStreams([]);  
    setConnectedPeers({}); 
    setRoomParticipantsData([]);
    setMainDisplayedStreamInfo({ stream: null, id: null, email: null, isLocal: true, fullName: 'Vous' }); // Réinitialiser l'affichage principal
    setStartTime(null); // Réinitialiser le minuteur
    setElapsedTime(0);
    console.log('[performLeaveActions] Leave actions completed.');
  };

  const handleLeaveRoom = async () => {
    console.log('[handleLeaveRoom] User clicked leave room...');
    await performLeaveActions(); 
    console.log('[handleLeaveRoom] Navigating to dashboard.');
    navigate('/dashboard');
  };

  // 2. Gestion de la présence (Join Room) et appels initiaux
  useEffect(() => {
    if (!currentUser || !roomId || !peerInstance?.id || !localStream) {
      let reason = 'Skipping Effect 2: ';
      if (!currentUser) reason += 'currentUser is null; ';
      if (!roomId) reason += 'roomId is null; ';
      if (!peerInstance?.id) reason += 'peerInstance.id is null; ';
      if (!localStream) reason += 'localStream is null (VERY IMPORTANT FOR CALLS!); ';
      console.log(reason);
      return;
    }
    console.log(`[Effect 2] START: Joining room ${roomId} for user ${currentUser.id}, peer ${peerInstance.id} with localStream:`, localStream);
    setIsJoiningRoom(true);

    let isMounted = true;
    const managePresenceAndInitialCalls = async () => {
      if (!isMounted) {
        console.log('[Effect 2] Aborted: Component unmounted before operation could complete.');
        return;
      }
      
      try {
        try {
          console.log(`[Effect 2] Attempting to DELETE any existing participant record for peer_id: ${peerInstance.id}`);
          const { error: deleteError } = await supabase
            .from('room_participants')
            .delete()
            .match({ peer_id: peerInstance.id });

          if (deleteError) {
            console.warn('[Effect 2] Supabase DELETE prior participant by peer_id warning (non-fatal): ', JSON.stringify(deleteError, null, 2));
          } else {
            console.log(`[Effect 2] Successfully deleted prior participant record for peer_id: ${peerInstance.id} (if any existed).`);
          }
        } catch (delErr) {
           console.warn('[Effect 2] Exception during pre-emptive delete by peer_id:', delErr);
        }

        console.log('[Effect 2] Attempting to UPSERT participant record.');
        let currentUserFullName = currentUser.email?.split('@')[0] || 'Utilisateur';
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', currentUser.id)
          .single();

        if (profileError) {
          console.warn(`[Effect 2] Erreur récupération du profil pour ${currentUser.id}:`, profileError.message);
        } else if (profileData) {
          currentUserFullName = profileData.full_name || currentUserFullName;
        }
        
        const { error: upsertError } = await supabase
          .from('room_participants')
          .upsert({
            room_id: roomId,
            user_id: currentUser.id,
            peer_id: peerInstance.id,
            user_email: currentUser.email,
            status: 'online',
            last_seen: new Date().toISOString(),
            user_full_name: currentUserFullName,
          }, { onConflict: 'room_id, user_id' });

        if (!isMounted) return;
        if (upsertError) {
          console.error('[Effect 2] Supabase UPSERT ERROR:', JSON.stringify(upsertError, null, 2));
          alert(`Erreur connexion à la salle (upsert): ${upsertError.message}. Code: ${upsertError.code}. Détails: ${upsertError.details}`);
          setIsJoiningRoom(false);
          setIsLoading(false); 
          return;
        }
        console.log('[Effect 2] Supabase UPSERT SUCCESS for user:', currentUser.id);

        console.log('[Effect 2] Attempting to FETCH initial participants.');
        const { data: initialParticipants, error: fetchError } = await supabase
          .from('room_participants')
          .select('id, room_id, user_id, peer_id, user_email, status, user_full_name')
          .eq('room_id', roomId)
          .eq('status', 'online')
          .neq('peer_id', peerInstance.id);

        if (!isMounted) return;
        if (fetchError) {
          console.error('[Effect 2] Supabase FETCH initial participants ERROR:', fetchError);
        } else if (initialParticipants) {
          console.log('[Effect 2] Initial participants fetched:', initialParticipants.map(p=>p.user_full_name || p.user_email));
          setRoomParticipantsData(initialParticipants.filter(p => p.peer_id !== peerInstance.id)); 
          initialParticipants.forEach(participant => {
            if (participant.peer_id !== peerInstance.id) {
              console.log('[Effect 2] Initiating call to initial participant:', participant.user_full_name || participant.user_email, participant.peer_id);
              initiateCallToPeer(participant.peer_id, participant.user_email, participant.user_full_name);
            }
          });
        }
      } catch (error) {
        console.error('[Effect 2] UNEXPECTED ERROR during presence management:', error);
        if (isMounted) alert('Une erreur inattendue est survenue lors de la connexion à la salle.');
      } finally {
        if (isMounted) {
          console.log('[Effect 2] FINALLY block: Setting isJoiningRoom and isLoading to false.');
          setIsJoiningRoom(false);
          setIsLoading(false); 
        }
      }
    };

    managePresenceAndInitialCalls();
    return () => { 
      isMounted = false; 
      console.log('[Effect 2] CLEANUP: isMounted set to false.');
    }
  }, [currentUser, roomId, peerInstance?.id, localStream]); 

  // 3. Souscription Realtime aux changements des participants
  useEffect(() => {
    if (!roomId || !currentUser?.id || !peerInstance?.id || !localStream) {
        let reason = 'Skipping Effect 3 (Realtime Participants): ';
        if (!roomId) reason += 'roomId is null; ';
        if (!currentUser?.id) reason += 'currentUser.id is null; ';
        if (!peerInstance?.id) reason += 'peerInstance.id is null; ';
        if (!localStream) reason += 'localStream is null; ';
        console.log(reason);
        return;
    }
    console.log(`[Effect 3] START: Realtime subscription for room_participants ${roomId}`);
    const channelName = `room-${roomId}`;
    const participantSubscription = supabase.channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_participants', filter: `room_id=eq.${roomId}` }, payload => {
        console.log('[Effect 3] room_participants change received:', payload.eventType, payload.new || payload.old);
        const { eventType, new: newRecord, old: oldRecord } = payload;
        const recordPeerId = newRecord?.peer_id || oldRecord?.peer_id;
        const recordUserId = newRecord?.user_id || oldRecord?.user_id;
        let recordFullName = newRecord?.user_full_name || oldRecord?.user_full_name || newRecord?.user_email?.split('@')[0] || oldRecord?.user_email?.split('@')[0] || 'Participant';
        const recordEmail = newRecord?.user_email || oldRecord?.user_email;

        // Mise à jour de roomParticipantsData pour le panneau latéral (contient tous les autres utilisateurs en ligne)
        setRoomParticipantsData(currentParticipants => {
          let updatedParticipants = [...currentParticipants];
          if (eventType === 'INSERT') {
            if (newRecord.peer_id !== peerInstance.id && !updatedParticipants.find(p => p.peer_id === newRecord.peer_id)) {
                updatedParticipants.push(newRecord);
            }
          } else if (eventType === 'UPDATE') {
            updatedParticipants = updatedParticipants.map(p => p.peer_id === newRecord.peer_id ? newRecord : p);
          } else if (eventType === 'DELETE') {
            updatedParticipants = updatedParticipants.filter(p => p.peer_id !== oldRecord.peer_id);
          }
          return updatedParticipants;
        });

        // Si un nom/email est mis à jour pour un participant existant dans remoteStreams ou mainDisplay
        if (eventType === 'UPDATE' && recordPeerId && recordPeerId !== peerInstance.id) {
            setRemoteStreams(prev => prev.map(rs => {
                if (rs.id === recordPeerId) {
                    const newFullName = newRecord.user_full_name || (newRecord.user_email ? newRecord.user_email.split('@')[0] : rs.fullName); // Fallback to derived or existing
                    const newEmail = newRecord.user_email || rs.email;
                    if (newFullName !== rs.fullName || newEmail !== rs.email) {
                        console.log(`[Effect 3 - Name Update] Updating remoteStream for ${recordPeerId}. Name: ${rs.fullName} -> ${newFullName}, Email: ${rs.email} -> ${newEmail}`);
                        return { ...rs, fullName: newFullName, email: newEmail };
                    }
                }
                return rs;
            }));

            if (mainDisplayedStreamInfo.id === recordPeerId && !mainDisplayedStreamInfo.isLocal) {
                const newFullName = newRecord.user_full_name || (newRecord.user_email ? newRecord.user_email.split('@')[0] : mainDisplayedStreamInfo.fullName);
                const newEmail = newRecord.user_email || mainDisplayedStreamInfo.email;
                if (newFullName !== mainDisplayedStreamInfo.fullName || newEmail !== mainDisplayedStreamInfo.email) {
                    console.log(`[Effect 3 - Name Update] Updating mainDisplayedStreamInfo for ${recordPeerId}. Name: ${mainDisplayedStreamInfo.fullName} -> ${newFullName}, Email: ${mainDisplayedStreamInfo.email} -> ${newEmail}`);
                    setMainDisplayedStreamInfo(prevInfo => ({ ...prevInfo, fullName: newFullName, email: newEmail }));
                }
            }
        }

        if (eventType === 'INSERT' && newRecord.peer_id !== peerInstance.id && newRecord.status === 'online') {
          console.log(`[Effect 3] New participant ${recordFullName} joined (peer: ${recordPeerId}), initiating call.`);
          initiateCallToPeer(recordPeerId, newRecord.user_email, newRecord.user_full_name);
        } else if (eventType === 'UPDATE') {
          if (newRecord.status === 'offline') {
            const leavingPeerId = newRecord.peer_id;
            console.log(`[Effect 3] Participant ${recordFullName} (peer: ${leavingPeerId}) went offline.`);
            const wasMainDisplay = mainDisplayedStreamInfo.id === leavingPeerId;
            let nextMainInfo = null;

            if (wasMainDisplay) {
              const previewRemoteStreams = remoteStreams.filter(s => s.id !== leavingPeerId);
              nextMainInfo = getNextMainDisplay(leavingPeerId, previewRemoteStreams, localStream, currentUser, cameraStreamRef);
            }

            setRemoteStreams(prev => prev.filter(s => s.id !== leavingPeerId));
            if (connectedPeers[leavingPeerId]) {
              connectedPeers[leavingPeerId].close();
              setConnectedPeers(prev => { const updated = {...prev}; delete updated[leavingPeerId]; return updated; });
            }
            
            if (wasMainDisplay && nextMainInfo) {
              console.log(`[Effect 3 - UPDATE Offline] Setting main display to: ${nextMainInfo.fullName || 'None'}`);
              setMainDisplayedStreamInfo(nextMainInfo);
            } else if (wasMainDisplay) {
                console.warn("[Effect 3 - UPDATE Offline] Main display was leaving user, but no nextMainInfo determined. This shouldn't happen if getNextMainDisplay is robust.");
            }

          } else if (newRecord.status === 'online' && oldRecord?.status !== 'online' && !connectedPeers[recordPeerId]) {
            console.log(`[Effect 3] Participant ${recordFullName} (peer: ${recordPeerId}) came online, initiating call.`);
            initiateCallToPeer(recordPeerId, newRecord.user_email, newRecord.user_full_name);
          }
        } else if (eventType === 'DELETE') {
          const leavingPeerId = oldRecord.peer_id;
          console.log(`[Effect 3] Participant ${recordFullName} (peer: ${leavingPeerId}) left (deleted).`);
          const wasMainDisplay = mainDisplayedStreamInfo.id === leavingPeerId;
          let nextMainInfo = null;

          if (wasMainDisplay) {
            const previewRemoteStreams = remoteStreams.filter(s => s.id !== leavingPeerId);
            nextMainInfo = getNextMainDisplay(leavingPeerId, previewRemoteStreams, localStream, currentUser, cameraStreamRef);
          }

          setRemoteStreams(prev => prev.filter(s => s.id !== leavingPeerId));
          if (connectedPeers[leavingPeerId]) {
            connectedPeers[leavingPeerId].close();
            setConnectedPeers(prev => { const updated = {...prev}; delete updated[leavingPeerId]; return updated; });
          }

          if (wasMainDisplay && nextMainInfo) {
            console.log(`[Effect 3 - DELETE] Setting main display to: ${nextMainInfo.fullName || 'None'}`);
            setMainDisplayedStreamInfo(nextMainInfo);
          } else if (wasMainDisplay) {
            console.warn("[Effect 3 - DELETE] Main display was leaving user, but no nextMainInfo determined. This shouldn't happen if getNextMainDisplay is robust.");
          }
        }
      })
      .subscribe(status => {
        if (status === 'SUBSCRIBED') console.log(`[Effect 3] Successfully subscribed to room_participants ${channelName}`);
        else if (status === 'CHANNEL_ERROR') console.error(`[Effect 3] Realtime subscription error on room_participants ${channelName}`);
        else if (status === 'TIMED_OUT') console.warn(`[Effect 3] Realtime subscription timed out on room_participants ${channelName}`);
        else console.log(`[Effect 3] Realtime status for room_participants ${channelName}: ${status}`);
      });
    return () => { 
      console.log(`[Effect 3] CLEANUP: Unsubscribing from room_participants ${channelName}`); 
      supabase.removeChannel(participantSubscription).catch(err => console.error('[Effect 3 Cleanup] Error removing channel:', err)); 
    };
  }, [currentUser?.id, roomId, peerInstance?.id, localStream, connectedPeers, mainDisplayedStreamInfo, remoteStreams]);

  // 4. Gestion des appels entrants PeerJS
  useEffect(() => {
    const currentPeer = getPeer();
    if (!currentPeer || !localStream) {
        let reason = 'Skipping Effect 4 (Incoming Calls): ';
        if (!currentPeer) reason += 'currentPeer is null; ';
        if (!localStream) reason += 'localStream is null; ';
        console.log(reason);
        return;
    }
    console.log(`[Effect 4] START: Setting up incoming call handler for peer ${currentPeer.id} with localStream:`, localStream);
    
    const handleIncomingCall = call => {
      console.log(`[Effect 4] Incoming call from ${call.peer} with metadata:`, call.metadata);
      console.log('[Effect 4] Answering call with localStream:', localStream);
      if(localStream.getAudioTracks().length > 0) {
        console.log('[Effect 4] Local audio track for answering call:', localStream.getAudioTracks()[0]);
      } else {
        console.warn('[Effect 4] Answering call WITHOUT local audio track!');
      }
      call.answer(localStream);
      
      const participantInfo = roomParticipantsData.find(p => p.peer_id === call.peer) || call.metadata?.participantInfo;
      const participantEmail = participantInfo?.user_email || 'Pair distant';
      const participantFullName = participantInfo?.user_full_name || participantEmail.split('@')[0];
      
      call.on('stream', remoteStream => { 
        console.log(`[Effect 4] Stream received from ${call.peer} (${participantFullName}). Stream:`, remoteStream);
        if (remoteStream.getAudioTracks().length > 0) {
            console.log(`[Effect 4] REMOTE Audio track found from ${call.peer}:`, remoteStream.getAudioTracks()[0]);
            console.log(`[Effect 4] REMOTE Audio track enabled:`, remoteStream.getAudioTracks()[0].enabled);
            console.log(`[Effect 4] REMOTE Audio track muted state:`, remoteStream.getAudioTracks()[0].muted);
        } else {
            console.warn(`[Effect 4] NO REMOTE Audio track found in stream from ${call.peer}!`);
        }
        if (remoteStream.getVideoTracks().length > 0) {
            console.log(`[Effect 4] REMOTE Video track found from ${call.peer}:`, remoteStream.getVideoTracks()[0]);
        } else {
            console.warn(`[Effect 4] NO REMOTE Video track found in stream from ${call.peer}!`);
        }

        setRemoteStreams(prevRemoteStreams => {
          const newRemoteStreamData = { id: call.peer, stream: remoteStream, email: participantEmail, fullName: participantFullName, isLocal: false };
          let updatedRemoteStreams;
          const existingStreamIndex = prevRemoteStreams.findIndex(s => s.id === call.peer);

          if (existingStreamIndex !== -1) {
            console.log(`[Effect 4] Updating existing remote stream for ${call.peer}`);
            updatedRemoteStreams = [...prevRemoteStreams];
            updatedRemoteStreams[existingStreamIndex] = newRemoteStreamData;
          } else {
            console.log(`[Effect 4] Adding new remote stream for ${call.peer}`);
            updatedRemoteStreams = [...prevRemoteStreams, newRemoteStreamData];
          }

          // Logique pour changer le mainDisplayedStreamInfo si le premier distant arrive
          // et que l'affichage principal est actuellement le flux local.
          if (mainDisplayedStreamInfo.isLocal && updatedRemoteStreams.length === 1 && prevRemoteStreams.length === 0) {
            console.log(`[Main Display Logic - Incoming Call] First remote participant ${newRemoteStreamData.fullName} arrived. Switching main display.`);
            setMainDisplayedStreamInfo(newRemoteStreamData); // newRemoteStreamData a déjà isLocal: false
          }
          return updatedRemoteStreams;
        });
        setConnectedPeers(prev => ({ ...prev, [call.peer]: call }));
      });
      
      call.on('close', () => { 
        console.log(`[Effect 4] Call with ${call.peer} (${participantFullName}) closed.`);
        setRemoteStreams(prev => prev.filter(s => s.id !== call.peer)); 
        setConnectedPeers(prev => { const n = {...prev}; delete n[call.peer]; return n; });
        if (mainDisplayedStreamInfo.id === call.peer && localStream) {
            let localUserFullName = currentUser.email?.split('@')[0] || 'Vous';
            const localProfile = roomParticipantsData.find(p => p.user_id === currentUser.id);
            if (localProfile && localProfile.user_full_name) {
                localUserFullName = localProfile.user_full_name;
            }
            setMainDisplayedStreamInfo({ stream: localStream, id: currentUser.id, email: currentUser.email, isLocal: true, fullName: localUserFullName });
        }
      });
      
      call.on('error', err => { 
        console.error(`[Effect 4] Error on call with ${call.peer} (${participantFullName}):`, err); 
        setRemoteStreams(prev => prev.filter(s => s.id !== call.peer));
        setConnectedPeers(prev => { const n = {...prev}; delete n[call.peer]; return n; });
        if (mainDisplayedStreamInfo.id === call.peer && localStream) {
             let localUserFullName = currentUser.email?.split('@')[0] || 'Vous';
             const localProfile = roomParticipantsData.find(p => p.user_id === currentUser.id);
             if (localProfile && localProfile.user_full_name) {
                 localUserFullName = localProfile.user_full_name;
             }
             setMainDisplayedStreamInfo({ stream: localStream, id: currentUser.id, email: currentUser.email, isLocal: true, fullName: localUserFullName });
        }
      });
    };
    
    currentPeer.on('call', handleIncomingCall);
    
    return () => { 
      console.log(`[Effect 4] CLEANUP: Removing call handler for peer ${currentPeer.id}`); 
      if (currentPeer && typeof currentPeer.off === 'function') {
        currentPeer.off('call', handleIncomingCall); 
      }
    };
  }, [localStream, roomParticipantsData, mainDisplayedStreamInfo, currentUser?.id, currentUser?.email]);

  // Fonction pour appeler un autre pair
  const initiateCallToPeer = (remotePeerId, remoteUserEmail = 'Pair distant', remoteUserFullName) => {
    if (!localStream || !remotePeerId || !peerInstance?.id) {
      console.warn('[initiateCallToPeer] Aborted: missing localStream, remotePeerId, or peerInstance.id. LocalStream:', localStream);
      return;
    }
    if (remotePeerId === peerInstance.id) {
      console.warn('[initiateCallToPeer] Aborted: cannot call self');
      return;
    }
    if (connectedPeers[remotePeerId]) {
      console.log(`[initiateCallToPeer] Aborted: already connected or connecting to ${remotePeerId}`);
      return;
    }
    console.log(`[initiateCallToPeer] Attempting to call ${remoteUserFullName || remoteUserEmail} (${remotePeerId}) with localStream:`, localStream);
    if(localStream.getAudioTracks().length > 0) {
        console.log('[initiateCallToPeer] Local audio track for outgoing call:', localStream.getAudioTracks()[0]);
    } else {
        console.warn('[initiateCallToPeer] Initiating call WITHOUT local audio track!');
    }
    const call = callPeer(remotePeerId, localStream, {
        metadata: { 
            participantInfo: { 
                user_id: currentUser.id, 
                user_email: currentUser.email, 
                user_full_name: roomParticipantsData.find(p => p.user_id === currentUser.id)?.user_full_name || currentUser.email?.split('@')[0]
            }
        }
    });
    if (call) {
      setConnectedPeers(prev => ({ ...prev, [remotePeerId]: call })); 
      call.on('stream', (remoteStream) => {
        console.log(`[initiateCallToPeer] Stream received from ${remotePeerId} (${remoteUserFullName}). Stream:`, remoteStream);
        if (remoteStream.getAudioTracks().length > 0) {
            console.log(`[initiateCallToPeer] REMOTE Audio track found from ${remotePeerId}:`, remoteStream.getAudioTracks()[0]);
            console.log(`[initiateCallToPeer] REMOTE Audio track enabled:`, remoteStream.getAudioTracks()[0].enabled);
            console.log(`[initiateCallToPeer] REMOTE Audio track muted state:`, remoteStream.getAudioTracks()[0].muted);
        } else {
            console.warn(`[initiateCallToPeer] NO REMOTE Audio track found in stream from ${remotePeerId}!`);
        }
        if (remoteStream.getVideoTracks().length > 0) {
            console.log(`[initiateCallToPeer] REMOTE Video track found from ${remotePeerId}:`, remoteStream.getVideoTracks()[0]);
        } else {
            console.warn(`[initiateCallToPeer] NO REMOTE Video track found in stream from ${remotePeerId}!`);
        }
        setRemoteStreams(prevRemoteStreams => {
          const newRemoteStreamData = { id: remotePeerId, stream: remoteStream, email: remoteUserEmail, fullName: remoteUserFullName, isLocal: false };
          let updatedRemoteStreams;
          const existingStreamIndex = prevRemoteStreams.findIndex(s => s.id === remotePeerId);

          if (existingStreamIndex !== -1) {
            console.log(`[initiateCallToPeer] Updating existing remote stream for ${remotePeerId}`);
            updatedRemoteStreams = [...prevRemoteStreams];
            updatedRemoteStreams[existingStreamIndex] = newRemoteStreamData;
          } else {
            console.log(`[initiateCallToPeer] Adding new remote stream for ${remotePeerId}`);
            updatedRemoteStreams = [...prevRemoteStreams, newRemoteStreamData];
          }

          // Logique pour changer le mainDisplayedStreamInfo si le premier distant arrive
          // et que l'affichage principal est actuellement le flux local.
          if (mainDisplayedStreamInfo.isLocal && updatedRemoteStreams.length === 1 && prevRemoteStreams.length === 0) {
            console.log(`[Main Display Logic - Outgoing Call] First remote participant ${newRemoteStreamData.fullName} connected. Switching main display.`);
            setMainDisplayedStreamInfo(newRemoteStreamData); // newRemoteStreamData a déjà isLocal: false
          }
          return updatedRemoteStreams;
        });
      });
      call.on('close', () => {
        console.log(`[initiateCallToPeer] Call with ${remotePeerId} (${remoteUserFullName}) closed.`);
        setRemoteStreams(prev => prev.filter(s => s.id !== remotePeerId));
        setConnectedPeers(prev => { const n = {...prev}; delete n[remotePeerId]; return n; });
        if (mainDisplayedStreamInfo.id === remotePeerId && localStream) {
            let localUserFullName = currentUser.email?.split('@')[0] || 'Vous';
            const localProfile = roomParticipantsData.find(p => p.user_id === currentUser.id);
            if (localProfile && localProfile.user_full_name) {
                localUserFullName = localProfile.user_full_name;
            }
            setMainDisplayedStreamInfo({ stream: localStream, id: currentUser.id, email: currentUser.email, isLocal: true, fullName: localUserFullName });
        }
      });
      call.on('error', (err) => {
        console.error(`[initiateCallToPeer] Error on outgoing call to ${remotePeerId} (${remoteUserFullName}):`, err);
        setRemoteStreams(prev => prev.filter(s => s.id !== remotePeerId));
        setConnectedPeers(prev => { const n = {...prev}; delete n[remotePeerId]; return n; });
        if (mainDisplayedStreamInfo.id === remotePeerId && localStream) {
             let localUserFullName = currentUser.email?.split('@')[0] || 'Vous';
             const localProfile = roomParticipantsData.find(p => p.user_id === currentUser.id);
             if (localProfile && localProfile.user_full_name) {
                 localUserFullName = localProfile.user_full_name;
             }
             setMainDisplayedStreamInfo({ stream: localStream, id: currentUser.id, email: currentUser.email, isLocal: true, fullName: localUserFullName });
        }
      });
    } else {
      console.error(`[initiateCallToPeer] Failed to initiate call to ${remotePeerId}. callPeer returned null.`);
    }
  };

  // Fonctions pour le partage d'écran
  const handleActiveStreamChange = (newActiveStream, type) => {
    console.log(`[handleActiveStreamChange] Type: ${type}, new stream has ${newActiveStream?.getTracks().length} tracks. Stream object:`, newActiveStream);
    const currentActiveCameraStream = cameraStreamRef.current;
    let streamToDisplayInMain, idToDisplay, emailToDisplay, isLocalToDisplay, fullNameToDisplay;

    let currentLocalUserFullName = mainDisplayedStreamInfo.isLocal ? mainDisplayedStreamInfo.fullName : (roomParticipantsData.find(p => p.user_id === currentUser.id)?.user_full_name || currentUser.email?.split('@')[0] || 'Vous');
    console.log(`[handleActiveStreamChange] currentLocalUserFullName determined as: ${currentLocalUserFullName}`);

    if (type === 'screen') {
      console.log("[handleActiveStreamChange] Processing 'screen' type. New stream:", newActiveStream);
      setLocalStream(newActiveStream);
      streamToDisplayInMain = newActiveStream;
      idToDisplay = currentUser.id + '_screen';
      emailToDisplay = currentUser.email;
      isLocalToDisplay = true;
      fullNameToDisplay = `${currentLocalUserFullName} (Écran)`;
      console.log("[handleActiveStreamChange] Screen share stream set as localStream. Main display info prepped.");

      if (Object.keys(connectedPeers).length === 0) {
        console.warn("[handleActiveStreamChange] Screen share: No connected peers to send the new stream to.");
      }
      Object.values(connectedPeers).forEach(call => {
        console.log(`[handleActiveStreamChange] Screen share: Replacing tracks for peer ${call.peer}`);
        const videoSender = call.peerConnection?.getSenders().find(s => s.track?.kind === 'video');
        if (videoSender && newActiveStream.getVideoTracks()[0]) {
          console.log(`[handleActiveStreamChange] Screen share: Replacing video track for ${call.peer}`, newActiveStream.getVideoTracks()[0]);
          videoSender.replaceTrack(newActiveStream.getVideoTracks()[0])
            .then(() => console.log(`[handleActiveStreamChange] Screen share: Video track REPLACED for ${call.peer}`))
            .catch(err => console.error(`[handleActiveStreamChange] Screen share: Erreur replaceTrack video for ${call.peer}:`, err));
        } else {
          console.warn(`[handleActiveStreamChange] Screen share: No video sender or no video track in new stream for ${call.peer}. VideoSender:`, videoSender, 'NewVideoTrack:', newActiveStream.getVideoTracks()[0]);
        }
        
        const audioSender = call.peerConnection?.getSenders().find(s => s.track?.kind === 'audio');
        if (audioSender) {
          if (newActiveStream.getAudioTracks()[0]) {
            console.log(`[handleActiveStreamChange] Screen share: Replacing audio track (from screen) for ${call.peer}`, newActiveStream.getAudioTracks()[0]);
            audioSender.replaceTrack(newActiveStream.getAudioTracks()[0])
              .then(() => console.log(`[handleActiveStreamChange] Screen share: Audio track (from screen) REPLACED for ${call.peer}`))
              .catch(err => console.error(`[handleActiveStreamChange] Screen share: Erreur replaceTrack audio (from screen) for ${call.peer}:`, err));
          } else if (currentActiveCameraStream?.getAudioTracks()[0]) {
            console.log(`[handleActiveStreamChange] Screen share: Replacing audio track (fallback to camera mic) for ${call.peer}`, currentActiveCameraStream.getAudioTracks()[0]);
            audioSender.replaceTrack(currentActiveCameraStream.getAudioTracks()[0])
              .then(() => console.log(`[handleActiveStreamChange] Screen share: Audio track (camera fallback) REPLACED for ${call.peer}`))
              .catch(err => console.error(`[handleActiveStreamChange] Screen share: Erreur replaceTrack audio (camera fallback) for ${call.peer}:`, err));
          } else {
            console.warn(`[handleActiveStreamChange] Screen share: No new audio track from screen and no camera audio track for ${call.peer}`);
          }
        } else {
            console.warn(`[handleActiveStreamChange] Screen share: No audio sender for ${call.peer}`);
        }
      });
    } else if (type === 'camera') {
      console.log("[handleActiveStreamChange] Processing 'camera' type. Camera stream:", currentActiveCameraStream);
      if (currentActiveCameraStream) {
        setLocalStream(currentActiveCameraStream);
        streamToDisplayInMain = currentActiveCameraStream;
        idToDisplay = currentUser.id;
        emailToDisplay = currentUser.email;
        isLocalToDisplay = true;
        fullNameToDisplay = currentLocalUserFullName;
        console.log("[handleActiveStreamChange] Camera stream re-set as localStream. Main display info prepped.");

        if (Object.keys(connectedPeers).length === 0) {
            console.warn("[handleActiveStreamChange] Camera switch: No connected peers to send the new stream to.");
        }
        Object.values(connectedPeers).forEach(call => {
          console.log(`[handleActiveStreamChange] Camera switch: Replacing tracks for peer ${call.peer}`);
          const videoSender = call.peerConnection?.getSenders().find(s => s.track?.kind === 'video');
          if (videoSender && currentActiveCameraStream.getVideoTracks()[0]) {
            console.log(`[handleActiveStreamChange] Camera switch: Replacing video track for ${call.peer}`, currentActiveCameraStream.getVideoTracks()[0]);
            videoSender.replaceTrack(currentActiveCameraStream.getVideoTracks()[0])
              .then(() => console.log(`[handleActiveStreamChange] Camera switch: Video track REPLACED for ${call.peer}`))
              .catch(err => console.error(`[handleActiveStreamChange] Camera switch: Erreur replaceTrack video for ${call.peer}:`, err));
          } else {
            console.warn(`[handleActiveStreamChange] Camera switch: No video sender or no video track in camera stream for ${call.peer}`);
          }
          const audioSender = call.peerConnection?.getSenders().find(s => s.track?.kind === 'audio');
          if (audioSender && currentActiveCameraStream.getAudioTracks()[0]) {
            console.log(`[handleActiveStreamChange] Camera switch: Replacing audio track for ${call.peer}`, currentActiveCameraStream.getAudioTracks()[0]);
            audioSender.replaceTrack(currentActiveCameraStream.getAudioTracks()[0])
              .then(() => console.log(`[handleActiveStreamChange] Camera switch: Audio track REPLACED for ${call.peer}`))
              .catch(err => console.error(`[handleActiveStreamChange] Camera switch: Erreur replaceTrack audio for ${call.peer}:`, err));
          } else {
            console.warn(`[handleActiveStreamChange] Camera switch: No audio sender or no audio track in camera stream for ${call.peer}`);
          }
        });
      } else {
        console.error("[handleActiveStreamChange] Cannot switch to camera: cameraStreamRef.current is null");
        return;
      }
    } else {
        console.error("[handleActiveStreamChange] Unknown type for handleActiveStreamChange:", type);
        return;
    }
    
    const localCameraId = currentUser.id;
    const localScreenId = currentUser.id + '_screen';

    if (mainDisplayedStreamInfo.id === localCameraId || mainDisplayedStreamInfo.id === localScreenId || type === 'screen') {
        console.log("[handleActiveStreamChange] Updating mainDisplayedStreamInfo due to local change or screen share start.");
        setMainDisplayedStreamInfo({
            stream: streamToDisplayInMain,
            id: idToDisplay,
            email: emailToDisplay,
            isLocal: isLocalToDisplay,
            fullName: fullNameToDisplay
        });
    } else {
        console.log("[handleActiveStreamChange] Main display is a remote stream, not updating it for local stream change unless it was a screen share start.");
    }
  };

  // Fonctions pour l'enregistrement
  const startRecording = () => {
    console.log('[startRecording] Called');
    const streamToRecord = mainDisplayedStreamInfo.stream;

    if (!streamToRecord || streamToRecord.getTracks().length === 0) {
      alert('Aucun flux média principal disponible pour l\'enregistrement.');
      return;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        alert('Enregistrement déjà en cours.');
        return;
    }

    recordedChunksRef.current = [];
    setDownloadLink('');

    try {
      const options = { mimeType: 'video/webm; codecs=vp9' };
      mediaRecorderRef.current = new MediaRecorder(streamToRecord, options);
    } catch (e1) {
      console.warn('MediaRecorder avec vp9 échoué, essai avec vp8:', e1.message);
      try {
        const options = { mimeType: 'video/webm; codecs=vp8' }; 
        mediaRecorderRef.current = new MediaRecorder(streamToRecord, options);
      } catch (e2) {
         console.error('MediaRecorder avec vp8 a aussi échoué:', e2.message);
         alert("Impossible de démarrer l'enregistrement. Format non supporté par le navigateur.");
         return;
      }
    }

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, {
        type: 'video/webm'
      });
      const url = URL.createObjectURL(blob);
      setDownloadLink(url);
      console.log('Enregistrement terminé, lien de téléchargement généré.');
      recordedChunksRef.current = [];
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
    console.log('Enregistrement démarré.');
  };

  const stopRecording = () => {
    console.log('[stopRecording] Called');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
        console.warn('Aucun enregistrement en cours à arrêter.');
    }
  };

  const handleToggleRecording = () => { if (isRecording) stopRecording(); else startRecording(); };

  const toggleMic = () => {
    console.log('[toggleMic] Called. Current isMicMuted state:', isMicMuted);
    if (cameraStreamRef.current && cameraStreamRef.current.getAudioTracks().length > 0) {
      const audioTrack = cameraStreamRef.current.getAudioTracks()[0];
      const targetTrackEnabledState = isMicMuted; 
      audioTrack.enabled = targetTrackEnabledState;
      setIsMicMuted(!targetTrackEnabledState); 
      console.log(`[toggleMic] Mic audioTrack.enabled now: ${audioTrack.enabled}. New UI isMicMuted: ${!targetTrackEnabledState}`);
    } else {
      console.warn('[toggleMic] No audio track found on cameraStreamRef or cameraStreamRef not ready.');
    }
  };
  
  const toggleCam = () => {
    console.log('[toggleCam] Called. Current isCamOff state:', isCamOff);
    if (cameraStreamRef.current && cameraStreamRef.current.getVideoTracks().length > 0) {
      const videoTrack = cameraStreamRef.current.getVideoTracks()[0];
      const targetTrackEnabledState = isCamOff; 
      videoTrack.enabled = targetTrackEnabledState;
      setIsCamOff(!targetTrackEnabledState); 
      console.log(`[toggleCam] Cam videoTrack.enabled now: ${videoTrack.enabled}. New UI isCamOff: ${!targetTrackEnabledState}`);
      
      if (localStream === cameraStreamRef.current) {
        if (!videoTrack.enabled && mainDisplayedStreamInfo.id === currentUser.id) {
          console.log("[toggleCam] Camera (main display) turned off.");
        }
      } else {
         console.log("[toggleCam] Camera toggled while screen sharing. Change will apply to camera stream, not the active local (screen) stream.");
      }

    } else {
      console.warn('[toggleCam] No video track found on cameraStreamRef or cameraStreamRef not ready.');
    }
  };

  const handleCopyLink = () => { navigator.clipboard.writeText(window.location.href).then(() => alert('Lien copié !')).catch(err => console.error(err)); };
  const handleAcceptJoin = () => { if (joiningUser) { console.log(`User ${joiningUser.name} accepted.`); setJoiningUser(null); } };
  const handleRejectJoin = () => { if (joiningUser) { console.log(`User ${joiningUser.name} rejected.`); setJoiningUser(null); } };

  // Fonction pour changer le flux principal affiché
  const handleThumbnailClick = (streamInfo) => {
    console.log("Thumbnail clicked:", streamInfo.id, "Current main:", mainDisplayedStreamInfo.id);
    setMainDisplayedStreamInfo(streamInfo);
  };

  // Fonction pour faire défiler le carrousel
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -carouselRef.current.offsetWidth * 0.75 : carouselRef.current.offsetWidth * 0.75;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScreenShareEndFallback = () => {
    console.log('[handleScreenShareEndFallback] Called');
    const currentActiveCameraStream = cameraStreamRef.current;
    if (currentActiveCameraStream && localStream !== currentActiveCameraStream) {
      console.log('Fallback: Partage écran terminé, retour caméra.');
      let localUserFullName = 'Vous';
      const localProfile = roomParticipantsData.find(p => p.user_id === currentUser?.id && p.user_full_name);
      if (localProfile) { 
        localUserFullName = localProfile.user_full_name;
      } else if (currentUser?.email) { 
        localUserFullName = currentUser.email.split('@')[0];
      }

      handleActiveStreamChange(currentActiveCameraStream, 'camera');
      // S'assurer que mainDisplayedStreamInfo est mis à jour si l'écran partagé était affiché
      if (mainDisplayedStreamInfo.id === currentUser?.id + '_screen') {
        setMainDisplayedStreamInfo({ 
            stream: currentActiveCameraStream, 
            id: currentUser?.id, 
            email: currentUser?.email, 
            isLocal: true, 
            fullName: localUserFullName 
        });
      }
    } else if (!currentActiveCameraStream) {
      console.warn('Partage écran terminé, mais flux caméra original non trouvé.');
      // S'il n'y a plus de flux caméra, il faut au moins arrêter d'envoyer des pistes vidéo aux pairs
      Object.values(connectedPeers).forEach(call => {
        const videoSender = call.peerConnection?.getSenders().find(s => s.track?.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(null).catch(e => console.warn("Can't send null track on screen share end", e));
        }
      });
      setLocalStream(null); // Plus de flux local actif
      if (mainDisplayedStreamInfo.id === currentUser?.id + '_screen') {
        setMainDisplayedStreamInfo({ stream: null, id: null, email: null, isLocal: true, fullName: 'Vous' });
      }
    }
  };

  if (isLoadingUser) {
    return <div className="w-screen min-h-screen flex items-center justify-center bg-minimeet-background"><p className="text-minimeet-text-secondary text-lg">Vérification de l'utilisateur...</p></div>;
  }
  
  if (!currentUser) {
    console.log('MeetRoom: currentUser est null après chargement, redirection attendue via onAuthStateChange.');
    return <div className="w-screen min-h-screen flex items-center justify-center bg-minimeet-background"><p className="text-minimeet-text-secondary text-lg">Redirection...</p></div>; 
  }

  if (peerError && !localStream) {
    return (
      <div className="w-screen min-h-screen flex flex-col items-center justify-center bg-minimeet-background p-4 text-center">
        <h1 className="text-xl font-semibold text-minimeet-error mb-2">Erreur de Connexion Visioconférence</h1>
        <p className="text-minimeet-text-secondary mb-4">{peerError.message}</p>
        <p className="text-sm text-minimeet-text-muted">Cela peut être dû à un problème réseau, à l'identifiant de session déjà utilisé, ou à une incompatibilité navigateur.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-4 py-2 bg-minimeet-primary text-white rounded-minimeet-md hover:bg-minimeet-primary-hover focus:outline-none focus:ring-2 focus:ring-minimeet-primary-focus">
          Actualiser la page
        </button>
      </div>
    );
  }

  if (isJoiningRoom && !localStream) {
    return <div className="w-screen min-h-screen flex items-center justify-center bg-minimeet-background"><p className="text-minimeet-text-secondary text-lg">Initialisation du service de visioconférence...</p></div>;
  }
  if (!peerInstance && !peerError && !localStream) {
    return <div className="w-screen min-h-screen flex items-center justify-center bg-minimeet-background"><p className="text-minimeet-text-secondary text-lg">Préparation de la connexion PeerJS...</p></div>;
  }
  if (!localStream && !peerError && peerInstance) {
    return <div className="w-screen min-h-screen flex items-center justify-center bg-minimeet-background"><p className="text-minimeet-text-secondary text-lg">Accès caméra/micro...</p></div>;
  }
  
  if (isLoading) { 
    return <div className="w-screen min-h-screen flex items-center justify-center bg-minimeet-background"><p className="text-minimeet-text-secondary text-lg">Chargement des données de la salle...</p></div>;
  }
  
  const currentUserFullName = mainDisplayedStreamInfo.isLocal ? mainDisplayedStreamInfo.fullName : (roomParticipantsData.find(p => p.user_id === currentUser.id)?.user_full_name || currentUser.email?.split('@')[0] || 'Vous');
  
  const onlineParticipantsForSidePanel = roomParticipantsData.filter(p => p.status === 'online' && p.peer_id !== peerInstance?.id);

  // Préparer les éléments pour le carrousel
  const carouselItems = [];
  remoteStreams.forEach(remote => {
    if (mainDisplayedStreamInfo.id !== remote.id) {
      carouselItems.push({ ...remote, isLocal: false });
    }
  });
  const localStreamId = localStream === cameraStreamRef.current ? currentUser.id : currentUser.id + '_screen';
  if (localStream && mainDisplayedStreamInfo.id !== localStreamId) {
    const localUserStreamData = mainDisplayedStreamInfo.id === localStreamId ? mainDisplayedStreamInfo : {
        stream: localStream,
        id: localStreamId,
        email: currentUser.email,
        isLocal: true,
        fullName: localStreamId.includes('_screen') ? `${currentUserFullName} (Écran)`: currentUserFullName
    };
    carouselItems.push(localUserStreamData);
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-minimeet-background font-sans overflow-hidden">
      <header className="h-[60px] bg-minimeet-surface text-minimeet-text-primary flex items-center justify-between px-4 sm:px-6 shadow-minimeet-md flex-shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/dashboard')} className="p-1.5 rounded-minimeet-full hover:bg-minimeet-background focus:outline-none focus:ring-2 focus:ring-minimeet-primary focus:ring-opacity-50"><IconArrowLeft className="w-5 h-5 text-minimeet-text-secondary" /></button>
          <div>
            <h1 className="text-base sm:text-lg font-semibold truncate" title={roomId}>{`Réunion: ${roomId.length > 15 ? roomId.substring(0,12)+'...' : roomId}`}</h1>
            <p className="text-xs text-minimeet-text-muted">
              {currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Hôte'}{' '}
              {startTime && (
                <span className="bg-black text-white px-1.5 py-0.5 rounded-minimeet-sm ml-1">
                  {formatTime(elapsedTime)}
                </span>
              )}
            </p>
          </div>
        </div>
        {joiningUser && (
          <div className="absolute left-1/2 -translate-x-1/2 top-3 sm:top-auto sm:relative sm:left-auto sm:translate-x-0 flex items-center space-x-3 bg-minimeet-surface p-2.5 rounded-minimeet-lg shadow-minimeet-lg border border-minimeet-border">
            <p className="text-sm text-minimeet-text-secondary"><span className="font-medium text-minimeet-text-primary">{joiningUser.name}</span> veut rejoindre</p>
            <button onClick={handleRejectJoin} title="Refuser" className="p-1.5 bg-minimeet-error/10 hover:bg-minimeet-error/20 rounded-minimeet-full text-minimeet-error focus:outline-none focus:ring-2 focus:ring-minimeet-error"><IconXMark /></button>
            <button onClick={handleAcceptJoin} title="Accepter" className="p-1.5 bg-minimeet-success/10 hover:bg-minimeet-success/20 rounded-minimeet-full text-minimeet-success focus:outline-none focus:ring-2 focus:ring-minimeet-success"><IconCheck /></button>
          </div>
        )}
        {!joiningUser && <div className="w-[200px] hidden sm:block"></div>}
      </header>

      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        <main className="flex-grow flex flex-col p-3 sm:p-4 bg-minimeet-background lg:overflow-y-auto">
          <div className="flex-grow">
            <div className="flex-grow flex items-start justify-center">
              <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-xl flex items-center justify-center text-white relative mt-4 lg:max-w-5xl xl:max-w-6xl mx-auto">
                {mainDisplayedStreamInfo.stream && mainDisplayedStreamInfo.stream.active ? (
                    <VideoPlayer 
                      stream={mainDisplayedStreamInfo.stream} 
                      isLocal={mainDisplayedStreamInfo.isLocal} 
                      muted={mainDisplayedStreamInfo.isLocal} 
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-minimeet-text-muted">
                        <IconCamOff className="w-16 h-16 opacity-50 mb-2"/>
                        <p >{mainDisplayedStreamInfo.id ? `Le flux de ${mainDisplayedStreamInfo.fullName || mainDisplayedStreamInfo.email?.split('@')[0] || 'participant'} n'est pas disponible.` : 'Aucun flux à afficher...'}</p>
                    </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2.5 py-1 rounded-minimeet-md text-sm font-medium">
                  {mainDisplayedStreamInfo.fullName || mainDisplayedStreamInfo.email?.split('@')[0] || (mainDisplayedStreamInfo.id || '').substring(0,8)}
                  {mainDisplayedStreamInfo.isLocal && !mainDisplayedStreamInfo.id?.includes("_screen") && ' (Vous)'}
                </div>
              </div>
            </div>
          </div>
          
          {(carouselItems.length > 0 || (remoteStreams.length === 0 && !isLoading && !isJoiningRoom) ) && (
            <div className="relative flex-shrink-0 mt-3">
              {carouselItems.length > 1 && (
                <>
                  <button 
                    onClick={() => scrollCarousel('left')}
                    className="absolute left-0.5 top-1/2 -translate-y-1/2 z-10 p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 text-white rounded-full focus:outline-none shadow-md"
                    aria-label="Précédent"
                  >
                    <IconArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button 
                    onClick={() => scrollCarousel('right')}
                    className="absolute right-0.5 top-1/2 -translate-y-1/2 z-10 p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 text-white rounded-full focus:outline-none shadow-md"
                    aria-label="Suivant"
                  >
                    <IconArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </>
              )}
              <div 
                ref={carouselRef}
                className="h-28 sm:h-32 md:h-36 flex items-center space-x-2 sm:space-x-3 overflow-x-auto px-1 py-1.5 bg-minimeet-surface/50 backdrop-blur-sm rounded-minimeet-lg shadow-minimeet-sm scrollbar-hide"
              >
                {carouselItems.length > 0 ? (
                    carouselItems.map(item => (
                    <div 
                        key={item.id} 
                        className="h-full aspect-video bg-black rounded-minimeet-md overflow-hidden relative flex-shrink-0 shadow-md cursor-pointer hover:ring-2 hover:ring-minimeet-primary focus:outline-none focus:ring-2 focus:ring-minimeet-primary"
                        onClick={() => handleThumbnailClick(item)}
                        tabIndex={0}
                        onKeyPress={(e) => e.key === 'Enter' && handleThumbnailClick(item)}
                    >
                        <VideoPlayer 
                            stream={item.stream} 
                            isLocal={item.isLocal} 
                            muted={item.isLocal}
                        />
                        <div className="absolute bottom-1 left-1.5 bg-black/60 text-white px-1.5 py-0.5 rounded-minimeet-sm text-xs truncate max-w-[calc(100%-12px)]">
                            {item.fullName || item.email?.split('@')[0] || item.id.substring(0,8)}
                            {item.isLocal && !item.id?.includes("_screen") && ' (Vous)'}
                        </div>
                    </div>
                    ))
            ) : (
                <div className="h-full flex items-center justify-center w-full">
                    <p className="text-sm text-minimeet-text-muted italic">
                        {isJoiningRoom || isLoading ? "Recherche de participants..." : "Aucun autre participant pour le moment."}
                    </p>
                </div>
            )}
          </div>
            </div>
          )}

          <div className="mt-auto pt-3 sm:pt-4 flex items-center justify-center w-full z-10 flex-shrink-0">
            <div className="flex items-center flex-wrap justify-center gap-1.5 xs:gap-2 sm:gap-3 bg-minimeet-dark-panel/80 backdrop-blur-md p-2 xs:p-2.5 sm:p-3 rounded-minimeet-full shadow-minimeet-lg">
                <button onClick={toggleMic} title={isMicMuted ? "Activer micro" : "Couper micro"} className={`p-2 xs:p-2.5 sm:p-3 rounded-minimeet-full transition-colors ${isMicMuted ? 'bg-minimeet-error text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}>{isMicMuted ? <IconMicOff className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"/> : <IconMicOn className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"/>}</button>
                <button onClick={toggleCam} title={isCamOff ? "Activer caméra" : "Désactiver caméra"} className={`p-2 xs:p-2.5 sm:p-3 rounded-minimeet-full transition-colors ${isCamOff ? 'bg-minimeet-error text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}>{isCamOff ? <IconCamOff className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"/> : <IconCamOn className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"/>}</button>
                <ScreenShareButton 
                    onStreamChanged={handleActiveStreamChange} 
                    onShareEnded={handleScreenShareEndFallback} 
                    localStream={cameraStreamRef.current}
                    buttonClassName="p-2 xs:p-2.5 sm:p-3 rounded-minimeet-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                    iconClassName="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"
                />
                <button 
                    onClick={handleToggleRecording} 
                    title={isRecording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement (flux principal)"} 
                    className={`p-2 xs:p-2.5 sm:p-3 rounded-minimeet-full transition-colors ${isRecording ? 'bg-minimeet-primary text-white animate-pulse' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
                    {isRecording ? <IconRecordStop className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"/> : <IconRecord className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"/>}
                </button>
                <button 
                    onClick={() => setActiveTab('chat')} 
                    title="Afficher le Chat" 
                    className={`hidden sm:flex p-2 xs:p-2.5 sm:p-3 rounded-minimeet-full transition-colors ${activeTab === 'chat' ? 'bg-minimeet-primary text-white' : 'bg-minimeet-background hover:bg-minimeet-background-hover text-minimeet-text-primary'}`}>
                    <IconChatBubbleLeftEllipsis className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"/>
                </button>
                <button 
                    onClick={() => setActiveTab('participants')} 
                    title="Afficher les Participants" 
                    className={`hidden sm:flex p-2 xs:p-2.5 sm:p-3 rounded-minimeet-full transition-colors ${activeTab === 'participants' ? 'bg-minimeet-primary text-white' : 'bg-minimeet-background hover:bg-minimeet-background-hover text-minimeet-text-primary'}`}>
                    <IconUsers className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"/>
                </button>
                <button 
                    onClick={handleLeaveRoom}
                    title="Quitter la réunion"
                    className="p-2 xs:p-2.5 sm:p-3 rounded-minimeet-full bg-minimeet-error hover:bg-red-700 text-white transition-colors">
                    <IconPhoneHangUp className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"/>
                </button>
                {downloadLink && (
                  <a href={downloadLink} download={`minimeet-recording-${roomId}-${new Date().toISOString().slice(0,10)}.webm`} title="Télécharger l'enregistrement" className="p-2 xs:p-2.5 sm:p-3 rounded-minimeet-full bg-minimeet-success hover:bg-green-600 text-white transition-colors flex items-center justify-center">
                    <IconDownload className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"/>
                  </a>
                )}
                <button onClick={handleCopyLink} title="Copier le lien de la réunion" className="hidden lg:flex p-2 xs:p-2.5 sm:p-3 rounded-minimeet-full bg-white/20 hover:bg-white/30 text-white transition-colors items-center justify-center">
                    <IconLink className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"/>
                </button>
                 <button title="Paramètres (bientôt)" className="hidden lg:flex p-2 xs:p-2.5 sm:p-3 rounded-minimeet-full bg-white/20 hover:bg-white/30 text-white transition-colors items-center justify-center cursor-not-allowed opacity-70">
                    <IconSettings className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"/>
                </button>
            </div>
          </div>
        </main>
        <aside className={`w-full lg:w-[320px] xl:w-[360px] bg-minimeet-surface flex-shrink-0 flex flex-col border-l border-minimeet-border lg:h-full ${activeTab === 'none' && 'hidden lg:flex'}`}>
          <div className="h-[40%] p-2 border-b border-minimeet-border lg:overflow-y-auto">
            {currentUser && roomId && <SharedTodoList roomId={roomId} currentUser={currentUser} />}
          </div>

          <div className="h-[60%] flex flex-col">
            <div className="p-3 border-b border-minimeet-border flex lg:hidden items-center justify-center space-x-2">
                  <button 
                      onClick={() => setActiveTab(activeTab === 'chat' ? 'none' : 'chat')} 
                      title={activeTab === 'chat' ? "Masquer le Chat" : "Afficher le Chat"}
                      className={`p-2 rounded-minimeet-md transition-colors w-full ${activeTab === 'chat' ? 'bg-minimeet-primary text-white' : 'bg-minimeet-background hover:bg-minimeet-background-hover text-minimeet-text-primary'}`}>
                      <IconChatBubbleLeftEllipsis className="w-5 h-5 mx-auto"/>
                  </button>
                  <button 
                      onClick={() => setActiveTab(activeTab === 'participants' ? 'none' : 'participants')} 
                      title={activeTab === 'participants' ? "Masquer les Participants" : "Afficher les Participants"}
                      className={`p-2 rounded-minimeet-md transition-colors w-full ${activeTab === 'participants' ? 'bg-minimeet-primary text-white' : 'bg-minimeet-background hover:bg-minimeet-background-hover text-minimeet-text-primary'}`}>
                      <IconUsers className="w-5 h-5 mx-auto"/>
                  </button>
            </div>

            <div className="flex-grow overflow-y-auto">
              {activeTab === 'chat' && roomId && currentUser && <ChatBox roomId={roomId} currentUser={currentUser} />}
              {activeTab === 'participants' && currentUser && (
                  <div className="p-4 flex-grow">
                    <p className="text-minimeet-text-primary font-semibold mb-3">Participants ({1 + onlineParticipantsForSidePanel.length})</p>
                    <ul className="space-y-1.5">
                        <li className="text-minimeet-text-primary text-sm font-medium flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            {currentUserFullName} (Vous)
                        </li>
                      {onlineParticipantsForSidePanel.map(p => (
                        <li key={p.peer_id} className="text-minimeet-text-secondary text-sm flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          {p.user_full_name || p.user_email?.split('@')[0] || p.peer_id.substring(0,8)}
                        </li>
                      ))}
                      {onlineParticipantsForSidePanel.length === 0 && !isLoading && <li className="text-sm text-minimeet-text-muted italic mt-2">Vous êtes seul pour le moment.</li>}
                    </ul>
                  </div>
                )}
              {activeTab === 'none' && 
                <div className="p-4 flex-grow flex items-center justify-center lg:hidden">
                    <p className="text-minimeet-text-muted text-sm">Affichez le chat ou les participants.</p>
                </div>
                }
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MeetRoomPage;