using MicroServiceDotNet.DTO.LoginUser;
using MicroServiceDotNet.DTO.RegisterUser;
using MicroServiceDotNet.Repository;
using MicroServiceDotNet.Services.AuthService;
using MicroServiceDotNet.Services.JwtService;
using MicroServiceDotNet.Services.PasswordService;
using MicroServiceDotNet.Services.UserRoleService;

public class AuthService : IAuthService
{
    private readonly IUserRepository _repo;
    private readonly IUserRoleService _role;
    private readonly IJwtService _jwtService;
    private readonly IPasswordService _passwordService;

    public AuthService(
        IUserRepository repo,
        IUserRoleService role,
        IJwtService jwtService,
        IPasswordService passwordService)
    {
        _repo = repo;
        _role = role;
        _jwtService = jwtService;
        _passwordService = passwordService;
    }

    public LoginResult Inscrire(RegisterUserVM vm)
    {
        var existingUser = _repo.GetByEmail(vm.email);

        if (existingUser != null)
        {
            return new LoginResult
            {
                Success = false,
                Message = "Email déjà utilisé"
            };
        }

        var user = _role.RegisterUser(vm);

        user.mot_de_passe =
            _passwordService.HashPassword(user, vm.mot_de_passe);

        _repo.AddUser(user);

        return new LoginResult
        {
            Success = true
        };
    }

    public LoginResult Login(string email, string mot_de_passe)
    {
        var user = _repo.GetByEmail(email);

        if (user == null ||
            !_passwordService.VerifyPassword(user, user.mot_de_passe, mot_de_passe))
        {
            return new LoginResult { Success = false };
        }

        if (!user.est_actif || !user.est_valide)
        {
            return new LoginResult { Success = false, IsBlocked = true };
        }

        var token = _jwtService.GenerateToken(user, out DateTime expiration);

        return new LoginResult
        {
            Success = true,
            Token = token,
            Role = user.role,
            Expiration = expiration
        };
    }
}
