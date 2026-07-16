using System.Text;
using System.Text.Json;
using HtmlAgilityPack;

namespace FlyRankAI.PoliteScraper
{
    class Program
    {
        private static readonly HttpClient _httpClient = new();
        private const string BaseUrl = "http://quotes.toscrape.com";

        private const string UserAgent = "FlyRankPoliteBot/1.0 (+mailto:elsafi19_dx72@yahoo.com; Mahmoud Mostafa)";

        static async Task Main(string[] args)
        {
            Console.WriteLine("=== Starting the Polite Scraper ===");
            _httpClient.DefaultRequestHeaders.Add("User-Agent", UserAgent);

            var allQuotes = new List<QuoteModel>();
            int maxPages = 5;
            string nextPageUrl = "/";

            for (int page = 1; page <= maxPages && !string.IsNullOrEmpty(nextPageUrl); page++)
            {
                Console.WriteLine($"\n[+] Fetching Page {page}: {BaseUrl}{nextPageUrl}");

                var html = await FetchPageAsync($"{BaseUrl}{nextPageUrl}");
                if (string.IsNullOrEmpty(html))
                {
                    Console.WriteLine("[-] Failed to fetch page. Skipping...");
                    continue;
                }

                var (quotes, next) = ParseAndExtract(html);
                allQuotes.AddRange(quotes);
                nextPageUrl = next;

                Console.WriteLine($"[✔] Extracted {quotes.Count} quotes from this page.");

                if (!string.IsNullOrEmpty(nextPageUrl))
                {
                    Console.WriteLine("[Polite Delay] Waiting 2 seconds before next request...");
                    await Task.Delay(2000);
                }
            }

            await SaveDataToJsonAsync(allQuotes);
            Console.WriteLine("\n=== Scraping Completed Successfully! ===");
        }

        private static async Task<string> FetchPageAsync(string url)
        {
            try
            {
                var response = await _httpClient.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadAsStringAsync();
                }
                Console.WriteLine($"[-] HTTP Error: {response.StatusCode}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[-] Connection Exception: {ex.Message}");
            }
            return string.Empty;
        }

        private static (List<QuoteModel> Quotes, string NextPageUrl) ParseAndExtract(string html)
        {
            var quotesList = new List<QuoteModel>();
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            var quoteNodes = doc.DocumentNode.SelectNodes("//div[@class='quote']");
            if (quoteNodes != null)
            {
                foreach (var node in quoteNodes)
                {
                    var textNode = node.SelectSingleNode(".//span[@class='text']");
                    var text = textNode != null ? textNode.InnerText : string.Empty;

                    var authorNode = node.SelectSingleNode(".//small[@class='author']");
                    var author = authorNode != null ? authorNode.InnerText : string.Empty;

                    var tagNodes = node.SelectNodes(".//div[@class='tags']/a[@class='tag']");
                    var tags = new List<string>();
                    if (tagNodes != null)
                    {
                        foreach (var tagNode in tagNodes)
                        {
                            tags.Add(tagNode.InnerText.Trim());
                        }
                    }

                    text = CleanText(text);

                    quotesList.Add(new QuoteModel
                    {
                        Text = text,
                        Author = author,
                        Tags = tags
                    });
                }
            }

            var nextButtonNode = doc.DocumentNode.SelectSingleNode("//li[@class='next']/a");
            var nextPageUrl = nextButtonNode != null ? nextButtonNode.GetAttributeValue("href", string.Empty) : string.Empty;

            return (quotesList, nextPageUrl);
        }

        private static string CleanText(string text)
        {
            if (string.IsNullOrEmpty(text)) return string.Empty;

            return text.Replace("“", "").Replace("”", "").Trim();
        }

        private static async Task SaveDataToJsonAsync(List<QuoteModel> quotes)
        {
            var options = new JsonSerializerOptions { WriteIndented = true };
            string jsonString = JsonSerializer.Serialize(quotes, options);

            string outputPath = Path.Combine(Directory.GetCurrentDirectory(), "quotes_corpus.json");
            await File.WriteAllTextAsync(outputPath, jsonString, Encoding.UTF8);

            Console.WriteLine($"\n[✔] Structured data saved to: {outputPath}");
            Console.WriteLine($"[✔] Total Records Saved: {quotes.Count}");
        }
    }
}
