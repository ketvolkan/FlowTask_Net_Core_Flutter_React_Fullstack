using FluentValidation;
using Flowtask.Business.DTOs.Comments;

namespace Flowtask.Business.ValidationRules;

public class CreateCommentRequestValidator : AbstractValidator<CreateCommentRequest>
{
    public CreateCommentRequestValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Comment content cannot be empty.")
            .MaximumLength(5000);
    }
}
