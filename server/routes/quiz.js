const express = require('express');
const router = express.Router();

// Route GET /api/quiz?theme=...&songCount=...&showVideo=...
router.get('/quiz', async (req, res) => {
  const theme = req.query.theme;
  if (!theme) {
    return res.status(400).json({ error: "Paramètre 'theme' requis" });
  }
  
  // Paramètres optionnels avec valeurs par défaut
  const songCount = parseInt(req.query.songCount) || 10; // Nombre de chansons (par défaut: 10)
  const showVideo = req.query.showVideo === 'true'; // Afficher la vidéo comme indice (par défaut: false)
  
  console.log(`Génération d'un quiz avec ${songCount} chansons. Affichage vidéo: ${showVideo}`);
  
  const apiKey = process.env.YOUTUBE_API_KEY;
  try {
    // Construire l'URL de la requête YouTube Data API (search.list)
    const params = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      videoCategoryId: '10',       // Catégorie Musique
      videoDuration: 'medium',    // Durée moyenne (4 à 20 min)
      maxResults: '50',
      q: theme,
      key: apiKey,
      videoEmbeddable: 'true'
    });
    const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?${params}`;
    
    const response = await fetch(youtubeApiUrl);
    const data = await response.json();
    if (!data.items) {
      throw new Error("Réponse invalide de l'API YouTube");
    }
    // data.items contient la liste des résultats de recherche (videos)
    let videos = data.items;

    // Exclusion par mots-clés dans le titre - liste étendue
    const excludeWords = [
      "cover", "karaoke", "live", "mix", "medley", "trailer", "interview", "best of",
      "compilation", "playlist", "top", "mega", "collection", "non-stop", "greatest hits",
      "hour of", "full album", "acoustic", "remix", "tribute", "instrumental", "concert",
      "performance", "mashup", "extended", "version", "edit", "reaction", "video"
    ];
    
    videos = videos.filter(item => {
      const title = item.snippet.title.toLowerCase();
      const description = item.snippet.description ? item.snippet.description.toLowerCase() : '';
      
      // Filtrage par titre
      const titleFiltered = !excludeWords.some(word => title.includes(word));
      
      // Filtrage optionnel par description
      const descriptionFiltered = !(description.includes('tracklist') || 
                                  description.includes('full songs') || 
                                  description.includes('timestamps') || 
                                  description.includes('full album'));
      
      return titleFiltered && descriptionFiltered;
    });
    
    // Log du nombre de vidéos après filtrage par mots-clés
    console.log(`Vidéos après filtrage par mots-clés: ${videos.length}`);
    
    // Extraire les IDs des vidéos restantes pour récupérer les durées
    const ids = videos.map(v => v.id.videoId).join(',');
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${ids}&key=${apiKey}`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();
    if (!detailsData.items) {
      throw new Error("Impossible de récupérer les détails des vidéos");
    }
    // Associer les détails (durée) à chaque vidéo
    let detailedVideos = detailsData.items;
    // Définition des limites de durée
    const minSec = 90;  // 1min30s minimum
    const maxSec = 420; // 7min maximum (plus strict que 600s)
    
    // Filtrer par durée entre minSec et maxSec
    detailedVideos = detailedVideos.filter(video => {
      const durationISO = video.contentDetails.duration; // ex: "PT4M30S"
      const durationSec = isoDurationToSeconds(durationISO);
      return durationSec >= minSec && durationSec <= maxSec;
    });
    
    console.log(`Vidéos après filtrage par durée: ${detailedVideos.length}`);

    // Utiliser un Set pour détecter les doublons de chansons
    const seenTitles = new Set();
    const uniqueVideos = [];
    
    // Filtrer les vidéos pour éliminer les doublons de chansons
    detailedVideos.forEach(video => {
      const normalizedTitle = normalizeTitle(video.snippet.title);
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        uniqueVideos.push(video);
      }
    });
    
    console.log(`Nombre de vidéos uniques après déduplication: ${uniqueVideos.length}`);
    
    // Limiter aux N premières vidéos uniques en fonction du paramètre songCount
    const maxQuestions = Math.min(songCount, 20); // Limite maximale de 20 questions
    const selected = uniqueVideos.slice(0, maxQuestions);
    console.log(`Nombre de questions générées: ${selected.length} (demandé: ${songCount})`);
    
    // Vérifier qu'on a assez de vidéos pour un quiz complet
    if (selected.length < songCount) {
      console.warn(`Attention: seulement ${selected.length} vidéos trouvées pour le thème "${theme}". Le quiz sera plus court que demandé.`);
    }

    // Préparer la liste des autres titres pour générer les leurres
    const otherTitles = uniqueVideos.slice(10).map(v => {
      // Titre de la vidéo déjà normalisé
      let title = v.snippet.title;
      title = title.replace(/\(.*official.*\)/i, '').trim();
      return title;
    });

    // Construire les questions avec le paramètre showVideo
    const quiz = selected.map(video => {
      const videoId = video.id;
      // Titre et artiste
      let title = video.snippet.title;
      title = title.replace(/\(.*official.*\)/i, '').trim();
      const artist = video.snippet.channelTitle || '';  // nom de la chaîne YouTube
      // Point de départ aléatoire entre 30s et durée-30s
      const durationSec = isoDurationToSeconds(video.contentDetails.duration);
      const start = Math.max(30, Math.floor(Math.random() * (durationSec - 30)));

      // Normalisation du titre pour la déduplication
      const normalizedCorrectTitle = normalizeTitle(title);
      const seenOptionTitles = new Set([normalizedCorrectTitle]);
      
      // Options initialisées avec le titre correct
      const options = [ title ];
      
      // S'assurer d'avoir assez de titres pour les leurres
      if (otherTitles.length < 3) {
        // Si nous n'avons pas assez de titres, générer des alternatives aléatoires
        const backupTitles = [
          "Never Gonna Give You Up",
          "Bohemian Rhapsody",
          "Billie Jean",
          "Shape of You",
          "Despacito",
          "Uptown Funk",
          "Thriller",
          "Bad Guy",
          "Imagine",
          "Sweet Child O' Mine",
          "Hotel California",
          "Smells Like Teen Spirit",
          "Dancing Queen",
          "Stairway to Heaven",
          "Like a Rolling Stone",
          "Wonderwall",
          "Everybody Hurts",
          "Welcome to the Jungle",
          "Nothing Else Matters",
          "I Will Always Love You"
        ];
        
        // Ajouter des titres de sauvegarde si nécessaire
        while (otherTitles.length < 3) {
          const randBackupTitle = backupTitles[Math.floor(Math.random() * backupTitles.length)];
          const normalizedBackup = normalizeTitle(randBackupTitle);
          
          if (!seenOptionTitles.has(normalizedBackup)) {
            otherTitles.push(randBackupTitle);
            seenOptionTitles.add(normalizedBackup);
          }
        }
      }
      
      // Garantir 4 options (1 correcte + 3 leurres)
      let attempts = 0;
      const maxAttempts = 50; // éviter les boucles infinies
      
      while (options.length < 4 && attempts < maxAttempts) {
        attempts++;
        
        // Choisir un leurre aléatoire parmi la liste des autres titres
        if (otherTitles.length === 0) break;
        
        const randIndex = Math.floor(Math.random() * otherTitles.length);
        const fakeTitle = otherTitles.splice(randIndex, 1)[0];
        
        if (!fakeTitle) continue;
        
        // Vérifier si ce titre est unique après normalisation
        const normalizedFake = normalizeTitle(fakeTitle);
        
        if (!seenOptionTitles.has(normalizedFake)) {
          options.push(fakeTitle);
          seenOptionTitles.add(normalizedFake);
        }
      }
      
      // Ajouter des options de secours si nous n'avons pas réussi à obtenir 4 options
      if (options.length < 4) {
        const emergencyOptions = [
          "Yesterday", "Let It Be", "Smooth Criminal", "Africa", "Don't Stop Believin'",
          "Highway to Hell", "Sweet Dreams", "Take On Me", "Livin' On A Prayer", "Every Breath You Take"
        ];
        
        while (options.length < 4) {
          const emergency = emergencyOptions[Math.floor(Math.random() * emergencyOptions.length)];
          const normalizedEmergency = normalizeTitle(emergency);
          
          if (!seenOptionTitles.has(normalizedEmergency)) {
            options.push(emergency);
            seenOptionTitles.add(normalizedEmergency);
          }
        }
      }
      // Mélanger les options pour que la bonne réponse ne soit pas toujours à la même position
      shuffleArray(options);

      return {
        videoId,
        title,
        artist,
        start,
        options
      };
    });

    // Ajouter le paramètre showVideo aux données du quiz
    res.json({
      quizData: quiz,
      showVideo: showVideo
    });
  } catch (err) {
    console.error("Erreur lors de la génération du quiz :", err);
    res.status(500).json({ error: "Erreur lors de la génération du quiz." });
  }
});

// Convertit une durée ISO8601 (PT#M#S) en secondes (nombre)
function isoDurationToSeconds(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  return hours * 3600 + minutes * 60 + seconds;
}

// Fonction pour normaliser les titres (uniformisation pour comparaison)
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/\(.*?\)/g, '')         // supprime tout entre parenthèses
    .replace(/\[.*?\]/g, '')         // supprime tout entre crochets
    .replace(/feat\.?.*|ft\.?.*/g, '') // supprime les "feat."
    .replace(/official|lyrics|audio|video|hd|mv|clip/gi, '')
    .replace(/[^a-z0-9\s]/gi, '')    // garde uniquement lettres/chiffres/espaces
    .replace(/\s+/g, ' ')            // espace simple
    .trim();
}

// Petite fonction utilitaire pour mélanger un tableau (Fisher-Yates)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

module.exports = router;
