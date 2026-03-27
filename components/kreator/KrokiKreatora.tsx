// Wskaźnik kroków kreatora bajki — pokazuje postęp użytkownika
const KROKI = [
  { nr: 1, label: "Dziecko" },
  { nr: 2, label: "Preferencje" },
  { nr: 3, label: "Bajka" },
];

interface Props {
  aktywnyKrok?: number;
}

export default function KrokiKreatora({ aktywnyKrok = 1 }: Props) {
  return (
    <div className="flex items-center justify-center gap-2">
      {KROKI.map((krok, i) => (
        <div key={krok.nr} className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold
            ${krok.nr <= aktywnyKrok ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {krok.nr}
          </div>
          <span className={`text-sm hidden sm:inline ${krok.nr === aktywnyKrok ? "font-semibold" : "text-muted-foreground"}`}>
            {krok.label}
          </span>
          {i < KROKI.length - 1 && (
            <div className={`h-px w-8 ${krok.nr < aktywnyKrok ? "bg-primary" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
