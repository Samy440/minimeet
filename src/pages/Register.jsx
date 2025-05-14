import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Décommenté
import { supabase } from '../services/supabaseClient'; // Décommenté

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate(); // Décommenté

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;
      setSuccess("Inscription réussie ! Veuillez vérifier vos e-mails pour confirmer votre compte.");
      // Optionnel: rediriger après un délai si vous le souhaitez, par exemple vers la page de connexion.
      // setTimeout(() => navigate('/login'), 3000);
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
            Créez votre compte
          </h2>
          <p className="mt-2 text-sm text-minimeet-text-secondary">
            ou{" "}
            <Link to="/login" className="font-medium text-minimeet-primary hover:text-minimeet-primary-hover">
              connectez-vous
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
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
              autoComplete="new-password"
              required
              className="w-full px-4 py-3 border border-minimeet-border rounded-minimeet-md bg-minimeet-background text-minimeet-text-primary placeholder-minimeet-text-muted focus:ring-2 focus:ring-minimeet-primary focus:border-transparent shadow-minimeet-sm sm:text-sm"
              placeholder="Choisissez un mot de passe (min. 6 caractères)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-minimeet-text-secondary mb-1.5">
              Confirmez le mot de passe
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full px-4 py-3 border border-minimeet-border rounded-minimeet-md bg-minimeet-background text-minimeet-text-primary placeholder-minimeet-text-muted focus:ring-2 focus:ring-minimeet-primary focus:border-transparent shadow-minimeet-sm sm:text-sm"
              placeholder="Retapez votre mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-minimeet-error text-center py-2">{error}</p>
          )}
          {success && (
            <p className="text-sm text-minimeet-success text-center py-2">{success}</p>
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
              {loading ? 'Création du compte...' : 'Créer un compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage; 