import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [newRoomId, setNewRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [pastMeetings, setPastMeetings] = useState([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUserSession = async () => {
      setIsLoadingUser(true);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) console.error('Erreur getSession lors du chargement initial:', sessionError);
        if (session?.user) {
          setCurrentUser(session.user);
          setIsLoadingUser(false);
          return;
        }
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError && userError.message !== 'User not found' && userError.message !== 'No current session') {
            console.error('Erreur getUser lors du chargement initial:', userError);
        }
        if (user) setCurrentUser(user);
      } catch (e) {
        console.error('Exception dans fetchUserSession:', e);
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUserSession();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const userFromSession = session?.user ?? null;
      setCurrentUser(userFromSession);
      setIsLoadingUser(false);
      if (event === 'INITIAL_SESSION' && !userFromSession) navigate('/login');
      else if (event === 'SIGNED_OUT') navigate('/login');
      else if (event === 'USER_DELETED' || event === 'TOKEN_REFRESHED_ERROR') navigate('/login');
    });
    return () => { authListener?.subscription?.unsubscribe(); };
  }, [navigate]);

  useEffect(() => {
    if (currentUser) fetchPastMeetings();
    else setPastMeetings([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchPastMeetings = async () => {
    if (!currentUser) return;
    setIsLoadingMeetings(true);
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('id, room_id, created_at')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPastMeetings(data || []);
    } catch (error) {
      console.error('Erreur dans fetchPastMeetings:', error.message);
    } finally {
      setIsLoadingMeetings(false);
    }
  };

  const handleCreateRoom = async () => {
    const generatedRoomId = uuidv4().substring(0, 12);
    setNewRoomId(generatedRoomId);
    if (!currentUser) { alert('Utilisateur non trouvé. Veuillez vous reconnecter.'); return; }
    try {
      await supabase.from('meetings').insert([{ room_id: generatedRoomId, user_id: currentUser.id }]);
      fetchPastMeetings();
      navigate(`/meet/${generatedRoomId}`);
    } catch (error) { alert('Exception lors de la création de la réunion: ' + error.message); }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (joinRoomId.trim()) navigate(`/meet/${joinRoomId.trim()}`);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert('Erreur lors de la déconnexion: ' + error.message);
  };

  if (isLoadingUser) {
    return <div className="w-screen min-h-screen flex items-center justify-center bg-minimeet-background"><p className="text-minimeet-text-secondary">Chargement de la session...</p></div>;
  }
  if (!currentUser && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    return <div className="w-screen min-h-screen flex items-center justify-center bg-minimeet-background"><p className="text-minimeet-text-secondary">Redirection...</p></div>;
  }
  if (!currentUser && (window.location.pathname === '/login' || window.location.pathname === '/register')) return null;

  return (
    <div className="w-screen min-h-screen bg-minimeet-background text-minimeet-text-primary p-6 md:p-8 lg:p-12 font-sans">
      <header className="mb-10 flex justify-between items-center">
        <h1 className="text-3xl lg:text-4xl font-semibold text-minimeet-text-primary">MiniMeet</h1>
        <div className="flex items-center space-x-4">
          {currentUser && <p className="text-sm lg:text-base text-minimeet-text-secondary"><span className="hidden md:inline">Bonjour, </span>{currentUser.email?.split('@')[0] || 'Utilisateur'} !</p>}
          <button 
            onClick={handleLogout} 
            className="px-4 py-2 text-sm font-medium bg-minimeet-error text-white rounded-minimeet-md hover:bg-opacity-80 transition-colors duration-150 shadow-minimeet-sm hover:shadow-minimeet-md"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-10">
        <section className="bg-minimeet-surface p-6 sm:p-8 rounded-minimeet-xl shadow-minimeet-lg flex flex-col space-y-6">
          <h2 className="text-2xl lg:text-3xl font-semibold text-minimeet-text-primary">Démarrer une réunion</h2>
          <div>
            <button 
              onClick={handleCreateRoom}
              disabled={!currentUser}
              className="w-full px-6 py-3.5 bg-minimeet-primary text-white rounded-minimeet-md hover:bg-minimeet-primary-hover focus:outline-none focus:ring-2 focus:ring-minimeet-primary focus:ring-opacity-40 transition-all duration-150 text-base lg:text-lg font-medium shadow-minimeet-md hover:shadow-minimeet-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Créer une nouvelle réunion instantanée
            </button>
            {newRoomId && <p className="text-xs sm:text-sm mt-2.5 text-minimeet-text-muted">ID de la nouvelle salle : {newRoomId}</p>}
          </div>
          
          <hr className="border-minimeet-border" />
          
          <form onSubmit={handleJoinRoom} className="flex flex-col space-y-4">
            <div>
              <label htmlFor="joinRoomId" className="block text-sm lg:text-base font-medium text-minimeet-text-secondary mb-1.5">Ou rejoindre avec un ID :</label>
              <input 
                type="text" 
                id="joinRoomId"
                value={joinRoomId} 
                onChange={(e) => setJoinRoomId(e.target.value)} 
                placeholder="Entrez l'ID de la réunion"
                className="w-full px-4 py-3 border border-minimeet-border rounded-minimeet-md bg-minimeet-background text-minimeet-text-primary placeholder-minimeet-text-muted focus:ring-2 focus:ring-minimeet-primary focus:border-transparent shadow-minimeet-sm text-sm lg:text-base"
              />
            </div>
            <button 
              type="submit" 
              disabled={!currentUser || !joinRoomId.trim()}
              className="w-full px-6 py-3.5 bg-minimeet-dark-panel text-minimeet-text-on-dark rounded-minimeet-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-minimeet-dark-panel focus:ring-opacity-50 transition-all duration-150 font-medium shadow-minimeet-md hover:shadow-minimeet-lg disabled:opacity-70 disabled:cursor-not-allowed text-sm lg:text-base"
            >
              Rejoindre la réunion
            </button>
          </form>
        </section>

        <section className="bg-minimeet-surface p-6 sm:p-8 rounded-minimeet-xl shadow-minimeet-lg flex flex-col">
          <h2 className="text-2xl lg:text-3xl font-semibold mb-6 text-minimeet-text-primary">Vos réunions récentes</h2>
          {isLoadingMeetings ? (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-minimeet-text-muted">Chargement des réunions...</p>
            </div>
          ) : pastMeetings.length > 0 ? (
            <ul className="space-y-4 flex-grow overflow-y-auto max-h-[60vh] pr-3">
              {pastMeetings.map(meeting => (
                <li key={meeting.id} className="p-4 bg-minimeet-background rounded-minimeet-lg shadow-minimeet-md hover:shadow-minimeet-lg transition-shadow duration-150 flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
                  <div className="flex-grow">
                    <p className="font-semibold text-minimeet-text-primary text-base">{`Réunion ${meeting.room_id.substring(0,8)}...`}</p>
                    <p className="text-sm text-minimeet-text-secondary mt-1">
                      ID: <span className="font-mono">{meeting.room_id}</span>
                    </p>
                    <p className="text-xs text-minimeet-text-muted mt-0.5">
                      Créée le: {new Date(meeting.created_at).toLocaleDateString()} à {new Date(meeting.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate(`/meet/${meeting.room_id}`)} 
                    className="mt-2 sm:mt-0 flex-shrink-0 px-4 py-2 bg-minimeet-primary text-white text-sm font-medium rounded-minimeet-md hover:bg-minimeet-primary-hover transition-colors duration-150 shadow-minimeet-sm hover:shadow-minimeet-md"
                  >
                    Rejoindre
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-minimeet-text-muted italic">{currentUser ? 'Aucune réunion récente trouvée.' : 'Connectez-vous pour voir vos réunions.'}</p> 
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage; 