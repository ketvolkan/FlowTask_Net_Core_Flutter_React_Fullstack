using Flowtask.Business.ValidationRules.FluentValidation;
using Flowtask.EntityLayer.DTOs.Auth;
using Flowtask.EntityLayer.DTOs.Projects;
using FluentAssertions;
using Xunit;

namespace Flowtask.UnitTests.Validators;

public class ValidationTests
{
    [Theory]
    [InlineData("", "Password123*", false)]
    [InlineData("invalid-email", "Password123*", false)]
    [InlineData("valid@flowtask.com", "", false)]
    [InlineData("valid@flowtask.com", "Password123*", true)]
    public void UserForLoginDtoValidator_ShouldValidateCorrectly(string email, string password, bool isValid)
    {
        var validator = new UserForLoginDtoValidator();
        var request = new UserForLoginDto { Email = email, Password = password };

        var result = validator.Validate(request);
        result.IsValid.Should().Be(isValid);
    }

    [Theory]
    [InlineData("", "FLW", false)]
    [InlineData("Flowtask", "F", false)] // Key too short (min 2)
    [InlineData("Flowtask", "flw", false)] // Key must be uppercase
    [InlineData("Flowtask", "FLW10", true)]
    public void ProjectCreateDtoValidator_ShouldValidateCorrectly(string name, string key, bool isValid)
    {
        var validator = new ProjectCreateDtoValidator();
        var request = new ProjectCreateDto { Name = name, Key = key };

        var result = validator.Validate(request);
        result.IsValid.Should().Be(isValid);
    }
}
