import { Link } from "react-router-dom";
import { useState } from "react";

function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  //const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    //setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="dp-footer">
      <div className="container" style={{ maxWidth: 1100 }}>
        {/* Newsletter */}
        <div className="dp-footer-newsletter">
          <div>
            <div className="dp-footer-news-title">Ricevi i migliori match della settimana</div>
            <div className="dp-footer-muted">Una selezione dei dibattiti più interessanti, ogni domenica.</div>
          </div>

          <form className="dp-news-form" onSubmit={handleSubscribe}>
            <input type="email" className="dp-news-input" placeholder="La tua email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="submit" className="btn dp-news-btn">
              Iscriviti
            </button>
          </form>
        </div>

        {/* Main footer grid */}
        <div className="row gy-4 py-5">
          <div className="col-12 col-md-4">
            <div className="dp-footer-brand">DebatePlatform</div>
            <div className="dp-footer-muted mt-2">Dibattiti moderati · Pro vs Contro · Voto pubblico</div>

            <div className="dp-social mt-3">
              <span className="dp-social-icon">𝕏</span>
              <span className="dp-social-icon">in</span>
              <span className="dp-social-icon">GH</span>
            </div>
          </div>

          <div className="col-6 col-md-2">
            <div className="dp-footer-title">Esplora</div>
            <ul className="dp-footer-list">
              <li>
                <Link to="/">Topic</Link>
              </li>
              <li>
                <Link to="/public/matches">Match pubblici</Link>
              </li>
              <li>
                <Link to="/results">Risultati</Link>
              </li>
            </ul>
          </div>

          <div className="col-6 col-md-3">
            <div className="dp-footer-title">Come funziona</div>
            <ul className="dp-footer-list">
              <li>1) Opening</li>
              <li>2) Rebuttal</li>
              <li>3) Voting pubblico</li>
              <li>4) Risultato finale</li>
            </ul>
          </div>

          <div className="col-12 col-md-3">
            <div className="dp-footer-title">Contatti</div>
            <ul className="dp-footer-list">
              <li className="dp-footer-muted">support@debateplatform.dev</li>
              <li className="dp-footer-muted">Milano · Remote</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="dp-footer-bottom py-3">
          <div className="dp-footer-muted">© {year} DebatePlatform — Demo Project</div>
          <div className="d-flex gap-3">
            <span className="dp-footer-link">Privacy</span>
            <span className="dp-footer-link">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
