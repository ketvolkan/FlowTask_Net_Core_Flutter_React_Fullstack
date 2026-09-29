using FluentValidation;
using Flowtask.EntityLayer.DTOs.Comments;

namespace Flowtask.Business.ValidationRules.FluentValidation;

public class CommentCreateDtoValidator : AbstractValidator<CommentCreateDto>
{
    public CommentCreateDtoValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Comment content is required.")
            .MaximumLength(2000).WithMessage("Comment cannot exceed 2000 characters.");
    }
}
