import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { api } from "../services/api";
import type {
    Candidato,
    CriarCandidatoRequest,
} from "../types/candidato";

type CamposFormulario = {
    nomeCompleto: string;
    email: string;
    telefone: string;
    areaInteresse: string;
    resumoProfissional: string;
};

type ErroValidacao = {
    message?: string;
    errors?: Record<string, string[]>;
};

const camposIniciais: CamposFormulario = {
    nomeCompleto: "",
    email: "",
    telefone: "",
    areaInteresse: "",
    resumoProfissional: "",
};

export default function NovoCandidato() {
    const navigate = useNavigate();

    const [campos, setCampos] = useState<CamposFormulario>(camposIniciais);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    function atualizarCampo(
        campo: keyof CamposFormulario,
        valor: string,
    ) {
        setCampos((atual) => ({
            ...atual,
            [campo]: valor,
        }));
    }

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (salvando) return;

        setErro("");

        const dados: CriarCandidatoRequest = {
            nomeCompleto: campos.nomeCompleto.trim(),
            email: campos.email.trim(),
            telefone: campos.telefone.trim(),
            areaInteresse: campos.areaInteresse.trim(),
            resumoProfissional: campos.resumoProfissional.trim(),
        };

        if (!dados.nomeCompleto || !dados.email) {
            setErro("Preencha o nome completo e o e-mail.");
            return;
        }

        setSalvando(true);

        try {
            const resposta = await api.post<Candidato>(
                "/api/candidatos",
                dados,
            );

            navigate(`/candidatos/${resposta.data.id}`, {
                replace: true,
                state: { cadastroSalvo: true },
            });
        } catch (error) {
            if (axios.isAxiosError<ErroValidacao>(error)) {
                const errosValidacao = error.response?.data.errors;

                if (error.response?.status === 400 && errosValidacao) {
                    setErro(Object.values(errosValidacao).flat().join(" "));
                } else {
                    setErro(
                        error.response?.data.message ??
                        "Não foi possível confirmar o cadastro. Confira a listagem antes de tentar novamente.",
                    );
                }
            } else {
                setErro("Ocorreu um erro ao salvar o cadastro. Tente novamente.");
            }
        } finally {
            setSalvando(false);
        }
    }

    return (
        <main className="candidate-registration">
            <nav
                className="candidate-registration__navigation"
                aria-label="Navegação do cadastro"
            >
                <Link
                    to="/#candidatos"
                    className="candidate-registration__back"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                    >
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
                aria-labelledby="titulo-cadastro"
            >
                <header className="candidate-registration__header">
                    <div className="candidate-registration__intro">
                        <span className="candidate-registration__eyebrow">
                            Cadastro
                        </span>

                        <h1 id="titulo-cadastro">Novo candidato</h1>

                        <p>
                            Preencha os dados abaixo.
                        </p>
                    </div>

                    <img
                        className="registration-illustration"
                        src="/images/caneta-cadastro.png"
                        alt=""
                    />
                    
                </header>

                <form
                    className="candidate-registration__form"
                    onSubmit={salvar}
                    aria-busy={salvando}
                >
                    <fieldset
                        className="candidate-registration__fieldset"
                        disabled={salvando}
                    >
                        <legend className="candidate-registration__sr-only">
                            Informações do candidato
                        </legend>

                        <div className="candidate-registration__columns">
                            <section
                                className="candidate-registration__personal"
                                aria-labelledby="titulo-dados-pessoais"
                            >
                                <h2 id="titulo-dados-pessoais">Dados pessoais</h2>

                                <div className="candidate-registration__fields">
                                    <div className="candidate-registration__field candidate-registration__field--wide">
                                        <label htmlFor="nomeCompleto">
                                            Nome completo{" "}
                                            <span aria-hidden="true">*</span>
                                        </label>

                                        <input
                                            id="nomeCompleto"
                                            name="nomeCompleto"
                                            type="text"
                                            autoComplete="name"
                                            placeholder="Ex.: Ana Souza"
                                            value={campos.nomeCompleto}
                                            onChange={(event) =>
                                                atualizarCampo(
                                                    "nomeCompleto",
                                                    event.target.value,
                                                )
                                            }
                                            maxLength={200}
                                            required
                                        />
                                    </div>

                                    <div className="candidate-registration__field">
                                        <label htmlFor="email">
                                            E-mail <span aria-hidden="true">*</span>
                                        </label>

                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="ana@email.com"
                                            value={campos.email}
                                            onChange={(event) =>
                                                atualizarCampo("email", event.target.value)
                                            }
                                            maxLength={254}
                                            required
                                        />
                                    </div>

                                    <div className="candidate-registration__field">
                                        <label htmlFor="telefone">Telefone</label>

                                        <input
                                            id="telefone"
                                            name="telefone"
                                            type="tel"
                                            autoComplete="tel"
                                            placeholder="(41) 99999-9999"
                                            value={campos.telefone}
                                            onChange={(event) =>
                                                atualizarCampo(
                                                    "telefone",
                                                    event.target.value,
                                                )
                                            }
                                            maxLength={30}
                                        />
                                    </div>

                                    <div className="candidate-registration__field candidate-registration__field--wide">
                                        <label htmlFor="areaInteresse">
                                            Área ou cargo de interesse
                                        </label>

                                        <input
                                            id="areaInteresse"
                                            name="areaInteresse"
                                            type="text"
                                            placeholder="Ex.: Desenvolvimento de software"
                                            value={campos.areaInteresse}
                                            onChange={(event) =>
                                                atualizarCampo(
                                                    "areaInteresse",
                                                    event.target.value,
                                                )
                                            }
                                            maxLength={150}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section
                                className="candidate-registration__summary"
                                aria-labelledby="titulo-resumo"
                            >
                                <h2 id="titulo-resumo">
                                    <label htmlFor="resumoProfissional">
                                        Resumo profissional
                                    </label>
                                </h2>

                                <p className="candidate-registration__hint">
                                    Conte um pouco sobre suas experiências, habilidades
                                    e objetivos.
                                </p>

                                <textarea
                                    id="resumoProfissional"
                                    name="resumoProfissional"
                                    placeholder="Escreva seu resumo aqui..."
                                    value={campos.resumoProfissional}
                                    onChange={(event) =>
                                        atualizarCampo(
                                            "resumoProfissional",
                                            event.target.value,
                                        )
                                    }
                                    maxLength={4000}
                                    aria-describedby="contador-resumo"
                                />

                                <span
                                    id="contador-resumo"
                                    className="candidate-registration__counter"
                                >
                                    {campos.resumoProfissional.length}/4000 caracteres
                                </span>
                            </section>
                        </div>
                    </fieldset>

                    {erro && (
                        <div
                            className="candidate-registration__error"
                            role="alert"
                        >
                            {erro}
                        </div>
                    )}

                    <footer className="candidate-registration__actions">
                        <p className="candidate-registration__required-note">
                            <span aria-hidden="true">*</span> Campos obrigatórios
                        </p>

                        <div className="candidate-registration__buttons">
                            {!salvando && (
                                <Link
                                    to="/#candidatos"
                                    className="candidate-registration__cancel"
                                >
                                    Cancelar
                                </Link>
                            )}

                            <button
                                type="submit"
                                className="candidate-registration__save"
                                disabled={salvando}
                            >
                                {salvando ? "Salvando..." : "Salvar candidato"}
                            </button>
                        </div>
                    </footer>
                </form>
            </section>
        </main>
    );
}