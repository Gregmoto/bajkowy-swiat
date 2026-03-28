interface Props {
  imie: string;
}

export default function PowitanieWidget({ imie }: Props) {
  const godzina = new Date().getHours();
  const powitanie =
    godzina < 6
      ? "Dobranoc"
      : godzina < 12
      ? "Dzień dobry"
      : godzina < 18
      ? "Dzień dobry"
      : "Dobry wieczór";

  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-black">
        {powitanie}, {imie}! 👋
      </h1>
      <p className="text-muted-foreground">
        Co dzisiaj stworzymy dla Twojego dziecka?
      </p>
    </div>
  );
}
