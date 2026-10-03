using CadastroCurriculos.API.Data;
using CadastroCurriculos.API.DTOs;
using CadastroCurriculos.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CadastroCurriculos.API.Controllers;

[ApiController]
[Route("api/candidatos")]
public class CandidatosController : ControllerBase
{
    private readonly AppDbContext _context;

    public CandidatosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult<Candidato>> Criar(
        CriarCandidatoRequest request,
        CancellationToken cancellationToken)
    {
        var candidato = new Candidato
        {
            NomeCompleto = request.NomeCompleto.Trim(),
            Email = request.Email.Trim(),
            Telefone = NormalizarOpcional(request.Telefone),
            AreaInteresse = NormalizarOpcional(request.AreaInteresse),
            ResumoProfissional = NormalizarOpcional(
                request.ResumoProfissional)
        };

        _context.Candidatos.Add(candidato);

        await _context.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(
            nameof(ObterPorId),
            new { id = candidato.Id },
            candidato);
    }

    [HttpGet]
    public async Task<ActionResult> Listar(
        CancellationToken cancellationToken)
    {
        var candidatos = await _context.Candidatos
            .AsNoTracking()
            .OrderByDescending(c => c.CriadoEm)
            .ThenByDescending(c => c.Id)
            .Select(c => new
            {
                c.Id,
                c.NomeCompleto,
                c.Email,
                c.Telefone,
                c.AreaInteresse,
                c.CriadoEm
            })
            .ToListAsync(cancellationToken);

        return Ok(candidatos);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Candidato>> ObterPorId(
        int id,
        CancellationToken cancellationToken)
    {
        var candidato = await _context.Candidatos
            .AsNoTracking()
            .FirstOrDefaultAsync(
                c => c.Id == id,
                cancellationToken);

        if (candidato is null)
        {
            return NotFound(new
            {
                mensagem = "Candidato não encontrado."
            });
        }

        return Ok(candidato);
    }

    private static string? NormalizarOpcional(string? valor)
    {
        return string.IsNullOrWhiteSpace(valor)
            ? null
            : valor.Trim();
    }
}