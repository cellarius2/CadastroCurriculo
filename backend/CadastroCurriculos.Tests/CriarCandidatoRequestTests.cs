using System.ComponentModel.DataAnnotations;
using CadastroCurriculos.API.DTOs;
using Xunit;

namespace CadastroCurriculos.Tests;

public sealed class CriarCandidatoRequestTests
{
    [Fact]
    public void CadastroManual_ApenasCamposObrigatorios_EValido()
    {
        var cadastro = CriarCadastroValido();

        var erros = Validar(cadastro);

        Assert.Empty(erros);
    }

    [Fact]
    public void Cadastro_ComTodosOsCampos_EValido()
    {
        var cadastro = CriarCadastroValido();

        cadastro.Telefone = "(41) 99999-1234";
        cadastro.AreaInteresse = "Desenvolvimento de software";
        cadastro.ResumoProfissional =
            "Estudante de ADS com conhecimentos em React e C#.";

        var erros = Validar(cadastro);

        Assert.Empty(erros);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("   ")]
    public void NomeCompleto_VazioOuComEspacos_EInvalido(string nome)
    {
        var cadastro = CriarCadastroValido();
        cadastro.NomeCompleto = nome;

        var erros = Validar(cadastro);

        Assert.Contains(erros, erro =>
            erro.MemberNames.Contains(nameof(cadastro.NomeCompleto)) &&
            erro.ErrorMessage == "Informe o nome completo.");
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("   ")]
    public void Email_VazioOuComEspacos_EInvalido(string email)
    {
        var cadastro = CriarCadastroValido();
        cadastro.Email = email;

        var erros = Validar(cadastro);

        Assert.Contains(erros, erro =>
            erro.MemberNames.Contains(nameof(cadastro.Email)) &&
            erro.ErrorMessage == "Informe o e-mail.");
    }

    [Theory]
    [InlineData("email-invalido")]
    [InlineData("candidato.example.com")]
    [InlineData("@example.com")]
    [InlineData("candidato@")]
    [InlineData("candidato@@example.com")]
    public void Email_ComFormatoInvalido_ERejeitado(string email)
    {
        var cadastro = CriarCadastroValido();
        cadastro.Email = email;

        var erros = Validar(cadastro);

        Assert.Contains(erros, erro =>
            erro.MemberNames.Contains(nameof(cadastro.Email)) &&
            erro.ErrorMessage == "Informe um e-mail válido.");
    }

    [Theory]
    [InlineData("NomeCompleto", 200)]
    [InlineData("Email", 254)]
    [InlineData("Telefone", 30)]
    [InlineData("AreaInteresse", 150)]
    [InlineData("ResumoProfissional", 4000)]
    public void Campo_NoLimiteDeCaracteres_EValido(
        string campo,
        int limite)
    {
        var cadastro = CriarCadastroValido();
        DefinirCampo(cadastro, campo, CriarValor(campo, limite));

        var erros = Validar(cadastro);

        Assert.Empty(erros);
    }

    [Theory]
    [InlineData("NomeCompleto", 200)]
    [InlineData("Email", 254)]
    [InlineData("Telefone", 30)]
    [InlineData("AreaInteresse", 150)]
    [InlineData("ResumoProfissional", 4000)]
    public void Campo_AcimaDoLimite_ERejeitado(
        string campo,
        int limite)
    {
        var cadastro = CriarCadastroValido();
        DefinirCampo(cadastro, campo, CriarValor(campo, limite + 1));

        var erros = Validar(cadastro);

        Assert.Contains(erros, erro =>
            erro.MemberNames.Contains(campo) &&
            erro.ErrorMessage == MensagemDeLimite(campo));
    }

    private static CriarCandidatoRequest CriarCadastroValido()
    {
        return new CriarCandidatoRequest
        {
            NomeCompleto = "Mariana Oliveira",
            Email = "mariana@example.com"
        };
    }

    private static List<ValidationResult> Validar(
        CriarCandidatoRequest cadastro)
    {
        var resultados = new List<ValidationResult>();

        Validator.TryValidateObject(
            cadastro,
            new ValidationContext(cadastro),
            resultados,
            validateAllProperties: true
        );

        return resultados;
    }

    private static string CriarValor(string campo, int tamanho)
    {
        // Mantém o formato do e-mail válido para testar
        // especificamente a regra de comprimento.
        if (campo == nameof(CriarCandidatoRequest.Email))
        {
            const string sufixo = "@example.com";

            return new string('a', tamanho - sufixo.Length) + sufixo;
        }

        return new string('a', tamanho);
    }

    private static void DefinirCampo(
        CriarCandidatoRequest cadastro,
        string campo,
        string valor)
    {
        switch (campo)
        {
            case nameof(CriarCandidatoRequest.NomeCompleto):
                cadastro.NomeCompleto = valor;
                break;

            case nameof(CriarCandidatoRequest.Email):
                cadastro.Email = valor;
                break;

            case nameof(CriarCandidatoRequest.Telefone):
                cadastro.Telefone = valor;
                break;

            case nameof(CriarCandidatoRequest.AreaInteresse):
                cadastro.AreaInteresse = valor;
                break;

            case nameof(CriarCandidatoRequest.ResumoProfissional):
                cadastro.ResumoProfissional = valor;
                break;

            default:
                throw new ArgumentException(
                    $"Campo desconhecido: {campo}",
                    nameof(campo)
                );
        }
    }

    private static string MensagemDeLimite(string campo)
    {
        return campo switch
        {
            nameof(CriarCandidatoRequest.NomeCompleto) =>
                "O nome completo deve ter até 200 caracteres.",

            nameof(CriarCandidatoRequest.Email) =>
                "O e-mail deve ter até 254 caracteres.",

            nameof(CriarCandidatoRequest.Telefone) =>
                "O telefone deve ter até 30 caracteres.",

            nameof(CriarCandidatoRequest.AreaInteresse) =>
                "A área ou cargo de interesse deve ter até 150 caracteres.",

            nameof(CriarCandidatoRequest.ResumoProfissional) =>
                "O resumo profissional deve ter até 4000 caracteres.",

            _ => throw new ArgumentException(
                $"Campo desconhecido: {campo}",
                nameof(campo)
            )
        };
    }
}