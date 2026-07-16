using FlyRankAI.BackgroundJobs.Models;

namespace FlyRankAI.BackgroundJobs.Services
{
    public class JobWorker : BackgroundService
    {
        private readonly JobQueue _jobQueue;
        private readonly ILogger<JobWorker> _logger;

        public JobWorker(JobQueue jobQueue, ILogger<JobWorker> logger)
        {
            _jobQueue = jobQueue;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Background Job Worker is starting...");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var job = await _jobQueue.DequeueJobAsync(stoppingToken);
                    _logger.LogInformation($"[Job {job.Id}] Picked up from queue.");

                    job.Status = JobStatus.Processing;

                    await ProcessJobAsync(job, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing job from queue.");
                }
            }

            _logger.LogInformation("Background Job Worker is stopping.");
        }

        private async Task ProcessJobAsync(BackgroundJob job, CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation($"[Job {job.Id}] Processing started (Simulating slow AI Call)...");

                await Task.Delay(5000, cancellationToken);

                job.Status = JobStatus.Completed;
                job.Result = $"AI successfully processed input: '{job.InputData?.ToUpper()}' at {DateTime.UtcNow}";
                job.CompletedAt = DateTime.UtcNow;

                _logger.LogInformation($"[Job {job.Id}] Processed successfully!");
            }
            catch (Exception ex)
            {
                job.Status = JobStatus.Failed;
                job.Error = ex.Message;
                job.CompletedAt = DateTime.UtcNow;
                _logger.LogError($"[Job {job.Id}] Failed with error: {ex.Message}");
            }
        }
    }
}
