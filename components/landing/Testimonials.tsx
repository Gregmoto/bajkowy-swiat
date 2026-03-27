// Sekcja opinii rodziców
const OPINIE = [
  { imie: "Anna K.", tekst: "Moja córka uwielbia bajki o sobie! Za każdym razem jest zachwycona.", avatar: "👩" },
  { imie: "Marek W.", tekst: "Świetny pomysł na wieczorne czytanie. Syn czeka na nową bajkę każdego dnia.", avatar: "👨" },
  { imie: "Kasia B.", tekst: "Jakość bajek jest niesamowita. Polecam każdemu rodzicowi!", avatar: "👩‍🦰" },
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container space-y-10">
        <h2 className="text-3xl font-bold text-center">Co mówią rodzice?</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {OPINIE.map((opinia) => (
            <div key={opinia.imie} className="rounded-xl border bg-card p-6 space-y-4">
              <p className="text-muted-foreground italic">&ldquo;{opinia.tekst}&rdquo;</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{opinia.avatar}</span>
                <span className="font-medium">{opinia.imie}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
