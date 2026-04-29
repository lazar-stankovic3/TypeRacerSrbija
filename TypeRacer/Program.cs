using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TypeRacer.Data;
using TypeRacer.Hubs;
using TypeRacer.Services;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
    builder.WebHost.UseUrls($"http://+:{port}");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var dbUrl    = Environment.GetEnvironmentVariable("DATABASE_URL");
var pgHost   = Environment.GetEnvironmentVariable("PGHOST");
var pgPort   = Environment.GetEnvironmentVariable("PGPORT");
var pgDb     = Environment.GetEnvironmentVariable("PGDATABASE");
var pgUser   = Environment.GetEnvironmentVariable("PGUSER");
var pgPass   = Environment.GetEnvironmentVariable("PGPASSWORD");

Console.WriteLine($"[DB] DATABASE_URL set: {dbUrl != null}");
Console.WriteLine($"[DB] PGHOST: {pgHost ?? "NOT SET"}");
Console.WriteLine($"[DB] PGPORT: {pgPort ?? "NOT SET"}");
Console.WriteLine($"[DB] PGDATABASE: {pgDb ?? "NOT SET"}");
Console.WriteLine($"[DB] PGUSER: {pgUser ?? "NOT SET"}");
Console.WriteLine($"[DB] PGPASSWORD set: {pgPass != null}");

string? connectionString;
if (dbUrl != null)
{
    connectionString = dbUrl;
    Console.WriteLine("[DB] Using DATABASE_URL");
}
else if (pgHost != null && pgDb != null && pgUser != null && pgPass != null)
{
    connectionString = $"Host={pgHost};Port={pgPort ?? "5432"};Database={pgDb};Username={pgUser};Password={pgPass};SSL Mode=Require;Trust Server Certificate=true";
    Console.WriteLine("[DB] Using PG* variables");
}
else
{
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    Console.WriteLine("[DB] Using appsettings.json (fallback)");
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddSignalR();
builder.Services.AddSingleton<GameRoomService>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultSignInScheme = Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationDefaults.AuthenticationScheme;
})
.AddCookie()
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

var googleClientId = builder.Configuration["Authentication:Google:ClientId"];
if (!string.IsNullOrEmpty(googleClientId))
{
    builder.Services.AddAuthentication()
        .AddGoogle(options =>
        {
            options.ClientId = googleClientId;
            options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]!;
        });
}

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (builder.Environment.IsDevelopment())
            policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
                  .AllowAnyHeader().AllowAnyMethod().AllowCredentials();
        else
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    DbSeeder.Seed(db);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});
app.UseStaticFiles();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<GameHub>("/gamehub");
app.MapFallbackToFile("index.html");

app.Run();
