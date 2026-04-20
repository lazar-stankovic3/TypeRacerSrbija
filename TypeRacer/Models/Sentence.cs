namespace TypeRacer.Models;

public class Sentence
{
    public int Id { get; set; }
    public string Text { get; set; } = "";
    public int Difficulty { get; set; } // 1=lako, 2=srednje, 3=teško
}
