using CadastroCurriculos.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CadastroCurriculos.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Candidato> Candidatos => Set<Candidato>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var candidato = modelBuilder.Entity<Candidato>();

        candidato.ToTable("Candidatos");

        candidato.HasKey(c => c.Id);

        candidato.Property(c => c.NomeCompleto)
            .IsRequired()
            .HasMaxLength(200);

        candidato.Property(c => c.Email)
            .IsRequired()
            .HasMaxLength(254);

        candidato.Property(c => c.Telefone)
            .HasMaxLength(30);

        candidato.Property(c => c.AreaInteresse)
            .HasMaxLength(150);

        candidato.Property(c => c.ResumoProfissional)
            .HasMaxLength(4000);

        candidato.Property(c => c.CriadoEm)
            .IsRequired();
    }
}