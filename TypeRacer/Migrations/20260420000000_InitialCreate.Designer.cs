using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using TypeRacer.Data;

#nullable disable

namespace TypeRacer.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260420000000_InitialCreate")]
    partial class InitialCreate
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.4")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("TypeRacer.Models.GameResult", b =>
            {
                b.Property<int>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("integer");
                NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                b.Property<int>("Accuracy").HasColumnType("integer");
                b.Property<int>("EloGained").HasColumnType("integer");
                b.Property<string>("Mode").IsRequired().HasColumnType("text");
                b.Property<DateTime>("PlayedAt").HasColumnType("timestamp without time zone");
                b.Property<int>("SentenceDifficulty").HasColumnType("integer");
                b.Property<int>("UserId").HasColumnType("integer");
                b.Property<int>("Wpm").HasColumnType("integer");

                b.HasKey("Id");
                b.HasIndex("UserId");
                b.ToTable("GameResults");
            });

            modelBuilder.Entity("TypeRacer.Models.Sentence", b =>
            {
                b.Property<int>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("integer");
                NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                b.Property<int>("Difficulty").HasColumnType("integer");
                b.Property<string>("Text").IsRequired().HasColumnType("text");

                b.HasKey("Id");
                b.ToTable("Sentences");
            });

            modelBuilder.Entity("TypeRacer.Models.User", b =>
            {
                b.Property<int>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("integer");
                NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                b.Property<DateTime>("CreatedAt").HasColumnType("timestamp without time zone");
                b.Property<int>("Elo").HasColumnType("integer");
                b.Property<string>("Email").IsRequired().HasColumnType("text");
                b.Property<string>("GoogleId").HasColumnType("text");
                b.Property<string>("PasswordHash").HasColumnType("text");
                b.Property<string>("Username").IsRequired().HasColumnType("text");

                b.HasKey("Id");
                b.HasIndex("Email").IsUnique();
                b.HasIndex("Username").IsUnique();
                b.ToTable("Users");
            });

            modelBuilder.Entity("TypeRacer.Models.GameResult", b =>
            {
                b.HasOne("TypeRacer.Models.User", "User")
                    .WithMany("GameResults")
                    .HasForeignKey("UserId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();

                b.Navigation("User");
            });

            modelBuilder.Entity("TypeRacer.Models.User", b =>
            {
                b.Navigation("GameResults");
            });
#pragma warning restore 612, 618
        }
    }
}
