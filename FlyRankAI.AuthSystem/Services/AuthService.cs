using Microsoft.Data.Sqlite;
using Dapper;
using BCrypt.Net;
using FlyRankAI.AuthSystem.DTOs;
using FlyRankAI.AuthSystem.Models;
using Microsoft.Extensions.Configuration;

namespace FlyRankAI.AuthSystem.Services
{
    public class AuthService
    {
        private readonly string _connectionString;
        private readonly TokenService _tokenService;

        public AuthService(IConfiguration configuration, TokenService tokenService)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? "Data Source=auth.db";
            _tokenService = tokenService;
        }

        public async Task<bool> RegisterAsync(RegisterDto dto)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var checkQuery = "SELECT COUNT(1) FROM Users WHERE Username = @Username OR Email = @Email";
            var exists = await connection.ExecuteScalarAsync<int>(checkQuery, new { dto.Username, dto.Email });

            if (exists > 0)
                return false;

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var insertQuery = @"
                INSERT INTO Users (Username, Email, PasswordHash, CreatedAt)
                VALUES (@Username, @Email, @PasswordHash, @CreatedAt)";

            var result = await connection.ExecuteAsync(insertQuery, new
            {
                dto.Username,
                dto.Email,
                PasswordHash = passwordHash,
                CreatedAt = DateTime.UtcNow.ToString("o")
            });

            return result > 0;
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var query = "SELECT * FROM Users WHERE Username = @Username";
            var user = await connection.QueryFirstOrDefaultAsync<User>(query, new { dto.Username });

            if (user == null)
                return null;

            var isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);

            if (!isPasswordValid)
                return null;

            var token = _tokenService.GenerateToken(user);

            return new AuthResponseDto
            {
                Token = token,
                Username = user.Username
            };
        }
    }
}
