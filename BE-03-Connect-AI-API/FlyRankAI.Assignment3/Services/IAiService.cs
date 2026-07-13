using FlyRankAI.Assignment3.Models;
using System.Threading.Tasks;

namespace FlyRankAI.Assignment3.Services
{
    public interface IAiService
    {
        Task<ExtractionResponse> ExtractReceiptDataAsync(string receiptText);
    }
}