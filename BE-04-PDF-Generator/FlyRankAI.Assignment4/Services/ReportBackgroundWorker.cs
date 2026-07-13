using QuestPDF.Fluent;

namespace FlyRankAI.Assignment4.Services
{
    public class ReportBackgroundWorker : BackgroundService
    {
        private readonly BackgroundReportQueue _queue;
        private readonly IServiceProvider _serviceProvider;
        private readonly IWebHostEnvironment _env;

        public ReportBackgroundWorker(BackgroundReportQueue queue, IServiceProvider serviceProvider, IWebHostEnvironment env)
        {
            _queue = queue;
            _serviceProvider = serviceProvider;
            _env = env;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var jobId = await _queue.DequeueJobAsync(stoppingToken);
                    _queue.UpdateJobStatus(jobId, "Processing");

                    using var scope = _serviceProvider.CreateScope();
                    var dataService = scope.ServiceProvider.GetRequiredService<ReportDataService>();

                    var aggregateData = dataService.GetSalesSummaryByCategory();

                    var document = new SalesReportDocument(aggregateData);

                    var reportsFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "reports");
                    if (!Directory.Exists(reportsFolder)) Directory.CreateDirectory(reportsFolder);

                    var fileName = $"sales-report-{jobId}.pdf";
                    var filePath = Path.Combine(reportsFolder, fileName);

                    document.GeneratePdf(filePath);

                    var downloadUrl = $"/reports/{fileName}";
                    _queue.UpdateJobStatus(jobId, "Completed", downloadUrl);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error processing PDF job: {ex.Message}");
                }
            }
        }
    }
}
