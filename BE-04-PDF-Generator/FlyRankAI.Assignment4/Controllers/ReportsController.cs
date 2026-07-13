using Microsoft.AspNetCore.Mvc;
using FlyRankAI.Assignment4.Services;

namespace FlyRankAI.Assignment4.Controllers
{
    /// <summary>
    /// API controller for managing PDF report generation with background job processing
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly BackgroundReportQueue _queue;

        public ReportsController(BackgroundReportQueue queue)
        {
            _queue = queue;
        }

        /// <summary>
        /// Triggers the generation of a sales report PDF
        /// </summary>
        /// <returns>Accepted response with JobId and StatusUrl for tracking</returns>
        /// <remarks>
        /// This endpoint starts the PDF generation in the background.
        /// Use the returned JobId with the /status/{jobId} endpoint to check progress.
        /// When complete, a download URL will be provided.
        /// </remarks>
        [HttpPost("generate")]
        [ProducesResponseType(StatusCodes.Status202Accepted)]
        public IActionResult GenerateReport()
        {
            var jobId = _queue.EnqueueJob();

            return Accepted(new {
                Message = "Report generation started in the background.",
                JobId = jobId,
                StatusUrl = $"/api/reports/status/{jobId}"
            });
        }

        /// <summary>
        /// Checks the status of a report generation job
        /// </summary>
        /// <param name="jobId">The unique identifier of the job</param>
        /// <returns>Job status with download URL if completed</returns>
        /// <remarks>
        /// Returns the current status of the report generation.
        /// Possible statuses: Pending, Processing, Completed
        /// When status is "Completed", a DownloadUrl will be included.
        /// </remarks>
        [HttpGet("status/{jobId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult GetStatus(string jobId)
        {
            var job = _queue.GetJobStatus(jobId);
            if (job == null) return NotFound(new { Message = "Job not found" });

            if (job.Status == "Completed")
            {
                var fullDownloadUrl = $"{Request.Scheme}://{Request.Host}{job.DownloadUrl}";
                return Ok(new { Status = job.Status, DownloadUrl = fullDownloadUrl });
            }

            return Ok(new { Status = job.Status, Message = "Job is still processing or pending." });
        }
    }
}
