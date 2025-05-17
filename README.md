# MiniMeet - Plateforme de Visioconférence Simple et Efficace

MiniMeet est une application web de visioconférence conçue pour offrir une expérience utilisateur simple, rapide et épurée. Elle permet des appels vidéo en peer-to-peer, un chat en temps réel, le partage d'écran et l'enregistrement des réunions, le tout avec une interface moderne et responsive.

## ✨ Fonctionnalités Clés

*   **Authentification Sécurisée :** Inscription et connexion des utilisateurs gérées via Supabase Auth.
*   **Appels Vidéo Peer-to-Peer :** Communication vidéo et audio directe entre les participants grâce à PeerJS, optimisant la performance et la confidentialité.
*   **Chat en Temps Réel :** Messagerie instantanée intégrée à chaque salle de réunion, alimentée par Supabase Realtime.
*   **Partage d'Écran :** Permet aux utilisateurs de partager leur écran avec les autres participants.
*   **Enregistrement des Réunions :** Fonctionnalité d'enregistrement côté client (via `MediaRecorder API`) avec téléchargement direct du fichier vidéo (format `.webm`).
*   **Tableau de Bord Utilisateur :**
    *   Création facile de nouvelles réunions.
    *   Liste des réunions récentes créées par l'utilisateur.
    *   Possibilité de rejoindre une réunion existante avec un ID.
*   **Interface Utilisateur Moderne :** Design épuré, responsive et intuitif, construit avec React et Tailwind CSS, en respectant le design de référence fourni.
*   **Gestion de Présence :** Suivi en temps réel des participants connectés à une salle.

## 🛠️ Stack Technique

*   **Frontend :**
    *   [React.js](https://reactjs.org/) (Bibliothèque UI)
    *   [Vite](https://vitejs.dev/) (Outil de build frontend)
    *   [Tailwind CSS](https://tailwindcss.com/) (Framework CSS utilitaire)
    *   [React Router DOM](https://reactrouter.com/) (Routing côté client)
*   **Backend (BaaS) & Services :**
    *   [Supabase](https://supabase.io/)
        *   Authentification (Supabase Auth)
        *   Base de données PostgreSQL (Supabase Database pour les réunions, messages, profils utilisateurs)
        *   Temps Réel (Supabase Realtime pour le chat et la gestion de présence)
*   **Communication Peer-to-Peer (WebRTC) :**
    *   [PeerJS](https://peerjs.com/) (Bibliothèque simplifiant WebRTC)
*   **Enregistrement Média :**
    *   `MediaRecorder API` (API navigateur)

## 🚀 Démarrage Rapide

Suivez ces étapes pour configurer et lancer le projet MiniMeet en local.

### Prérequis

*   [Node.js](https://nodejs.org/) (version 16.x ou supérieure recommandée)
*   [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
*   Un compte [Supabase](https://supabase.io/) et un projet configuré.

### Installation

1.  **Clonez le dépôt du projet :**
    ```bash
    git clone https://github.com/marcaureladj/minimeet.git
    cd minimeet 
    ```
   

2.  **Installez les dépendances :**
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Configuration des Variables d'Environnement :**
    *   Créez un fichier `.env` à la racine du projet en copiant le fichier `.env.example` (si vous en créez un) ou en le créant directement.
    *   Ajoutez vos clés d'API Supabase au fichier `.env` :
        ```env
        VITE_SUPABASE_URL=VOTRE_URL_SUPABASE
        VITE_SUPABASE_ANON_KEY=VOTRE_CLE_ANON_SUPABASE
        ```
    *   Remplacez `VOTRE_URL_SUPABASE` et `VOTRE_CLE_ANON_SUPABASE` par les informations de votre projet Supabase.

4.  **Configuration de la Base de Données Supabase :**
    *   Assurez-vous que l'authentification (Auth) est activée dans votre projet Supabase.
    *   Exécutez le script SQL fourni `create_tables.sql` dans l'éditeur SQL de votre tableau de bord Supabase. Ce script créera les tables nécessaires (`meetings`, `messages`, `room_participants`, `profiles`, `todos`) et configurera les politiques de sécurité au niveau des lignes (RLS) de base.

### Lancement du Projet

Une fois l'installation et la configuration terminées, lancez le serveur de développement :

```bash
npm run dev
# ou
yarn dev
```

L'application devrait maintenant être accessible sur `http://localhost:5173` (ou un port similaire indiqué par Vite).

## scripts_npm principaux

*   `npm run dev` : Démarre le serveur de développement avec Vite.
*   `npm run build` : Compile l'application pour la production.
*   `npm run lint` : Exécute ESLint pour analyser le code.
*   `npm run preview` : Démarre un serveur local pour prévisualiser le build de production.

## 🏗️ Structure du Projet (Aperçu)

Le code source est principalement organisé comme suit :

*   `src/components/` : Composants React réutilisables (ex: `VideoPlayer.jsx`, `ChatBox.jsx`).
*   `src/pages/` : Composants React représentant les différentes pages/vues de l'application (ex: `DashboardPage.jsx`, `MeetRoomPage.jsx`).
*   `src/services/` : Modules pour interagir avec des services externes comme Supabase (`supabaseClient.js`) et PeerJS (`peerClient.js`).
*   `src/context/` : (Si utilisé) Contexte React pour la gestion d'état global.
*   `src/assets/` : Fichiers statiques (images, icônes SVG si non inline).
*   `public/` : Contient les fichiers statiques qui sont servis directement, comme `index.html` initial.
*   `memory-bank/` : Documentation interne du projet (brief, contexte, décisions techniques, etc.).

## 🎯 État Actuel du Projet

Le projet MiniMeet a atteint une phase où les fonctionnalités principales définies dans le brief initial sont implémentées et fonctionnelles. Celles-ci incluent l'authentification, la création/jonction de salles, la visioconférence P2P, le chat en temps réel, le partage d'écran et l'enregistrement local des réunions.

Le projet est actuellement en phase de **test, stabilisation et polissage**.

## 🤝 Contribution

Pour le moment, les contributions externes ne sont pas activement recherchées, mais des suggestions ou rapports de bugs sont les bienvenus via les Issues GitHub (si applicable).

## 📄 Licence

*MIT*

---

N'hésitez pas à personnaliser ce README avec plus de détails, des badges, des GIFs de démonstration, ou toute autre information pertinente pour votre projet !
