import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { initializePeer, getPeer, callPeer, destroyPeer } from '../services/peerClient';

import VideoPlayer from '../components/VideoPlayer';
import ChatBox from '../components/ChatBox';
import ScreenShareButton from '../components/ScreenShareButton';

// --- Définitions des Icônes SVG ---
const IconArrowLeft = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
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
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zM8 8h8v8H8V8z"/></svg> // Same as Record for now, often a square is used for stop
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

  // États pour l'enregistrement
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null); // Utiliser useRef pour l'instance de MediaRecorder
  const recordedChunksRef = useRef([]); // Utiliser useRef pour les chunks
  const [downloadLink, setDownloadLink] = useState('');

  // Placeholder pour la notification d'arrivée (à implémenter avec la logique de présence)
  const [joiningUser, setJoiningUser] = useState(null); // ex: { name: 'Drew Bieber' }

  // Hook pour l'authentification
  useEffect(() => {
    const fetchUserSession = async () => {
      setIsLoadingUser(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser(session.user);
          return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (e) {
        console.error('MeetRoom: Exception dans fetchUserSession:', e);
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUserSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthListener] Event:', event, 'Session:', session);
      const userFromSession = session?.user ?? null;
      setCurrentUser(userFromSession);
      setIsLoadingUser(false);

      if (event === 'INITIAL_SESSION' && !userFromSession) {
        console.log('[AuthListener] INITIAL_SESSION completed, no user found. Redirecting to login.');
        navigate('/login', { replace: true });
      } else if (event === 'SIGNED_OUT') {
        console.log('[AuthListener] User SIGNED_OUT. Redirecting to login.');
        navigate('/login', { replace: true });
      }
    });
    return () => { 
      console.log('[AuthListener] Unsubscribing.');
      authListener?.subscription?.unsubscribe(); 
    };
  }, [navigate]);

  // 1. Initialisation PeerJS & getUserMedia
  useEffect(() => {
    if (!currentUser?.id) {
      console.log('[Effect 1] Skipping PeerJS & Media Init: currentUser.id is null.');
      return;
    }
    console.log('[Effect 1] START: PeerJS & Media Init for user:', currentUser.id);
    const peerIdToInitialize = currentUser.id;
    const peer = initializePeer(peerIdToInitialize);
    setPeerInstance(peer);

    peer.on('open', (id) => {
      console.log('[Effect 1] PeerJS opened with ID:', id, 'Expected ID:', peerIdToInitialize);
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          console.log('[Effect 1] getUserMedia SUCCESS');
          cameraStreamRef.current = stream; 
          setLocalStream(stream); 
        })
        .catch(err => {
          console.error('[Effect 1] getUserMedia ERROR:', err);
          alert("Impossible d'accéder à la caméra et/ou au microphone. Vérifiez les permissions.");
          setIsLoading(false); 
          setIsJoiningRoom(false); 
        });
    });

    peer.on('error', (err) => {
        console.error('[Effect 1] PeerJS Connection ERROR:', err);
        alert("Erreur de connexion au service de visioconférence (PeerJS). Veuillez réessayer.");
        setIsLoading(false);
        setIsJoiningRoom(false);
    });
    
    return () => { 
      console.log('[Effect 1] CLEANUP for user:', peerIdToInitialize);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        console.log('[Effect 1 Cleanup] Stopping active recording.');
        mediaRecorderRef.current.stop();
      }
      const updateStatus = async () => {
        const currentPeerId = getPeer()?.id;
        if (currentUser?.id && roomId && currentPeerId) {
            try {
                console.log(`[Effect 1 Cleanup] Updating status to offline for user ${currentUser.id} in room ${roomId}`);
                await supabase.from('room_participants').update({ status: 'offline', last_seen: new Date().toISOString() }).match({ room_id: roomId, user_id: currentUser.id });
            } catch (error) {
                console.error('[Effect 1 Cleanup] Error updating status to offline:', error);
            }
        }
      }
      updateStatus().finally(() => {
          if (cameraStreamRef.current) {
            console.log('[Effect 1 Cleanup] Stopping cameraStreamRef tracks.');
            cameraStreamRef.current.getTracks().forEach(track => track.stop());
          }
          console.log('[Effect 1 Cleanup] Destroying PeerJS instance.');
          destroyPeer();
      });
    };
  }, [currentUser?.id, roomId]);

  // 2. Gestion de la présence (Join Room) et appels initiaux
  useEffect(() => {
    if (!currentUser || !roomId || !peerInstance?.id || !localStream) {
      let reason = 'Skipping Effect 2: ';
      if (!currentUser) reason += 'currentUser is null; ';
      if (!roomId) reason += 'roomId is null; ';
      if (!peerInstance?.id) reason += 'peerInstance.id is null; ';
      if (!localStream) reason += 'localStream is null; ';
      return;
    }
    console.log(`[Effect 2] START: Joining room ${roomId} for user ${currentUser.id}, peer ${peerInstance.id}`);
    setIsJoiningRoom(true);

    let isMounted = true;
    const managePresenceAndInitialCalls = async () => {
      if (!isMounted) {
        console.log('[Effect 2] Aborted: Component unmounted before operation could complete.');
        return;
      }
      
      try {
        // Ajout: Tentative de suppression de toute entrée conflictuelle basée sur peer_id seul
        try {
          console.log(`[Effect 2] Attempting to DELETE any existing participant record for peer_id: ${peerInstance.id}`);
          const { error: deleteError } = await supabase
            .from('room_participants')
            .delete()
            .match({ peer_id: peerInstance.id });

          if (deleteError) {
            console.warn('[Effect 2] Supabase DELETE prior participant by peer_id warning (non-fatal):', JSON.stringify(deleteError, null, 2));
          } else {
            console.log(`[Effect 2] Successfully deleted prior participant record for peer_id: ${peerInstance.id} (if any existed).`);
          }
        } catch (delErr) {
           console.warn('[Effect 2] Exception during pre-emptive delete by peer_id:', delErr);
        }
        // Fin de l'ajout

        console.log('[Effect 2] Attempting to UPSERT participant record.');
        const { error: upsertError } = await supabase
          .from('room_participants')
          .upsert({
            room_id: roomId,
            user_id: currentUser.id,
            peer_id: peerInstance.id,
            user_email: currentUser.email,
            status: 'online',
            last_seen: new Date().toISOString(),
          }, { onConflict: 'room_id, user_id' }); // onConflict sur (room_id, user_id) est correct

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
          .select('id, room_id, user_id, peer_id, user_email, status') 
          .eq('room_id', roomId)
          .eq('status', 'online')
          .neq('peer_id', peerInstance.id);

        if (!isMounted) return;
        if (fetchError) {
          console.error('[Effect 2] Supabase FETCH initial participants ERROR:', fetchError);
        } else if (initialParticipants) {
          console.log('[Effect 2] Initial participants fetched:', initialParticipants.map(p=>p.user_email));
          setRoomParticipantsData(initialParticipants.filter(p => p.peer_id !== peerInstance.id)); 
          initialParticipants.forEach(participant => {
            if (participant.peer_id !== peerInstance.id) {
              console.log('[Effect 2] Initiating call to initial participant:', participant.user_email, participant.peer_id);
              initiateCallToPeer(participant.peer_id, participant.user_email);
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
    if (!roomId || !currentUser?.id || !peerInstance?.id || !localStream) return;
    console.log(`[Effect 3] START: Realtime subscription for room ${roomId}`);
    const channelName = `room-${roomId}`;
    const participantSubscription = supabase.channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_participants', filter: `room_id=eq.${roomId}` }, payload => {
        console.log('[Effect 3] Realtime change received:', payload.eventType, payload.new || payload.old);
        const { eventType, new: newRecord, old: oldRecord } = payload;
        setRoomParticipantsData(currentParticipants => {
          let updatedParticipants = [...currentParticipants];
          if (eventType === 'INSERT') {
            if (!updatedParticipants.find(p => p.peer_id === newRecord.peer_id)) updatedParticipants.push(newRecord);
            if (newRecord.peer_id !== peerInstance.id && newRecord.status === 'online' && newRecord.peer_id) initiateCallToPeer(newRecord.peer_id, newRecord.user_email);
          } else if (eventType === 'UPDATE') {
            updatedParticipants = updatedParticipants.map(p => p.peer_id === newRecord.peer_id ? newRecord : p);
            if (newRecord.peer_id !== peerInstance.id) {
                if (newRecord.status === 'offline' && connectedPeers[newRecord.peer_id]) connectedPeers[newRecord.peer_id].close();
                else if (newRecord.status === 'online' && oldRecord?.status !== 'online' && !connectedPeers[newRecord.peer_id]) initiateCallToPeer(newRecord.peer_id, newRecord.user_email);
            }
          } else if (eventType === 'DELETE') {
            updatedParticipants = updatedParticipants.filter(p => p.peer_id !== oldRecord.peer_id);
            if (oldRecord.peer_id !== peerInstance.id && oldRecord.peer_id && connectedPeers[oldRecord.peer_id]) connectedPeers[oldRecord.peer_id].close();
          }
          return updatedParticipants.filter(p => p.status === 'online' && p.peer_id !== peerInstance?.id);
        });
      })
      .subscribe(status => {
        if (status === 'SUBSCRIBED') console.log(`[Effect 3] Successfully subscribed to ${channelName}`);
        else if (status === 'CHANNEL_ERROR') console.error(`[Effect 3] Realtime subscription error on ${channelName}`);
        else if (status === 'TIMED_OUT') console.warn(`[Effect 3] Realtime subscription timed out on ${channelName}`);
        else console.log(`[Effect 3] Realtime status for ${channelName}: ${status}`);
      });
    return () => { 
      console.log(`[Effect 3] CLEANUP: Unsubscribing from ${channelName}`); 
      supabase.removeChannel(participantSubscription).catch(err => console.error('[Effect 3 Cleanup] Error removing channel:', err)); 
    };
  }, [currentUser?.id, roomId, peerInstance?.id, localStream, connectedPeers]);

  // 4. Gestion des appels entrants PeerJS
  useEffect(() => {
    const currentPeer = getPeer();
    if (!currentPeer || !localStream) return;
    console.log(`[Effect 4] START: Setting up incoming call handler for peer ${currentPeer.id}`);
    const handleIncomingCall = call => {
      console.log(`[Effect 4] Incoming call from ${call.peer}`);
      call.answer(localStream);
      const pInfo = roomParticipantsData.find(p => p.peer_id === call.peer);
      const pEmail = pInfo?.user_email || 'Pair distant';
      call.on('stream', remoteStream => { 
        console.log(`[Effect 4] Stream received from ${call.peer}`);
        if (!remoteStreams.find(s => s.id === call.peer)) {
          setRemoteStreams(prev => [...prev, { id: call.peer, stream: remoteStream, email: pEmail }]);
          setConnectedPeers(prev => ({ ...prev, [call.peer]: call }));
        }
      });
      call.on('close', () => { 
        console.log(`[Effect 4] Call with ${call.peer} closed.`);
        setRemoteStreams(prev => prev.filter(s => s.id !== call.peer)); 
        setConnectedPeers(prev => { const n = {...prev}; delete n[call.peer]; return n; });
      });
      call.on('error', err => { 
        console.error(`[Effect 4] Error on call with ${call.peer}:`, err); 
        setRemoteStreams(prev => prev.filter(s => s.id !== call.peer));
        setConnectedPeers(prev => { const n = {...prev}; delete n[call.peer]; return n; });
      });
    };
    currentPeer.on('call', handleIncomingCall);
    return () => { 
      console.log(`[Effect 4] CLEANUP: Removing call handler for peer ${currentPeer.id}`); 
      if (currentPeer) currentPeer.off('call', handleIncomingCall); 
    };
  }, [localStream, roomParticipantsData]);

  // Fonction pour appeler un autre pair
  const initiateCallToPeer = (remotePeerId, remoteUserEmail = 'Pair distant') => {
    if (!localStream || !remotePeerId || !peerInstance?.id) {
      console.warn('[initiateCallToPeer] Aborted: missing localStream, remotePeerId, or peerInstance.id');
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
    console.log(`[initiateCallToPeer] Attempting to call ${remotePeerId} (${remoteUserEmail})`);
    const call = callPeer(remotePeerId, localStream);
    if (call) {
      setConnectedPeers(prev => ({ ...prev, [remotePeerId]: call })); 
      call.on('stream', (remoteStream) => {
        console.log(`[initiateCallToPeer] Stream received from ${remotePeerId}`);
        if (!remoteStreams.find(s => s.id === remotePeerId)) {
          setRemoteStreams(prev => [...prev, { id: remotePeerId, stream: remoteStream, email: remoteUserEmail }]);
        }
      });
      call.on('close', () => {
        console.log(`[initiateCallToPeer] Call with ${remotePeerId} closed.`);
        setRemoteStreams(prev => prev.filter(s => s.id !== remotePeerId));
        setConnectedPeers(prev => { const n = {...prev}; delete n[remotePeerId]; return n; });
      });
      call.on('error', (err) => {
        console.error(`[initiateCallToPeer] Error on outgoing call to ${remotePeerId}:`, err);
        setRemoteStreams(prev => prev.filter(s => s.id !== remotePeerId));
        setConnectedPeers(prev => { const n = {...prev}; delete n[remotePeerId]; return n; });
      });
    } else {
      console.error(`[initiateCallToPeer] Failed to initiate call to ${remotePeerId}. callPeer returned null.`);
    }
  };

  // Fonctions pour le partage d'écran
  const handleActiveStreamChange = (newActiveStream, type) => {
    console.log(`[handleActiveStreamChange] Type: ${type}`);
    const currentActiveCameraStream = cameraStreamRef.current;
    console.log(`Changement de flux actif vers: ${type}`);

    if (type === 'screen') {
      setLocalStream(newActiveStream);
      Object.values(connectedPeers).forEach(call => {
        const videoSender = call.peerConnection?.getSenders().find(s => s.track?.kind === 'video');
        if (videoSender && newActiveStream.getVideoTracks()[0]) {
          videoSender.replaceTrack(newActiveStream.getVideoTracks()[0])
            .catch(err => console.error('Erreur replaceTrack video (screen):', err));
        }
        const audioSender = call.peerConnection?.getSenders().find(s => s.track?.kind === 'audio');
        if (audioSender) {
          if (newActiveStream.getAudioTracks()[0]) {
            audioSender.replaceTrack(newActiveStream.getAudioTracks()[0])
              .catch(err => console.error('Erreur replaceTrack audio (screen):', err));
          } else if (currentActiveCameraStream?.getAudioTracks()[0]) {
            audioSender.replaceTrack(currentActiveCameraStream.getAudioTracks()[0])
              .catch(err => console.error('Erreur replaceTrack audio (camera fallback):', err));
          }
        }
      });
    } else if (type === 'camera') {
      if (currentActiveCameraStream) {
        setLocalStream(currentActiveCameraStream);
        Object.values(connectedPeers).forEach(call => {
          const videoSender = call.peerConnection?.getSenders().find(s => s.track?.kind === 'video');
          if (videoSender && currentActiveCameraStream.getVideoTracks()[0]) {
            videoSender.replaceTrack(currentActiveCameraStream.getVideoTracks()[0])
              .catch(err => console.error('Erreur replaceTrack video (camera):', err));
          }
          const audioSender = call.peerConnection?.getSenders().find(s => s.track?.kind === 'audio');
          if (audioSender && currentActiveCameraStream.getAudioTracks()[0]) {
            audioSender.replaceTrack(currentActiveCameraStream.getAudioTracks()[0])
              .catch(err => console.error('Erreur replaceTrack audio (camera):', err));
          }
        });
      }
    }
  };

  const handleScreenShareEndFallback = () => {
    console.log('[handleScreenShareEndFallback] Called');
    const currentActiveCameraStream = cameraStreamRef.current;
    if (currentActiveCameraStream && localStream !== currentActiveCameraStream) {
      console.log('Fallback: Partage écran terminé, retour caméra.');
      handleActiveStreamChange(currentActiveCameraStream, 'camera');
    } else if (!currentActiveCameraStream) {
      console.warn('Partage écran terminé, mais flux caméra original non trouvé.');
      Object.values(connectedPeers).forEach(call => {
        const videoSender = call.peerConnection?.getSenders().find(s => s.track?.kind === 'video');
        if (videoSender) videoSender.replaceTrack(null).catch(e => console.warn("Can't send null track", e));
      });
      setLocalStream(null);
    }
  };

  // Fonctions pour l'enregistrement
  const startRecording = () => {
    console.log('[startRecording] Called');
    if (!localStream || localStream.getTracks().length === 0) {
      alert('Aucun flux média disponible pour l\'enregistrement.');
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
      mediaRecorderRef.current = new MediaRecorder(localStream, options);
    } catch (e1) {
      console.warn('MediaRecorder avec vp9 échoué, essai avec vp8:', e1.message);
      try {
        const options = { mimeType: 'video/webm; codecs=vp8' }; 
        mediaRecorderRef.current = new MediaRecorder(localStream, options);
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
  const handleLeaveRoom = async () => { console.log('[handleLeaveRoom] Leaving room...'); if (isRecording) stopRecording(); navigate('/dashboard'); };
  
  const toggleMic = () => {
    console.log('[toggleMic] Called. Current isMicMuted state:', isMicMuted);
    if (cameraStreamRef.current && cameraStreamRef.current.getAudioTracks().length > 0) {
      const audioTrack = cameraStreamRef.current.getAudioTracks()[0];
      const targetTrackEnabledState = isMicMuted; 
      audioTrack.enabled = targetTrackEnabledState;
      setIsMicMuted(!targetTrackEnabledState); 
      console.log(`[toggleMic] Mic audioTrack.enabled now: ${audioTrack.enabled}. New UI isMicMuted: ${!targetTrackEnabledState}`);
    } else {
      console.warn('[toggleMic] No audio track found or cameraStreamRef not ready.');
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
      if (localStream !== cameraStreamRef.current) {
         console.log("[toggleCam] Camera toggled while screen sharing. Change will apply to camera stream, not screen share.");
      }
    } else {
      console.warn('[toggleCam] No video track found or cameraStreamRef not ready.');
    }
  };

  const handleCopyLink = () => { navigator.clipboard.writeText(window.location.href).then(() => alert('Lien copié !')).catch(err => console.error(err)); };
  const handleAcceptJoin = () => { if (joiningUser) { console.log(`User ${joiningUser.name} accepted.`); setJoiningUser(null); } };
  const handleRejectJoin = () => { if (joiningUser) { console.log(`User ${joiningUser.name} rejected.`); setJoiningUser(null); } };

  if (isLoadingUser) {
    return <div className="w-screen min-h-screen flex items-center justify-center bg-minimeet-background"><p className="text-minimeet-text-secondary text-lg">Vérification de l'utilisateur...</p></div>;
  }
  
  if (!currentUser) {
    console.log('MeetRoom: currentUser est null après chargement, redirection attendue via onAuthStateChange.');
    return <div className="w-screen min-h-screen flex items-center justify-center bg-minimeet-background"><p className="text-minimeet-text-secondary text-lg">Redirection...</p></div>; 
  }

  if (!peerInstance) {
    return <div className="w-screen min-h-screen flex items-center justify-center bg-minimeet-background"><p className="text-minimeet-text-secondary text-lg">Initialisation PeerJS...</p></div>;
  }
  if (!localStream) {
    return <div className="w-screen min-h-screen flex items-center justify-center bg-minimeet-background"><p className="text-minimeet-text-secondary text-lg">Accès caméra/micro...</p></div>;
  }

  if (isJoiningRoom) {
    return <div className="w-screen min-h-screen flex items-center justify-center bg-minimeet-background"><p className="text-minimeet-text-secondary text-lg">Connexion à la salle en cours...</p></div>;
  }

  if (isLoading) { 
    return <div className="w-screen min-h-screen flex items-center justify-center bg-minimeet-background"><p className="text-minimeet-text-secondary text-lg">Chargement final des données de la salle...</p></div>;
  }
  
  const onlineParticipantsForDisplay = roomParticipantsData.filter(p => p.status === 'online' && p.peer_id !== peerInstance?.id);
  const currentUserShortName = currentUser.email?.split('@')[0] || 'Vous';

  return (
    <div className="w-screen h-screen flex flex-col bg-minimeet-background font-sans overflow-hidden">
      <header className="h-[60px] bg-minimeet-surface text-minimeet-text-primary flex items-center justify-between px-4 sm:px-6 shadow-minimeet-md flex-shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/dashboard')} className="p-1.5 rounded-minimeet-full hover:bg-minimeet-background focus:outline-none focus:ring-2 focus:ring-minimeet-primary focus:ring-opacity-50"><IconArrowLeft className="w-5 h-5 text-minimeet-text-secondary" /></button>
          <div>
            <h1 className="text-base sm:text-lg font-semibold truncate" title={roomId}>{`Réunion: ${roomId.length > 15 ? roomId.substring(0,12)+'...' : roomId}`}</h1>
            <p className="text-xs text-minimeet-text-muted">Salle de {currentUserShortName}</p>
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
        <main className="flex-grow flex flex-col p-3 sm:p-4 relative bg-minimeet-background lg:overflow-y-auto">
          <div className="flex-grow bg-black rounded-minimeet-lg flex items-center justify-center text-white relative min-h-[200px] sm:min-h-[300px] md:min-h-[400px]">
            {localStream ? (
                <VideoPlayer stream={localStream} isLocal={true} muted={true} className="object-contain w-full h-full" />
            ) : (
                <p className="text-minimeet-text-muted">Caméra/flux local non disponible...</p>
            )}
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2.5 py-1 rounded-minimeet-md text-sm font-medium">{currentUserShortName} (Vous)</div>
          </div>
          
          <div className="h-28 sm:h-32 md:h-36 flex-shrink-0 mt-3 space-x-2 sm:space-x-3 overflow-x-auto p-1.5 bg-minimeet-surface/70 backdrop-blur-sm rounded-minimeet-lg shadow-minimeet-sm">
            {remoteStreams.length > 0 ? (
                remoteStreams.map(remote => (
                <div key={remote.id} className="h-full aspect-video bg-black rounded-minimeet-md overflow-hidden relative flex-shrink-0 shadow-md">
                    <VideoPlayer stream={remote.stream} isLocal={false} className="object-cover w-full h-full" />
                    <div className="absolute bottom-1 left-1.5 bg-black/60 text-white px-1.5 py-0.5 rounded-minimeet-sm text-xs truncate max-w-[calc(100%-12px)]">{remote.email?.split('@')[0] || remote.id.substring(0,6)}</div>
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

          <div className="absolute bottom-4 xs:bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 w-max max-w-[calc(100%-16px)] xs:max-w-none">
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
                    title={isRecording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"} 
                    className={`p-2 xs:p-2.5 sm:p-3 rounded-minimeet-full transition-colors ${isRecording ? 'bg-minimeet-primary text-white animate-pulse' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
                    {isRecording ? <IconRecordStop className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"/> : <IconRecord className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"/>}
                </button>
                <button 
                    onClick={() => setActiveTab('chat')} 
                    title="Afficher le Chat" 
                    className={`p-2 xs:p-2.5 sm:p-3 rounded-minimeet-full transition-colors ${activeTab === 'chat' ? 'bg-minimeet-primary text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
                    <IconChatBubbleLeftEllipsis className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"/>
                </button>
                <button 
                    onClick={() => setActiveTab('participants')} 
                    title="Afficher les Participants" 
                    className={`p-2 xs:p-2.5 sm:p-3 rounded-minimeet-full transition-colors ${activeTab === 'participants' ? 'bg-minimeet-primary text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
                    <IconUsers className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"/>
                </button>
                <button 
                    onClick={handleLeaveRoom}
                    title="Quitter la réunion"
                    className="p-2 xs:p-2.5 sm:p-3 rounded-minimeet-full bg-minimeet-error hover:bg-red-700 text-white transition-colors">
                    <IconPhoneHangUp className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"/>
                </button>
                {downloadLink && (
                  <a href={downloadLink} download={`minimeet-recording-${roomId}.webm`} title="Télécharger l'enregistrement" className="p-2 xs:p-2.5 sm:p-3 rounded-minimeet-full bg-minimeet-success hover:bg-green-600 text-white transition-colors flex items-center justify-center">
                    <IconDownload className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"/>
                  </a>
                )}
                <button onClick={handleCopyLink} title="Copier le lien de la réunion" className="p-2 xs:p-2.5 sm:p-3 rounded-minimeet-full bg-white/20 hover:bg-white/30 text-white transition-colors flex items-center justify-center">
                    <IconLink className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"/>
                </button>
                 <button title="Paramètres (bientôt)" className="p-2 xs:p-2.5 sm:p-3 rounded-minimeet-full bg-white/20 hover:bg-white/30 text-white transition-colors flex items-center justify-center cursor-not-allowed opacity-70">
                    <IconSettings className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"/>
                </button>
            </div>
          </div>
        </main>
        <aside className="w-full lg:w-[360px] xl:w-[400px] bg-minimeet-surface flex-shrink-0 flex flex-col border-l border-minimeet-border lg:h-full lg:overflow-y-auto">
          {activeTab === 'chat' && roomId && <ChatBox roomId={roomId} />}
          {activeTab === 'participants' && (
              <div className="p-4">
                <p className="text-minimeet-text-primary font-semibold mb-3">Participants ({1 + onlineParticipantsForDisplay.length})</p>
                 <ul className="space-y-1.5">
                    <li className="text-minimeet-text-primary text-sm font-medium">{currentUserShortName} (Vous)</li>
                  {onlineParticipantsForDisplay.map(p => (
                    <li key={p.peer_id} className="text-minimeet-text-secondary text-sm">
                      {p.user_email?.split('@')[0] || p.peer_id.substring(0,8)}...
                    </li>
                  ))}
                  {onlineParticipantsForDisplay.length === 0 && <li className="text-sm text-minimeet-text-muted italic">Vous êtes seul pour le moment.</li>}
                </ul>
              </div>
            )}
           {activeTab !== 'chat' && activeTab !== 'participants' && 
             <div className="p-4 flex-grow flex items-center justify-center">
                <p className="text-minimeet-text-muted">Sélectionnez un onglet</p>
             </div>
            }
        </aside>
      </div>
    </div>
  );
};

export default MeetRoomPage;