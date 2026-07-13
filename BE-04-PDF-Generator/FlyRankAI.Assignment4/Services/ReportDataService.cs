using Microsoft.Data.Sqlite;
using Dapper;
using FlyRankAI.Assignment4.Models;

namespace FlyRankAI.Assignment4.Services
{
    public class ReportDataService
    {
        private readonly string _connectionString;

        public ReportDataService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                                ?? "Data Source=reports.db";
        }

        public IEnumerable<CategorySalesSummary> GetSalesSummaryByCategory()
        {
            using var connection = new SqliteConnection(_connectionString);

            // Query تجميع البيانات من الـ Database مباشرة (SQL Aggregation)
            string query = @"
                SELECT
                    p.Category,
                    SUM(s.Quantity) AS TotalQuantitySold,
                    SUM(s.TotalAmount) AS TotalRevenue
                FROM Sales s
                INNER JOIN Products p ON s.ProductId = p.Id
                GROUP BY p.Category
                ORDER BY TotalRevenue DESC";

            return connection.Query<CategorySalesSummary>(query);
        }
    }
}
