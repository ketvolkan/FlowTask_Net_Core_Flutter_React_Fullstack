using FluentValidation;
using Flowtask.EntityLayer.DTOs.Auth;

namespace Flowtask.Business.ValidationRules.FluentValidation;

public class UserForLoginDtoValidator : AbstractValidator<UserForLoginDto>
{
    public UserForLoginDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.");
    }
}
