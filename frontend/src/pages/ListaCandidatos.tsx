import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import type { CandidatoResumo } from "../types/candidato";

function obterIniciais(nome: string) {
    return nome
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join("")
        .toUpperCase();
}

export default function ListaCandidatos() {
    const [candidatos, setCandidatos] = useState<CandidatoResumo[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function carregarCandidatos() {
            setCarregando(true);
            setErro("");

            try {
                const resposta = await api.get<CandidatoResumo[]>(
                    "/api/candidatos",
                    { signal: controller.signal },
                );

                if (!controller.signal.aborted) {
                    setCandidatos(resposta.data);
                }
            } catch {
                if (!controller.signal.aborted) {
                    setErro(
                        "Não foi possível carregar os candidatos. Tente novamente.",
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setCarregando(false);
                }
            }
        }

        void carregarCandidatos();

        return () => controller.abort();
    }, [tentativa]);

    return (
        <section id="candidatos" className="candidates-section">
            <div className="section-heading">
                <h1>Candidatos</h1>
                <p>Conheça os talentos cadastrados.</p>
            </div>

            {carregando && (
                <p className="feedback" role="status">
                    Carregando candidatos...
                </p>
            )}

            {!carregando && erro && (
                <div className="feedback" role="alert">
                    <p>{erro}</p>
                    <button
                        className="button button-secondary"
                        onClick={() => setTentativa((valor) => valor + 1)}
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            {!carregando && !erro && candidatos.length === 0 && (
                <div className="feedback">
                    <p>Nenhum candidato cadastrado.</p>
                    <Link className="button button-secondary" to="/candidatos/novo">
                        Cadastrar primeiro candidato
                    </Link>
                </div>
            )}

            {!carregando && !erro && candidatos.length > 0 && (
                <ul className="candidate-grid">
                    {candidatos.map((candidato) => (
                        <li key={candidato.id} className="candidate-card">
                            <div className="browser-bar" aria-hidden="true">
                                <span />
                                <span />
                                <span />
                            </div>

                            <div className="candidate-body">
                                <div className="avatar" aria-hidden="true">
                                    {obterIniciais(candidato.nomeCompleto)}
                                </div>

                                <h2>{candidato.nomeCompleto}</h2>

                                <p className="candidate-role">
                                    {candidato.areaInteresse || "Área não informada"}
                                </p>

                                <p className="candidate-email">{candidato.email}</p>

                                <div className="card-decoration" aria-hidden="true" />
                            </div>

                            <div className="candidate-footer">
                                <Link
                                    className="button button-details"
                                    to={`/candidatos/${candidato.id}`}
                                >
                                    Ver detalhes
                                    <span className="sr-only">
                                        {" "}de {candidato.nomeCompleto}
                                    </span>
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}