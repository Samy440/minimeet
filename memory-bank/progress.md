# Progression du Projet : MiniMeet

**Date de dernière mise à jour :** {{DATE}}

## ✅ Ce qui fonctionne :

-   **Authentification (`Login.jsx`, `Register.jsx`, `supabaseClient.js`) :**
    -   Inscription et connexion des utilisateurs via Supabase Auth.
    -   Redirection automatique et routes protégées.
-   **Dashboard (`DashboardPage.jsx`) :**
    -   Création de nouvelles réunions avec génération d'un `roomId`.
    -   Enregistrement des réunions créées dans la table `meetings` de Supabase (associées à `user_id`).
    -   Affichage de la liste des réunions passées/récentes pour l'utilisateur connecté, avec possibilité de les rejoindre.
    -   Possibilité de rejoindre une réunion existante via un ID.
    -   Bouton de déconnexion fonctionnel.
-   **Salle de Réunion (`MeetRoomPage.jsx`) :**
    -   **Initialisation et P2P (`peerClient.js`) :**
        -   Configuration et initialisation de PeerJS.
        -   Accès à la caméra et au microphone (`getUserMedia`).
    -   **Gestion de Présence et Appels Dynamiques :**
        -   Enregistrement et mise à jour du statut des participants (`online`/`offline`) dans la table `room_participants`.
        -   Découverte en temps réel des autres participants via Supabase Realtime.
        -   Initiation automatique des appels PeerJS vers les autres et gestion des appels entrants.
        -   Affichage dynamique de la liste des participants connectés.
    -   **Flux Vidéo (`VideoPlayer.jsx`) :**
        -   Affichage du flux vidéo local et des flux distants.
    -   **Chat en Temps Réel (`ChatBox.jsx`) :**
        -   Connexion à un canal Supabase Realtime pour le `roomId`.
        -   Envoi et réception de messages en temps réel, affichage avec distinction de l'expéditeur.
    -   **Partage d'Écran (`ScreenShareButton.jsx`, `MeetRoomPage.jsx`) :**
        -   Bouton pour démarrer/arrêter le partage d'écran.
        -   Utilisation de `navigator.mediaDevices.getDisplayMedia()`.
        -   Le flux de l'écran partagé remplace le flux vidéo de la caméra pour les autres participants (`replaceTrack`).
        -   Restauration du flux caméra après l'arrêt du partage.
    -   **Enregistrement de la Réunion (`MeetRoomPage.jsx`) :**
        -   Bouton pour démarrer/arrêter l'enregistrement du flux média local (caméra/micro ou partage d'écran).
        -   Utilisation de l'API `MediaRecorder`.
        -   Génération d'un lien de téléchargement pour la vidéo enregistrée au format `.webm`.
    -   **Contrôles et Interface :**
        -   Boutons avec icônes SVG pour : micro (on/off), caméra (on/off), partage d'écran (on/off), enregistrement (on/off), quitter la réunion, copier le lien.
        -   Affichage du `roomId` et de l'utilisateur courant.
        -   Système d'onglets pour basculer entre le Chat et la liste des Participants.

## ⏳ Ce qui reste à construire / affiner (Phase de Polissage / Post-MVP) :

