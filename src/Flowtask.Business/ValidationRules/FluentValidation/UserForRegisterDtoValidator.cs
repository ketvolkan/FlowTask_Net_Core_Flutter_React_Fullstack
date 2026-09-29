using FluentValidation;
using Flowtask.EntityLayer.DTOs.Auth;

namespace Flowtask.Business.ValidationRules.FluentValidation;

public class UserForRegisterDtoValidator : AbstractValidator<UserForRegisterDto>
{
    public UserForRegisterDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters.");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MaximumLength(100).WithMessage("Full name cannot exceed 100 characters.");
    }
}
