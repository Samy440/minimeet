import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';

const ChatBox = ({ roomId }) => {
  // const currentUser = supabase.auth.user(); // Ancienne méthode
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null); // Pour scroller en bas

  // Hook pour l'authentification de l'utilisateur
  useEffect(() => {
    setIsLoadingUser(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
            setCurrentUser(session.user);
        }
        setIsLoadingUser(false);
    }).catch(error => {
        console.error("ChatBox: Erreur lors de getSession", error);
        setIsLoadingUser(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setCurrentUser(session?.user ?? null);
        setIsLoadingUser(false);
      }
    );
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Récupération initiale des messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!roomId) return;
      const { data, error } = await supabase
        .from('messages')
        .select('id, room_id, sender_id, content, created_at, sender_full_name')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erreur de récupération des messages:', error);
        setError('Impossible de charger les messages.');
        setMessages([]);
      } else {
        const transformedData = data.map(msg => ({
          ...msg,
          sender: { fullName: msg.sender_full_name || msg.sender_id }
        }));
        setMessages(transformedData || []);
      }
    };
    fetchMessages();
  }, [roomId]);

  // Souscription aux nouveaux messages en temps réel
  useEffect(() => {
    if (!roomId || !currentUser) return;

    const channelName = `chat-${roomId}`;
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          console.log('Nouveau message reçu (payload):', payload);
          const newMessageData = {
            ...payload.new,
            sender: { fullName: payload.new.sender_full_name || payload.new.sender_id }
          };
          // @ts-ignore TODO: typings pour sender
          setMessages(prevMessages => [...prevMessages, newMessageData]);
        }
      )
      .subscribe();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
          .then(() => console.log(`Canal Realtime ${channelName} désabonné pour ChatBox.`))
          .catch(err => console.error(`Erreur désabonnement canal ${channelName} ChatBox:`, err));
      }
    };
  }, [roomId, currentUser]);

  // Scroll automatique vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    let senderFullName = 'Utilisateur Anonyme'; // Valeur par défaut initiale
    if (currentUser && currentUser.id) {
      // Essayer de récupérer le nom complet depuis la table profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error("Erreur lors de la récupération du profil pour le chat:", profileError);
        // Si erreur de profil, et qu'on a un email, utiliser le début de l'email
        if (currentUser.email) {
          senderFullName = currentUser.email.split('@')[0];
        } 
        // Sinon, 'Utilisateur Anonyme' reste par défaut
      } else if (profile && profile.full_name) {
        senderFullName = profile.full_name; // Utiliser le nom complet du profil s'il existe et n'est pas vide
      } else if (currentUser.email) {
        // Si le profil est récupéré mais full_name est vide/null, ou si le profil lui-même est null (ne devrait pas arriver pour un user valide)
        // et qu'on a un email, utiliser le début de l'email.
        senderFullName = currentUser.email.split('@')[0];
      }
      // Si après tout ça, senderFullName est encore la valeur par défaut et qu'on a pas d'email, 'Utilisateur Anonyme' est conservé.
    }

    const messageToSend = {
      room_id: roomId,
      sender_id: currentUser.id,
      content: newMessage.trim(),
      sender_full_name: senderFullName // Utiliser le nom complet récupéré
    };

    const { error: insertError } = await supabase.from('messages').insert([messageToSend]);

    if (insertError) {
      console.error('Erreur d\'envoi du message:', insertError);
      setError("Erreur lors de l\'envoi du message.");
    } else {
      setNewMessage('');
      setError(null);
      // Le message s'affichera via la souscription temps réel
    }
  };

  if (isLoadingUser) {
    return <p className="text-minimeet-text-secondary text-sm p-4 animate-pulse">Chargement du chat...</p>;
  }

  if (!currentUser) {
    return <p className="text-minimeet-text-secondary text-sm p-4">Veuillez être connecté pour voir le chat.</p>;
  }

  return (
    <div className="flex flex-col h-full bg-minimeet-surface">
      {error && <p className="p-2 text-sm text-minimeet-error bg-red-100 rounded-md">{error}</p>}
      
      {/* Zone des messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.sender_id === currentUser.id ? 'items-end' : 'items-start'}`}
          >
            <div 
              className={`max-w-xs lg:max-w-md px-3 py-2 rounded-xl ${ 
                msg.sender_id === currentUser.id 
                  ? 'bg-minimeet-primary text-white rounded-br-none'
                  : 'bg-gray-200 text-minimeet-text-primary rounded-bl-none'
              }`}
            >
              <p className="text-xs font-semibold mb-0.5">
                {msg.sender_id === currentUser.id ? 'Vous' : (msg.sender?.fullName || 'Anonyme')}
              </p>
              <p className="text-sm">{msg.content}</p>
              <p className={`text-xs opacity-70 mt-1 text-right ${msg.sender_id === currentUser.id ? 'text-gray-50' : 'text-gray-500'}`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {messages.length === 0 && !error && (
          <p className="text-center text-minimeet-text-muted">Aucun message pour le moment. Soyez le premier !</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-minimeet-border flex items-center gap-2 bg-minimeet-surface">
        <input 
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Tapez votre message..."
          className="flex-grow px-3 py-2 border border-minimeet-border rounded-full bg-minimeet-background focus:outline-none focus:ring-1 focus:ring-minimeet-primary focus:border-minimeet-primary text-minimeet-text-primary text-sm"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          className="p-2.5 rounded-full bg-minimeet-primary text-white hover:bg-minimeet-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M3.105 3.105a1.5 1.5 0 012.122-.001L19.58 10.582a1.5 1.5 0 010 2.122L5.227 19.22A1.5 1.5 0 013.105 17.1L4.934 11.5H9.5a.75.75 0 000-1.5H4.934L3.105 4.42A1.5 1.5 0 013.105 3.105z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatBox; 