-   **Tests Approfondis :**
    -   Tests de compatibilité multi-navigateurs.
    -   Tests de robustesse (scénarios d'erreur, perte de connexion, etc.).
    -   Tests d'expérience utilisateur (UX).
-   **Améliorations UI/UX (Optionnel - basées sur les tests et le feedback) :**
    -   Peaufinage du design (alignements, espacements, responsive design sur plus de tailles d'écran).
    -   Animations légères pour améliorer l'interactivité.
    -   Tooltips plus descriptifs pour les icônes si nécessaire.
    -   Amélioration de l'affichage des erreurs et des notifications.
-   **Nettoyage du Code et Optimisations Mineures :**
    -   Revue du code pour la clarté, les commentaires et les petites optimisations.
-   **Fonctionnalités Avancées (Non prioritaires / Hors scope initial strict) :**
    -   Nommer les réunions à la création.
    -   Thème sombre/clair (plus complexe).
    -   Indicateurs visuels plus clairs pour "qui parle".
    -   Enregistrement côté serveur ou mixage de plusieurs flux (très complexe).

## 📊 Statut Actuel
Le projet MiniMeet a atteint un jalon majeur : **toutes les fonctionnalités principales définies dans le brief initial ont été implémentées et sont fonctionnelles.** L'application permet l'authentification, la création/jonction de salles, la visioconférence P2P avec chat, partage d'écran, et enregistrement local. Le Dashboard affiche également l'historique des réunions.

Le projet entre maintenant dans une phase de **stabilisation, test et polissage**. Aucune fonctionnalité majeure manquante du brief original n'est identifiée.

## 🐛 Problèmes Connus / Points d'Attention (pour la phase de test)
-   La robustesse de `replaceTrack` dans tous les scénarios de partage d'écran et de toggle caméra/micro doit être validée sur plusieurs navigateurs.
-   La gestion des permissions pour `getUserMedia` et `getDisplayMedia` doit être gracieuse.
-   Compatibilité des codecs `MediaRecorder` (vp9/vp8) selon les navigateurs.

## 🚧 Ce qui reste à construire (selon les étapes de développement initiales)

1.  **Mise en place de la structure du projet React et installation des dépendances.**
2.  **Configuration de Tailwind CSS** (incluant couleurs et police déduites/choisies).
3.  **Initialisation de `App.jsx` (avec routing) et `main.jsx`.**
4.  **Intégration PeerJS :**
    *   Configuration initiale de `peerClient.js`.
5.  **UI : Login/Register + Dashboard :**
    *   Création des composants React pour `Login.jsx`, `Register.jsx`, `Dashboard.jsx`.
    *   Styling avec Tailwind CSS en respectant l'image de référence.
    *   Intégration de Supabase Auth (connexion, inscription, déconnexion, gestion de session) via `supabaseClient.js`.
    *   Logique pour créer une nouvelle réunion, lister les réunions passées, rejoindre une réunion par code sur le Dashboard.
6.  **Vidéoconférence + enregistrement (`MeetRoom.jsx`) :**
    *   Mise en place de la communication P2P avec PeerJS (`VideoPlayer.jsx`).
    *   Gestion des flux vidéo locaux et distants.
    *   Implémentation de la fonction d'enregistrement avec `MediaRecorder API`.
    *   Interface pour démarrer/arrêter l'enregistrement et télécharger la vidéo.
    *   Boutons de contrôle (micro/caméra on/off, copier le lien de la réunion).
7.  **Chat en temps réel (`ChatBox.jsx`) :**
    *   Intégration avec Supabase Realtime.
    *   Affichage des messages.
    *   Envoi de messages.
8.  **Partage d'écran (`ScreenShareButton.jsx`) :**
    *   Implémentation avec `navigator.mediaDevices.getDisplayMedia()`.
    *   Intégration avec PeerJS pour diffuser le flux de partage d'écran.
9.  **Responsive Design & Finalisation UI :**
    *   S'assurer que toute l'application est responsive.
    *   Peaufinage du design, animations légères, thème sombre/clair (optionnel).
10. **Tests (basiques pour commencer).**
11. **Packaging & Déploiement.**

## 📊 Statut Actuel

*   **Phase :** Préparation du développement frontend.
*   **Prochaine étape majeure :** Mise en place de la structure du projet React, configuration de Tailwind CSS, et démarrage du développement de l'UI pour l'authentification (`Login.jsx`).

## ❗ Problèmes Connus

*   **Point d'attention :** L'extraction précise des styles (couleurs, polices, espacements, tailles d'arrondis) à partir de l'image de référence sera cruciale et demandera une attention particulière lors du développement des composants UI. 