using FluentValidation;
using Flowtask.EntityLayer.DTOs.Projects;

namespace Flowtask.Business.ValidationRules.FluentValidation;

public class ProjectCreateDtoValidator : AbstractValidator<ProjectCreateDto>
{
    public ProjectCreateDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Project name is required.")
            .MaximumLength(100).WithMessage("Project name cannot exceed 100 characters.");

        RuleFor(x => x.Key)
            .NotEmpty().WithMessage("Project key is required.")
            .MinimumLength(2).WithMessage("Project key must be at least 2 characters.")
            .MaximumLength(10).WithMessage("Project key cannot exceed 10 characters.")
            .Matches("^[A-Z0-9]+$").WithMessage("Project key must be alphanumeric uppercase.");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.");
    }
}
