"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function SubmitButton({ children, className }: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`btn-cta w-full justify-center ${pending ? "opacity-70 cursor-not-allowed" : ""} ${className ?? ""}`}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Ładowanie…
        </>
      ) : (
        children
      )}
    </button>
  );
}
