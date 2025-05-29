import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './styles.css';

function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const quizData = location.state?.quizData || [];  // récupère les questions passées depuis HomePage
  const showVideo = location.state?.showVideo || false; // Option pour afficher la vidéo comme indice
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);  // "correct" | "wrong" | null
  const [playing, setPlaying] = useState(false);
  const [answered, setAnswered] = useState(false); // Pour savoir si l'utilisateur a répondu

  useEffect(() => {
    if (!quizData.length) {
      // Si pas de données (ex: rafraîchi la page sans passer par l'accueil), on retourne à l'accueil
      navigate('/');
      return;
    }
    setPlaying(true);
    setAnswered(false);
  }, [quizData, navigate, current]);

  if (!quizData.length) {
    return null;
  }

  const question = quizData[current];

  const handleAnswer = (option) => {
    const isCorrect = option === question.title;
    if (isCorrect) setScore(score + 1);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setAnswered(true); // L'utilisateur a répondu, on peut afficher la vidéo
    
    // Après un délai plus long pour permettre de voir la vidéo, passer à la question suivante
    setTimeout(() => {
      setFeedback(null);
      setPlaying(false); // Stop playing current song
      setAnswered(false); // Réinitialiser pour la prochaine question
      
      if (current < quizData.length - 1) {
        setCurrent(current + 1);
      } else {
        // Quiz terminé, passer à la page de résultats
        navigate('/result', { state: { score, total: quizData.length } });
      }
    }, 8000); // Augmenté à 8 secondes pour laisser le temps de voir la vidéo
  };

  return (
    <div className="container quiz">
      <h2>Question {current + 1} / {quizData.length}</h2>
      
      {/* Lecteur YouTube */}
      <div className="player-container">
        {playing && !answered && (
          // Pendant le quiz, avant la réponse - audio seulement
          <>
            <iframe 
              width="1" height="1" 
              src={`https://www.youtube.com/embed/${question.videoId}?start=${question.start}&end=${question.start+10}&autoplay=1&controls=0`}
              title="Music extract"
              allow="autoplay"
              style={{ opacity: 0 }}
            />
            <div className="player-overlay">
              <div className="music-icon">
                🎵
              </div>
            </div>
          </>
        )}
        
        {/* Après avoir répondu, toujours afficher la vidéo */}
        {answered && (
          <div className="video-reveal">
            <iframe 
              width="100%" height="315" 
              src={`https://www.youtube.com/embed/${question.videoId}?start=${question.start}&autoplay=1&controls=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
      </div>
      
      {/* Options de réponse */}
      <div className="options">
        {question.options.map((option, idx) => (
          <button 
            key={idx} 
            onClick={() => handleAnswer(option)}
            disabled={feedback !== null}
            className={feedback && option === question.title ? 'option-correct' : ''}
          >
            {option}
          </button>
        ))}
      </div>
      
      {/* Feedback */}
      {feedback && (
        <div className={feedback === 'correct' ? 'feedback correct' : 'feedback wrong'}>
          {feedback === 'correct' ? '✅ Bonne réponse !' : '❌ Mauvaise réponse'}
          <p>La bonne réponse était: <strong>{question.title}</strong></p>
          <p>Artiste: <strong>{question.artist}</strong></p>
        </div>
      )}
      
      <div className="score-display">
        Score actuel: {score}
      </div>
    </div>
  );
}

export default QuizPage;
