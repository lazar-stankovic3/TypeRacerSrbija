using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TypeRacer.Data;

namespace TypeRacer.Controllers;

[ApiController]
[Route("api/leaderboard")]
public class LeaderboardController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string mode = "all")
    {
        var query = db.GameResults.Include(r => r.User).AsQueryable();
        if (mode == "solo") query = query.Where(r => r.Mode == "solo");
        else if (mode == "multi") query = query.Where(r => r.Mode == "multi");
        else if (mode == "alphabet") query = query.Where(r => r.Mode == "alphabet");
        else if (mode == "daily") query = query.Where(r => r.Mode == "daily");

        var entries = await query
            .GroupBy(r => new { r.UserId, r.User.Username, r.User.Elo })
            .Select(g => new
            {
                Username = g.Key.Username,
                Elo = g.Key.Elo,
                BestWpm = g.Max(r => r.Wpm),
                AvgWpm = (int)g.Average(r => r.Wpm),
                Games = g.Count(),
                AvgAccuracy = (int)g.Average(r => r.Accuracy)
            })
            .OrderByDescending(e => e.BestWpm)
            .Take(100)
            .ToListAsync();

        return Ok(entries);
    }

    [HttpGet("daily")]
    public async Task<IActionResult> GetDaily()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var entries = await db.GameResults
            .Include(r => r.User)
            .Where(r => r.Mode == "daily" && r.PlayedAt >= today && r.PlayedAt < tomorrow)
            .GroupBy(r => new { r.UserId, r.User.Username })
            .Select(g => new
            {
                Username = g.Key.Username,
                BestWpm = g.Max(r => r.Wpm),
                AvgAccuracy = (int)g.Average(r => r.Accuracy),
                Attempts = g.Count()
            })
            .OrderByDescending(e => e.BestWpm)
            .Take(50)
            .ToListAsync();

        return Ok(entries);
    }
}
