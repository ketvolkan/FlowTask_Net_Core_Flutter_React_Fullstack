using Flowtask.Business.DTOs.Auth;
using Flowtask.Business.DTOs.Projects;
using Flowtask.Business.ValidationRules;
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
    public void LoginRequestValidator_ShouldValidateCorrectly(string email, string password, bool isValid)
    {
        var validator = new LoginRequestValidator();
        var request = new LoginRequest { Email = email, Password = password };

        var result = validator.Validate(request);
        result.IsValid.Should().Be(isValid);
    }

    [Theory]
    [InlineData("", "FLW", false)]
    [InlineData("Flowtask", "F", false)] // Key too short (min 2)
    [InlineData("Flowtask", "flw", false)] // Key must be uppercase
    [InlineData("Flowtask", "FLW10", true)]
    public void CreateProjectRequestValidator_ShouldValidateCorrectly(string name, string key, bool isValid)
    {
        var validator = new CreateProjectRequestValidator();
        var request = new CreateProjectRequest { Name = name, Key = key };

        var result = validator.Validate(request);
        result.IsValid.Should().Be(isValid);
    }
}
