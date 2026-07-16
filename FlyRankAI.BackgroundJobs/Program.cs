using FlyRankAI.BackgroundJobs.Models;
using FlyRankAI.BackgroundJobs.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<JobQueue>();
builder.Services.AddHostedService<JobWorker>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseSwagger();
app.UseSwaggerUI();

app.MapPost("/jobs", async (CreateJobRequest request, JobQueue queue) =>
{
    var job = new BackgroundJob
    {
        Id = Guid.NewGuid().ToString(),
        Status = JobStatus.Pending,
        InputData = request.InputData,
        CreatedAt = DateTime.UtcNow
    };

    await queue.EnqueueJobAsync(job);

    return Results.Accepted($"/jobs/{job.Id}", new
    {
        jobId = job.Id,
        status = job.Status.ToString(),
        message = "Job accepted and is now in the queue."
    });
});

app.MapGet("/jobs/{jobId}", (string jobId, JobQueue jobQueue) =>
{
    var job = jobQueue.GetJob(jobId);
    return job is null ? Results.NotFound() : Results.Ok(job);
});

app.Run();

public record CreateJobRequest(string InputData);
