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

type ResultadoImportacao = {
    nomeCompleto: string | null;
    email: string | null;
    telefone: string | null;
    avisos: string[];
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

    const [importando, setImportando] = useState(false);
    const [erroImportacao, setErroImportacao] = useState("");
    const [avisosImportacao, setAvisosImportacao] = useState<string[]>([]);
    const [nomeArquivo, setNomeArquivo] = useState("");

    const ocupado = salvando || importando;

    function atualizarCampo(
        campo: keyof CamposFormulario,
        valor: string,
    ) {
        setCampos((atual) => ({
            ...atual,
            [campo]: valor,
        }));
    }

    async function importarPdf(arquivo: File) {
        if (ocupado) return;

        setErroImportacao("");
        setAvisosImportacao([]);
        setNomeArquivo("");

        if (!arquivo.name.toLowerCase().endsWith(".pdf")) {
            setErroImportacao(
                "Selecione um arquivo PDF. Você também pode preencher manualmente.",
            );
            return;
        }

        if (arquivo.size === 0) {
            setErroImportacao("O arquivo está vazio. Selecione outro PDF.");
            return;
        }

        if (arquivo.size > 5 * 1024 * 1024) {
            setErroImportacao("O PDF deve ter no máximo 5 MB.");
            return;
        }

        const formulario = new FormData();
        formulario.append("Arquivo", arquivo);

        setNomeArquivo(arquivo.name);
        setImportando(true);

        try {
            const resposta = await api.post<ResultadoImportacao>(
                "/api/curriculos/importar",
                formulario,
                { timeout: 30000 },
            );

            const resultado = resposta.data;

            const camposMantidos = Boolean(
                (campos.nomeCompleto.trim() && resultado.nomeCompleto) ||
                (campos.email.trim() && resultado.email) ||
                (campos.telefone.trim() && resultado.telefone),
            );

            setCampos((atual) => ({
                ...atual,
                nomeCompleto: atual.nomeCompleto.trim()
                    ? atual.nomeCompleto
                    : resultado.nomeCompleto ?? "",
                email: atual.email.trim()
                    ? atual.email
                    : resultado.email ?? "",
                telefone: atual.telefone.trim()
                    ? atual.telefone
                    : resultado.telefone ?? "",
            }));

            setAvisosImportacao([
                ...resultado.avisos,
                ...(camposMantidos
                    ? ["Os campos já preenchidos foram mantidos."]
                    : []),
            ]);
        } catch (error) {
            if (axios.isAxiosError<{ message?: string }>(error)) {
                setErroImportacao(
                    error.response?.status === 413
                        ? "O arquivo excede o limite permitido. Envie um PDF de até 5 MB."
                        : error.response?.data.message ??
                        "Não foi possível importar o PDF. Continue preenchendo manualmente.",
                );
            } else {
                setErroImportacao(
                    "Não foi possível importar o PDF. Continue preenchendo manualmente.",
                );
            }
        } finally {
            setImportando(false);
        }
    }

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (ocupado) return;

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
                aria-labelledby="titulo-cadastro"
            >
                <header className="candidate-registration__header">
                    <div className="candidate-registration__intro">
                        <span className="candidate-registration__eyebrow">
                            Cadastro
                        </span>

                        <h1 id="titulo-cadastro">Novo candidato</h1>

                        <p>
                            Preencha os dados abaixo. Os campos com{" "}
                            <span aria-hidden="true">*</span> são obrigatórios.
                        </p>
                    </div>

                    <img
                        className="registration-illustration"
                        src="/images/caneta-cadastro.png"
                        alt=""
                    />
                </header>

                <section
                    className="resume-import"
                    aria-labelledby="titulo-importacao"
                    aria-busy={importando}
                >
                    <div className="resume-import__intro">
                        <div className="resume-import__icon" aria-hidden="true">
                            <svg viewBox="0 0 48 48" fill="none">
                                <path
                                    d="M13 5H28L37 14V40C37 42 35 43 33 43H13C11 43 10 42 10 40V9C10 7 11 5 13 5Z"
                                    fill="#fff7ed"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M27 5V15H37"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinejoin="round"
                                />
                                <text
                                    x="23.5"
                                    y="32"
                                    textAnchor="middle"
                                    fill="currentColor"
                                    fontFamily="Arial, sans-serif"
                                    fontSize="11"
                                    fontWeight="700"
                                >
                                    PDF
                                </text>
                            </svg>
                        </div>

                        <div className="resume-import__copy">
                            <div className="resume-import__heading">
                                <h2 id="titulo-importacao">Importar currículo</h2>
                                <span className="resume-import__badge">Opcional</span>
                            </div>

                            <p>
                                Preencha os dados com seu PDF ou continue manualmente.
                            </p>
                        </div>
                    </div>

                    <div className="resume-import__control">
                        <div className="resume-import__picker">
                            <input
                                id="curriculoPdf"
                                className="resume-import__input"
                                type="file"
                                accept=".pdf,application/pdf"
                                disabled={ocupado}
                                aria-describedby="orientacao-pdf arquivo-pdf"
                                onChange={(event) => {
                                    const arquivo = event.currentTarget.files?.[0];
                                    event.currentTarget.value = "";

                                    if (arquivo) {
                                        void importarPdf(arquivo);
                                    }
                                }}
                            />

                            <label
                                htmlFor="curriculoPdf"
                                className="resume-import__button"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M12 16V4M7 9L12 4L17 9M4 16V19C4 19.55 4.45 20 5 20H19C19.55 20 20 19.55 20 19V16"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>

                                {importando ? "Lendo PDF..." : "Selecionar PDF"}
                            </label>
                        </div>

                        <span
                            id="orientacao-pdf"
                            className="resume-import__hint"
                        >
                            PDF de até 5 MB
                        </span>

                        <span
                            id="arquivo-pdf"
                            className={
                                nomeArquivo
                                    ? "resume-import__filename"
                                    : "candidate-registration__sr-only"
                            }
                            title={nomeArquivo || undefined}
                        >
                            {nomeArquivo || "Nenhum currículo selecionado"}
                        </span>
                    </div>

                    {importando && (
                        <p className="resume-import__status" role="status">
                            Identificando informações do currículo...
                        </p>
                    )}

                    {erroImportacao && (
                        <p
                            className="candidate-registration__error"
                            role="alert"
                        >
                            {erroImportacao}
                        </p>
                    )}

                    {avisosImportacao.length > 0 && (
                        <div className="resume-import__feedback" role="status">
                            <ul>
                                {avisosImportacao.map((aviso, indice) => (
                                    <li key={`${indice}-${aviso}`}>{aviso}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>

                <form
                    className="candidate-registration__form"
                    onSubmit={salvar}
                    aria-busy={ocupado}
                >
                    <fieldset
                        className="candidate-registration__fieldset"
                        disabled={ocupado}
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
                                            Nome completo <span aria-hidden="true">*</span>
                                        </label>

                                        <input
                                            id="nomeCompleto"
                                            name="nomeCompleto"
                                            type="text"
                                            autoComplete="name"
                                            placeholder="Ex.: Ana Souza"
                                            value={campos.nomeCompleto}
                                            onChange={(event) =>
                                                atualizarCampo("nomeCompleto", event.target.value)
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
                                                atualizarCampo("telefone", event.target.value)
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
                                                atualizarCampo("areaInteresse", event.target.value)
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
                                        atualizarCampo("resumoProfissional", event.target.value)
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
                        <div className="candidate-registration__error" role="alert">
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
                                disabled={ocupado}
                            >
                                {salvando
                                    ? "Salvando..."
                                    : importando
                                        ? "Lendo PDF..."
                                        : "Salvar candidato"}
                            </button>
                        </div>
                    </footer>
                </form>
            </section>
        </main>
    );
}