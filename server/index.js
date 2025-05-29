const express = require('express');
const app = express();
require('dotenv').config();            // Charge YOUTUBE_API_KEY depuis .env

// Importer la route quiz
const quizRoute = require('./routes/quiz');
app.use('/api', quizRoute);           // Monte le routeur sur le chemin /api

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur Express démarré sur http://localhost:${PORT}`);
});
