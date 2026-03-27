// Widget powitalny — wyświetla imię użytkownika i datę
export default function PowitanieWidget() {
  const godzina = new Date().getHours();
  const powitanie = godzina < 12 ? "Dzień dobry" : godzina < 18 ? "Dzień dobry" : "Dobry wieczór";

  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold">{powitanie}! 👋</h1>
      <p className="text-muted-foreground">
        Co dzisiaj stworzymy dla Twojego dziecka?
      </p>
    </div>
  );
}
