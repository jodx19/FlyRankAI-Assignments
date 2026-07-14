using Microsoft.Data.Sqlite;
using Dapper;
using Microsoft.Extensions.Configuration;

namespace FlyRankAI.AuthSystem.Database
{
    public class DatabaseInitializer
    {
        private readonly string _connectionString;

        public DatabaseInitializer(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? "Data Source=auth.db";
        }

        public void Initialize()
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            var createUsersTableQuery = @"
                CREATE TABLE IF NOT EXISTS Users (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Username TEXT NOT NULL UNIQUE,
                    Email TEXT NOT NULL UNIQUE,
                    PasswordHash TEXT NOT NULL,
                    CreatedAt TEXT NOT NULL
                );";

            connection.Execute(createUsersTableQuery);
        }
    }
}
