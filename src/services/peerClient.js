import Peer from 'peerjs';

let peerInstance = null;

/**
 * Initialise une instance Peer pour l'utilisateur.
 * Si une instance existe déjà pour cet ID, elle est retournée.
 * @param {string} userId - L'ID unique de l'utilisateur pour PeerJS.
 * @returns {Peer} L'instance Peer.
 */
export const initializePeer = (userId) => {
  if (peerInstance && peerInstance.id === userId && !peerInstance.destroyed) {
    console.log('Returning existing Peer instance for:', userId);
    return peerInstance;
  }

  // Si une ancienne instance existe mais avec un ID différent ou détruite, la détruire proprement
  if (peerInstance && !peerInstance.destroyed) {
    console.log('Destroying old Peer instance:', peerInstance.id);
    peerInstance.destroy();
  }
  
  console.log('Initializing new Peer instance for:', userId);
  // Utilisation du serveur PeerJS public par défaut
  // Pour un serveur auto-hébergé, configurez les options host, port, path, secure.
  peerInstance = new Peer(userId, {
    // host: 'localhost', // Décommentez et configurez pour un serveur PeerJS local/privé
    // port: 9000,
    // path: '/myapp',
    // secure: false, // Mettre à true si votre serveur PeerJS utilise HTTPS
    debug: 2 // 0 (rien) à 3 (tout). Utile pour le débogage.
  });

  peerInstance.on('open', (id) => {
    console.log('PeerJS: Connexion ouverte. Mon ID peer est ' + id);
  });

  peerInstance.on('connection', (conn) => {
    console.log('PeerJS: Connexion entrante de:', conn.peer);
    conn.on('data', (data) => {
      console.log('PeerJS: Données reçues:', data);
      // Gérer les données reçues (ex: messages de signalisation personnalisés)
    });
    conn.on('open', () => {
      console.log('PeerJS: Canal de données ouvert avec:', conn.peer);
      // Peut-être envoyer un message de bienvenue ou l'état initial
      // conn.send('Hello from ' + peerInstance.id);
    });
     conn.on('close', () => {
      console.log('PeerJS: Connexion de données fermée avec:', conn.peer);
    });
    conn.on('error', (err) => {
      console.error('PeerJS: Erreur de connexion de données avec:', conn.peer, err);
    });
  });

  peerInstance.on('call', (call) => {
    console.log('PeerJS: Appel entrant de:', call.peer);
    // La gestion de l'appel (répondre avec le flux média local) se fera dans MeetRoom.jsx
    // Par exemple: 
    // navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    //   .then(stream => {
    //     call.answer(stream); // Répondre à l'appel avec notre flux
    //     // Ajouter le flux distant à l'UI
    //   })
    //   .catch(err => {
    //     console.error('PeerJS: Erreur pour obtenir le flux média local:', err);
    //   });
  });

  peerInstance.on('disconnected', () => {
    console.warn('PeerJS: Déconnecté du serveur de signalisation. Tentative de reconnexion...');
    // PeerJS tente de se reconnecter automatiquement. 
    // Vous pourriez vouloir gérer cela dans l'UI si la reconnexion échoue après un certain temps.
    // peerInstance.reconnect(); // Peut être appelé manuellement si nécessaire
  });

  peerInstance.on('error', (err) => {
    console.error('PeerJS: Erreur:', err);
    // Gérer différents types d'erreurs PeerJS (network, disconnected, etc.)
    // if (err.type === 'peer-unavailable') {
    //   // L'ID peer distant n'est pas trouvé
    // }
  });

  return peerInstance;
};

/**
 * Retourne l'instance Peer actuelle si elle existe et n'est pas détruite.
 * @returns {Peer | null} L'instance Peer ou null.
 */
export const getPeer = () => {
  if (peerInstance && !peerInstance.destroyed) {
    return peerInstance;
  }
  return null;
};

/**
 * Détruit l'instance Peer actuelle si elle existe.
 */
export const destroyPeer = () => {
  if (peerInstance && !peerInstance.destroyed) {
    console.log('Destroying Peer instance explicitly:', peerInstance.id);
    peerInstance.destroy();
    peerInstance = null;
  }
};

// Plus de fonctions utilitaires pour PeerJS peuvent être ajoutées ici,
// par exemple pour initier un appel ou une connexion de données.

/**
 * Établit une connexion de données avec un autre pair.
 * @param {string} remotePeerId L'ID du pair distant.
 * @returns {DataConnection | null} L'objet DataConnection ou null si l'instance Peer n'est pas prête.
 */
export const connectToPeerData = (remotePeerId) => {
  const peer = getPeer();
  if (!peer || peer.disconnected || peer.destroyed) {
    console.error('PeerJS: Instance Peer non disponible ou déconnectée pour la connexion de données.');
    return null;
  }
  console.log(`PeerJS: Tentative de connexion de données à ${remotePeerId}`);
  const conn = peer.connect(remotePeerId);
  // Les gestionnaires d'événements pour cette connexion spécifique sont généralement ajoutés ici
  // ou là où la connexion est initiée (ex: dans le composant React)
  return conn; 
};

/**
 * Appelle un pair distant avec un flux média.
 * @param {string} remotePeerId L'ID du pair distant.
 * @param {MediaStream} localStream Le flux média local à envoyer.
 * @returns {MediaConnection | null} L'objet MediaConnection ou null si l'instance Peer n'est pas prête.
 */
export const callPeer = (remotePeerId, localStream) => {
  const peer = getPeer();
  if (!peer || peer.disconnected || peer.destroyed) {
    console.error('PeerJS: Instance Peer non disponible ou déconnectée pour l\'appel.');
    return null;
  }
  console.log(`PeerJS: Tentative d'appel à ${remotePeerId}`);
  const call = peer.call(remotePeerId, localStream);
  // Les gestionnaires d'événements pour cet appel spécifique (ex: call.on('stream', ...))
  // sont généralement ajoutés là où l'appel est initié.
  return call;
}; 