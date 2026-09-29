using FluentValidation;
using Flowtask.EntityLayer.DTOs.Projects;

namespace Flowtask.Business.ValidationRules.FluentValidation;

public class ProjectUpdateDtoValidator : AbstractValidator<ProjectUpdateDto>
{
    public ProjectUpdateDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Project name is required.")
            .MaximumLength(100).WithMessage("Project name cannot exceed 100 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.");

        RuleFor(x => x.OwnerId)
            .NotEmpty().WithMessage("Project owner is required.");
    }
}
