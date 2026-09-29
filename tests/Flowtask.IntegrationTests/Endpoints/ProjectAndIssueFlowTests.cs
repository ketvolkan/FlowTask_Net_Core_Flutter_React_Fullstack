using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Flowtask.Business.DTOs.Auth;
using Flowtask.Business.DTOs.Comments;
using Flowtask.Business.DTOs.Issues;
using Flowtask.Business.DTOs.Projects;
using Flowtask.Core.Results;
using Flowtask.EntityLayer.Enums;
using Flowtask.IntegrationTests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace Flowtask.IntegrationTests.Endpoints;

public class ProjectAndIssueFlowTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ProjectAndIssueFlowTests(CustomWebApplicationFactory factory)
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
    public async Task EndToEndFlow_CreateProject_CreateIssue_UpdateStatus_AddComment()
    {
        // 1. Authenticate as Admin
        var token = await GetTokenAsync("admin@flowtask.com", "Admin123*");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // 2. Create Project
        var key = "TST" + Guid.NewGuid().ToString("N")[..3].ToUpperInvariant();
        var createProjectResponse = await _client.PostAsJsonAsync("/api/projects", new CreateProjectRequest
        {
            Name = "Integration Test Project",
            Key = key,
            Description = "Automated test project"
        });
        createProjectResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var projectResult = await createProjectResponse.Content.ReadFromJsonAsync<DataResult<ProjectDto>>();
        var projectId = projectResult!.Data!.Id;

        // 3. Create Issue 1
        var createIssue1Response = await _client.PostAsJsonAsync($"/api/projects/{projectId}/issues", new CreateIssueRequest
        {
            Title = "First Test Task",
            Description = "Task description",
            IssueType = IssueType.Task,
            Priority = IssuePriority.High,
            Status = IssueStatus.Todo
        });
        createIssue1Response.StatusCode.Should().Be(HttpStatusCode.OK);
        var issue1Result = await createIssue1Response.Content.ReadFromJsonAsync<DataResult<IssueDto>>();
        var issue1Id = issue1Result!.Data!.Id;
        issue1Result.Data.IssueKey.Should().Be($"{key}-1");

        // 4. Create Issue 2 (Verify auto-incrementing key)
        var createIssue2Response = await _client.PostAsJsonAsync($"/api/projects/{projectId}/issues", new CreateIssueRequest
        {
            Title = "Second Test Bug",
            IssueType = IssueType.Bug,
            Priority = IssuePriority.Highest
        });
        createIssue2Response.StatusCode.Should().Be(HttpStatusCode.OK);
        var issue2Result = await createIssue2Response.Content.ReadFromJsonAsync<DataResult<IssueDto>>();
        issue2Result!.Data!.IssueKey.Should().Be($"{key}-2");

        // 5. Update Status of Issue 1 to InProgress
        var updateStatusResponse = await _client.PatchAsJsonAsync($"/api/projects/{projectId}/issues/{issue1Id}/status", new UpdateIssueStatusRequest
        {
            Status = IssueStatus.InProgress
        });
        updateStatusResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var updatedStatusResult = await updateStatusResponse.Content.ReadFromJsonAsync<DataResult<IssueDto>>();
        updatedStatusResult!.Data!.Status.Should().Be(IssueStatus.InProgress);

        // 6. Add Comment to Issue 1
        var commentResponse = await _client.PostAsJsonAsync($"/api/projects/{projectId}/issues/{issue1Id}/comments", new CreateCommentRequest
        {
            Content = "Starting work on this task."
        });
        commentResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var commentResult = await commentResponse.Content.ReadFromJsonAsync<DataResult<CommentDto>>();
        commentResult!.Data!.Content.Should().Be("Starting work on this task.");

        // 7. IDOR Isolation check: Accessing issue with wrong project ID should fail
        var randomProjectId = Guid.NewGuid();
        var idorResponse = await _client.GetAsync($"/api/projects/{randomProjectId}/issues/{issue1Id}");
        idorResponse.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }
}
