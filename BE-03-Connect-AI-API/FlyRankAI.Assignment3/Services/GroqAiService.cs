using FlyRankAI.Assignment3.Models;
using System;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace FlyRankAI.Assignment3.Services
{
    public class GroqAiService : IAiService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<GroqAiService> _logger;
        private readonly string _apiKey;
        private const string GroqUrl = "https://api.groq.com/openai/v1/chat/completions";
        private const string ModelName = "llama-3.1-8b-instant";

        
        private const decimal CostPerInputMillion = 0.05m;
        private const decimal CostPerOutputMillion = 0.08m;

        public GroqAiService(HttpClient httpClient, IConfiguration configuration, ILogger<GroqAiService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _apiKey = configuration["GROQ_API_KEY"] ?? throw new ArgumentNullException("GROQ_API_KEY is missing!");
        }

        public async Task<ExtractionResponse> ExtractReceiptDataAsync(string receiptText)
        {
            var systemPrompt = @"You are a data extraction assistant. Your job is to extract financial data from receipt text.
                    You MUST return a valid JSON object matching this schema strictly:
                  {
                     ""MerchantName"": ""string"",
                     ""Date"": ""string"",
                     ""TotalAmount"": 0.0
                   }
                        Do not include any markdown block formatting (like ```json), no conversation, and no extra text. Just raw, pure valid JSON.";

            var requestBody = new
            {
                model = ModelName,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = receiptText }
                },
                temperature = 0.1, 
                response_format = new { type = "json_object" } 
            };

            var jsonPayload = JsonSerializer.Serialize(requestBody);
            int maxRetries = 3;
            int delaySeconds = 2;

            for (int retry = 0; retry <= maxRetries; retry++)
            {
                try
                {
                    using var request = new HttpRequestMessage(HttpMethod.Post, GroqUrl);
                    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
                    request.Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                    using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(15));

                    var response = await _httpClient.SendAsync(request, cts.Token);

                    
                    if (response.StatusCode == HttpStatusCode.TooManyRequests || (int)response.StatusCode >= 500)
                    {
                        if (retry == maxRetries) break;

                        _logger.LogWarning($"[Retry {retry + 1}/{maxRetries}] Faced status code {response.StatusCode}. Retrying in {delaySeconds}s...");
                        await Task.Delay(TimeSpan.FromSeconds(delaySeconds));
                        delaySeconds *= 2; // Exponential backoff
                        continue;
                    }

                    response.EnsureSuccessStatusCode();

                    var responseString = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(responseString);
                    var root = doc.RootElement;

                    
                    var contentString = root.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "{}";


                    ReceiptData? extractedData;
                    try
                    {
                        extractedData = JsonSerializer.Deserialize<ReceiptData>(contentString, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    }
                    catch (JsonException ex)
                    {
                        _logger.LogError($"JSON Validation Failed: {ex.Message}. Raw content: {contentString}");
                        return new ExtractionResponse { IsSuccess = false, ErrorMessage = "AI returned invalid JSON format schema." };
                    }

                    
                    var usage = root.GetProperty("usage");
                    int promptTokens = usage.GetProperty("prompt_tokens").GetInt32();
                    int completionTokens = usage.GetProperty("completion_tokens").GetInt32();
                    int totalTokens = usage.GetProperty("total_tokens").GetInt32();

                    decimal cost = ((promptTokens / 1000000m) * CostPerInputMillion) +
                                   ((completionTokens / 1000000m) * CostPerOutputMillion);

                    
                    _logger.LogInformation($"[AI Log] Success! Tokens used: P:{promptTokens}, C:{completionTokens}, T:{totalTokens}. Est Cost: ${cost:F6}");

                    return new ExtractionResponse
                    {
                        IsSuccess = true,
                        Data = extractedData,
                        Usage = new TokenUsageInfo
                        {
                            PromptTokens = promptTokens,
                            CompletionTokens = completionTokens,
                            TotalTokens = totalTokens,
                            EstimatedCostDollar = cost
                        }
                    };
                }
                catch (Exception ex)
                {
                    if (retry == maxRetries)
                    {
                        _logger.LogError($"Final attempt failed: {ex.Message}");
                        return new ExtractionResponse { IsSuccess = false, ErrorMessage = ex.Message };
                    }
                    _logger.LogWarning($"Attempt {retry} failed: {ex.Message}. Retrying...");
                    await Task.Delay(TimeSpan.FromSeconds(delaySeconds));
                }
            }

            return new ExtractionResponse { IsSuccess = false, ErrorMessage = "Failed after max retries due to rate limit or server error." };
        }
    }
}