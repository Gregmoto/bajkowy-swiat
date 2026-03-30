import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page:     number;
  total:    number;
  perPage:  number;
  baseHref: string;   // e.g. "/admin/bajki?status=PUBLISHED&"  — trailing & or ?
}

export default function Pagination({ page, total, perPage, baseHref }: Props) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const sep = baseHref.includes("?") ? "&" : "?";

  function href(p: number) {
    return `${baseHref}${baseHref.endsWith("&") || baseHref.endsWith("?") ? "" : sep}page=${p}`;
  }

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex items-center justify-between px-1 pt-4">
      <p className="text-xs text-slate-400 tabular-nums">
        Strona {page} z {totalPages} · {total.toLocaleString("pl-PL")} wyników
      </p>
      <div className="flex items-center gap-1">
        <Link
          href={href(page - 1)}
          aria-disabled={page <= 1}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border text-slate-600 transition-colors ${
            page <= 1
              ? "pointer-events-none border-slate-100 text-slate-300"
              : "border-slate-200 hover:bg-slate-50"
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-xs text-slate-400">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={href(p as number)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold transition-colors ${
                p === page
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p}
            </Link>
          )
        )}

        <Link
          href={href(page + 1)}
          aria-disabled={page >= totalPages}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border text-slate-600 transition-colors ${
            page >= totalPages
              ? "pointer-events-none border-slate-100 text-slate-300"
              : "border-slate-200 hover:bg-slate-50"
          }`}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
