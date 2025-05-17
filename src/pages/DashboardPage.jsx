import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userFullName, setUserFullName] = useState('');
  const [newRoomId, setNewRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [pastMeetings, setPastMeetings] = useState([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(true); // Pour le chargement initial de l'utilisateur

  useEffect(() => {
    const fetchUserSession = async () => {
      setIsLoadingUser(true);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Erreur getSession:', sessionError);
          navigate('/login');
          return;
        }
        
        if (session && session.user) {
          setCurrentUser(session.user);
          fetchUserProfile(session.user.id);
        } else {
          // Si pas de session, essayer getUser pour voir si une session stockée peut être récupérée
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError && userError.message !== 'User not found' && userError.message !== 'No current session') {
            console.error('Erreur getUser:', userError);
          }
          if (user) {
            setCurrentUser(user);
            fetchUserProfile(user.id);
          } else {
            navigate('/login');
          }
        }
      } catch (e) {
        console.error('Exception dans fetchUserSession:', e);
        navigate('/login');
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, session);
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        fetchUserProfile(user.id);
      } else {
        setUserFullName('');
      }
      if (!user && event !== 'INITIAL_SESSION') { // Ne pas rediriger sur INITIAL_SESSION si user est null au début
        // Rediriger seulement si l'utilisateur se déconnecte explicitement ou si la session expire
        if(event === 'SIGNED_OUT' || event === 'USER_DELETED' || event === 'TOKEN_REFRESHED_ERROR') {
          navigate('/login');
        }
      } else if (user && event === 'SIGNED_IN') {
        // Optionnel: logique à exécuter quand l'utilisateur se connecte
      }
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      fetchPastMeetings();
    } else {
      // Si currentUser devient null après avoir été défini (déconnexion), nettoyer les réunions passées
      setPastMeetings([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchUserProfile = async (userId) => {
    if (!userId) return;
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();
      if (error) {
        console.warn("Dashboard: Erreur lors de la récupération du profil:", error.message);
        setUserFullName('');
      } else if (profile) {
        setUserFullName(profile.full_name || '');
        console.log("Dashboard: Profil récupéré, full_name:", profile.full_name);
      } else {
        console.log("Dashboard: Profil non trouvé pour l\'utilisateur:", userId);
        setUserFullName('');
      }
    } catch (e) {
      console.error("Dashboard: Exception lors de la récupération du profil:", e);
      setUserFullName('');
    }
  };

  const fetchPastMeetings = async () => {
    if (!currentUser) return;
    setIsLoadingMeetings(true);
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('id, room_id, created_at, name') // 'name' est optionnel, ajouté au cas où
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des réunions passées:', error);
        throw error;
      }
      setPastMeetings(data || []);
    } catch (error) {
      // Gérer l'erreur, peut-être afficher un message à l'utilisateur
    } finally {
      setIsLoadingMeetings(false);
    }
  };

  const handleCreateRoom = async () => {
    const generatedRoomId = uuidv4().substring(0, 12); // Génère un ID plus court
    setNewRoomId(generatedRoomId);

    if (!currentUser) {
      alert('Utilisateur non trouvé. Veuillez vous reconnecter.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('meetings')
        .insert([
          { room_id: generatedRoomId, user_id: currentUser.id /*, name: 'Réunion rapide' */ }, // Name optionnel
        ]);

      if (error) {
        console.error('Erreur lors de la création de la réunion dans la DB:', error);
        throw error;
      }
      console.log('Réunion créée dans la DB:', data);
      // Mettre à jour la liste des réunions passées immédiatement
      fetchPastMeetings(); 
      navigate(`/meet/${generatedRoomId}`);
    } catch (error) {
      alert('Impossible de créer la réunion. Veuillez réessayer.');
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (joinRoomId.trim()) {
      navigate(`/meet/${joinRoomId.trim()}`);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erreur de déconnexion:', error);
    } else {
      // Le onAuthStateChange devrait gérer la redirection via setCurrentUser(null)
      // Mais on peut forcer la redirection ici pour plus de réactivité.
      navigate('/login'); 
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!currentUser) {
      alert("Utilisateur non authentifié.");
      return;
    }
    if (!meetingId) {
      alert("ID de réunion invalide pour la suppression.");
      return;
    }

    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette réunion de votre historique ? Cette action est irréversible.");
    if (!isConfirmed) {
      return;
    }

    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .match({ id: meetingId, user_id: currentUser.id }); // Assurer que l'utilisateur ne supprime que ses propres réunions

      if (error) {
        console.error('Erreur lors de la suppression de la réunion:', error);
        throw error;
      }
      console.log('Réunion supprimée avec succès:', meetingId);
      // Mettre à jour la liste des réunions passées après suppression
      setPastMeetings(prevMeetings => prevMeetings.filter(meeting => meeting.id !== meetingId));
      // Optionnel: alerte de succès, ou un toast/notification plus discret
      // alert('Réunion supprimée de votre historique.'); 
    } catch (error) {
      alert('Impossible de supprimer la réunion. Veuillez réessayer. ' + error.message);
    }
  };

  if (isLoadingUser || (!currentUser && !window.location.pathname.startsWith('/login'))) { // Affiche le chargement tant que l'utilisateur n'est pas chargé, sauf si on est déjà sur login
    return <div className="min-h-screen flex items-center justify-center bg-minimeet-background text-minimeet-text-light">Chargement de la session...</div>;
  }

  // Si après le chargement, currentUser est toujours null, et on n'est pas sur login, c'est un problème (devrait être géré par navigate)
  // Cette condition est une double sécurité, normalement le useEffect s'occupe de la redirection.
  if (!currentUser && !isLoadingUser) {
    // Cette situation ne devrait pas se produire si le useEffect de fetchUserSession fonctionne correctement
    // et que onAuthStateChange est actif.
    // Si on arrive ici, c'est qu'on n'est pas sur /login et qu'on n'a pas d'utilisateur.
    // La redirection dans fetchUserSession ou onAuthStateChange aurait dû se produire.
    // Pour éviter une boucle de rendu, on peut juste afficher un message ou rien.
    console.warn("Tentative de rendu du Dashboard sans utilisateur et sans chargement en cours.");
    return null; // Ou un fallback plus gracieux
  }

  return (
    <div className="min-h-screen bg-minimeet-background text-minimeet-text-light p-4 sm:p-8">
      <header className="mb-10 flex justify-between items-center">
        <h1 className="text-4xl font-bold text-minimeet-primary-accent">MiniMeet</h1>
        <div className="flex items-center">
          {currentUser && <p className="mr-4 text-minimeet-text-medium">Bonjour, {userFullName || currentUser.email?.split('@')[0] || 'Utilisateur'} !</p>}
          <button 
            onClick={handleLogout} 
            className="px-4 py-2 bg-minimeet-action-red text-white rounded-minimeet-button hover:bg-minimeet-action-red/90 transition-colors duration-150"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section Créer/Rejoindre */}
        <section className="bg-minimeet-container-bg p-6 rounded-minimeet-card shadow-xl">
          <h2 className="text-2xl font-semibold mb-6 text-minimeet-text-dark">Démarrer une réunion</h2>
          
          <div className="mb-6">
            <button 
              onClick={handleCreateRoom} 
              className="w-full px-6 py-3 bg-minimeet-primary-accent text-white rounded-minimeet-button hover:bg-minimeet-primary-accent/90 focus:outline-none focus:ring-2 focus:ring-minimeet-primary-accent focus:ring-opacity-50 transition-colors duration-150 text-lg font-medium"
            >
              Créer une nouvelle réunion instantanée
            </button>
            {newRoomId && <p className="text-sm mt-2 text-minimeet-text-medium">ID de la nouvelle salle : {newRoomId}</p>}
          </div>

          <hr className="my-6 border-minimeet-border-light" />

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label htmlFor="joinRoomId" className="block text-sm font-medium text-minimeet-text-dark mb-1">Ou rejoindre avec un ID :</label>
              <input 
                type="text" 
                id="joinRoomId"
                value={joinRoomId} 
                onChange={(e) => setJoinRoomId(e.target.value)} 
                placeholder="Entrez l'ID de la réunion"
                className="w-full px-4 py-2 border border-minimeet-border-light rounded-minimeet-input bg-minimeet-input-bg text-minimeet-text-dark placeholder-minimeet-text-medium focus:ring-minimeet-primary-accent focus:border-minimeet-primary-accent"
              />
            </div>
            <button 
              type="submit" 
              className="w-full px-6 py-3 bg-minimeet-secondary-accent text-white rounded-minimeet-button hover:bg-minimeet-secondary-accent/90 focus:outline-none focus:ring-2 focus:ring-minimeet-secondary-accent focus:ring-opacity-50 transition-colors duration-150 font-medium"
            >
              Rejoindre la réunion
            </button>
          </form>
        </section>

        {/* Section Réunions Passées */}
        <section className="bg-minimeet-container-bg p-6 rounded-minimeet-card shadow-xl">
          <h2 className="text-2xl font-semibold mb-6 text-minimeet-text-dark">Vos réunions récentes</h2>
          {isLoadingMeetings ? (
            <p className="text-minimeet-text-medium">Chargement des réunions...</p>
          ) : pastMeetings.length > 0 ? (
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {pastMeetings.map(meeting => (
                <li key={meeting.id} className="p-4 bg-minimeet-input-bg rounded-minimeet-button flex justify-between items-center hover:bg-minimeet-border-light transition-colors duration-150">
                  <div>
                    <p className="font-medium text-minimeet-text-dark">{meeting.name || `Réunion ${meeting.room_id.substring(0,8)}...`}</p>
                    <p className="text-xs text-minimeet-text-medium">
                      ID: {meeting.room_id} <br />
                      Créée le: {new Date(meeting.created_at).toLocaleDateString()} à {new Date(meeting.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center mt-2 sm:mt-0">
                    <button 
                      onClick={() => navigate(`/meet/${meeting.room_id}`)} 
                      className="px-3 py-1.5 bg-minimeet-primary-accent text-white text-xs sm:text-sm rounded-minimeet-button hover:bg-minimeet-primary-accent/90 transition-colors duration-150 sm:mr-2 mb-1.5 sm:mb-0 w-full sm:w-auto"
                    >
                      Rejoindre
                    </button>
                    <button 
                      onClick={() => handleDeleteMeeting(meeting.id)} 
                      className="px-3 py-1.5 bg-minimeet-action-red text-white text-xs sm:text-sm rounded-minimeet-button hover:bg-minimeet-action-red/90 transition-colors duration-150 w-full sm:w-auto"
                    >
                      Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-minimeet-text-medium">Aucune réunion récente trouvée.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage; 