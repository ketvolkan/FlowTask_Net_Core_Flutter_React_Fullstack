using FluentValidation;
using Flowtask.Business.DTOs.Issues;

namespace Flowtask.Business.ValidationRules;

public class UpdateIssueRequestValidator : AbstractValidator<UpdateIssueRequest>
{
    public UpdateIssueRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Issue title is required.")
            .MaximumLength(250);

        RuleFor(x => x.StoryPoints)
            .GreaterThanOrEqualTo(0).When(x => x.StoryPoints.HasValue)
            .WithMessage("Story points cannot be negative.");
    }
}
