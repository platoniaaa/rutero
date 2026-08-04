/**
 * Ilustraciones de paisajes chilenos, dibujadas con la paleta Cordillera.
 * Son SVG propios en vez de fotos de stock: pesan poco, escalan sin perder
 * nitidez y no arrastran licencias de terceros. Si más adelante hay fotos
 * reales de los viajes, reemplazan estos bloques sin tocar el layout.
 */

import { cn } from "@/lib/utils";

/** Siluetas del hero. Se declaran aparte porque cada una se usa dos veces:
 *  una para pintar el cerro y otra como máscara de la nieve. */
const CORDON_MEDIO =
  "M0 352 L58 306 L96 322 L146 268 L182 292 L214 262 L252 300 L300 244 L338 276 L372 258 L420 306 L468 272 L512 312 L562 268 L604 296 L652 258 L706 300 L752 274 L800 298 L800 500 L0 500 Z";

const MACIZO =
  "M0 410 L64 358 L104 378 L152 330 L188 352 L238 292 L276 324 L310 306 L352 356 L398 320 L442 360 L494 314 L540 348 L590 300 L640 344 L692 312 L742 350 L800 322 L800 500 L0 500 Z";

/** Cota de nieve: borde irregular que baja por las quebradas. */
const COTA_NIEVE_MEDIO =
  "M0 0 L800 0 L800 292 L752 284 L706 306 L652 272 L604 302 L562 280 L512 316 L468 284 L420 310 L372 270 L338 284 L300 258 L252 306 L214 276 L182 300 L146 282 L96 328 L58 318 L0 348 Z";

const COTA_NIEVE_MACIZO =
  "M0 0 L800 0 L800 330 L742 356 L692 320 L640 350 L590 310 L540 354 L494 324 L442 366 L398 328 L352 360 L310 314 L276 332 L238 304 L188 358 L152 340 L104 384 L64 366 L0 418 Z";

/** Cordillera nevada con lago al pie. La pieza principal del hero. */
export function PaisajeCordillera({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 500"
      /* Anclado abajo: en formatos anchos se recorta el cielo, no el paisaje. */
      preserveAspectRatio="xMidYMax slice"
      className={cn("size-full", className)}
      role="img"
      aria-label="Ilustración de la cordillera de los Andes con nieve y un lago al pie"
    >
      <defs>
        <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#072a41" />
          <stop offset="55%" stopColor="#0b3c5d" />
          <stop offset="100%" stopColor="#1a5a80" />
        </linearGradient>
        {/* Radial y no lineal: con lineal el borde de la elipse queda a la
            vista como un arco duro. */}
        <radialGradient id="sol" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f4a259" stopOpacity="0.6" />
          <stop offset="45%" stopColor="#f4a259" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#f4a259" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lago" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d7874" />
          <stop offset="100%" stopColor="#0f4a48" />
        </linearGradient>

        <clipPath id="siluetaMedio">
          <path d={CORDON_MEDIO} />
        </clipPath>
        <clipPath id="siluetaMacizo">
          <path d={MACIZO} />
        </clipPath>
      </defs>

      <rect width="800" height="500" fill="url(#cielo)" />

      {/* Luz de atardecer detrás de las cumbres */}
      <ellipse cx="580" cy="330" rx="360" ry="230" fill="url(#sol)" />

      {/* Estrellas, apenas */}
      {[
        [90, 58],
        [178, 104],
        [302, 44],
        [418, 92],
        [664, 66],
        [732, 128],
        [516, 36],
        [246, 148],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={i % 3 === 0 ? 1.7 : 1.1}
          fill="#f7f9fb"
          opacity={i % 2 ? 0.4 : 0.6}
        />
      ))}

      {/* Cordón lejano, apenas insinuado por la neblina */}
      <path
        d="M0 316 L74 268 L128 296 L196 240 L262 284 L330 232 L410 290 L474 250 L556 300 L630 254 L712 302 L800 262 L800 500 L0 500 Z"
        fill="#1a5a80"
        opacity="0.45"
      />

      {/* Cordón intermedio: cumbres irregulares, no triángulos */}
      <path d={CORDON_MEDIO} fill="#134f76" />
      {/* La nieve es una cota recortada por la silueta del cerro, igual que en
          la montaña real: cubre todo lo que está sobre cierta altura y baja por
          las quebradas. Recortar evita los parches flotantes. */}
      <g clipPath="url(#siluetaMedio)">
        <path d={COTA_NIEVE_MEDIO} fill="#dce8f0" opacity="0.5" />
      </g>

      {/* Cordón delantero, el macizo principal */}
      <path d={MACIZO} fill="#0a3450" />
      <g clipPath="url(#siluetaMacizo)">
        <path d={COTA_NIEVE_MACIZO} fill="#f7f9fb" opacity="0.9" />
        {/* Sombra en la cara oriente de cada cumbre nevada */}
        <path d={COTA_NIEVE_MACIZO} fill="#8fa9bd" opacity="0.35" transform="translate(9 5)" />
      </g>

      {/* Neblina en la base del macizo */}
      <path
        d="M0 404 C 140 386, 260 414, 400 400 C 540 386, 660 412, 800 398 L800 440 L0 440 Z"
        fill="#1a5a80"
        opacity="0.28"
      />

      {/* Lago */}
      <path d="M0 434 L800 448 L800 500 L0 500 Z" fill="url(#lago)" />
      {/* Reflejo del sol en el agua */}
      <g opacity="0.3">
        {[454, 468, 482, 496].map((y, i) => (
          <rect
            key={y}
            x={540 - i * 16}
            y={y}
            width={86 + i * 30}
            height="3"
            rx="1.5"
            fill="#f4a259"
          />
        ))}
      </g>
    </svg>
  );
}

