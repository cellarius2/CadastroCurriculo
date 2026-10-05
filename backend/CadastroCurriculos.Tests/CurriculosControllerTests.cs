using System.Text;
using CadastroCurriculos.API.Controllers;
using CadastroCurriculos.API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace CadastroCurriculos.Tests;

public sealed class CurriculosControllerTests
{
    private static CurriculosController CriarController()
    {
        return new CurriculosController(
            new ExtracaoCurriculoService(),
            NullLogger<CurriculosController>.Instance
        );
    }

    private static FormFile CriarArquivo(
        byte[] conteudo,
        string nome = "curriculo.pdf",
        string tipo = "application/pdf")
    {
        return new FormFile(
            new MemoryStream(conteudo),
            0,
            conteudo.Length,
            "Arquivo",
            nome
        )
        {
            Headers = new HeaderDictionary(),
            ContentType = tipo
        };
    }

    private static void ValidarMensagem(
        object? resposta,
        string mensagemEsperada)
    {
        Assert.NotNull(resposta);

        var propriedade = resposta.GetType().GetProperty("message");
        Assert.NotNull(propriedade);

        var mensagem = Assert.IsType<string>(
            propriedade.GetValue(resposta)
        );

        Assert.Equal(mensagemEsperada, mensagem);
    }

    [Fact]
    public async Task Importar_SemArquivo_RetornaMensagemParaCadastroManual()
    {
        var controller = CriarController();

        var resultado = await controller.Importar(
            new ImportarCurriculoRequest(),
            CancellationToken.None
        );

        var resposta = Assert.IsType<BadRequestObjectResult>(resultado);

        ValidarMensagem(
            resposta.Value,
            "Selecione um PDF ou continue preenchendo manualmente."
        );
    }

    [Fact]
    public async Task Importar_ArquivoVazio_RetornaErro()
    {
        var controller = CriarController();

        var resultado = await controller.Importar(
            new ImportarCurriculoRequest
            {
                Arquivo = CriarArquivo(Array.Empty<byte>())
            },
            CancellationToken.None
        );

        var resposta = Assert.IsType<BadRequestObjectResult>(resultado);

        ValidarMensagem(
            resposta.Value,
            "Selecione um PDF ou continue preenchendo manualmente."
        );
    }

    [Fact]
    public async Task Importar_AcimaDeCincoMb_RetornaErroDeTamanho()
    {
        var controller = CriarController();
        var conteudo = new byte[5 * 1024 * 1024 + 1];

        var resultado = await controller.Importar(
            new ImportarCurriculoRequest
            {
                Arquivo = CriarArquivo(conteudo)
            },
            CancellationToken.None
        );

        var resposta = Assert.IsType<BadRequestObjectResult>(resultado);

        ValidarMensagem(
            resposta.Value,
            "O PDF deve ter no máximo 5 MB."
        );
    }

    [Fact]
    public async Task Importar_ExtensaoInvalida_RetornaErro()
    {
        var controller = CriarController();

        var resultado = await controller.Importar(
            new ImportarCurriculoRequest
            {
                Arquivo = CriarArquivo(
                    Encoding.ASCII.GetBytes("%PDF-1.7"),
                    nome: "curriculo.txt"
                )
            },
            CancellationToken.None
        );

        var resposta = Assert.IsType<BadRequestObjectResult>(resultado);

        ValidarMensagem(
            resposta.Value,
            "Arquivo inválido. Envie um arquivo com extensão .pdf."
        );
    }

    [Fact]
    public async Task Importar_TipoInvalido_RetornaErro()
    {
        var controller = CriarController();

        var resultado = await controller.Importar(
            new ImportarCurriculoRequest
            {
                Arquivo = CriarArquivo(
                    Encoding.ASCII.GetBytes("%PDF-1.7"),
                    tipo: "text/plain"
                )
            },
            CancellationToken.None
        );

        var resposta = Assert.IsType<BadRequestObjectResult>(resultado);

        ValidarMensagem(
            resposta.Value,
            "Tipo de arquivo inválido. Envie um PDF."
        );
    }

    [Fact]
    public async Task Importar_TextoRenomeadoParaPdf_RetornaErroDeConteudo()
    {
        var controller = CriarController();

        var resultado = await controller.Importar(
            new ImportarCurriculoRequest
            {
                Arquivo = CriarArquivo(
                    Encoding.UTF8.GetBytes("Este arquivo não é um PDF.")
                )
            },
            CancellationToken.None
        );

        var resposta = Assert.IsType<BadRequestObjectResult>(resultado);

        ValidarMensagem(
            resposta.Value,
            "O conteúdo do arquivo não corresponde a um PDF válido."
        );
    }

    [Fact]
    public async Task Importar_PdfDanificado_PermiteOrientacaoManual()
    {
        var controller = CriarController();

        var resultado = await controller.Importar(
            new ImportarCurriculoRequest
            {
                Arquivo = CriarArquivo(
                    Encoding.ASCII.GetBytes(
                        "%PDF-1.7\nDocumento incompleto e danificado."
                    )
                )
            },
            CancellationToken.None
        );

        var resposta =
            Assert.IsType<UnprocessableEntityObjectResult>(resultado);

        ValidarMensagem(
            resposta.Value,
            "Não foi possível ler o PDF. Ele pode estar " +
            "danificado ou protegido por senha. " +
            "Você pode continuar o cadastro manualmente."
        );
    }
}