using MicroServiceDotNet.Data;
using MicroServiceDotNet.Models;
using MicroServiceDotNet.Services;
using MicroServiceDotNet.ViewModels;
using Microsoft.EntityFrameworkCore;

public class ProfileService : IProfileService
{
    private readonly AppDbContext _context;

    public ProfileService(AppDbContext context)
    {
        _context = context;
    }

    public object GetMyProfile(int userId)
    {
        var user = _context.Users
            .Include(u => u.Apprenant)
            .Include(u => u.Enseignant)
            .FirstOrDefault(u => u.id == userId);

        if (user == null)
            throw new Exception("Utilisateur introuvable");

        if (user.role == "APPRENANT" && user.Apprenant != null)
        {
            return new
            {
                user.id,
                user.email,
                user.nom,
                user.prenom,
                user.role,
                user.telephone,
                user.est_actif,
                user.est_valide,
                details = new
                {
                    user.Apprenant.niveau_scolaire,
                    user.Apprenant.date_inscription,
                    user.Apprenant.statut,
                    user.Apprenant.score
                }
            };
        }

        if (user.role == "ENSEIGNANT" && user.Enseignant != null)
        {
            return new
            {
                user.id,
                user.email,
                user.nom,
                user.prenom,
                user.role,
                user.telephone,
                user.est_actif,
                user.est_valide,
                details = new
                {
                    user.Enseignant.specialite,
                    user.Enseignant.date_embauche
                }
            };
        }

        return new
        {
            user.id,
            user.email,
            user.nom,
            user.prenom,
            user.role,
            user.telephone,
            user.est_actif,
            user.est_valide
        };
    }

    public object UpdateUser(int userId, UpdateProfileUserVM dto)
    {
        var user = _context.Users
            .Include(u => u.Apprenant)
            .Include(u => u.Enseignant)
            .FirstOrDefault(u => u.id == userId);

        if (user == null)
            throw new Exception("Utilisateur introuvable");

        // Mise à jour des champs standards
        if (dto.email != null) user.email = dto.email;
        if (dto.mot_de_passe != null) user.mot_de_passe = dto.mot_de_passe;
        if (dto.telephone != null) user.telephone = dto.telephone;
        if (dto.nom != null) user.nom = dto.nom;
        if (dto.prenom != null) user.prenom = dto.prenom;

        // Mise à jour détails spécifiques
        if (user.role == "APPRENANT" && user.Apprenant != null)
        {
            if (dto.niveau_scolaire != null) user.Apprenant.niveau_scolaire = dto.niveau_scolaire;
            if (dto.statut != null) user.Apprenant.statut = dto.statut;
            if (dto.score.HasValue) user.Apprenant.score = dto.score.Value;
        }

        if (user.role == "ENSEIGNANT" && user.Enseignant != null)
        {
            if (dto.specialite != null) user.Enseignant.specialite = dto.specialite;
        }

        _context.SaveChanges();

        return GetMyProfile(userId);
    }
}
