using MicroServiceDotNet.Data;
using MicroServiceDotNet.DTO.ManageProfileUser;
using MicroServiceDotNet.Services.PasswordService;
using MicroServiceDotNet.Services.ProfileService;
using Microsoft.EntityFrameworkCore;

public class ProfileService : IProfileService
{
    private readonly AppDbContext _context;
    private readonly IPasswordService _passwordService;

    public ProfileService(AppDbContext context, IPasswordService passwordService)
    {
        _context = context;
        _passwordService = passwordService;
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
        if (UpdateVM.mot_de_passe != null)
            user.mot_de_passe = _passwordService.HashPassword(user, UpdateVM.mot_de_passe);
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

    public object UpdatePhoto(int userId, IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return new
            {
                success = false,
                message = "Fichier invalide"
            };
        }

        var user = _context.Users.FirstOrDefault(u => u.id == userId);

        if (user == null)
        {
            return new
            {
                success = false,
                message = "Utilisateur introuvable"
            };
        }

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
        var extension = Path.GetExtension(file.FileName).ToLower();

        if (!allowedExtensions.Contains(extension))
        {
            return new
            {
                success = false,
                message = "Format non supporté (jpg, jpeg, png uniquement)"
            };
        }

        if (file.Length > 2 * 1024 * 1024)
        {
            return new
            {
                success = false,
                message = "Image trop volumineuse (max 2MB)"
            };
        }

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");

        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        if (!string.IsNullOrEmpty(user.photo_profil))
        {
            var oldPath = Path.Combine(uploadsFolder, user.photo_profil);
            if (File.Exists(oldPath))
                File.Delete(oldPath);
        }

        var fileName = Guid.NewGuid().ToString() + extension;
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            file.CopyTo(stream);
        }

        user.photo_profil = fileName;
        _context.SaveChanges();

        return new
        {
            success = true,
            message = "Photo mise à jour avec succès",
            photoUrl = $"/uploads/{fileName}"
        };
    }
}
