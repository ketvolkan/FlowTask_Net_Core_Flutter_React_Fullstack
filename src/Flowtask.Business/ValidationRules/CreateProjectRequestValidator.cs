using FluentValidation;
using Flowtask.Business.DTOs.Projects;

namespace Flowtask.Business.ValidationRules;

public class CreateProjectRequestValidator : AbstractValidator<CreateProjectRequest>
{
    public CreateProjectRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Project name is required.")
            .MaximumLength(150);

        RuleFor(x => x.Key)
            .NotEmpty().WithMessage("Project key is required.")
            .Length(2, 10).WithMessage("Project key must be between 2 and 10 characters.")
            .Matches("^[A-Z0-9]+$").WithMessage("Project key must contain only uppercase alphanumeric characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000);
    }
}
