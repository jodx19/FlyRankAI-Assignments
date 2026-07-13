using System.Threading.Channels;

namespace FlyRankAI.Assignment4.Services
{
    public class ReportJob
    {
        public string JobId { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public string? DownloadUrl { get; set; }
    }

    public class BackgroundReportQueue
    {
        private readonly Channel<string> _queue = Channel.CreateUnbounded<string>();
        private readonly Dictionary<string, ReportJob> _jobs = new();

        public string EnqueueJob()
        {
            var jobId = Guid.NewGuid().ToString();
            var job = new ReportJob { JobId = jobId, Status = "Pending" };

            _jobs[jobId] = job;
            _queue.Writer.TryWrite(jobId);

            return jobId;
        }

        public async ValueTask<string> DequeueJobAsync(CancellationToken cancellationToken)
        {
            return await _queue.Reader.ReadAsync(cancellationToken);
        }

        public ReportJob? GetJobStatus(string jobId)
        {
            return _jobs.TryGetValue(jobId, out var job) ? job : null;
        }

        public void UpdateJobStatus(string jobId, string status, string? downloadUrl = null)
        {
            if (_jobs.TryGetValue(jobId, out var job))
            {
                job.Status = status;
                if (downloadUrl != null) job.DownloadUrl = downloadUrl;
            }
        }
    }
}
