import React from 'react';
import { Link } from 'react-router-dom';
// Removed: import { supabase } from '../services/supabaseClient'; as it's not used in this component based on the provided snippet.
// If it was intended for future use, it can be re-added.

// Icônes simples pour la démo (à remplacer par de vraies icônes SVG si disponibles ou nécessaires)
const IconBrand = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
    <path d="M2 17l10 5 10-5"></path>
    <path d="M2 12l10 5 10-5"></path>
  </svg>
);

const IconChat = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.68-3.091a4.501 4.501 0 00-1.007.072H7.5a2.25 2.25 0 01-2.25-2.25V10.5c0-.97.616-1.813 1.5-2.097m6.025 0a4.5 4.5 0 01-8.568 0M12 6.75c.517 0 1.008.064 1.482.181M12 6.75a4.5 4.5 0 00-8.568 0m8.568 0L12 6.75m0 0L12 4.5m0 2.25L15.083 9M12 6.75L8.917 9" />
  </svg>
);

const IconShare = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
  </svg>
);

const IconCheckCircle = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const NewLandingPage = () => {
  const gradientBackground = 'bg-gradient-to-br from-minimeet-background via-pink-200 to-orange-200';

  return (
    <div className={`min-h-screen flex flex-col font-sans ${gradientBackground} text-minimeet-text-primary`}>
      {/* Barre de navigation */}
      <nav className="py-4 sm:py-6 px-4 sm:px-8 md:px-16 sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <IconBrand className="w-7 h-7 sm:w-8 sm:h-8 text-minimeet-primary" />
            <span className="text-xl sm:text-2xl font-semibold text-minimeet-primary">MiniMeet</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6 sm:space-x-8 text-sm sm:text-base">
            <a href="#features" className="hover:text-minimeet-primary transition-colors">Fonctionnalités</a>
            <a href="#about" className="hover:text-minimeet-primary transition-colors">À Propos</a>
            <a href="#contact" className="hover:text-minimeet-primary transition-colors">Contact</a>
          </div>
          <div className="md:hidden">
             <button className="text-minimeet-text-primary focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
             </button>
          </div>
        </div>
      </nav>

      {/* Section Héros */}
      <main className="flex-grow flex items-center">
        <div className="container mx-auto px-4 sm:px-8 md:px-16 py-12 sm:py-16 md:py-24 text-center md:text-left">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                MiniMeet: Vos réunions en ligne, <span className="text-minimeet-primary">simplifiées</span>.
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-minimeet-text-secondary max-w-xl mx-auto md:mx-0">
                Connectez-vous, partagez et collaborez en temps réel avec une solution de visioconférence intuitive et performante. Idéal pour les équipes, les amis et la famille.
              </p>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                <Link
                  to="/register"
                  className="px-6 sm:px-8 py-3 sm:py-3.5 text-base sm:text-lg font-medium text-white bg-minimeet-primary hover:bg-minimeet-primary-hover rounded-minimeet-md shadow-minimeet-lg hover:shadow-minimeet-xl transition-all duration-150 transform hover:scale-105"
                >
                  Créer un compte
                </Link>
                <Link
                  to="/login"
                  className="px-6 sm:px-8 py-3 sm:py-3.5 text-base sm:text-lg font-medium text-minimeet-primary border-2 border-minimeet-primary hover:bg-minimeet-primary hover:text-white rounded-minimeet-md shadow-minimeet-sm hover:shadow-minimeet-md transition-all duration-150"
                >
                  Se connecter
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center items-center">
              <div className="w-full max-w-md aspect-square bg-gradient-to-tr from-minimeet-primary via-red-300 to-orange-300 rounded-minimeet-xl shadow-minimeet-xl flex items-center justify-center p-8">
                 <IconBrand className="w-32 h-32 text-white opacity-75" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Section Fonctionnalités (id="features") - AMÉLIORÉE */}
      <section id="features" className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-8 md:px-16">
          <div className="text-center mb-12 sm:mb-14 md:mb-20">
            <h2 className="text-3xl sm:text-4xl font-semibold text-minimeet-text-primary mb-4">Pourquoi choisir MiniMeet ?</h2>
            <p className="mt-3 sm:mt-4 text-lg sm:text-xl text-minimeet-text-secondary max-w-3xl mx-auto">
              Une plateforme conçue pour la simplicité et l'efficacité de vos communications. Découvrez nos atouts.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {[
              { title: "Chat Intégré Facile", description: "Communiquez par messages textes pendant vos appels sans interrompre le flux de la conversation.", icon: <IconChat className="w-7 h-7" /> },
              { title: "Partage d'Écran Fluide", description: "Partagez votre écran ou des documents en toute simplicité pour des présentations claires et efficaces.", icon: <IconShare className="w-7 h-7" /> },
              { title: "Haute Qualité & Fiabilité", description: "Profitez d'une connexion stable et d'une qualité audio/vidéo optimale pour toutes vos réunions.", icon: <IconCheckCircle className="w-7 h-7" /> }
            ].map((feature, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-minimeet-xl shadow-minimeet-lg hover:shadow-minimeet-xl transition-shadow transform hover:-translate-y-1 duration-150">
                <div className="flex items-center justify-center w-14 h-14 bg-minimeet-primary text-white rounded-minimeet-full mb-5 sm:mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-minimeet-text-primary">{feature.title}</h3>
                <p className="text-base text-minimeet-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Section "À Propos" (id="about") - AMÉLIORÉE */}
      <section id="about" className="py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-8 md:px-16">
            <div className="bg-white/80 backdrop-blur-sm p-8 sm:p-10 md:p-12 rounded-minimeet-xl shadow-minimeet-lg max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-semibold mb-6 text-center text-minimeet-text-primary">À propos de MiniMeet</h2>
              <p className="text-lg text-minimeet-text-secondary leading-relaxed mb-4">
                  MiniMeet est un projet passionné visant à fournir une solution de visioconférence simple, open-source et respectueuse de la vie privée. 
                  Nous croyons en la puissance de la connexion humaine et nous nous efforçons de rendre cela accessible à tous.
              </p>
              <p className="text-lg text-minimeet-text-secondary leading-relaxed">
                  Ce projet est en cours de développement. N'hésitez pas à suivre son évolution et à contribuer si le cœur vous en dit !
              </p>
            </div>
          </div>
      </section>

      {/* Section "Contactez-nous" (id="contact") - AMÉLIORÉE */}
      <section id="contact" className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-8 md:px-16">
          <div className="bg-white/80 backdrop-blur-sm p-8 sm:p-10 md:p-12 rounded-minimeet-xl shadow-minimeet-lg max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-semibold mb-8 text-center text-minimeet-text-primary">Contactez-nous</h2>
            <div className="max-w-xl mx-auto text-center">
              <p className="text-lg text-minimeet-text-secondary mb-8">
                Pour toute question, suggestion ou demande d'information, n'hésitez pas à nous joindre.
              </p>
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-medium text-minimeet-primary mb-1">Par Email</h4>
                  <a href="mailto:marcaureladj@gmail.com" className="text-lg text-minimeet-text-secondary hover:text-minimeet-primary-hover hover:underline">marcaureladj@gmail.com</a>
                </div>
                <div>
                  <h4 className="text-xl font-medium text-minimeet-primary mb-1">Par Téléphone</h4>
                  <a href="tel:+2290195413447" className="text-lg text-minimeet-text-secondary hover:text-minimeet-primary-hover hover:underline">+229 01 95 41 34</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 border-t border-minimeet-border/30">
        <div className="container mx-auto px-4 sm:px-8 md:px-16 text-center">
          <p className="text-sm text-minimeet-text-secondary opacity-90">
            &copy; {new Date().getFullYear()} MiniMeet. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default NewLandingPage; 