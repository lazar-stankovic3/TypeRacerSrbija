using Microsoft.AspNetCore.Mvc;
using TypeRacer.Data;

namespace TypeRacer.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SentencesController(AppDbContext db) : ControllerBase
{
    [HttpGet("random")]
    public IActionResult GetRandom([FromQuery] int? difficulty)
    {
        var query = db.Sentences.AsQueryable().Where(s => s.Difficulty <= 3);
        if (difficulty.HasValue) query = query.Where(s => s.Difficulty == difficulty.Value);

        var count = query.Count();
        if (count == 0) return NotFound();

        var sentence = query.Skip(Random.Shared.Next(count)).First();
        return Ok(sentence);
    }

    [HttpGet("daily")]
    public IActionResult GetDaily()
    {
        var dailySentences = db.Sentences.Where(s => s.Difficulty == 4).ToList();
        if (dailySentences.Count == 0) return NotFound();

        var today = DateTime.UtcNow;
        var index = (today.Year * 366 + today.DayOfYear) % dailySentences.Count;
        return Ok(dailySentences[index]);
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(db.Sentences.ToList());
}
