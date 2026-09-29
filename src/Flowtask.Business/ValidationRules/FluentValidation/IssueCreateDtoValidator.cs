using FluentValidation;
using Flowtask.EntityLayer.DTOs.Issues;

namespace Flowtask.Business.ValidationRules.FluentValidation;

public class IssueCreateDtoValidator : AbstractValidator<IssueCreateDto>
{
    public IssueCreateDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title cannot exceed 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(5000).WithMessage("Description cannot exceed 5000 characters.");

        RuleFor(x => x.StoryPoints)
            .GreaterThanOrEqualTo(0).When(x => x.StoryPoints.HasValue)
            .WithMessage("Story points cannot be negative.");
    }
}
