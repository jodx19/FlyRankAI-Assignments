using System.Threading.Channels;
using FlyRankAI.BackgroundJobs.Models;

namespace FlyRankAI.BackgroundJobs.Services
{
    public class JobQueue
    {
        private readonly Channel<BackgroundJob> _queue;
        private readonly Dictionary<string, BackgroundJob> _jobs = new();

        public JobQueue()
        {
            _queue = Channel.CreateUnbounded<BackgroundJob>();
        }

        public async Task EnqueueJobAsync(BackgroundJob job)
        {
            _jobs[job.Id] = job;
            await _queue.Writer.WriteAsync(job);
        }

        public async Task<BackgroundJob> DequeueJobAsync(CancellationToken cancellationToken)
        {
            return await _queue.Reader.ReadAsync(cancellationToken);
        }

        public BackgroundJob? GetJob(string jobId)
        {
            _jobs.TryGetValue(jobId, out var job);
            return job;
        }
    }
}
