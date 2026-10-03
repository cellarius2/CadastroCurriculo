import {
  BrowserRouter,
  Link,
  Route,
  Routes,
} from "react-router-dom";
import ListaCandidatos from "./pages/ListaCandidatos";
import NovoCandidato from "./pages/NovoCandidato";
import DetalhesCandidato from "./pages/DetalhesCandidato";

function CurriculoDecorativo({ lado }: { lado: "left" | "right" }) {
  return (
    <div
      className={`resume-decoration resume-decoration-${lado}`}
      aria-hidden="true"
    >
      <div className="resume-sheet resume-sheet-back">
        <span className="resume-line" />
        <span className="resume-line" />
        <span className="resume-line" />
        <span className="resume-line" />
      </div>

      <div className="resume-sheet resume-sheet-front">
        <div className="resume-profile">
          <span className="resume-person">
            <span className="resume-person-head" />
            <span className="resume-person-body" />
          </span>

          <div className="resume-profile-lines">
            <span className="resume-line" />
            <span className="resume-line" />
          </div>
        </div>

        <span className="resume-line" />
        <span className="resume-line" />
        <span className="resume-line" />
        <span className="resume-line resume-line-short" />
      </div>

      <div className="decoration-rays">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function LinhasDecorativas() {
  return (
    <svg
      className="hero-lines"
      viewBox="0 0 1440 500"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M-30 5 C90 95 125 20 230 115 S300 315 420 355"
        className="line-orange"
      />

      <path
        d="M-30 280 C80 290 110 395 250 425"
        className="line-peach"
      />

      <path
        d="M1470 0 C1380 120 1260 45 1195 160 S1100 310 1010 355"
        className="line-peach"
      />

      <path
        d="M1470 240 C1380 310 1300 215 1240 305"
        className="line-orange"
      />
    </svg>
  );
}

function PaginaInicial() {
  return (
    <>
      <header className="hero">
        <div className="hero-art" aria-hidden="true" />

        <div className="hero-stage">
          <LinhasDecorativas />
          <CurriculoDecorativo lado="left" />
          <CurriculoDecorativo lado="right" />

          <div className="hero-content">
            <h1>Cadastro de Currículos</h1>

            <img
              className="hero-icon"
              src="/images/elemento.png"
              alt=""
            />

            <Link
              className="button button-primary"
              to="/candidatos/novo"
            >
              Cadastrar candidato
            </Link>
          </div>

          <a
            className="scroll-cue"
            href="#candidatos"
            aria-label="Ir para a listagem de candidatos"
          >
            <svg
              viewBox="0 0 32 32"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M6 11 L16 21 L26 11" />
            </svg>
          </a>
        </div>

        <svg
          className="hero-wave"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M0 90
               C180 0 340 0 520 55
               C700 110 770 115 950 50
               C1140 -10 1260 120 1440 25
               L1440 120 L0 120 Z"
          />
        </svg>
      </header>

      <main id="candidatos">
        <ListaCandidatos />
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PaginaInicial />} />

        <Route path="/candidatos/novo" element={<NovoCandidato />} />

        <Route path="/candidatos/:id" element={<DetalhesCandidato />} />

        <Route
          path="*"
          element={
            <main className="internal-page">
              <section className="content-page">
                <h1>Página não encontrada</h1>
                <Link to="/">Voltar para candidatos</Link>
              </section>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}