/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'minimeet-background': '#F8F9FA',      // Fond général de l'application (blanc cassé/gris clair)
        'minimeet-surface': '#FFFFFF',         // Fond des cartes, panneaux, modales (blanc pur)
        
        'minimeet-primary': '#FF5252',        // Accent principal (rouge corail doux)
        'minimeet-primary-hover': '#E04848',  // Hover pour l'accent principal
        
        'minimeet-secondary-accent': '#4DB6AC', // Un vert menthe/turquoise pour certains accents (Placeholder, à ajuster si besoin)

        'minimeet-dark-panel': '#1F2937',      // Fond pour panneaux sombres (ex: Tasks List, onglet actif)
        'minimeet-dark-panel-text': '#F9FAFB', // Texte sur panneaux sombres (gris très clair)
        
        'minimeet-text-primary': '#212529',      // Texte principal sur fonds clairs (presque noir)
        'minimeet-text-secondary': '#4B5563',  // Texte secondaire sur fonds clairs (gris moyen-foncé)
        'minimeet-text-muted': '#6B7280',      // Texte discret/placeholder (gris moyen)
        'minimeet-text-on-dark': '#FFFFFF',    // Texte principal sur fonds foncés (blanc)

        'minimeet-border': '#E5E7EB',         // Couleur de bordure standard (gris clair)
        
        'minimeet-success': '#10B981',        // Vert pour succès/validation
        'minimeet-error': '#EF4444',          // Rouge pour erreur/refus (similaire à record-active)
        'minimeet-warning': '#F59E0B',        // Orange pour avertissement

        // Couleurs spécifiques de l'UI de l'image
        'minimeet-summary-card-bg': '#E0F2F1', // Vert d'eau très pâle pour la carte Summary (similaire à l'ancien chat-bubble-light)
        'minimeet-other-chat-bubble': '#E0F2F1',// Pour les bulles de chat des autres
        'minimeet-recording-indicator': '#EF4444', // Rouge pour l'indicateur d'enregistrement
      },
      borderRadius: {
        'minimeet-sm': '6px',
        'minimeet-md': '8px',    // Utilisé pour boutons, inputs par défaut
        'minimeet-lg': '12px',   // Utilisé pour cartes plus grandes
        'minimeet-xl': '16px',   // Pour arrondis très prononcés
        'minimeet-full': '9999px', // Pour éléments circulaires
        // 'minimeet-button': '8px', // Remplacé par minimeet-md
        // 'minimeet-video': '10px', // Peut être minimeet-md ou minimeet-lg
        // 'minimeet-chat-bubble': '10px', // Peut être minimeet-md ou minimeet-lg
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'minimeet-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'minimeet-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'minimeet-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'minimeet-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
} 