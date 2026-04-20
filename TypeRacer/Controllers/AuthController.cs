using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TypeRacer.Data;
using TypeRacer.Models;

namespace TypeRacer.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, IConfiguration config) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { message = "Sva polja su obavezna." });

        if (req.Password.Length < 6)
            return BadRequest(new { message = "Lozinka mora imati najmanje 6 karaktera." });

        if (await db.Users.AnyAsync(u => u.Email == req.Email.ToLower()))
            return BadRequest(new { message = "Email je već registrovan." });

        if (await db.Users.AnyAsync(u => u.Username == req.Username))
            return BadRequest(new { message = "Korisničko ime je zauzeto." });

        var user = new User
        {
            Username = req.Username,
            Email = req.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password)
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return Ok(new { token = GenerateToken(user), user = ToDto(user) });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email.ToLower());
        if (user == null || user.PasswordHash == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "Pogrešan email ili lozinka." });

        return Ok(new { token = GenerateToken(user), user = ToDto(user) });
    }

    [HttpGet("google")]
    public IActionResult GoogleLogin()
    {
        var props = new AuthenticationProperties { RedirectUri = "/api/auth/google/callback" };
        return Challenge(props, GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet("google/callback")]
    public async Task<IActionResult> GoogleCallback()
    {
        var result = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);
        if (!result.Succeeded) return Redirect("/login?error=google");

        var googleId = result.Principal.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var email = result.Principal.FindFirstValue(ClaimTypes.Email)!;
        var name = result.Principal.FindFirstValue(ClaimTypes.Name) ?? email.Split('@')[0];

        var user = await db.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId)
                ?? await db.Users.FirstOrDefaultAsync(u => u.Email == email.ToLower());

        if (user == null)
        {
            var username = await UniqueUsername(name);
            user = new User { Username = username, Email = email.ToLower(), GoogleId = googleId };
            db.Users.Add(user);
        }
        else
        {
            user.GoogleId ??= googleId;
        }

        await db.SaveChangesAsync();

        var token = GenerateToken(user);
        var frontendUrl = config["Frontend:Url"] ?? "http://localhost:5173";
        return Redirect($"{frontendUrl}/?token={token}");
    }

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("username", user.Username)
        };
        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<string> UniqueUsername(string base_)
    {
        var clean = new string(base_.Where(char.IsLetterOrDigit).ToArray());
        if (clean.Length == 0) clean = "user";
        var candidate = clean;
        var i = 1;
        while (await db.Users.AnyAsync(u => u.Username == candidate))
            candidate = clean + i++;
        return candidate;
    }

    private static object ToDto(User u) => new { u.Id, u.Username, u.Email };
}

public record RegisterRequest(string Username, string Email, string Password);
public record LoginRequest(string Email, string Password);
