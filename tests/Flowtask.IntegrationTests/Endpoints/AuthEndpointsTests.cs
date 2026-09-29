using System.Net;
using System.Net.Http.Json;
using Flowtask.Business.DTOs.Auth;
using Flowtask.Core.Results;
using Flowtask.IntegrationTests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace Flowtask.IntegrationTests.Endpoints;

public class AuthEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthEndpointsTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Login_WithSeededAdminCredentials_ShouldReturnOkAndTokens()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "admin@flowtask.com",
            Password = "Admin123*"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<DataResult<LoginResponse>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.AccessToken.Should().NotBeNullOrEmpty();
        result.Data.User.IsSystemAdmin.Should().BeTrue();
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ShouldReturnBadRequest()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "admin@flowtask.com",
            Password = "WrongPassword!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var result = await response.Content.ReadFromJsonAsync<Result>();
        result.Should().NotBeNull();
        result!.Success.Should().BeFalse();
    }

    [Fact]
    public async Task Register_WithNewUser_ShouldReturnOk()
    {
        // Arrange
        var email = $"tester_{Guid.NewGuid():N}@flowtask.com";
        var request = new RegisterRequest
        {
            FullName = "Integration Tester",
            Email = email,
            Password = "Password123*",
            JobTitle = "QA Engineer"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<DataResult<LoginResponse>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data!.User.Email.Should().Be(email);
    }
}
