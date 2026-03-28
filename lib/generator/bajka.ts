/**
 * Lokalny generator bajek — bez zewnętrznego API.
 * Używa szablonów i komponowania bloków narracyjnych.
 */

import type { TematBajki, TonOpowiesci, DlugoscBajki } from "@/lib/validators/kreator";

// ---------------------------------------------------------------------------
// Typy
// ---------------------------------------------------------------------------
export interface GeneratorInput {
  temat: TematBajki;
  ton: TonOpowiesci;
  dlugosc: DlugoscBajki;
  name: string;
  age: number;
  gender: "BOY" | "GIRL" | "OTHER";
  favoriteColor?: string | null;
  favoriteAnimal?: string | null;
  interests: string[];
  moral?: string | null;
  dodatkowe?: string | null;
}

export interface GeneratorOutput {
  tytul: string;
  opis: string;
  tresc: string;
}

// ---------------------------------------------------------------------------
// Prosty deterministyczny generator liczb losowych (LCG)
// ---------------------------------------------------------------------------
function stworzRng(seed: number) {
  let s = Math.abs(seed) || 1;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function imieDoSeed(imie: string): number {
  let h = 5381;
  for (const c of imie) h = ((h << 5) + h + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function wybierz<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ---------------------------------------------------------------------------
// Podstawienia zmiennych
// ---------------------------------------------------------------------------
function zastap(
  tekst: string,
  zmienne: Record<string, string>
): string {
  return tekst.replace(/\{(\w+)\}/g, (_, k) => zmienne[k] ?? `{${k}}`);
}

// ---------------------------------------------------------------------------
// Adapter wiekowy — upraszcza/komplikuje zdania
// ---------------------------------------------------------------------------
function adaptujDlaWieku(akapity: string[], wiek: number): string[] {
  if (wiek <= 4) {
    // Dla najmłodszych: skróć każdy akapit do pierwszych 2 zdań
    return akapity.map((a) => {
      const zdania = a.match(/[^.!?]+[.!?]+/g) ?? [a];
      return zdania.slice(0, 3).join(" ").trim();
    });
  }
  return akapity;
}

// ---------------------------------------------------------------------------
// Banki szablonów — TYTUŁY
// ---------------------------------------------------------------------------
const TYTULY: Record<TematBajki, string[]> = {
  KOSMOS: [
    "Kosmiczna przygoda {name}",
    "{name} i tajemnicza gwiazda",
    "{name} ratuje Układ Słoneczny",
    "Gwiazdkowa wyprawa {name}",
  ],
  DZUNGLA: [
    "{name} w sercu dżungli",
    "Wielka wyprawa przez dżunglę",
    "{name} i przyjaciele z dżungli",
    "Tajemnica zielonej dżungli",
  ],
  JEDNOROZCE: [
    "{name} i zaczarowany jednorożec",
    "Kraina Tęczy czeka na {name}",
    "{name} i magia jednorożca",
    "Skarb Krainy Jednorożców",
  ],
  SMOKI: [
    "{name} i przyjazny smok",
    "Smokowa przygoda {name}",
    "{name} ratuje małego smoka",
    "Smok Kaziu i dzielny {name}",
  ],
  MORZE: [
    "{name} pod powierzchnią morza",
    "Podwodna przygoda {name}",
    "{name} i skarb głębokiego morza",
    "Przygoda na Błękitnym Oceanie",
  ],
  LAS: [
    "{name} w zaczarowanym lesie",
    "Leśna wyprawa {name}",
    "{name} i tajemnica starego dębu",
    "Przyjaciele z leśnej polany",
  ],
  PRZYJAZN: [
    "{name} i nowy przyjaciel",
    "Najlepszy przyjaciel {name}",
    "{name} i wielka niespodzianka",
    "Siła prawdziwej przyjaźni",
  ],
  DOBRANOC: [
    "{name} wyrusza do Krainy Snów",
    "Dobranoc, {name}",
    "Gwiazdka opowiada bajkę {name}",
    "Księżyc czeka na {name}",
  ],
};

// ---------------------------------------------------------------------------
// Banki szablonów — OTWARCIA
// ---------------------------------------------------------------------------
const OTWARCIA: Record<TematBajki, string[]> = {
  KOSMOS: [
    "Dawno, dawno temu, gdy niebo było usiane milionami gwiazd, mały astronauta imieniem {name} siedział na dachu swojego domu i patrzył w górę z wypiekami na twarzy. {name} marzył o podróży w kosmos odkąd pamiętał, a dziś — właśnie dziś — to marzenie miało się spełnić.",
    "W pewnej niezwykłej nocy, kiedy księżyc świecił jasno jak latarnia, {name} znalazł w ogrodzie coś zadziwiającego — małą srebrną rakietę, nie większą niż rower, z migającymi niebieskimi światełkami i otwartą klapą zapraszającą do środka.",
  ],
  DZUNGLA: [
    "Za siedmioma górami i siedmioma lasami rozciągała się najpiękniejsza dżungla na świecie. Pewnego słonecznego ranka {name} obudził się z postanowieniem: dziś wyrusza na wielką wyprawę i odkryje, co skrywa serce zielonego lasu.",
    "Kiedy {name} otworzył pewnego dnia magiczną starą księgę, z jej kartek wysypały się kolorowe motyle, a między nimi — mapa. Mapa prowadziła prosto do serca dżungli, gdzie czekał największy skarb, jaki można sobie wyobrazić.",
  ],
  JEDNOROZCE: [
    "W odległej Krainie Tęczy, gdzie niebo zawsze mieniło się wszystkimi kolorami, żył niezwykły jednorożec o imieniu Tęczan. Pewnego ranka doszły go słuchy, że dzielny podróżnik imieniem {name} szuka kogoś, kto pomoże mu dotrzeć do Zaczarowanego Ogrodu.",
    "Wszyscy w szkole mówili, że jednorożce to tylko bajki. Ale {name} wiedział swoje — i właśnie dlatego, gdy pewnego wieczoru za oknem sypialni pojawiło się coś lśniącego i różowego, {name} bez wahania wstał i wyjrzał przez okno.",
  ],
  SMOKI: [
    "W górskim królestwie, gdzie szczyty sięgały chmur, a w dolinach biegły krystaliczne strumyki, mieszkał mały smok o imieniu Kacper. Miał zielone łuski, złote oczka i jedno wielkie marzenie — znaleźć prawdziwego przyjaciela. I właśnie wtedy na górskiej ścieżce pojawił się {name}.",
    "Historia, którą zaraz opowiem, zaczyna się w miejscu, do którego nie każdy się odważa zapuścić — przed wejściem do Smoczej Jaskini. {name} stał właśnie przed nią, ściskając w dłoni latarkę i bijące ze strachu serce. Ale odwagi {name} nigdy nie brakowało.",
  ],
  MORZE: [
    "Morze w to magiczne południe było spokojne jak lustro, a słońce tańczyło na falach złotymi iskierkami. {name} siedział na brzegu i wypatrywał czegoś w głębinie, kiedy nagle woda się rozstąpiła i z piany wynurzyła mała, błękitna rybka z koroną na głowie.",
    "Wszyscy w rodzinie {name} kochali morze, ale nikt nie odważył się zajrzeć pod jego powierzchnię. Aż do dnia, gdy {name} znalazł w piasku muszlę z tajemniczym listem: Drogi odkrywco, czekamy na ciebie w podwodnym zamku. Podpis: Mieszkańcy Głębiny.",
  ],
  LAS: [
    "Na skraju wioski, tam gdzie kończyła się utwardzona droga, zaczynał się Zaczarowany Las. Starsi mówili, że kto wejdzie do lasu z czystym sercem, trafi na niesamowite przygody. {name} miał serce bardzo czyste i ciekawy umysł — więc pewnego ranka wziął koszyczek i ruszył między drzewa.",
    "{name} zawsze wiedział, że stary dąb na początku ścieżki leśnej skrywa tajemnicę. Był za gruby, żeby go objąć. Miał za wiele sęków, by policzyć. I szeleścił zawsze, nawet gdy nie wiał wiatr. Aż pewnego dnia dąb przemówił. Dosłownie.",
  ],
  PRZYJAZN: [
    "Było to zwykłe wtorkowe popołudnie, kiedy do sąsiedniej bramy podjechała wielka ciężarówka z meblami. {name} wyglądał przez okno i obserwował, jak na podwórko wchodzi ktoś nowy — chłopiec/dziewczynka mniej więcej w tym samym wieku, trzymający/trzymająca w rękach pudełko z dziurkami. W środku coś poruszało się i piszczało.",
    "Najgorsze w nowym miejscu jest to, że nie zna się nikogo. {name} wiedział to aż za dobrze, bo właśnie przeprowadził/przeprowadziła się do nowego miasta i w nowej szkole nie miał/nie miała jeszcze ani jednego przyjaciela. Aż do dnia, gdy na przerwie, przy starym kasztanowcu, coś dziwnego mu/jej wpadło na kolana.",
  ],
  DOBRANOC: [
    "Kiedy mama powiedziała dobranoc i zgasiła światło, {name} leżał/leżała w łóżku i patrzył/patrzyła w sufit. Przez okno do pokoju wpadał jasny blask księżyca, a wśród gwiazd {name} dostrzegł/dostrzegła pewną, bardzo jasną, mrugającą wesoło gwiazdkę. I nagle — gwiazdka powiedziała: Dobry wieczór, {name}. Chodź ze mną.",
    "Każdej nocy, tuż przed zaśnięciem, {name} zamykał/zamykała oczy i wyobrażał/wyobrażała sobie inne miejsca. Ale tej nocy, gdy zamknął/zamknęła oczy, coś było inaczej — zamiast czerni poczuł/poczuła lekki wiatr, usłyszał/usłyszała śpiew ptaków i... znalazł/znalazła się w Krainie Snów.",
  ],
};

// ---------------------------------------------------------------------------
// BLOKI PRZYGODY — po 4 paragrafy per temat, wybieramy 2-4 zależnie od długości
// ---------------------------------------------------------------------------
const PRZYGODY: Record<TematBajki, string[]> = {
  KOSMOS: [
    "Rakieta uniosła się w powietrze cicho i sprawnie, a {name} trzymał/trzymała mocno gałkę sterową. Za oknem iluminatora Ziemia robiła się coraz mniejsza — najpierw wielka jak talerz, potem jak piłka, potem jak mała niebieska kulka. Gdzieś w oddali błysnęła zielona planeta, a za nią jeszcze jedna, {color}, jakby ktoś pomalował ją specjalnie dla {name}.",
    "Nagle panel sterowania zamrugał na czerwono i rozległ się pisk alarmu. — Awaria silnika numer dwa! — zapiszczał komputerowy głos. {name} przejrzał/przejrzała mapy gwiezdne i odkrył/odkryła, że najbliższa stacja kosmiczna znajduje się przy gwiazdozbiorze Niedźwiedzicy Małej. Ale żeby tam dolecieć, trzeba było przelecieć przez Pas Meteorytów. Serce {name} zabiło szybciej.",
    "Za kometą {name} znalazł/znalazła małe stworzenie — okrągłe, zielone, z oczami jak dwa księżyce i wyraźnie przestraszone. — Zgubiłem/Zgubiłam statek! — piszczało stworzenie. — Nazywam się Bzip i lecę do swojej planety na urodziny mamy! {name} wiedział/wiedziała, że nie można zostawić nikogo samego w kosmosie. — Pomogę ci, Bzip — powiedział/powiedziała spokojnie.",
    "Na stacji kosmicznej poznali Kapitana Stellę — starszą panią astronautkę, która latała w kosmos od czterdziestu lat i znała każdą gwiazdę po imieniu. Stella spojrzała na mapę Bzipa, zmrużyła jedno oko i powiedziała: — Wasza planeta jest za tym różowym mgławicą. Lot zajmie dwie godziny. Ale musicie uważać na Śpiące Komety — one bardzo lubią drzemki właśnie na głównych trasach przelotu.",
    "Gdy minęli ostatnią kometę i wjechali w jasne światło słońca Bzipowej planety, wszyscy mieszkańcy wyszli na powitanie. Planeta pachniała jak wata cukrowa i cytryny jednocześnie, a niebo było fioletowe w złote cętki. — To najpiękniejsze miejsce, jakie widziałem/widziałam — szepnął/szepnęła {name} z zachwytem.",
  ],
  DZUNGLA: [
    "Las był gęsty i zielony, pełen śpiewu ptaków i szeleszczących liści. {name} szedł/szła ścieżką między ogromnymi drzewami, gdy nagle na gałęzi tuż nad głową pojawiła się kolorowa papuga. — Hej! — krzyknęła papuga. — Czego szukasz w tej dżungli? — Przygody — odpowiedział/odpowiedziała {name} bez chwili wahania. — Trafiłeś/Trafiłaś w dobre miejsce — zaśmiała się papuga.",
    "Papuga, która nazywała się Ara i znała każdy zakamarek dżungli, zaprowadziła {name} nad rzekę. Ale most z lin był zerwany, a po drugiej stronie, na kamiennym pagórku, siedziało małe słoniątko z uwięzioną nogą między kamieniami. Mazgaiło się cicho i wyglądało tak żałośnie, że {name} od razu postanowił/postanowiła coś zrobić.",
    "Nie było to łatwe — kamienie były ciężkie, a rzeka głośna. {name} szukał/szukała rozwiązania, kiedy Ara zawołała: — Patrz, tu rośnie wytrzymała liana! Można nią zbudować nowy most! Razem, {name} i Ara, związali lianę, zrobili prowizoryczną kładkę i ostrożnie przeszli na drugi brzeg. Małe słoniątko, gdy tylko poczuło się wolne, zaczęło trąbić z radości.",
    "Słoniątko miało na imię Pumba i znało sekret, który co prawda nie był tajemnicą całej dżungli, ale był za to najpiękniejszym miejscem, jakie {name} mógł/mogła sobie wyobrazić — ukryta wodospadowa grota, gdzie woda świeciła wieczorem niebieskim blaskiem, bo żyły w niej tysiące małych świetlnych rybek. — To nagroda dla tych, którzy mają dobre serce — powiedziało Pumba poważnie.",
    "Przed powrotem Pumba dał {name} mały kamyk. — To kamień dżungli. Gdy go ściśniesz i zamkniesz oczy, zawsze znajdziesz właściwą drogę. I pamiętaj: dżungla nigdy nie zapomina swoich przyjaciół. {name} ścisnął/ścisnęła kamyk mocno. Faktycznie, ścieżka do wyjścia sama pojawiła się przed oczami.",
  ],
  JEDNOROZCE: [
    "Jednorożec Tęczan był przepiękny — miał perłowy grzyf, złoty róg i kopyta, które przy każdym stąpnięciu zostawiały ślad z iskier. — Dokąd idziesz, {name}? — zapytał. — Do Zaczarowanego Ogrodu — odpowiedział/odpowiedziała {name}. — To niedaleko — powiedział Tęczan — ale droga wiedzie przez Las Złudzeń, gdzie wszystko bywa inne, niż się wydaje.",
    "Las Złudzeń był dziwny. Drzewa zmieniały kształty, kwiaty rozmawiały, a kamienie śpiewały piosenki. {name} poczuł/poczuła, że łatwo tu zgubić głowę. — Trzymaj się mojego grzyfu — powiedział Tęczan — i myśl o czymś, co sprawia ci radość. Dopóki myślisz o pięknych rzeczach, złudzenia ci nie zaszkodzą.",
    "W połowie drogi natknęli się na biedną wróżkę Błyszczkę, która wpadła do głębokiej kałuży (bardzo głębokiej, bo wróżki są malutkie) i nie mogła wyjść. Jej skrzydełka zmoknęły i nie nadawały się do latania. {name} delikatnie wyciągnął/wyciągnęła Błyszczkę i otulił/otuliła ją liściem łopianu, żeby wyschła. — Jesteś dobry/dobra — powiedziała Błyszczka. — Pokażę wam skrót do Ogrodu.",
    "Zaczarowany Ogród był jeszcze piękniejszy, niż {name} sobie wyobrażał/wyobrażała. Kwiaty świeciły własnym blaskiem, drzewa miały jabłka w kolorach tęczy, a w środku ogrodu stała studzienka spełniająca życzenia. Ale żeby skorzystać ze studzienki, trzeba było wykonać zadanie — zebrać trzy magiczne kwiaty i zanieść je do chorego jednorożca, który mieszkał za wzgórzem.",
    "Gdy {name} przyniósł/przyniosła kwiaty choremu jednorożcowi, ten natychmiast zdrowiał. Wyprostował się, zatrząsł grzywą i zarżał donośnie. — Wiedziałem, że ktoś dobrego serca do nas przyjedzie — powiedział. — W nagrodę spełnimy twoje jedno życzenie. {name} pomyślał/pomyślała chwilę. — Chcę, żeby moi bliscy byli zawsze szczęśliwi — powiedział/powiedziała.",
  ],
  SMOKI: [
    "Mały smok Kacper miał problem: jego skrzydła były jeszcze za słabe, żeby latać. Próbował codziennie, ale zawsze spadał na miękkie mchy. {name} patrzył/patrzyła na to ze współczuciem. — Nie martw się — powiedział/powiedziała. — Nauczę cię. Najpierw musisz uwierzyć, że dasz radę. — A czy ty umiesz latać? — zapytał Kacper. — Nie, ale znam kogoś, kto lata bardzo dobrze.",
    "Razem ruszyli na szczyt Srebrnej Góry, gdzie podobno mieszkała Stara Smocza Babcia, znana ze swojej mądrości i wyjątkowego bulionu z chmur (który wzmacniał skrzydła). Droga była kręta i kamienista, ale {name} co chwilę zatrzymywał/zatrzymywała się, żeby Kacper mógł odpocząć. Przy okazji zbierali kamyki — Kacper kolekcjonował wszystkie błyszczące.",
    "Smocza Babcia okazała się nieoczekiwanie miłą staruszką — tyle że wielkości dwupiętrowego domu i z nosem, z którego co chwilę buchał dymek. Wysłuchała ich historii, pokiwała głową i powiedziała: — Kacper, twoje skrzydła są mocniejsze, niż myślisz. Boisz się, a strach jest jak kamień przywiązany do ogona. Zostańcie na noc, a jutro zrobimy próbę.",
    "Rano Babcia dała Kacprowi do zjedzenia mały różowy cukierek (z chmury truskawkowej) i powiedziała: — Teraz biegnij ku przepaści i nie zatrzymuj się. {name} zacisnął/zacisnęła rękę, bo brzmiało to strasznie, ale Kacper z zamkniętymi oczami pobiegł i... rozłożył skrzydła. I poleciał. Naprawdę poleciał! Wydał z siebie mały, triumfujący płomyk ognia, a {name} skakał/skakała z radości na krawędzi.",
    "Kacper okrążył góry trzy razy, bo nie mógł się powstrzymać. Gdy wreszcie wylądował, był tak szczęśliwy, że przez pół godziny nie mógł przestać wydychać różowych iskier. — To ty mi w to uwierzyłeś/uwierzyłaś — powiedział do {name} — a bez wiary nigdy bym tego nie zrobił. {name} pogłaskał/pogłaskała go po zielonym nosie. Smocze nosy są aksamitne. To ciekawostka.",
  ],
  MORZE: [
    "Rybka z koroną (która nazywała się Perełka i była księżniczką podwodnego zamku) wyciągnęła małą złotą bańkę. — Dmuchnij w nią — powiedziała — a będziesz mógł/mogła oddychać pod wodą. {name} dmuchnął/dmuchnęła, bańka rozrosła się i otoczyła głowę jak hełm z powietrza. Wskoczyli razem do morza i {name} otworzył/otworzyła szeroko oczy ze zdumienia.",
    "Pod wodą wszystko było inne i piękniejsze. Rafy koralowe przypominały bajkowe zamki w kolorach {color}. Ryby w paskach i cętki mijały ich grzecznie, kłaniając się Perełce. Przy dnie pełzały rozgwiazdy, a morskie koniki kiwały głowami jak gdyby tańczyły. — Dlaczego nazywają to podwodnym światem? — zapytał/zapytała {name}. — Bo to cały oddzielny świat — odpowiedziała Perełka.",
    "Problemem okazało się to, że ktoś ukradł Magiczną Muszlę — najważniejszy przedmiot w podwodnym królestwie. Bez niej morze zaczynało tracić kolor. Już przy rafie koralowej można było zobaczyć, że niektóre korale rozbielały. Perełka patrzyła na to ze smutkiem. — Złodziej zostawił ślad z bąbelków — powiedział/powiedziała {name}, klęcząc przy dnie. — Idź za nim!",
    "Bąbelki prowadziły przez ciemny kanion, gdzie bioluminescencyjne meduzy oświetlały drogę blaskiem jak latarnie. {name} i Perełka szli ostrożnie, trzymając się razem, aż dotarli do groty za wielką skałą. Wewnątrz siedziała stara ośmiornica otoczona skradzionymi skarbami. Nie wyglądała groźnie — wyglądała na smutną.",
    "— Dlaczego ukradłaś muszlę? — zapytał/zapytała {name} łagodnie. — Bo jestem sama — powiedziała ośmiornica. — Wszyscy się mnie boją. Myślałam, że jak będę miała muszlę, to Perełka po nią przyjdzie i mnie odwiedzi. {name} spojrzał/spojrzała na Perełkę. Perełka wzięła ośmiornicę za jedną z jej ośmiu rąk. — Mogłaś po prostu zapytać, czy możesz przyjść na herbatę — powiedziała Perełka cicho.",
  ],
  LAS: [
    "Las przywitał {name} chłodnym cieniem i zapachem wilgotnej ziemi i grzybów. Ptaki śpiewały na powitanie, a wiewiórki obserwowały z ciekawością spośród gałęzi. Nagle {name} usłyszał cichy płacz dochodzący spod wielkiego korzenia. Ukucnął/Ukucnęła i zajrzał/zajrzała — w małej norce siedział malutki jeżyk, zwinięty w kulkę.",
    "— Zgubiłem mamę — szlochał jeżyk. — Szłam za motylem i nie zauważyłam, jak zaszłam za daleko. Mam na imię Kolczastek. {name} usiadł/usiadła przy norce. — Pomogę ci znaleźć mamę, Kolczastku. Jak wygląda? — Jak ja, tylko większa i pachnie leśnymi truskawkami — powiedział jeżyk i przestał płakać, bo poczuł się mniej sam.",
    "Razem ruszyli przez las. Kolczastek znał wiele leśnych zapachów, ale nie potrafił powiedzieć, w którą stronę iść. {name} natomiast potrafił/potrafiła czytać ślady — na miękkim mchu widać było małe kolczaste odciski łapek. — Tędy! — powiedział/powiedziała {name} i ruszył/ruszyła pewnym krokiem. Kolczastek dreptał z tyłu, mlaszcząc na widok każdego ślimaka.",
    "Przy starym dębie (tym, który szeleścił bez wiatru) zatrzymali się, bo droga się rozwidlała. W lewo wiodła w gęstwinę, w prawo — na słoneczną polanę. Wtedy dąb naprawdę się odezwał, tym razem po ludzku: — Idźcie na polanę. Tam truskawki. {name} i Kolczastek spojrzeli na siebie zdumieni, po czym bez słowa skręcili w prawo. Na polanie siedziała mama jeżyk i jadła truskawki.",
    "Spotkanie Kolczastka z mamą było głośne i wymagało dużo przytulania. Mama jeżyków dziękowała {name} tak gorąco, że aż się zarumieniała pod kolcami. Potem pokazała {name} sekretną ścieżkę prowadzącą z lasu wprost do wsi — skrót, który znały tylko leśne stworzenia i który przekazywały tylko tym, którym ufały. — Wracaj do nas kiedy chcesz — powiedziała mama jeżyków. — Las będzie na ciebie czekał.",
  ],
  PRZYJAZN: [
    "Nowy sąsiad/sąsiadka miał/miała na imię Franek/Frania. W pudełku z dziurkami okazało się być coś brązowego, miękkiego i ciepłego — świnka morska o imieniu Fasola. Franek/Frania trzymał/trzymała ją ostrożnie i patrzył/patrzyła na {name} nieśmiało. — Może chcesz ją pogłaskać? — zapytał/zapytała cicho. {name} wyciągnął/wyciągnęła rękę. Fasola obmąchała ją i uznała za odpowiednią.",
    "Przez pierwsze dni Franek/Frania nie wychodził/wychodziła z domu. {name} postanowił/postanowiła coś z tym zrobić i zaprosił/zaprosiła nowego sąsiada/sąsiadkę na największą w historii dzielnicy wyprawę: poszukiwanie zaginionej mapy do Parku Skarbów (bo tak {name} nazywał/nazywała stary park przy ulicy Lipowej).",
    "Franek/Frania okazał/okazała się kimś, kto zna się na wszystkim, co rośnie. Potrafił/Potrafiła odróżnić każde drzewo i znał/znała nazwy wszystkich kwiatów, a to okazało się przydatne, gdy trzeba było rozszyfrować zagadkę na mapie: Idź tam, gdzie kwitnie lipa, a przy jej korzeniach znajdziesz kolejną wskazówkę. — Tam! — krzyknął/krzyknęła Franek/Frania i pobiegł/pobiegła. {name} pobiegł/pobiegła za nim/nią i śmiał/śmiała się po drodze.",
    "Skarb był schowany pod starą ławką — blaszana puszka pełna kolorowych kamieni, kilku monet i notes. Na pierwszej stronie notesu ktoś napisał: Ten skarb należy do tych, którzy tu dotrą razem. Dopisz swoje imiona. Pod tym było już dwadzieścia innych imion. {name} i Franek/Frania dopisali swoje obok siebie, używając tego samego ołówka, który trzymali razem.",
    "W drodze powrotnej Franek/Frania powiedział/powiedziała coś, czego {name} się nie spodziewał/spodziewała: — W poprzednim mieście nie miałem/miałam ani jednego prawdziwego przyjaciela. Myślałem/myślałam, że tu będzie tak samo. {name} zastanowił/zastanowiła się przez chwilę. — Prawdziwy przyjaciel to ktoś, z kim chcesz szukać skarbów — powiedział/powiedziała w końcu. Franek/Frania uśmiechnął/uśmiechnęła się szeroko.",
  ],
  DOBRANOC: [
    "Gwiazdka miała imię Migotka i była odpowiedzialna za sny dzieci w całym miasteczku. Wzięła {name} za rękę i razem wzlecieli ponad drzewa, ponad chmury, aż dotarli do bramy Krainy Snów, zbudowanej ze srebrnego mglistego powietrza i dekorowanej kawałkami tęczy. — Każda noc to podróż — powiedziała Migotka — a ty już tu jesteś.",
    "Kraina Snów była niesamowita. Domy były z chmur, drogi z miękkich pudrowych tęcz, a zamiast wiatru wiał tu ciepły powiew pachnący ciasteczkami z wanilią. Napotkane stworzenia — małe gwiazdkowe misie — kłaniały się grzecznie i oferowały koce wykonane z mgły. {name} otulił/otuliła się takim kocem i poczuł/poczuła, jak zmęczenie znika.",
    "Migotka zaprowadziła {name} na Wzgórze Marzeń, skąd widać było cały świat jak na dłoni — mały, spokojny, lśniący w nocy milionem świateł. — Widzisz to światełko? — zapytała Migotka, wskazując małe okienko. — To twój dom. Mama i tata już śpią. Wszyscy, których kochasz, są bezpieczni. Możesz spokojnie odpocząć.",
    "Na Wzgórzu Marzeń rosło jedno szczególne drzewo — Drzewo Wspomnień, którego liście mieniły się złotem i srebrem. Każdy liść to jedno piękne wspomnienie. {name} delikatnie dotknął/dotknęła kilku — i poczuł/poczuła ciepło: lato na plaży, śmiech przy stole, ciepłe ramię mamy. — To twoje skarby — powiedziała Migotka. — Zawsze możesz tu wrócić.",
    "Gdy oczy zaczęły same się zamykać, Migotka ułożyła {name} na wielkim obłoku miękkim jak puch i przykryła kocem z tęczy. — Śpij spokojnie — szepnęła. — Jutro znów będzie piękny dzień, pełen przygód i śmiechu. A kiedy zaśniesz, ja zapalę dla ciebie swoją gwiazdkę, żebyś zawsze wiedział/wiedziała, że czuwam. Dobranoc, {name}.",
  ],
};

// ---------------------------------------------------------------------------
// ZAKOŃCZENIA per TON
// ---------------------------------------------------------------------------
const ZAKONCZENIA: Record<TonOpowiesci, string[]> = {
  WESOLA: [
    "Kiedy {name} wrócił/wróciła do domu, miał/miała pełne kieszenie wspomnień i policzki czerwone od śmiechu. Mama spytała: Co słychać? A {name} usiadł/usiadła i zaczął/zaczęła opowiadać — tak długo i tak wesoło, że oboje śmiali się do łez przy kolacji.",
    "{name} wskoczył/wskoczyła do łóżka z uśmiechem sięgającym do uszu. Przygoda się skończyła, ale {name} wiedział/wiedziała, że wspominać ją będzie przez całe życie — i że jutro z pewnością czeka kolejna.",
  ],
  PRZYGODOWA: [
    "{name} wrócił/wróciła do domu zmęczony/zmęczona, ale szczęśliwy/szczęśliwa. W kieszeni miał/miała dowód na to, że odwaga się opłaca — kamyk, piórko, albo po prostu nowe wspomnienie, które było warte każdego trudnego momentu.",
    "Leżąc już w łóżku, {name} patrzył/patrzyła w sufit i wiedział/wiedziała jedno: świat jest pełen przygód i czeka tylko na kogoś wystarczająco odważnego, żeby wyruszyć. A {name} był/była właśnie taki/taka.",
  ],
  USPOKAJAJACA: [
    "{name} zamknął/zamknęła oczy i poczuł/poczuła, że jest dokładnie tam, gdzie powinien/powinna być — bezpieczny/bezpieczna, kochany/kochana i spokojny/spokojna. Sen przyszedł cicho, jak przyjaciel, który nie musi pukać.",
    "W pokoju był spokój. Za oknem mruczał nocny wiatr, w domu pachniało domem, a {name} powoli, oddech po oddechu, odpływał/odpływała w ciepłe objęcia snu.",
  ],
  WZRUSZAJACA: [
    "{name} zrozumiał/zrozumiała tego dnia coś ważnego: że miłość i przyjaźń to nie są słowa. To są rzeczy, które czuje się w środku — ciepłe jak herbata w zimowy dzień i trwałe jak gwiazdy.",
    "Kiedy {name} zamknął/zamknęła oczy, na twarzy miał/miała spokojny uśmiech. Bo wiedział/wiedziała, że niezależnie od tego, co przyniesie jutro, nie będzie sam/sama. I to była najlepsza myśl, z jaką można zasnąć.",
  ],
  EDUKACYJNA: [
    "{name} wiedział/wiedziała, że to co przeżył/przeżyła, nauczyło go/ją czegoś, czego żadna książka nie mogła dać: że najważniejsze odkrycia robi się wtedy, gdy odważy się wyjść za drzwi z ciekawością większą niż strach.",
    "Leżąc w łóżku, {name} myślał/myślała o wszystkim, czego się dziś dowiedział/dowiedziała. Jutro chciał/chciała znaleźć w bibliotece książkę na ten temat i dowiedzieć się jeszcze więcej. Bo wiedza to nie ciężar — to skrzydła.",
  ],
};

// ---------------------------------------------------------------------------
// PODSUMOWANIA (opis bajki — 1–2 zdania)
// ---------------------------------------------------------------------------
const OPISY: Record<TematBajki, string> = {
  KOSMOS:    "Kosmiczna przygoda, podczas której {name} wyrusza między gwiazdy i odkrywa, że przyjaźń pokonuje każdą odległość.",
  DZUNGLA:   "Zielona wyprawa przez egzotyczną dżunglę, gdzie {name} uczy się, że odwaga i dobre serce otwierają każde drzwi.",
  JEDNOROZCE:"Magiczna podróż do Krainy Tęczy, gdzie {name} pomaga jednorożcom i odkrywa moc życzliwości.",
  SMOKI:     "Serdeczna historia o przyjaźni z małym smokiem, który uczy się latać dzięki wierze {name}.",
  MORZE:     "Podwodna przygoda pełna kolorów i zaskoczeń — {name} odkrywa, że nawet pod wodą ważne jest serce.",
  LAS:       "Ciepła leśna opowieść, w której {name} pomaga zagubionemu jeżykowi i poznaje sekretne ścieżki lasu.",
  PRZYJAZN:  "Wzruszająca historia o początku prawdziwej przyjaźni i odkryciu, że nie trzeba skarbów, by być bogatym.",
  DOBRANOC:  "Uspokajająca podróż do Krainy Snów, gdzie {name} odkrywa, że noc to czas pięknych marzeń i zasłużonego odpoczynku.",
};

// ---------------------------------------------------------------------------
// Liczba bloków przygody zależnie od długości
// ---------------------------------------------------------------------------
const ILOSC_AKAPITOW_PRZYGODY: Record<DlugoscBajki, number> = {
  SHORT: 2,
  MEDIUM: 3,
  LONG: 5,
};

// ---------------------------------------------------------------------------
// GŁÓWNA FUNKCJA GENERATORA
// ---------------------------------------------------------------------------
export function generujBajkeLokalna(input: GeneratorInput): GeneratorOutput {
  const {
    temat, ton, dlugosc, name, age, gender,
    favoriteColor, favoriteAnimal, moral, dodatkowe,
  } = input;

  // Zmienne szablonu
  const color  = favoriteColor  ?? "złotym";
  const animal = favoriteAnimal ?? "przyjaciel";

  const zmienne: Record<string, string> = { name, color, animal };

  // Generator losowości — seedowany imieniem + aktualną chwilą (minuty)
  const seed = imieDoSeed(name) + Math.floor(Date.now() / 60000);
  const rng  = stworzRng(seed);

  // --- TYTUŁ ---
  const tytulSzablon = wybierz(TYTULY[temat], rng);
  const tytul = zastap(tytulSzablon, zmienne);

  // --- OTWARCIE ---
  const otwarcieAkapit = zastap(wybierz(OTWARCIA[temat], rng), zmienne);

  // --- PRZYGODA ---
  const przygodyPuli = [...PRZYGODY[temat]];
  const ileAkapitow  = ILOSC_AKAPITOW_PRZYGODY[dlugosc];

  // Przetasuj i weź potrzebną ilość
  const wybranePrzygody: string[] = [];
  for (let i = 0; i < ileAkapitow && przygodyPuli.length > 0; i++) {
    const idx = Math.floor(rng() * przygodyPuli.length);
    wybranePrzygody.push(zastap(przygodyPuli.splice(idx, 1)[0], zmienne));
  }

  // --- ZAKOŃCZENIE ---
  const zakonczenieAkapit = zastap(wybierz(ZAKONCZENIA[ton], rng), zmienne);

  // --- MORAŁ (akapit opcjonalny) ---
  let moralAkapit = "";
  if (moral) {
    moralAkapit = `A morał tej historii jest taki: ${moral}.`;
  }

  // --- SKLEJENIE TREŚCI ---
  const wszystkieAkapity = [
    otwarcieAkapit,
    ...wybranePrzygody,
    zakonczenieAkapit,
    ...(moralAkapit ? [moralAkapit] : []),
  ];

  // Dodaj wzmianki o ulubionym zwierzęciu jeśli brak w przygodach
  // (tylko dla dłuższych bajek gdzie jest miejsce)
  if (favoriteAnimal && dlugosc !== "SHORT" && !wszystkieAkapity.some(a => a.includes(animal))) {
    const wstawka = `Przy okazji {name} zauważył/zauważyła zwierzątko bardzo podobne do swojego ulubionego ${animal} — co sprawiło, że serce podskoczyło mu/jej z radości.`;
    wszystkieAkapity.splice(2, 0, zastap(wstawka, zmienne));
  }

  // Adaptacja wiekowa
  const adaptowane = adaptujDlaWieku(wszystkieAkapity, age);

  // Dodatkowe szczegóły z formularza — krótka wzmianka w 2. akapicie
  let tresc = adaptowane.join("\n\n");
  if (dodatkowe && dlugosc !== "SHORT") {
    const wzmianka = `\n\n(W tej historii warto wiedzieć: ${dodatkowe.toLowerCase().replace(/\.+$/, "")})`;
    // Dodaj na końcu jako narratorski komentarz
    tresc += wzmianka;
  }

  // --- OPIS ---
  const opis = zastap(OPISY[temat], zmienne);

  return { tytul, opis, tresc };
}
