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
        db.GameResults.Add(new GameResult
        {
            UserId = userId,
            Wpm = req.Wpm,
            Accuracy = req.Accuracy,
            Mode = req.Mode
        });
        await db.SaveChangesAsync();
        return Ok();
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
            .Select(r => new { r.Id, r.Wpm, r.Accuracy, r.Mode, r.PlayedAt })
            .ToListAsync();
        return Ok(results);
    }
}

public record SaveResultRequest(int Wpm, int Accuracy, string Mode);
