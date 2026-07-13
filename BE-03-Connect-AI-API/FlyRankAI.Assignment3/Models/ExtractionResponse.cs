namespace FlyRankAI.Assignment3.Models
{
    public class ExtractionResponse
    {
        public bool IsSuccess { get; set; }
        public ReceiptData? Data { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
        public TokenUsageInfo Usage { get; set; } = new();
    }

    public class TokenUsageInfo
    {
        public int PromptTokens { get; set; }
        public int CompletionTokens { get; set; }
        public int TotalTokens { get; set; }
        public decimal EstimatedCostDollar { get; set; }
    }
}