using CadastroCurriculos.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace CadastroCurriculos.API.Controllers;

public sealed class ImportarCurriculoRequest
{
    public IFormFile? Arquivo { get; set; }
}

[ApiController]
[Route("api/curriculos")]
public sealed class CurriculosController : ControllerBase
{
    private const long TamanhoMaximo = 5 * 1024 * 1024;

    private readonly ExtracaoCurriculoService _extracao;
    private readonly ILogger<CurriculosController> _logger;

    public CurriculosController(
        ExtracaoCurriculoService extracao,
        ILogger<CurriculosController> logger)
    {
        _extracao = extracao;
        _logger = logger;
    }

    [HttpPost("importar")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(TamanhoMaximo + 1024 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = TamanhoMaximo + 1024 * 1024)]
    public async Task<IActionResult> Importar(
        [FromForm] ImportarCurriculoRequest request,
        CancellationToken cancellationToken)
    {
        var arquivo = request.Arquivo;

        if (arquivo is null || arquivo.Length == 0)
        {
            return BadRequest(new
            {
                message = "Selecione um PDF ou continue preenchendo manualmente."
            });
        }

        if (arquivo.Length > TamanhoMaximo)
        {
            return BadRequest(new
            {
                message = "O PDF deve ter no máximo 5 MB."
            });
        }

        if (!string.Equals(
            Path.GetExtension(arquivo.FileName),
            ".pdf",
            StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message = "Arquivo inválido. Envie um arquivo com extensão .pdf."
            });
        }

        if (!string.Equals(
            arquivo.ContentType,
            "application/pdf",
            StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message = "Tipo de arquivo inválido. Envie um PDF."
            });
        }

        using var memoria = new MemoryStream();
        await arquivo.CopyToAsync(memoria, cancellationToken);

        var bytes = memoria.ToArray();

        // Confere a assinatura inicial "%PDF-".
        // A biblioteca também verificará a estrutura durante a leitura.
        if (bytes.Length < 5 ||
            bytes[0] != '%' ||
            bytes[1] != 'P' ||
            bytes[2] != 'D' ||
            bytes[3] != 'F' ||
            bytes[4] != '-')
        {
            return BadRequest(new
            {
                message = "O conteúdo do arquivo não corresponde a um PDF válido."
            });
        }

        try
        {
            var resultado = _extracao.Extrair(bytes);

            return Ok(resultado);
        }
        catch (Exception exception) when (
            exception is not OperationCanceledException)
        {
            _logger.LogWarning(
                exception,
                "Falha ao extrair informações do currículo em PDF."
            );

            return UnprocessableEntity(new
            {
                message =
                    "Não foi possível ler o PDF. Ele pode estar " +
                    "danificado ou protegido por senha. " +
                    "Você pode continuar o cadastro manualmente."
            });
        }
    }
}