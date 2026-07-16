namespace FlyRankAI.PoliteScraper
{
    public class QuoteModel
    {
        public string Text { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = new();
    }
}
