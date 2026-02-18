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

    public object UpdateUser(int userId, UpdateProfileUserVM UpdateVM)
    {
        var user = _context.Users
            .Include(u => u.Apprenant)
            .Include(u => u.Enseignant)
            .FirstOrDefault(u => u.id == userId);

        if (user == null)
            throw new Exception("Utilisateur introuvable");

        // Mise à jour des champs standards
        if (UpdateVM.email != null) user.email = UpdateVM.email;
        if (UpdateVM.mot_de_passe != null) user.mot_de_passe = UpdateVM.mot_de_passe;
        if (UpdateVM.telephone != null) user.telephone = UpdateVM.telephone;
        if (UpdateVM.nom != null) user.nom = UpdateVM.nom;
        if (UpdateVM.prenom != null) user.prenom = UpdateVM.prenom;

        // Mise à jour détails spécifiques
        if (user.role == "APPRENANT" && user.Apprenant != null)
        {
            if (UpdateVM.niveau_scolaire != null) user.Apprenant.niveau_scolaire = UpdateVM.niveau_scolaire;
            if (UpdateVM.statut != null) user.Apprenant.statut = UpdateVM.statut;
            if (UpdateVM.score.HasValue) user.Apprenant.score = UpdateVM.score.Value;
        }

        if (user.role == "ENSEIGNANT" && user.Enseignant != null)
        {
            if (UpdateVM.specialite != null) user.Enseignant.specialite = UpdateVM.specialite;
        }

        _context.SaveChanges();

        return GetMyProfile(userId);
    }
}
