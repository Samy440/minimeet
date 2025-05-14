# Contexte Produit : MiniMeet

## ❓ Pourquoi ce projet existe-t-il ?

MiniMeet vise à fournir une solution de visioconférence accessible et facile à utiliser, répondant au besoin croissant de communication à distance. L'objectif est d'offrir une alternative aux plateformes existantes en mettant l'accent sur la simplicité, la rapidité et l'efficacité.

## 💡 Problèmes résolus

*   **Complexité des outils existants :** Beaucoup de plateformes de visioconférence sont surchargées de fonctionnalités, rendant leur utilisation intimidante pour certains utilisateurs. MiniMeet se concentre sur l'essentiel.
*   **Rapidité de mise en place :** Permettre de démarrer ou rejoindre une réunion rapidement, sans inscription complexe (bien que l'authentification soit nécessaire pour certaines fonctionnalités).
*   **Accessibilité :** Offrir les fonctionnalités clés (vidéo, chat, partage d'écran, enregistrement) dans une interface intuitive.

## ⚙️ Comment cela devrait-il fonctionner ?

1.  **Authentification :** Les utilisateurs se connectent ou créent un compte via e-mail et mot de passe (Supabase Auth).
2.  **Tableau de bord :** Après connexion, l'utilisateur accède à un tableau de bord où il peut :
    *   Créer une nouvelle réunion (générant un ID de salle unique).
    *   Voir la liste de ses réunions passées.
    *   Rejoindre une réunion existante via un code.
    *   Se déconnecter.
3.  **Salle de réunion (MeetRoom) :**
    *   La visioconférence se déroule en P2P grâce à PeerJS.
    *   Un chat en temps réel (Supabase Realtime) est disponible.
    *   Les utilisateurs peuvent activer/désactiver leur micro et caméra.
    *   La fonction de partage d'écran est accessible.
    *   L'organisateur (ou tout participant selon la configuration future) peut démarrer et arrêter l'enregistrement de la session (MediaRecorder API).
    *   Un lien pour copier l'ID de la réunion est disponible.
    *   Après l'arrêt de l'enregistrement, un lien de téléchargement du fichier vidéo (format .webm) est proposé.

## 🎯 Objectifs de l'expérience utilisateur (UX)

*   **Simplicité :** Interface claire, commandes intuitives.
*   **Rapidité :** Accès rapide aux fonctions, faible latence.
*   **Efficacité :** Atteindre les objectifs de communication sans friction.
*   **Design moderne :** Respect strict du design fourni (couleurs, disposition, formes arrondies) pour une expérience visuelle agréable et cohérente.
*   **Réactivité :** L'application doit être utilisable sur différents appareils (desktop, mobile via un design responsive). 