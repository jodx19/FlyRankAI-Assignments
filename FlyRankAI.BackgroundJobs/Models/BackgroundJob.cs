namespace FlyRankAI.BackgroundJobs.Models
{
    public enum JobStatus
    {
        Pending,
        Processing,
        Completed,
        Failed
    }

    public class BackgroundJob
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public JobStatus Status { get; set; } = JobStatus.Pending;
        public string? InputData { get; set; }
        public string? Result { get; set; }
        public string? Error { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
    }
}
