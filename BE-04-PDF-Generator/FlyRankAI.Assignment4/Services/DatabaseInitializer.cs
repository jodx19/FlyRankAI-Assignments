using Microsoft.Data.Sqlite;
using Dapper;

namespace FlyRankAI.Assignment4.Services
{
    public class DatabaseInitializer
    {
        private readonly string _connectionString;

        public DatabaseInitializer(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                                ?? "Data Source=reports.db";
        }

        public void Initialize()
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            connection.Execute(@"
                CREATE TABLE IF NOT EXISTS Products (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Name TEXT NOT NULL,
                    Category TEXT NOT NULL,
                    Price REAL NOT NULL
                );

                CREATE TABLE IF NOT EXISTS Sales (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ProductId INTEGER NOT NULL,
                    Quantity INTEGER NOT NULL,
                    TotalAmount REAL NOT NULL,
                    SaleDate TEXT NOT NULL,
                    FOREIGN KEY (ProductId) REFERENCES Products(Id)
                );
            ");

            var productCount = connection.ExecuteScalar<int>("SELECT COUNT(1) FROM Products");
            if (productCount == 0)
            {
                connection.Execute(@"
                    INSERT INTO Products (Name, Category, Price) VALUES
                    ('SaaS Subscription Pro', 'Software', 99.00),
                    ('AI Assistant Token Pack', 'AI Credits', 29.00),
                    ('Enterprise Support Integration', 'Support', 499.00),
                    ('Developer API Key - Monthly', 'Software', 49.00);
                ");

                connection.Execute(@"
                    INSERT INTO Sales (ProductId, Quantity, TotalAmount, SaleDate) VALUES
                    (1, 15, 1485.00, '2026-07-01'),
                    (2, 50, 1450.00, '2026-07-02'),
                    (3, 3, 1497.00, '2026-07-05'),
                    (1, 10, 990.00, '2026-07-10'),
                    (4, 25, 1225.00, '2026-07-12'),
                    (2, 30, 870.00, '2026-07-13');
                ");
            }
        }
    }
}
