import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen flex flex-col items-center justify-center bg-minimeet-background p-4 font-sans">
      <div className="w-full max-w-md bg-minimeet-surface p-8 sm:p-10 rounded-minimeet-xl shadow-minimeet-lg space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-minimeet-text-primary">
            Connectez-vous
          </h2>
          <p className="mt-2 text-sm text-minimeet-text-secondary">
            ou{" "}
            <Link to="/register" className="font-medium text-minimeet-primary hover:text-minimeet-primary-hover">
              créez votre compte
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-minimeet-text-secondary mb-1.5">
              Adresse e-mail
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 border border-minimeet-border rounded-minimeet-md bg-minimeet-background text-minimeet-text-primary placeholder-minimeet-text-muted focus:ring-2 focus:ring-minimeet-primary focus:border-transparent shadow-minimeet-sm sm:text-sm"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-minimeet-text-secondary mb-1.5">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 border border-minimeet-border rounded-minimeet-md bg-minimeet-background text-minimeet-text-primary placeholder-minimeet-text-muted focus:ring-2 focus:ring-minimeet-primary focus:border-transparent shadow-minimeet-sm sm:text-sm"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-minimeet-error text-center py-2">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-medium rounded-minimeet-md text-white bg-minimeet-primary hover:bg-minimeet-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-minimeet-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-150 shadow-minimeet-md hover:shadow-minimeet-lg"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 