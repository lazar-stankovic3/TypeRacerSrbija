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
        var query = db.Sentences.AsQueryable();
        if (difficulty.HasValue) query = query.Where(s => s.Difficulty == difficulty.Value);

        var count = query.Count();
        if (count == 0) return NotFound();

        var sentence = query.Skip(Random.Shared.Next(count)).First();
        return Ok(sentence);
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(db.Sentences.ToList());
}
