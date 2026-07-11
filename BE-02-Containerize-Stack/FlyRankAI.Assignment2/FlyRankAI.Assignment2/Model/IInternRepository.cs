public record InternInfo(string Name, string Track, string Status);

public interface IInternRepository
{
    Task<InternInfo?> GetInternAsync();
    Task UpdateStatusAsync(string newStatus);
}