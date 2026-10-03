using System.ComponentModel.DataAnnotations;

namespace CadastroCurriculos.API.DTOs;

public class CriarCandidatoRequest
{
    [Required(ErrorMessage = "Informe o nome completo.")]
    [StringLength(200,
        ErrorMessage = "O nome completo deve ter até 200 caracteres.")]
    public string NomeCompleto { get; set; } = string.Empty;

    [Required(ErrorMessage = "Informe o e-mail.")]
    [EmailAddress(ErrorMessage = "Informe um e-mail válido.")]
    [StringLength(254,
        ErrorMessage = "O e-mail deve ter até 254 caracteres.")]
    public string Email { get; set; } = string.Empty;

    [StringLength(30,
        ErrorMessage = "O telefone deve ter até 30 caracteres.")]
    public string? Telefone { get; set; }

    [StringLength(150,
        ErrorMessage = "A área ou cargo de interesse deve ter até 150 caracteres.")]
    public string? AreaInteresse { get; set; }

    [StringLength(4000,
        ErrorMessage = "O resumo profissional deve ter até 4000 caracteres.")]
    public string? ResumoProfissional { get; set; }
}