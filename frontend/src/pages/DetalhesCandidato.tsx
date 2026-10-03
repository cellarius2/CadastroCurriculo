import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import axios from "axios";

import { api } from "../services/api";
import type { Candidato } from "../types/candidato";

export default function DetalhesCandidato() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();

    const [candidato, setCandidato] = useState<Candidato | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [tentativa, setTentativa] = useState(0);

    const cadastroSalvo = location.state?.cadastroSalvo === true;

    useEffect(() => {
        const controller = new AbortController();

        async function carregar() {
            setCarregando(true);
            setErro("");
            setCandidato(null);

            if (!id || !/^[1-9]\d*$/.test(id)) {
                setErro("Candidato não encontrado.");
                setCarregando(false);
                return;
            }

            try {
                const resposta = await api.get<Candidato>(
                    `/api/candidatos/${id}`,
                    { signal: controller.signal },
                );

                if (!controller.signal.aborted) {
                    setCandidato(resposta.data);
                }
            } catch (error) {
                if (controller.signal.aborted) return;

                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 404
                ) {
                    setErro("Candidato não encontrado.");
                } else {
                    setErro("Não foi possível carregar os dados. Tente novamente.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setCarregando(false);
                }
            }
        }

        void carregar();

        return () => controller.abort();
    }, [id, tentativa]);

    return (
        <main className="candidate-registration candidate-details">
            <nav
                className="candidate-registration__navigation"
                aria-label="Navegação do perfil"
            >
                <Link
                    to="/#candidatos"
                    className="candidate-registration__back"
                >
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                            d="M19 12H5M11 6L5 12L11 18"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>

                    Voltar para candidatos
                </Link>
            </nav>

            <section
                className="candidate-registration__panel"
                aria-labelledby="titulo-detalhes"
                aria-busy={carregando}
            >
                <header className="candidate-registration__header">
                    <div className="candidate-registration__intro">
                        <span className="candidate-registration__eyebrow">
                            Perfil do candidato
                        </span>

                        <h1 id="titulo-detalhes">Detalhes do candidato</h1>

                        <p>
                            Consulte os dados pessoais e as informações
                            profissionais cadastradas.
                        </p>
                    </div>

                    <div className="candidate-details__icon" aria-hidden="true">
                        <svg viewBox="0 0 80 80" fill="none">
                            <circle cx="40" cy="40" r="36" fill="#FFE4CC" />

                            <rect
                                x="23"
                                y="15"
                                width="35"
                                height="49"
                                rx="5"
                                fill="#FFFAF4"
                                stroke="#173E5C"
                                strokeWidth="2.5"
                            />

                            <circle
                                cx="40"
                                cy="29"
                                r="5"
                                fill="#FFBD83"
                                stroke="#173E5C"
                                strokeWidth="2"
                            />

                            <path
                                d="M32 42C32 37 48 37 48 42M31 50H50M31 56H44"
                                stroke="#173E5C"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                </header>

                {carregando && (
                    <p className="candidate-details__status" role="status">
                        Carregando informações do candidato...
                    </p>
                )}

                {!carregando && erro && (
                    <div className="candidate-details__status">
                        <p className="candidate-registration__error" role="alert">
                            {erro}
                        </p>

                        <button
                            type="button"
                            className="candidate-registration__save"
                            onClick={() => setTentativa((atual) => atual + 1)}
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}

                {!carregando && candidato && (
                    <>
                        {cadastroSalvo && (
                            <div className="candidate-details__success" role="status">
                                Cadastro salvo com sucesso!
                            </div>
                        )}

                        <div className="candidate-details__content">
                            <section aria-labelledby="titulo-informacoes">
                                <h2 id="titulo-informacoes">Dados pessoais</h2>

                                <dl className="candidate-details__grid">
                                    <div className="candidate-details__field candidate-details__field--wide">
                                        <dt>Nome completo</dt>
                                        <dd>{candidato.nomeCompleto}</dd>
                                    </div>

                                    <div className="candidate-details__field">
                                        <dt>E-mail</dt>
                                        <dd>{candidato.email}</dd>
                                    </div>

                                    <div className="candidate-details__field">
                                        <dt>Telefone</dt>
                                        <dd>{candidato.telefone || "Não informado"}</dd>
                                    </div>

                                    <div className="candidate-details__field candidate-details__field--wide">
                                        <dt>Área ou cargo de interesse</dt>
                                        <dd>
                                            {candidato.areaInteresse || "Não informado"}
                                        </dd>
                                    </div>
                                </dl>
                            </section>

                            <section
                                className="candidate-details__summary"
                                aria-labelledby="titulo-resumo-detalhes"
                            >
                                <h2 id="titulo-resumo-detalhes">
                                    Resumo profissional
                                </h2>

                                <div className="candidate-details__summary-text">
                                    {candidato.resumoProfissional ||
                                        "Nenhum resumo profissional informado."}
                                </div>
                            </section>
                        </div>

                        <footer className="candidate-registration__actions">
                            <p className="candidate-registration__required-note">
                                Informações do cadastro do candidato.
                            </p>

                            <Link
                                to="/#candidatos"
                                className="candidate-registration__cancel"
                            >
                                Voltar para listagem
                            </Link>
                        </footer>
                    </>
                )}
            </section>
        </main>
    );
}