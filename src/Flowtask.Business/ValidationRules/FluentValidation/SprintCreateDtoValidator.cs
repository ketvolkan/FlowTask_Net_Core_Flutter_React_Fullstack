using FluentValidation;
using Flowtask.EntityLayer.DTOs.Sprints;

namespace Flowtask.Business.ValidationRules.FluentValidation;

public class SprintCreateDtoValidator : AbstractValidator<SprintCreateDto>
{
    public SprintCreateDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Sprint name is required.")
            .MaximumLength(100).WithMessage("Sprint name cannot exceed 100 characters.");

        RuleFor(x => x.Goal)
            .MaximumLength(500).WithMessage("Goal cannot exceed 500 characters.");

        RuleFor(x => x.EndDate)
            .GreaterThan(x => x.StartDate!.Value).When(x => x.StartDate.HasValue && x.EndDate.HasValue)
            .WithMessage("End date must be after start date.");
    }
}
