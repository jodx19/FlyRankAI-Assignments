using Npgsql;

public class PostgresInternRepository : IInternRepository
{
    private readonly string _connectionString;

    // سنقوم بتمرير نص الاتصال عبر الـ Configuration (ملف الـ .env لاحقاً)
    public PostgresInternRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new ArgumentNullException(nameof(configuration));
    }

    public async Task<InternInfo?> GetInternAsync()
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        using var command = new NpgsqlCommand("SELECT name, track, status FROM intern_profile LIMIT 1;", connection);
        using var reader = await command.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            return new InternInfo(
                reader.GetString(0),
                reader.GetString(1),
                reader.GetString(2)
            );
        }

        return null;
    }

    public async Task UpdateStatusAsync(string newStatus)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        using var command = new NpgsqlCommand("UPDATE intern_profile SET status = @status;", connection);
        command.Parameters.AddWithValue("status", newStatus);

        await command.ExecuteNonQueryAsync();
    }
}