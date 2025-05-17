import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';

// Icône pour la case à cocher (simple cercle ou SVG plus élaboré si besoin)
const IconCheckboxCircle = ({ checked, className = "w-5 h-5" }) => (
  <svg className={`${className} ${checked ? 'text-minimeet-primary-accent' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {checked ? (
      <>
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ) : (
      <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);

const IconPlus = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconTrash = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const SharedTodoList = ({ roomId, currentUser }) => {
  console.log('[SharedTodoList] Component RENDERED/RE-RENDERED. Room ID:', roomId, 'CurrentUser:', currentUser?.id);
  const [todos, setTodos] = useState([]);
  const [newTodoContent, setNewTodoContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userFullName, setUserFullName] = useState('');

  const listContainerRef = useRef(null); // Référence pour le conteneur scrollable

  useEffect(() => {
    console.log('[SharedTodoList] useEffect for Profile Fetch triggered.');
    if (currentUser && currentUser.id) {
      const fetchProfile = async () => {
        console.log('[SharedTodoList] Fetching profile for user:', currentUser.id);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', currentUser.id)
          .single();
        if (profileError) {
          console.warn("[SharedTodoList] Erreur récupération profil:", profileError.message);
        } else if (profile) {
          console.log('[SharedTodoList] Profile fetched:', profile.full_name);
          setUserFullName(profile.full_name || currentUser.email?.split('@')[0] || 'Utilisateur');
        } else {
          console.log('[SharedTodoList] Profile not found, using fallback name.');
          setUserFullName(currentUser.email?.split('@')[0] || 'Utilisateur');
        }
      };
      fetchProfile();
    }
  }, [currentUser]);

  // Fetch initial todos
  useEffect(() => {
    console.log('[SharedTodoList] useEffect for Initial Todos Fetch triggered. Room ID:', roomId);
    const fetchTodos = async () => {
      if (!roomId) {
        console.log('[SharedTodoList] fetchTodos: No roomId, aborting.');
        setIsLoading(false); // S'assurer de ne pas rester en chargement infini
        return;
      }
      setIsLoading(true);
      setError(null);
      console.log('[SharedTodoList] fetchTodos: Fetching initial todos for room:', roomId);
      try {
        const { data, error: fetchError } = await supabase
          .from('todos')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });

        if (fetchError) throw fetchError;
        console.log('[SharedTodoList] fetchTodos: Todos received from DB:', data);
        setTodos(data || []);
      } catch (err) {
        console.error('[SharedTodoList] Erreur de récupération des todos initiaux:', err);
        setError('Impossible de charger les tâches initiales.');
        setTodos([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTodos();
  }, [roomId]);

  // Realtime subscription for todos
  useEffect(() => {
    console.log('[SharedTodoList] useEffect for Realtime Subscription triggered. Room ID:', roomId);
    if (!roomId) {
        console.log('[SharedTodoList] Realtime: No roomId, aborting subscription setup.');
        return;
    }

    const channelName = `todos-${roomId}`;
    console.log(`[SharedTodoList] Realtime: Attempting to subscribe to channel: ${channelName}`);
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos', filter: `room_id=eq.${roomId}` },
        (payload) => {
          console.log('[SharedTodoList] >>> Realtime PAYLOAD RECEIVED <<<<:', JSON.stringify(payload, null, 2));
          
          if (payload.eventType === 'INSERT') {
            console.log('[SharedTodoList] Realtime: INSERT event. New data:', payload.new);
            // @ts-ignore
            setTodos(prevTodos => {
              console.log('[SharedTodoList] Realtime: setTodos after INSERT. Prev todos count:', prevTodos.length);
              const newTodos = [...prevTodos, payload.new];
              console.log('[SharedTodoList] Realtime: setTodos after INSERT. New todos count:', newTodos.length);
              return newTodos;
            });
          } else if (payload.eventType === 'UPDATE') {
            console.log('[SharedTodoList] Realtime: UPDATE event. Updated data:', payload.new);
            setTodos(prevTodos => {
              console.log('[SharedTodoList] Realtime: setTodos after UPDATE. Prev todos count:', prevTodos.length);
              // @ts-ignore
              const newTodos = prevTodos.map(todo => (todo.id === payload.new.id ? payload.new : todo));
              console.log('[SharedTodoList] Realtime: setTodos after UPDATE. New todos (updated item id):', payload.new.id);
              return newTodos;
            });
          } else if (payload.eventType === 'DELETE') {
            console.log('[SharedTodoList] Realtime: DELETE event. Old data:', payload.old);
            setTodos(prevTodos => {
              console.log('[SharedTodoList] Realtime: setTodos after DELETE. Prev todos count:', prevTodos.length);
              // @ts-ignore
              const newTodos = prevTodos.filter(todo => todo.id !== payload.old.id);
              console.log('[SharedTodoList] Realtime: setTodos after DELETE. New todos count:', newTodos.length);
              return newTodos;
            });
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[SharedTodoList] Realtime: SUCCESSFULLY SUBSCRIBED to ${channelName}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`[SharedTodoList] Realtime: CHANNEL_ERROR on ${channelName}:`, err);
          setError("Erreur de connexion temps-réel pour la liste des tâches.");
        } else if (status === 'TIMED_OUT') {
            console.warn(`[SharedTodoList] Realtime: TIMED_OUT on ${channelName}`);
        } else {
          console.log(`[SharedTodoList] Realtime: Status for ${channelName}: ${status}`);
        }
      });

    return () => {
      console.log(`[SharedTodoList] Realtime: Cleaning up subscription to ${channelName}`);
      if (subscription) {
        supabase.removeChannel(subscription)
          .catch(err => console.error(`[SharedTodoList] Erreur désabonnement canal ${channelName} Realtime:`, err));
      }
    };
  }, [roomId, currentUser?.id]); // Ajout de currentUser?.id pour la comparaison dans le payload
  
  // Effet pour scroller vers le bas
  useEffect(() => {
    console.log('[SharedTodoList] useEffect for Scroll triggered. Todos count:', todos.length);
    if (listContainerRef.current && todos.length > 0) {
      setTimeout(() => {
        if (listContainerRef.current) {
          console.log('[SharedTodoList] Scrolling to bottom. ScrollHeight:', listContainerRef.current.scrollHeight);
          listContainerRef.current.scrollTop = listContainerRef.current.scrollHeight;
        }
      }, 100); // Augmenté légèrement le délai pour être sûr
    }
  }, [todos]); // Déclenché à chaque changement de `todos`


  const handleAddTodo = async (e) => {
    e.preventDefault();
    console.log('[SharedTodoList] handleAddTodo called. Content:', newTodoContent);
    if (!newTodoContent.trim() || !currentUser || !roomId) {
        console.warn('[SharedTodoList] handleAddTodo: Aborted due to empty content or missing user/roomId.');
        return;
    }
    const content = newTodoContent.trim();
    setNewTodoContent(''); 

    try {
      console.log('[SharedTodoList] handleAddTodo: Inserting todo with content:', content, 'for user:', currentUser.id);
      const { error: insertError } = await supabase.from('todos').insert({
        room_id: roomId,
        task_content: content,
        created_by_user_id: currentUser.id 
      });

      if (insertError) throw insertError;
      // Le nouveau todo est ajouté via realtime, ce qui déclenchera le useEffect de scroll
    } catch (err) {
      console.error("[SharedTodoList] Erreur d'ajout du todo:", err);
      setError("Impossible d'ajouter la tâche.");
      setNewTodoContent(content); 
    }
  };

  const handleToggleTodo = async (todoId, currentStatus) => {
    console.log('[SharedTodoList] handleToggleTodo called. Todo ID:', todoId, 'Current status:', currentStatus);
    if (!currentUser) {
        console.warn('[SharedTodoList] handleToggleTodo: Aborted, no current user.');
        return;
    }
    try {
      console.log('[SharedTodoList] handleToggleTodo: Updating todo ID:', todoId, 'to status:', !currentStatus);
      const { error: updateError } = await supabase
        .from('todos')
        .update({ 
            is_completed: !currentStatus,
        })
        .eq('id', todoId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Erreur de mise à jour du todo:', err);
      setError('Impossible de mettre à jour la tâche.');
    }
  };

  const handleDeleteTodo = async (todoId) => {
    console.log('[SharedTodoList] handleDeleteTodo called. Todo ID:', todoId);
    if (!currentUser || !roomId) {
        console.warn('[SharedTodoList] handleDeleteTodo: Aborted due to missing user/roomId.');
        return;
    }
    // Optionnel: Demander confirmation
    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?");
    if (!isConfirmed) {
        return;
    }

    try {
      console.log('[SharedTodoList] handleDeleteTodo: Deleting todo ID:', todoId);
      // Note: La politique RLS doit permettre cette opération.
      // Si vous voulez que seul le créateur puisse supprimer:
      // .match({ id: todoId, created_by_user_id: currentUser.id })
      // Pour l'instant, on suppose que quiconque dans la room peut supprimer.
      const { error: deleteError } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId);

      if (deleteError) throw deleteError;
      // La suppression est gérée par Realtime, qui mettra à jour l'état `todos`
      // Aucun changement d'état local direct nécessaire ici.
      console.log('[SharedTodoList] handleDeleteTodo: Todo deleted successfully via DB operation.');
    } catch (err) {
      console.error("[SharedTodoList] Erreur de suppression du todo:", err);
      setError("Impossible de supprimer la tâche. " + err.message);
    }
  };

  if (isLoading && !roomId) { 
    return null; 
  }
  if (isLoading) {
    return <div className="p-4 text-center text-sm text-minimeet-text-muted animate-pulse">Chargement de la liste des tâches...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white p-3 sm:p-4 rounded-lg shadow-lg ring-1 ring-gray-700">
      <h3 className="text-lg font-semibold mb-3 text-minimeet-primary-accent flex-shrink-0">Liste de Tâches</h3>
      
      {error && <p className="mb-2 text-sm text-red-400 bg-red-900/50 p-2 rounded-md">{error}</p>}

      <div 
        ref={listContainerRef} // Attacher la référence ici
        className="flex-grow overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      >
        {todos.length === 0 && !isLoading && (
          <p className="text-sm text-gray-400 italic text-center mt-4">Aucune tâche pour le moment.</p>
        )}
        {todos.map(todo => (
          <div 
            key={todo.id} 
            className={`flex items-center p-2.5 rounded-md transition-all duration-150 ease-in-out group ${todo.is_completed ? 'bg-green-800/30' : 'bg-gray-800/60 hover:bg-gray-700/80'}`}
          >
            <button 
              onClick={() => handleToggleTodo(todo.id, todo.is_completed)}
              aria-label={todo.is_completed ? "Marquer comme non faite" : "Marquer comme faite"}
              className="flex-shrink-0 mr-3 p-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-minimeet-primary-accent"
            >
              <IconCheckboxCircle checked={todo.is_completed} />
            </button>
            <span className={`flex-grow text-sm ${todo.is_completed ? 'line-through text-gray-500' : 'text-gray-100'}`}>
              {todo.task_content}
            </span>
            <span className="text-xs text-gray-500 ml-2 mr-2 opacity-70 group-hover:opacity-100 transition-opacity">
             créé par {todo.created_by_full_name || (todo.created_by_user_id || '').substring(0,5)}
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTodo(todo.id);
              }}
              aria-label="Supprimer la tâche"
              className="p-1 rounded-full hover:bg-red-700/50 focus:outline-none focus:ring-1 focus:ring-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            >
              <IconTrash className="w-4 h-4 text-red-400 hover:text-red-300" />
            </button>
          </div>
        ))}
        {/* listEndRef n'est plus nécessaire si on scrolle le conteneur parent directement */}
      </div>

      <form onSubmit={handleAddTodo} className="mt-3 pt-3 border-t border-gray-700 flex items-center gap-2 flex-shrink-0">
        <input
          type="text"
          value={newTodoContent}
          onChange={(e) => setNewTodoContent(e.target.value)}
          placeholder="Nouvelle tâche..."
          className="flex-grow px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-minimeet-primary-accent focus:border-minimeet-primary-accent text-sm"
        />
        <button
          type="submit"
          disabled={!newTodoContent.trim()}
          className="p-2.5 rounded-lg bg-minimeet-primary-accent text-white hover:bg-minimeet-primary-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          aria-label="Ajouter la tâche"
        >
          <IconPlus className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default SharedTodoList; 