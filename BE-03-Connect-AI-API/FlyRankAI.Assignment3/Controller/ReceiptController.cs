using FlyRankAI.Assignment3.Models;
using FlyRankAI.Assignment3.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace FlyRankAI.Assignment3.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReceiptController : ControllerBase
    {
        private readonly IAiService _aiService;

        public ReceiptController(IAiService aiService)
        {
            _aiService = aiService;
        }

        [HttpPost("extract")]
        public async Task<IActionResult> ExtractReceipt([FromBody] ExtractionRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.ReceiptText))
            {
                return BadRequest(new { Message = "Receipt text cannot be empty." });
            }

            var result = await _aiService.ExtractReceiptDataAsync(request.ReceiptText);

            if (!result.IsSuccess)
            {
                return StatusCode(500, result);
            }

            return Ok(result);
        }
    }
}