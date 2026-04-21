using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TypeRacer.Data;
using TypeRacer.Models;

namespace TypeRacer.Controllers;

[ApiController]
[Route("api/results")]
public class ResultsController(AppDbContext db) : ControllerBase
{
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> SaveResult([FromBody] SaveResultRequest req)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var eloGained = CalculateElo(req.Wpm, req.Accuracy, req.SentenceDifficulty, req.Mode);

        db.GameResults.Add(new GameResult
        {
            UserId = userId,
            Wpm = req.Wpm,
            Accuracy = req.Accuracy,
            Mode = req.Mode,
            SentenceDifficulty = req.SentenceDifficulty,
            EloGained = eloGained
        });

        var user = await db.Users.FindAsync(userId);
        if (user != null) user.Elo += eloGained;

        await db.SaveChangesAsync();
        return Ok(new { eloGained });
    }

    [HttpGet("mine")]
    [Authorize]
    public async Task<IActionResult> GetMine()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var results = await db.GameResults
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.PlayedAt)
            .Take(50)
            .Select(r => new { r.Id, r.Wpm, r.Accuracy, r.Mode, r.EloGained, r.SentenceDifficulty, r.PlayedAt })
            .ToListAsync();
        return Ok(results);
    }

    private static int CalculateElo(int wpm, int accuracy, int difficulty, string mode)
    {
        // base points by difficulty
        double basePoints = difficulty switch
        {
            1 => 15,
            2 => 25,
            3 => 40,
            4 => 40, // daily treated as hard
            _ => 20
        };

        // daily bonus
        if (mode == "daily") basePoints *= 1.5;

        double accuracyFactor = accuracy / 100.0;
        double wpmFactor = Math.Min(wpm / 60.0, 2.0);

        return (int)Math.Round(basePoints * accuracyFactor * wpmFactor);
    }
}

public record SaveResultRequest(int Wpm, int Accuracy, string Mode, int SentenceDifficulty = 0);
