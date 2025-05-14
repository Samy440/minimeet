# Contexte Technique : MiniMeet

## 🛠️ Technologies Utilisées

| Élément                | Technologie                | Description                                                                 |
| ---------------------- | -------------------------- | --------------------------------------------------------------------------- |
| Frontend               | React.js                   | Bibliothèque JavaScript pour construire des interfaces utilisateur.           |
| Style                  | Tailwind CSS               | Framework CSS utilitaire pour un design rapide et personnalisé.             |
| Authentification       | Supabase Auth              | Service d'authentification fourni par Supabase.                             |
| Base de données        | Supabase Database (PostgreSQL) | Base de données relationnelle pour stocker les données (réunions, messages). |
| Temps Réel (Chat)      | Supabase Realtime          | Pour la fonctionnalité de chat en direct.                                    |
| Appels vidéo P2P       | PeerJS                     | Bibliothèque simplifiant WebRTC pour la communication P2P.                    |
| Enregistrement réunion | MediaRecorder API          | API navigateur pour enregistrer des flux médias.                            |
| Routing                | React Router DOM           | Pour la navigation côté client dans une application React.                  |
| Environnement          | Node.js / npm ou yarn      | Pour la gestion des dépendances et l'exécution des scripts de build.        |
| Bundler                | Vite                       | Outil de build frontend rapide. (Déduit de `vite.config.js` et `package.json` typiques pour React) |

## ⚙️ Configuration du Développement

1.  **Cloner le dépôt** (si applicable) ou initialiser un nouveau projet React avec Vite.
2.  **Installer les dépendances :** `npm install` ou `yarn install`.
    *   `react`, `react-dom`
    *   `tailwindcss`, `postcss`, `autoprefixer`
    *   `@supabase/supabase-js`
    *   `peerjs`
    *   `react-router-dom`
3.  **Configurer les variables d'environnement :**
    *   Créer un fichier `.env` à la racine du projet.
    *   Ajouter les clés Supabase (fournies dans le fichier `.env` attaché à la requête initiale) :
        *   `VITE_SUPABASE_URL=your_supabase_url`
        *   `VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`
4.  **Configurer Supabase :**
    *   S'assurer que l'authentification est activée.
    *   Exécuter le script SQL `create_tables.sql` (fourni) dans l'éditeur SQL de Supabase pour créer les tables `meetings` et `messages` avec les politiques RLS nécessaires.
5.  **Lancer le serveur de développement :** `npm run dev` ou `yarn dev`.

## 🔌 Dépendances Externes Clés

*   **Supabase :** Nécessite un compte Supabase et un projet configuré.
*   **Serveur PeerJS :** PeerJS nécessite un serveur de signalisation. On peut utiliser le serveur public par défaut de PeerJS pour le développement, ou configurer un serveur PeerJS auto-hébergé pour la production.

## ⚠️ Contraintes Techniques

*   **Compatibilité Navigateur :** WebRTC (utilisé par PeerJS) et MediaRecorder API ont des niveaux de support variables selon les navigateurs. Il faudra cibler les navigateurs modernes.
*   **Gestion des erreurs réseau P2P :** La nature P2P peut être sujette à des problèmes de NAT traversal et de connectivité. Une gestion robuste des erreurs et des états de connexion sera nécessaire.
*   **Scalabilité du serveur de signalisation PeerJS :** Si un serveur auto-hébergé est utilisé, sa capacité devra être prise en compte.
*   **Sécurité :** Les politiques de sécurité de Supabase (RLS) sont cruciales et doivent être correctement implémentées (le script `create_tables.sql` en fournit une bonne base).

## Fichiers de Configuration Fournis
*   `.env`: Contient les clés d'API pour Supabase.
*   `create_tables.sql`: Contient le schéma SQL pour les tables `meetings` et `messages`, ainsi que les politiques RLS associées. 