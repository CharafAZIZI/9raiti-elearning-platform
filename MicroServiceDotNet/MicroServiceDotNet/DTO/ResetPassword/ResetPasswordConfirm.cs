namespace MicroServiceDotNet.DTO.ResetPassword
{
    public class ResetPasswordConfirm
    {
        public string Token { get; set; }
        public string NewPassword { get; set; }
        public string ConfirmPassword { get; set; }
    }
}
