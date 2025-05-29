import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

function HomePage() {
  const [theme, setTheme] = useState('');
  const [songCount, setSongCount] = useState(10); // Nombre de chansons par défaut: 10
  const [showVideo, setShowVideo] = useState(false); // Afficher la vidéo comme indice par défaut: false
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const startQuiz = async () => {
    if (!theme) return;
    setLoading(true);
    try {
      // Construction de l'URL avec les paramètres de personnalisation
      const url = `/api/quiz?theme=${encodeURIComponent(theme)}&songCount=${songCount}&showVideo=${showVideo}`;
      const res = await fetch(url);
      const data = await res.json();
      setLoading(false);
      // Naviguer vers la page quiz en passant les données du quiz et les options
      navigate('/quiz', { state: { quizData: data.quizData, showVideo: data.showVideo } });
    } catch (err) {
      console.error("Erreur API", err);
      setLoading(false);
      alert("Erreur lors de la création du quiz.");
    }
  };

  return (
    <div className="container home">
      <h1>🎵 Blind Test Musical</h1>
      <div className="input-container">
        <input 
          type="text" 
          placeholder="Entrez un thème (ex: pop 2000)" 
          value={theme} 
          onChange={e => setTheme(e.target.value)} 
          onKeyPress={e => e.key === 'Enter' && startQuiz()}
          className="full-width"
        />
        
        <div className="options-container">
          <div className="option-group">
            <label>Nombre de chansons:</label>
            <select 
              value={songCount} 
              onChange={e => setSongCount(parseInt(e.target.value))}
              className="option-select"
            >
              <option value="5">5 chansons</option>
              <option value="10">10 chansons</option>
              <option value="15">15 chansons</option>
              <option value="20">20 chansons</option>
            </select>
          </div>
          
          <div className="option-group">
            <label>
              <input 
                type="checkbox" 
                checked={showVideo} 
                onChange={e => setShowVideo(e.target.checked)} 
              />
              Afficher la vidéo dès le début (comme indice)
            </label>
          </div>
        </div>
        
        <button onClick={startQuiz} disabled={loading} className="btn-primary">
          {loading ? "Génération en cours..." : "Lancer le blind test"}
        </button>
      </div>
    </div>
  );
}

export default HomePage;
