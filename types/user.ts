// Typy związane z użytkownikiem i subskrypcją
export interface User {
  id: string;
  name: string;
  email: string;
  plan: "free" | "premium";
  created: string;
}

export interface PlanLimity {
  maxBajekMiesieczne: number;
  maxDzieci: number;
  historiaZawsze: boolean;
}

export const PLANY: Record<User["plan"], PlanLimity> = {
  free: { maxBajekMiesieczne: 5, maxDzieci: 2, historiaZawsze: false },
  premium: { maxBajekMiesieczne: Infinity, maxDzieci: Infinity, historiaZawsze: true },
};
