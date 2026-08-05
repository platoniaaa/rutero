import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NoEncontrada() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-line bg-muted px-6 py-16 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-surface text-meta">
        <Compass className="size-5" aria-hidden />
      </span>
      <p className="font-display text-display-sm text-ink">
        No encontramos esta página
      </p>
      <p className="max-w-md text-sm text-meta">
        El enlace puede estar mal escrito, o apuntar a algo que ya no existe.
      </p>
      <Button asChild>
        <Link href="/">Ir al inicio</Link>
      </Button>
    </div>
  );
}
