# Blind Test Musical

Application web de Blind Test musical complète qui génère un quiz musical basé sur un thème saisi par l'utilisateur. L'application utilise l'API YouTube pour récupérer des chansons en lien avec le thème, et propose un quiz de 10 extraits audio avec des choix multiples pour deviner le titre de la chanson.

## Structure du projet

```
root/
├── client/          # Application React + Vite
│   ├── src/         # Code source React (composants, pages, etc.)
│   └── vite.config.js  # Configuration Vite (proxy, etc.)
├── server/          # Serveur Node/Express
│   ├── routes/      
│   │   └── quiz.js  # Route API /api/quiz
│   └── index.js     # Point d'entrée du serveur Express
├── .env             # Clé API YouTube (YOUTUBE_API_KEY=...)
└── package.json     # Dépendances et scripts de démarrage
```

## Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Une clé API YouTube (à insérer dans le fichier .env)

## Installation

1. Clonez ce dépôt
2. Installez les dépendances:

```bash
npm run install-all
```

Cette commande installera les dépendances à la fois pour le serveur backend et le client frontend.

## Configuration

Assurez-vous d'avoir une clé API YouTube valide dans le fichier `.env` à la racine du projet:

```
YOUTUBE_API_KEY=votre_clé_api_youtube
```

Vous pouvez obtenir une clé API YouTube en suivant ces étapes:
1. Connectez-vous à la [Console Google Cloud](https://console.cloud.google.com/)
2. Créez un nouveau projet
3. Activez l'API YouTube Data v3
4. Créez une clé API et restreignez-la si nécessaire

## Démarrage

Pour lancer l'application en mode développement:

```bash
npm run dev
```

Cette commande démarrera simultanément:
- Le serveur backend Express sur http://localhost:5000
- Le serveur de développement Vite pour le frontend React sur http://localhost:5173

## Utilisation

1. Accédez à http://localhost:5173 dans votre navigateur
2. Entrez un thème pour votre blind test (ex: "pop 2000", "rock 90s", "french rap")
3. Cliquez sur "Lancer le blind test"
4. Le quiz générera 10 questions avec des extraits musicaux de 10 secondes
5. Choisissez la bonne réponse parmi les 4 propositions pour chaque question
6. À la fin du quiz, votre score sera affiché

## Fonctionnement

- **Backend**: Le serveur Express génère un quiz musical en recherchant des vidéos sur YouTube correspondant au thème saisi par l'utilisateur.
- **Frontend**: L'application React affiche l'interface utilisateur et gère la logique du quiz.

## Licence

MIT
