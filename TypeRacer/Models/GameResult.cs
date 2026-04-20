namespace TypeRacer.Models;

public class GameResult
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int Wpm { get; set; }
    public int Accuracy { get; set; }
    public string Mode { get; set; } = "solo"; // "solo" | "multi"
    public DateTime PlayedAt { get; set; } = DateTime.UtcNow;
}
