var builder = WebApplication.CreateBuilder(args);

// setting up the connection string for PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// injecting the PostgreSQL repository implementation for IInternRepository
builder.Services.AddScoped<IInternRepository, PostgresInternRepository>();

var app = builder.Build();

app.MapGet("/", () => "Welcome to FlyRank AI Internship - Week 2!");

// endpoint to get the intern data from the repository
app.MapGet("/intern", async (IInternRepository repo) =>
{
    var intern = await repo.GetInternAsync();
    return intern is not null ? Results.Ok(intern) : Results.NotFound();
});

// add endpoint to update the intern status in the repository
app.MapPost("/intern/status", async (string status, IInternRepository repo) =>
{
    await repo.UpdateStatusAsync(status);
    return Results.Ok(new { Message = "Status updated successfully", NewStatus = status });
});

app.Run();