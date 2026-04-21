using TypeRacer.Models;

namespace TypeRacer.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (db.Sentences.Count() >= 100) return;

        db.Sentences.RemoveRange(db.Sentences.ToList());
        db.SaveChanges();

        db.Sentences.AddRange(

            // ── Lako (1) ──────────────────────────────────────────────────────
            new Sentence { Text = "Sunce je sjalo nad gradom celog dana.", Difficulty = 1 },
            new Sentence { Text = "Mačka sedi na prozoru i gleda napolje.", Difficulty = 1 },
            new Sentence { Text = "Deca se igraju u parku pored fontane.", Difficulty = 1 },
            new Sentence { Text = "Jutro je lepo vreme za šetnju.", Difficulty = 1 },
            new Sentence { Text = "Knjiga leži na stolu pored čaše vode.", Difficulty = 1 },
            new Sentence { Text = "Pas trči po travnjaku i laje na ptice.", Difficulty = 1 },
            new Sentence { Text = "Reka teče mirno kroz zelenu dolinu.", Difficulty = 1 },
            new Sentence { Text = "Vreme prolazi brzo kada se zabavljaš.", Difficulty = 1 },
            new Sentence { Text = "Kafa miriše divno ujutro.", Difficulty = 1 },
            new Sentence { Text = "Dete crta kuću i drvo na papiru.", Difficulty = 1 },
            new Sentence { Text = "Avion leti visoko iznad oblaka.", Difficulty = 1 },
            new Sentence { Text = "Miš traži hranu po celoj sobi.", Difficulty = 1 },
            new Sentence { Text = "Baka pravi kolače za vikend.", Difficulty = 1 },
            new Sentence { Text = "Voz dolazi svake jutro u sedam.", Difficulty = 1 },
            new Sentence { Text = "Riba pliva u bistrom jezeru.", Difficulty = 1 },
            new Sentence { Text = "Cveće cveta svake proleći.", Difficulty = 1 },
            new Sentence { Text = "Mesec sija noću nad tihim selom.", Difficulty = 1 },
            new Sentence { Text = "Dečak vozi bicikl niz ulicu.", Difficulty = 1 },
            new Sentence { Text = "Ptica peva na grani svako jutro.", Difficulty = 1 },
            new Sentence { Text = "Sneg prekriva polja belo bojom.", Difficulty = 1 },

            // ── Srednje (2) ────────────────────────────────────────────────────
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
            new Sentence { Text = "Sportisti svakodnevno vežbaju da bi postigli što bolje rezultate na takmičenjima.", Difficulty = 2 },
            new Sentence { Text = "Šuma je puna zvukova prirode koji smiruju dušu i čiste misli od briga.", Difficulty = 2 },
            new Sentence { Text = "Deca uče brže od odraslih jer im je um otvoren za nova znanja i iskustva.", Difficulty = 2 },
            new Sentence { Text = "Veštačka inteligencija menja svet brže nego što smo ikada mogli zamisliti.", Difficulty = 2 },
            new Sentence { Text = "Kuvar je satima pripremao specijalitet koji je oduševio sve goste restorana.", Difficulty = 2 },
            new Sentence { Text = "Biciklisti su jurili niz brdsku stazu dok je sunce zalazilo iza horizonta.", Difficulty = 2 },
            new Sentence { Text = "Svaki novi dan donosi nove prilike za učenje, rast i ostvarivanje snova.", Difficulty = 2 },
            new Sentence { Text = "Tehnologija nam pomaže da budemo produktivniji i povežemo se sa svetom.", Difficulty = 2 },
            new Sentence { Text = "Stari grad je pun priča i sećanja koja čekaju da budu otkrivena i ispričana.", Difficulty = 2 },
            new Sentence { Text = "Prijatelji su najvažniji dar koji život može da ti pruži u teškim trenucima.", Difficulty = 2 },
            new Sentence { Text = "More miriše na sol i slobodu, a talasi nikada ne prestaju da šapuću tajne.", Difficulty = 2 },
            new Sentence { Text = "Planinar je sa vrha planine gledao dolinu prekrivenu jutarnjom maglom.", Difficulty = 2 },
            new Sentence { Text = "Nauka nam pomaže da razumemo svet oko nas i da odgovorimo na velika pitanja.", Difficulty = 2 },
            new Sentence { Text = "Svaki sat provedeno u vežbanju kucanja donosi vidljivo poboljšanje brzine.", Difficulty = 2 },

            // ── Teško (3) ─────────────────────────────────────────────────────
            new Sentence { Text = "Nauka i tehnologija menjaju svet bržim tempom nego ikad pre u istoriji čovečanstva.", Difficulty = 3 },
            new Sentence { Text = "Reka Dunav protiče kroz deset zemalja i jedna je od najdužih reka u Evropi po dužini toka.", Difficulty = 3 },
            new Sentence { Text = "Pozorišne predstave donose duboke emocije i razmišljanja koja nas čine boljim i mudrijim ljudima.", Difficulty = 3 },
            new Sentence { Text = "Srpski jezik je bogat i izražajan, pun reči koje opisuju sve nijanse svakodnevnog života.", Difficulty = 3 },
            new Sentence { Text = "Tihomir je svaki dan vežbao kucanje na tastaturi kako bi bio brži, tačniji i efikasniji.", Difficulty = 3 },
            new Sentence { Text = "Stari Beograd pun je istorije, a svaka ulica krije zanimljive priče iz daleke prošlosti.", Difficulty = 3 },
            new Sentence { Text = "Vetar je nosio miris cveća iz bašte kroz otvoreni prozor moje sobice na spratu.", Difficulty = 3 },
            new Sentence { Text = "Astronomi koriste moćne teleskope da bi proučavali zvezde i galaksije udaljene milijardama svetlosnih godina.", Difficulty = 3 },
            new Sentence { Text = "Filozofi su kroz vekove pokušavali da odgovore na pitanje šta je smisao čovekovog postojanja na Zemlji.", Difficulty = 3 },
            new Sentence { Text = "Programeri svaki dan rešavaju složene probleme kombinirajući logiku, matematiku i kreativno razmišljanje.", Difficulty = 3 },
            new Sentence { Text = "Kompozitor je satima sedeo za klavirom tražeći savršenu melodiju koja bi dirnula svako srce.", Difficulty = 3 },
            new Sentence { Text = "Evolucija je proces koji traje milionima godina i koji je oblikovao sav život na našoj planeti.", Difficulty = 3 },
            new Sentence { Text = "Digitalna transformacija zahteva od kompanija da se prilagode novim tehnologijama i promenljivim potrebama tržišta.", Difficulty = 3 },
            new Sentence { Text = "Istraživači su otkrili novu vrstu bakterije koja može da razlaže plastiku i tako pomaže u borbi sa zagađenjem.", Difficulty = 3 },
            new Sentence { Text = "Kvantna mehanika opisuje svet subatomskih čestica gde važe potpuno drugačija pravila nego u svakodnevnom životu.", Difficulty = 3 },
            new Sentence { Text = "Arhitekta je osmislio zgradu koja se savršeno uklapa u okolinu, koristeći prirodne materijale i svetlost.", Difficulty = 3 },
            new Sentence { Text = "Srpski srednjovekovni manastiri su svedočanstvo izuzetnog umetničkog i graditeljskog majstorstva naših predaka.", Difficulty = 3 },
            new Sentence { Text = "Ekonomske krize pokazuju koliko je važno imati stabilan finansijski sistem i odgovorne institucije u svakom društvu.", Difficulty = 3 },
            new Sentence { Text = "Paleontolozi otkopavaju fosilne ostatke dinosaurusa koji su živeli pre više od šezdeset miliona godina na Zemlji.", Difficulty = 3 },
            new Sentence { Text = "Umetnik je kroz svoja dela pokušavao da izrazi kompleksna osećanja koja se ne mogu opisati rečima svakodnevnog govora.", Difficulty = 3 },

            // ── Dnevni izazov (4) — dugačke rečenice ─────────────────────────
            new Sentence { Text = "Srbija je zemlja bogate istorije i kulture, sa gradovima koji čuvaju tragove rimskih osvajača, vizantijskih careva, srpskih vladara i modernih epoha razvoja koje su ostavile neizbrisiv trag u srcima njenih stanovnika.", Difficulty = 4 },
            new Sentence { Text = "Kucanje na tastaturi je veština koja se razvija svakodnevnom vežbom i strpljenjem, a svako slovo koje pritisneš precizno i brzo donosi novi osećaj zadovoljstva i potvrdu da si bolji nego juče.", Difficulty = 4 },
            new Sentence { Text = "Vetar koji duva sa Fruške gore nosi mirise šuma, vinograda i reka, podsetnik da je priroda najdragoceniji dar koji čovek može da nosi u srcu bez obzira na to gde živeo i koliko daleko otišao od doma.", Difficulty = 4 },
            new Sentence { Text = "Kada sunce zagreje krovove starog Beograda i osvetli reku Savu, grad dobija poseban sjaj koji se ne može opisati rečima ali se može duboko osetiti u duši svakog ko voli ovaj grad svim srcem.", Difficulty = 4 },
            new Sentence { Text = "Naučnici iz celog sveta rade zajedno na rešavanju najtežih problema čovečanstva, od klimatskih promena do novih bolesti, u nadi da će budućim generacijama ostaviti bolji, zdraviji i pravedniji svet nego što su ga sami zatekli.", Difficulty = 4 },
            new Sentence { Text = "Programiranje nije samo pisanje koda — to je način razmišljanja koji te uči kako da rasklapiš svaki složen problem na jednostavne korake i pronađeš elegantno rešenje tamo gde drugi ne vide ništa osim haosa.", Difficulty = 4 },
            new Sentence { Text = "Istorija srpskog naroda puna je uspona i padova, junaka i izdajnika, pobeda i poraza, ali svaki period ostavio je trag koji oblikuje identitet i ponos naroda koji nikada nije odustao od sebe i svojih vrednosti.", Difficulty = 4 },
            new Sentence { Text = "Svaki put kada sedneš ispred tastature i počneš da kucaš, ti vežbaš ne samo prste nego i um, koncentraciju i brzinu donošenja odluka, a ti sitni treninzi se skupljaju u ogromnu prednost tokom dugog vremenskog perioda.", Difficulty = 4 },
            new Sentence { Text = "Planine Balkana kriju netaknute šume, bistре рeke i sela u kojima vreme teče sporije, gde starci još pamte priče koje su čuli od svojih dedova, a deca rasту uz legende koje su stare koliko i sam narod.", Difficulty = 4 },
            new Sentence { Text = "Digitalno doba donelo je neverovatne mogućnosti ali i nove izazove za privatnost, mentalno zdravlje i međuljudske odnose, pa je važno pronaći ravnotežu između virtuelnog i stvarnog sveta u kome živimo svaki dan.", Difficulty = 4 },
            new Sentence { Text = "Jezik je živo biće koje se menja zajedno sa društvom, upija nove reči, zaboravlja stare i uvek pronalazi novi način da izrazi ono što se dešava u srcima i umovima onih koji ga govore i vole.", Difficulty = 4 },
            new Sentence { Text = "Muzika nema granice — ona prelazi planine, mora i okeane, ulazi u svaki dom i svako srce, ne pita za jezik ni poreklo, nego samo traži uho koje je voljno da čuje i dušu koja je otvorena da oseti.", Difficulty = 4 },
            new Sentence { Text = "Svaki sportista koji je stajao na pobedničkom postolju prošao je hiljade sati napornog treninga, razočarenja i bola, ali nikada nije dozvolio da te teškoće ugase vatru koja gori duboko u njemu i tera ga napred.", Difficulty = 4 },
            new Sentence { Text = "Zemlja je neverovatno mesto — jedina planeta u poznatom svemiru koja nosi život, sa ekosistemima toliko složenim da nauka tek pokušava da razume sve veze između biljaka, životinja, vode, vazduha i tla.", Difficulty = 4 },
            new Sentence { Text = "Knjige su prozori u svetove koje nikada nećeš posetiti, u živote koje nikada nećeš živeti, u misli koje nikada ne bi sam imao, i upravo zato su jedan od najvažnijih izuma u celoj istoriji civilizacije.", Difficulty = 4 },
            new Sentence { Text = "Grad noću izgleda kao ogromna svetlosna mapa, svaki prozor je priča, svaka ulica je tok misli, a negde u tom ogromnom tkivu od asfalta i betona žive milioni ljudi sa snovima, brigama i ljubavima.", Difficulty = 4 },
            new Sentence { Text = "Veštačka inteligencija promenila je sve industrije za kratko vreme, i sada stojimo pred pitanjem koje će oblikovati budućnost — kako da koristimo ovu tehnologiju odgovorno, etički i u korist svih, a ne samo nekolicine.", Difficulty = 4 },
            new Sentence { Text = "Stari most u Mostaru, sagrađen pre više od četiri veka, i danas stoji kao simbol lepote, trajnosti i nade, podsetnik da ono što gradimo s ljubavlju i veštinom može da nadživi i vreme i ratove.", Difficulty = 4 },
            new Sentence { Text = "Svaki čovek nosi u sebi celu jednu vaseljenu — sećanja, strahove, snove, iskustva i ljubavi koji zajedno čine nešto jedinstveno i neponovljivo, nešto što postoji samo jedanput u celoj istoriji svemira.", Difficulty = 4 },
            new Sentence { Text = "Reka vremena nosi sve — radosti i tuge, uspehe i poraze, susrete i rastanke — ali ono što ostaje zauvek su trenuci u kojima smo bili potpuno prisutni i dali sve od sebe, bez zadrške i bez straha.", Difficulty = 4 }
        );

        db.SaveChanges();
    }
}
