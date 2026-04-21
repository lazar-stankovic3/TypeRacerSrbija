using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TypeRacer.Migrations
{
    public partial class AddEloAndDaily : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Elo",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "EloGained",
                table: "GameResults",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SentenceDifficulty",
                table: "GameResults",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Elo", table: "Users");
            migrationBuilder.DropColumn(name: "EloGained", table: "GameResults");
            migrationBuilder.DropColumn(name: "SentenceDifficulty", table: "GameResults");
        }
    }
}
