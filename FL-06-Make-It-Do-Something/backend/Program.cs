using System.Net.Http.Headers;
using System.Net.Mail;
using System.Text;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient<IEmailService, ResendEmailService>();
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapPost("/api/contact", async (ContactRequest request, IEmailService emailService, CancellationToken cancellationToken) =>
{
    if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Message))
        return Results.BadRequest(new { error = "All fields are required." });

    try
    {
        _ = new MailAddress(request.Email);
    }
    catch (FormatException)
    {
        return Results.BadRequest(new { error = "Please provide a valid email address." });
    }

    var sent = await emailService.SendEmailAsync(request, cancellationToken);
    return sent ? Results.Ok(new { success = true }) : Results.Problem("Failed to dispatch email.");
});

app.Run();

public record ContactRequest(string Name, string Email, string Message);

public interface IEmailService
{
    Task<bool> SendEmailAsync(ContactRequest request, CancellationToken cancellationToken);
}

public sealed class ResendEmailService(HttpClient httpClient, IConfiguration configuration, ILogger<ResendEmailService> logger) : IEmailService
{
    public async Task<bool> SendEmailAsync(ContactRequest request, CancellationToken cancellationToken)
    {
        var apiKey = configuration["Resend:ApiKey"];
        var recipient = configuration["Resend:To"];
        var sender = configuration["Resend:From"] ?? "onboarding@resend.dev";

        if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(recipient))
        {
            logger.LogWarning("Resend is not configured. Contact submission was accepted without dispatching email.");
            return true;
        }

        using var message = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        message.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        message.Content = new StringContent(JsonSerializer.Serialize(new
        {
            from = sender,
            to = new[] { recipient },
            subject = $"Portfolio inquiry from {request.Name}",
            text = $"Sender: {request.Name} <{request.Email}>\n\nMessage:\n{request.Message}"
        }), Encoding.UTF8, "application/json");

        using var response = await httpClient.SendAsync(message, cancellationToken);
        return response.IsSuccessStatusCode;
    }
}
