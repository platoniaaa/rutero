"use client";

import { useState } from "react";
import { Info, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRutero } from "@/lib/mock/store";
import type { Id, Mensaje } from "@/lib/mock/types";
import { formatearFecha } from "@/lib/utils/format";
import { AVISO_FUGA, contieneTelefono } from "@/lib/utils/rules";
import { cn } from "@/lib/utils";

/**
 * Chat del viaje. Cuando alguien escribe algo que parece un teléfono, aparece
 * el aviso suave: el respaldo del viaje solo existe dentro de Rutero.
 */
export function ChatViaje({
  viajeId,
  mensajes,
  rol,
  autorId,
  nombreContraparte,
  habilitado,
}: {
  viajeId: Id;
  mensajes: Mensaje[];
  rol: "agencia" | "transportista";
  autorId: Id;
  nombreContraparte: string;
  habilitado: boolean;
}) {
  const enviarMensaje = useRutero((s) => s.enviarMensaje);
  const [texto, setTexto] = useState("");

  const avisarFuga = contieneTelefono(texto);

  function enviar() {
    const limpio = texto.trim();
    if (!limpio) return;
    enviarMensaje({ viajeId, autorRol: rol, autorId, texto: limpio });
    setTexto("");
  }

  return (
    <section className="flex flex-col rounded-lg border border-line bg-surface">
      <div className="border-b border-line p-4">
        <h2 className="font-display text-display-sm text-ink">
          Chat con {nombreContraparte}
        </h2>
        <p className="mt-0.5 text-xs text-meta">
          Todo lo que se acuerde acá queda registrado y sirve como respaldo si hay
          una disputa.
        </p>
      </div>

      <ol className="flex max-h-96 flex-col gap-3 overflow-y-auto p-4">
        {mensajes.length === 0 && (
          <li className="py-6 text-center text-sm text-meta">
            Todavía no hay mensajes. Escribe el primero para coordinar la salida.
          </li>
        )}
        {mensajes.map((m) => {
          const propio = m.autorRol === rol;
          return (
            <li
              key={m.id}
              className={cn("flex flex-col gap-1", propio ? "items-end" : "items-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                  propio
                    ? "bg-ink text-white"
                    : "border border-line bg-muted text-ink",
                )}
              >
                {m.texto}
              </div>
              <span className="font-mono text-xs tabular-nums text-meta">
                {formatearFecha(m.createdAt)}
              </span>
              {m.avisoFugaMostrado && (
                <p className="flex max-w-[85%] items-start gap-1.5 rounded border border-signal/40 bg-signal-soft px-2 py-1 text-xs text-[#8a5b00]">
                  <Info className="mt-0.5 size-3 shrink-0" aria-hidden />
                  {AVISO_FUGA}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="border-t border-line p-4">
        {habilitado ? (
          <>
            <Textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) enviar();
              }}
              placeholder="Escribe un mensaje…"
              rows={2}
              aria-label="Mensaje"
            />
            {avisarFuga && (
              <p
                role="status"
                className="mt-2 flex items-start gap-2 rounded border border-signal/40 bg-signal-soft px-3 py-2 text-sm text-[#8a5b00]"
              >
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                {AVISO_FUGA}
              </p>
            )}
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-meta">Ctrl + Enter para enviar</span>
              <Button onClick={enviar} disabled={!texto.trim()}>
                <Send className="size-4" aria-hidden />
                Enviar
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-meta">
            El chat se abre cuando el pago entra al escrow.
          </p>
        )}
      </div>
    </section>
  );
}
