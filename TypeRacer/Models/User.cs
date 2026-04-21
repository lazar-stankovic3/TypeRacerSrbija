namespace TypeRacer.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string? PasswordHash { get; set; }
    public string? GoogleId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int Elo { get; set; } = 0;

    public ICollection<GameResult> GameResults { get; set; } = [];
}
