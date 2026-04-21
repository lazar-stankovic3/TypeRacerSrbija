namespace TypeRacer.Models;

public class GameResult
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int Wpm { get; set; }
    public int Accuracy { get; set; }
    public string Mode { get; set; } = "solo"; // "solo" | "multi" | "daily" | "alphabet"
    public int SentenceDifficulty { get; set; } = 0;
    public int EloGained { get; set; } = 0;
    public DateTime PlayedAt { get; set; } = DateTime.UtcNow;
}
