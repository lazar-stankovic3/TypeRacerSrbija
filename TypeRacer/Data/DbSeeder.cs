using TypeRacer.Models;

namespace TypeRacer.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (db.Sentences.Any()) return;

        db.Sentences.AddRange(
            // Lako (1)
            new Sentence { Text = "Sunce je sjalo nad gradom celog dana.", Difficulty = 1 },
            new Sentence { Text = "Mačka sedi na prozoru i gleda napolje.", Difficulty = 1 },
            new Sentence { Text = "Deca se igraju u parku pored fontane.", Difficulty = 1 },
            new Sentence { Text = "Jutro je lepo vreme za šetnju.", Difficulty = 1 },
            new Sentence { Text = "Knjiga leži na stolu pored čaše vode.", Difficulty = 1 },
            new Sentence { Text = "Pas trči po travnjaku i laje na ptice.", Difficulty = 1 },
            new Sentence { Text = "Reka teče mirno kroz zelenu dolinu.", Difficulty = 1 },
            new Sentence { Text = "Sta ste bre navalili na grobno mesto", Difficulty = 1 },

            // Srednje (2)
            new Sentence { Text = "Beograd leži na ušću Save u Dunav i predstavlja srce srpske kulture.", Difficulty = 2 },
            new Sentence { Text = "Programiranje zahteva strpljenje, logičko razmišljanje i kreativnost.", Difficulty = 2 },
            new Sentence { Text = "Planine su uvek privlačile ljude koji traže mir i avanturu u prirodi.", Difficulty = 2 },
            new Sentence { Text = "Muzika ima moć da promeni raspoloženje i poveže ljude iz različitih kultura.", Difficulty = 2 },
            new Sentence { Text = "Srpska kuhinja je bogata ukusnim jelima poput sarme, ćevapa i kajmaka.", Difficulty = 2 },
            new Sentence { Text = "Internet je promenio način na koji komuniciramo, radimo i učimo svaki dan.", Difficulty = 2 },
            new Sentence { Text = "Voz je polako ulazio u stanicu dok je jutarnja magla nestajala u daljini.", Difficulty = 2 },
            new Sentence { Text = "Fotografija je umetnost hvatanja trenutaka koji ostaju zauvek zabeleženi.", Difficulty = 2 },
            new Sentence { Text = "Zimske večeri su idealne za čitanje dobrih knjiga uz topli čaj i ćebe.", Difficulty = 2 },
            new Sentence { Text = "Putovanje proširuje vidike i pomaže nam da razumemo različite kulture sveta.", Difficulty = 2 },
            new Sentence { Text = "Oblaci su plutali po nebu kao beli brodovi na plavom moru bez kraja.", Difficulty = 2 },

            // Teško (3)
            new Sentence { Text = "Nauka i tehnologija menjaju svet bržim tempom nego ikad pre u istoriji čovečanstva.", Difficulty = 3 },
            new Sentence { Text = "Reka Dunav protiče kroz deset zemalja i jedna je od najdužih reka u Evropi po dužini toka.", Difficulty = 3 },
            new Sentence { Text = "Pozorišne predstave donose duboke emocije i razmišljanja koja nas čine boljim i mudrijim ljudima.", Difficulty = 3 },
            new Sentence { Text = "Srpski jezik je bogat i izražajan, pun reči koje opisuju sve nijanse svakodnevnog života.", Difficulty = 3 },
            new Sentence { Text = "Tihomir je svaki dan vežbao kucanje na tastaturi kako bi bio brži, tačniji i efikasniji.", Difficulty = 3 },
            new Sentence { Text = "Stari Beograd pun je istorije, a svaka ulica krije zanimljive priče iz daleke prošlosti.", Difficulty = 3 },
            new Sentence { Text = "Vetar je nosio miris cveća iz bašte kroz otvoreni prozor moje sobice na spratu.", Difficulty = 3 }
        );
       
        db.SaveChanges();
    }
}
