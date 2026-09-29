using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Flowtask.Business.DTOs.Auth;
using Flowtask.Core.Results;
using Flowtask.IntegrationTests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace Flowtask.IntegrationTests.Security;

public class AuthorizationSecurityTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthorizationSecurityTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<string> GetTokenAsync(string email, string password)
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = email,
            Password = password
        });

        var result = await response.Content.ReadFromJsonAsync<DataResult<LoginResponse>>();
        return result!.Data!.AccessToken;
    }

    [Fact]
    public async Task AnonymousRequest_ToProtectedEndpoint_ShouldReturnUnauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/projects");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task NormalUser_ToAdminEndpoint_ShouldReturnForbidden()
    {
        // Arrange
        var normalUserToken = await GetTokenAsync("demo@flowtask.com", "Demo123*");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", normalUserToken);

        // Act
        var response = await _client.GetAsync("/api/admin/users");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task SystemAdmin_ToAdminEndpoint_ShouldReturnOk()
    {
        // Arrange
        var adminToken = await GetTokenAsync("admin@flowtask.com", "Admin123*");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.GetAsync("/api/admin/users");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
