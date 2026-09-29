using FluentValidation;
using Flowtask.Business.DTOs.Sprints;

namespace Flowtask.Business.ValidationRules;

public class CreateSprintRequestValidator : AbstractValidator<CreateSprintRequest>
{
    public CreateSprintRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Sprint name is required.")
            .MaximumLength(150);

        RuleFor(x => x.EndDate)
            .GreaterThan(x => x.StartDate!.Value).When(x => x.StartDate.HasValue && x.EndDate.HasValue)
            .WithMessage("End date must be after start date.");
    }
}
