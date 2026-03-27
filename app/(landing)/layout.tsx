import Nawigacja from "@/components/shared/Nawigacja";
import StopkaStrony from "@/components/shared/StopkaStrony";

// Layout publiczny: Nawigacja marketingowa + stopka
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nawigacja wariant="publiczna" />
      <main>{children}</main>
      <StopkaStrony />
    </>
  );
}
