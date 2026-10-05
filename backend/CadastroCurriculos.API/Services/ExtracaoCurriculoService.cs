using System.Text;
using System.Text.RegularExpressions;
using UglyToad.PdfPig;
using UglyToad.PdfPig.DocumentLayoutAnalysis.TextExtractor;

namespace CadastroCurriculos.API.Services;

public sealed record ResultadoExtracaoCurriculo(
    string? NomeCompleto,
    string? Email,
    string? Telefone,
    string[] Avisos
);

public sealed class ExtracaoCurriculoService
{
    private static readonly TimeSpan RegexTimeout =
        TimeSpan.FromSeconds(1);

    public ResultadoExtracaoCurriculo Extrair(byte[] arquivo)
    {
        using var documento = PdfDocument.Open(arquivo);

        var texto = new StringBuilder();

        foreach (var pagina in documento.GetPages())
        {
            texto.AppendLine(ContentOrderTextExtractor.GetText(pagina));
        }

        var conteudo = texto.ToString();

        if (string.IsNullOrWhiteSpace(conteudo))
        {
            return new ResultadoExtracaoCurriculo(
                null,
                null,
                null,
                [
                    "Não foi encontrado texto no PDF. " +
                    "Se o currículo for uma imagem digitalizada, " +
                    "preencha os dados manualmente."
                ]
            );
        }

        var email = EncontrarEmail(conteudo);
        var telefone = EncontrarTelefone(conteudo);
        var nome = EncontrarNome(conteudo);

        var avisos = new List<string>();

        if (nome is null)
            avisos.Add("Nome não identificado. Preencha manualmente.");

        if (email is null)
            avisos.Add("E-mail não identificado. Preencha manualmente.");

        if (telefone is null)
            avisos.Add("Telefone não identificado. Preencha manualmente.");

        avisos.Add(
            "Revise os dados identificados antes de salvar o cadastro."
        );

        return new ResultadoExtracaoCurriculo(
            nome,
            email,
            telefone,
            avisos.ToArray()
        );
    }

    private static string? EncontrarEmail(string texto)
    {
        var resultado = Regex.Match(
            texto,
            @"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b",
            RegexOptions.IgnoreCase,
            RegexTimeout
        );

        return resultado.Success && resultado.Value.Length <= 254
            ? resultado.Value
            : null;
    }

    private static string? EncontrarTelefone(string texto)
    {
        // Telefone brasileiro: DDD + 8 ou 9 dígitos,
        // com código do país opcional.
        var resultado = Regex.Match(
            texto,
            @"(?<!\d)(?:\+?55[\s.-]*)?\(?[1-9]\d\)?[\s.-]*(?:9[\s.-]*)?\d{4}[\s.-]*\d{4}(?!\d)",
            RegexOptions.None,
            RegexTimeout
        );

        if (!resultado.Success)
            return null;

        var telefone = Regex.Replace(
            resultado.Value,
            @"\s+",
            " ",
            RegexOptions.None,
            RegexTimeout
        ).Trim();

        return telefone.Length <= 30 ? telefone : null;
    }

    private static string? EncontrarNome(string texto)
    {
        var linhas = texto
            .Split(
                ['\r', '\n'],
                StringSplitOptions.RemoveEmptyEntries
            )
            .Select(linha => Regex.Replace(
                linha.Trim(),
                @"\s+",
                " ",
                RegexOptions.None,
                RegexTimeout
            ))
            .Where(linha => !string.IsNullOrWhiteSpace(linha))
            .Take(12);

        // Primeiro tenta uma linha explicitamente marcada com "Nome:".
        foreach (var linha in linhas)
        {
            var resultado = Regex.Match(
                linha,
                @"^nome(?:\s+completo)?\s*:\s*(.+)$",
                RegexOptions.IgnoreCase,
                RegexTimeout
            );

            if (resultado.Success)
            {
                var nome = resultado.Groups[1].Value.Trim();

                if (PareceNome(nome))
                    return nome;
            }
        }

        // Depois tenta encontrar um nome nas primeiras linhas.
        foreach (var linha in linhas)
        {
            if (PareceNome(linha))
                return linha;
        }

        return null;
    }

    private static bool PareceNome(string texto)
    {
        if (texto.Length is < 5 or > 200)
            return false;

        if (!Regex.IsMatch(
            texto,
            @"^[\p{L}\p{M}][\p{L}\p{M}'’ -]+$",
            RegexOptions.None,
            RegexTimeout
        ))
        {
            return false;
        }

        var palavras = texto.Split(
            ' ',
            StringSplitOptions.RemoveEmptyEntries
        );

        if (palavras.Length is < 2 or > 8)
            return false;

        string[] termosDescartados =
        [
            "currículo", "curriculo", "curriculum", "vitae",
            "resumo", "objetivo", "experiência", "experiencia",
            "formação", "formacao", "habilidades", "competências",
            "competencias", "contato", "dados", "profissional",
            "desenvolvedor", "desenvolvedora", "analista",
            "assistente", "estudante", "engenheiro", "engenheira"
        ];

        return !palavras.Any(palavra =>
            termosDescartados.Contains(
                palavra,
                StringComparer.OrdinalIgnoreCase
            )
        );
    }
}