/** Silueta de cordillera para usar como cenefa entre secciones. */
export function CenefaCordillera({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 80"
      preserveAspectRatio="none"
      className={cn("h-12 w-full", className)}
      aria-hidden
    >
      <path
        d="M0 80 L60 44 L118 66 L190 26 L262 62 L330 34 L410 70 L486 40 L560 68 L640 30 L720 64 L800 38 L880 72 L960 44 L1040 68 L1120 36 L1200 60 L1200 80 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Valle con camino: acompaña el bloque de "cómo funciona". */
export function PaisajeValle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 400"
      preserveAspectRatio="xMidYMid slice"
      className={cn("size-full", className)}
      role="img"
      aria-label="Ilustración de un valle con un camino que sube hacia la montaña"
    >
      <defs>
        <linearGradient id="cieloValle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a5a80" />
          <stop offset="100%" stopColor="#4d8db3" />
        </linearGradient>
      </defs>

      <rect width="600" height="400" fill="url(#cieloValle)" />
      <circle cx="470" cy="88" r="34" fill="#f4a259" opacity="0.9" />

      {/* Cerros del fondo */}
      <path d="M0 214 L120 130 L226 200 L330 122 L440 196 L540 146 L600 184 L600 400 L0 400 Z" fill="#12496e" />
      <path d="M330 122 L364 154 L342 162 L314 142 Z" fill="#f7f9fb" opacity="0.8" />

      {/* Laderas */}
      <path d="M0 268 L160 206 L300 262 L440 208 L600 258 L600 400 L0 400 Z" fill="#1d7874" />
      <path d="M0 316 L180 268 L360 318 L600 272 L600 400 L0 400 Z" fill="#17615e" />

      {/* Camino que sube */}
      <path
        d="M262 400 C 292 344, 250 318, 288 288 C 320 262, 292 240, 322 222"
        stroke="#e8eef2"
        strokeWidth="26"
        fill="none"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M262 400 C 292 344, 250 318, 288 288 C 320 262, 292 240, 322 222"
        stroke="#f4a259"
        strokeWidth="2"
        strokeDasharray="10 12"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Costa: la contraparte del norte y el litoral. */
export function PaisajeCosta({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 400"
      preserveAspectRatio="xMidYMid slice"
      className={cn("size-full", className)}
      role="img"
      aria-label="Ilustración de la costa del Pacífico al atardecer"
    >
      <defs>
        <linearGradient id="cieloCosta" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b3c5d" />
          <stop offset="60%" stopColor="#8a6a7a" />
          <stop offset="100%" stopColor="#f4a259" />
        </linearGradient>
        <linearGradient id="mar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4a259" stopOpacity="0.7" />
          <stop offset="35%" stopColor="#1d7874" />
          <stop offset="100%" stopColor="#0b3c5d" />
        </linearGradient>
      </defs>

      <rect width="600" height="400" fill="url(#cieloCosta)" />
      <circle cx="300" cy="232" r="42" fill="#f7d9b0" opacity="0.95" />

      {/* Mar */}
      <rect y="234" width="600" height="166" fill="url(#mar)" />
      {/* Reflejo */}
      <g opacity="0.4">
        {[252, 268, 286, 306, 330].map((y, i) => (
          <rect key={y} x={272 - i * 12} y={y} width={56 + i * 24} height="3" rx="1.5" fill="#f7d9b0" />
        ))}
      </g>

      {/* Roqueríos */}
      <path d="M0 300 L64 258 L118 296 L162 274 L206 310 L0 400 Z" fill="#072a41" />
      <path d="M600 288 L540 250 L486 292 L436 266 L392 306 L600 400 Z" fill="#072a41" />
      {/* Espuma */}
      <path
        d="M150 344 C 210 336, 260 352, 320 344 C 380 336, 430 350, 480 342"
        stroke="#f7f9fb"
        strokeWidth="3"
        fill="none"
        opacity="0.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
