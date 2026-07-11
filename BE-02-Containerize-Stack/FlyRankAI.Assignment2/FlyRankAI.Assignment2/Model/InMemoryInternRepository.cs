public class InMemoryInternRepository : IInternRepository
{
    private static InternInfo _intern = new InternInfo("Mahmoud Mostafa", "Backend AI Engineering", "Active");

    public Task<InternInfo?> GetInternAsync() => Task.FromResult<InternInfo?>(_intern);

    public Task UpdateStatusAsync(string newStatus)
    {
        _intern = _intern with { Status = newStatus };
        return Task.CompletedTask;
    }
}