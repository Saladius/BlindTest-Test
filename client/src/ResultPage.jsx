import { useLocation, useNavigate } from 'react-router-dom';
import './styles.css';

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, total } = location.state || { score: 0, total: 0 };

  const replay = () => navigate('/');
  
  let message = "Pas mal !";
  if (score === total) {
    message = "Parfait ! Tu es un vrai mu00e9lomane !";
  } else if (score >= total * 0.8) {
    message = "Excellent ! Tu connais vraiment bien ta musique !";
  } else if (score >= total * 0.6) {
    message = "Bien jouu00e9 ! Tu as de bonnes connaissances musicales !";
  } else if (score <= total * 0.3) {
    message = "Tu peux faire mieux, continue u00e0 u00e9couter plus de musique !";
  }

  return (
    <div className="container result">
      <h2>Ru00e9sultat du Blind Test</h2>
      
      <div className="score-card">
        <p className="final-score">
          <span className="score-value">{score}</span> / {total}
        </p>
        <p className="score-message">{message}</p>
      </div>
      
      <button onClick={replay} className="btn-primary">
        Rejouer
      </button>
    </div>
  );
}

export default ResultPage;
