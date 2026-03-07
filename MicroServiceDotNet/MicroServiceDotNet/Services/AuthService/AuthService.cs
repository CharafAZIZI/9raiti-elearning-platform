using Google.Apis.Auth;
using MicroServiceDotNet.DTO.LoginUser;
using MicroServiceDotNet.DTO.RegisterUser;
using MicroServiceDotNet.Models;
using MicroServiceDotNet.Repository;
using MicroServiceDotNet.Services.AuthService;
using MicroServiceDotNet.Services.JwtService;
using MicroServiceDotNet.Services.PasswordService;
using MicroServiceDotNet.Services.UserRoleService;
using MicroServiceDotNet.Services.EmailService; //  AJOUT
using System;

public class AuthService : IAuthService
{
    private readonly IUserRepository _repo;
    private readonly IUserRoleService _role;
    private readonly IJwtService _jwtService;
    private readonly IPasswordService _passwordService;
<<<<<<< HEAD
    private readonly IEmailService _emailService; //  AJOUT
=======
    private readonly IGoogleAuthService _googleAuthService;
    private readonly ILogger<AuthService> _logger;
>>>>>>> 0d4fa9da73c6ff7f066946d733aa1662500032dc

    public AuthService(
        IUserRepository repo,
        IUserRoleService role,
        IJwtService jwtService,
        IPasswordService passwordService,
<<<<<<< HEAD
        IEmailService emailService) //  AJOUT
=======
        IGoogleAuthService googleAuthService,
        ILogger<AuthService> logger)
>>>>>>> 0d4fa9da73c6ff7f066946d733aa1662500032dc
    {
        _repo = repo;
        _role = role;
        _jwtService = jwtService;
        _passwordService = passwordService;
<<<<<<< HEAD
        _emailService = emailService; //  AJOUT
=======
        _googleAuthService = googleAuthService;
        _logger = logger;
>>>>>>> 0d4fa9da73c6ff7f066946d733aa1662500032dc
    }

    public LoginResult Inscrire(RegisterUserVM vm)
    {
        var existingUser = _repo.GetByEmail(vm.email);
        if (existingUser != null)
            return new LoginResult { Success = false, Message = "Email déjà utilisé" };

        var user = _role.RegisterUser(vm);
<<<<<<< HEAD

        user.mot_de_passe =
            _passwordService.HashPassword(user, vm.mot_de_passe);

        //  AJOUT : EMAIL CONFIRMATION
        var token = Guid.NewGuid().ToString();

        user.EmailConfirmed = false;
        user.EmailConfirmationToken = token;

        _repo.AddUser(user);

        string confirmationLink =
            $"https://localhost:7167/api/auth/confirm-email?token={token}";

        _emailService.SendEmail(
            user.email,
            "Confirmation Email",
             confirmationLink
        );
        return new LoginResult
        {
            Success = true
        };
=======
        user.mot_de_passe = _passwordService.HashPassword(user, vm.mot_de_passe);
        _repo.AddUser(user);

        return new LoginResult { Success = true };
>>>>>>> 0d4fa9da73c6ff7f066946d733aa1662500032dc
    }

    public LoginResult Login(string email, string mot_de_passe)
    {
        var user = _repo.GetByEmail(email);
        if (user == null || !_passwordService.VerifyPassword(user, user.mot_de_passe, mot_de_passe))
            return new LoginResult { Success = false };

        if (!user.est_actif || !user.est_valide)
            return new LoginResult { Success = false, IsBlocked = true };

        var token = _jwtService.GenerateToken(user, out DateTime expiration);
        return new LoginResult { Success = true, Token = token, Role = user.role, Expiration = expiration };
    }
<<<<<<< HEAD
=======

    public LoginResult LoginWithGoogle(string idToken)
    {
        try
        {
            var payload = _googleAuthService.ValidateToken(idToken);

            var user = _repo.GetOrCreateFromGooglePayload(payload);

            var token = _jwtService.GenerateToken(user, out DateTime expiration);
            return new LoginResult
            {
                Success = true,
                Token = token,
                Role = user.role,
                Expiration = expiration
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur Google login");
            return new LoginResult
            {
                Success = false,
                Message = $"Erreur Google login : {ex.Message}"
            };
        }
    }
>>>>>>> 0d4fa9da73c6ff7f066946d733aa1662500032dc
}