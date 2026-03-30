"use client";

import { useTransition } from "react";
import { Flag } from "lucide-react";
import { flagStoryAdmin } from "@/lib/actions/admin";

interface Props {
  storyId: string;
  flagged: boolean;
}

export default function StoryFlagButton({ storyId, flagged }: Props) {
  const [pending, startTransition] = useTransition();

  function handle() {
    startTransition(async () => {
      await flagStoryAdmin(storyId, !flagged);
    });
  }

  return (
    <button
      onClick={handle}
      disabled={pending}
      title={flagged ? "Odznacz moderację" : "Oznacz do moderacji"}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
        flagged
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-700"
      } ${pending ? "opacity-50 cursor-wait" : ""}`}
    >
      <Flag className={`h-3.5 w-3.5 ${flagged ? "fill-red-400" : ""}`} />
      {flagged ? "Do moderacji" : "Oznacz"}
    </button>
  );
}
