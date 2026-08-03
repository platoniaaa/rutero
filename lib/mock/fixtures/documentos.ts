import {
  DOCS_CONDUCTOR,
  DOCS_CUENTA,
  DOCS_SIN_VENCIMIENTO as SIN_VENCIMIENTO,
  docsDeVehiculo,
} from "@/lib/documentos-requeridos";
import type { Documento, EstadoDocumento, TipoDocumento } from "@/lib/mock/types";

import { VEHICULOS } from "./cuentas";
import { dias } from "./tiempo";

/**
 * Días hasta el vencimiento por documento. Un número negativo deja el documento
 * vencido, y bajo 30 lo deja en ámbar. Lo que no aparece acá usa el valor por
 * defecto del perfil.
 */
type Perfil = {
  estado?: EstadoDocumento;
  porDefecto: number;
  excepciones?: Partial<Record<TipoDocumento, number>>;
  /** Documentos que la cuenta todavía no sube. */
  faltantes?: TipoDocumento[];
  motivoRechazo?: string;
};

const PERFIL_CUENTA: Record<string, Perfil> = {
  // Al día y con holgura.
  "tr-1": { porDefecto: 320 },
  "tr-2": { porDefecto: 275 },
  "tr-3": { porDefecto: 400 },
  "tr-4": { porDefecto: 210 },

  // El seguro se le vence este mes: badge ámbar, todavía no bloquea.
  "tr-5": { porDefecto: 180, excepciones: { seguro_responsabilidad_civil: 18 } },

  // Cuenta en revisión: subió todo pero el admin no lo ha aprobado.
  "tr-6": { estado: "pendiente", porDefecto: 240 },

  // Caso de prueba del criterio de aceptación: DS 80 vencido, bloquea postular.
  "tr-7": {
    porDefecto: 150,
    excepciones: { inscripcion_ds80_servicio: -23, seguro_personal_conduccion: 9 },
  },

  // Cuenta nueva que no ha subido nada.
  "tr-8": {
    porDefecto: 365,
    faltantes: [
      "rut_erut",
      "inicio_actividades",
      "inscripcion_ds80_servicio",
      "seguro_responsabilidad_civil",
      "seguro_personal_conduccion",
    ],
  },

  "tr-9": { porDefecto: 290 },
  "tr-10": { porDefecto: 500 },
  "tr-11": { porDefecto: 260, excepciones: { seguro_personal_conduccion: 26 } },
  "tr-12": { porDefecto: 340 },
};

const PERFIL_VEHICULO: Record<string, Perfil> = {
  "ve-1": { porDefecto: 300 },
  "ve-2": { porDefecto: 190, excepciones: { revision_tecnica: 22 } },
  "ve-3": { porDefecto: 350 },
  "ve-4": { porDefecto: 240 },
  "ve-5": { porDefecto: 160, excepciones: { soap: 14 } },
  "ve-6": { estado: "pendiente", porDefecto: 220 },

  // El vehículo del transportista con DS 80 vencido tiene además la revisión
  // técnica caída.
  "ve-7": { porDefecto: 130, excepciones: { revision_tecnica: -8 } },

  "ve-8": {
    porDefecto: 400,
    faltantes: [
      "inscripcion_ds80_vehiculo",
      "permiso_circulacion",
      "revision_tecnica",
      "soap",
      "certificado_emisiones",
      "tacografo",
    ],
  },
  "ve-9": { porDefecto: 280 },
  "ve-10": { porDefecto: 520 },
  "ve-11": { porDefecto: 310 },
  "ve-12": { porDefecto: 175, excepciones: { permiso_circulacion: 11 } },
  "ve-13": { porDefecto: 265 },
  "ve-14": { porDefecto: 200 },
  "ve-15": { porDefecto: 330 },
  "ve-16": { porDefecto: 245 },
  "ve-17": {
    porDefecto: 120,
    estado: "rechazado",
    motivoRechazo: "La foto de la revisión técnica está cortada. Vuelve a subirla completa.",
    excepciones: { revision_tecnica: 60 },
  },
  "ve-18": { porDefecto: 420 },
  "ve-19": { porDefecto: 295 },
  "ve-20": { porDefecto: 480 },
};

const PERFIL_CONDUCTOR: Record<string, Perfil> = {
  "co-1": { porDefecto: 420, excepciones: { licencia_profesional: 420 } },
  "co-2": { porDefecto: 190, excepciones: { licencia_profesional: 190 } },
  "co-3": { porDefecto: 610, excepciones: { licencia_profesional: 610 } },
  "co-4": { porDefecto: 95, excepciones: { licencia_profesional: 95 } },
  "co-5": { porDefecto: 200, excepciones: { licencia_profesional: 21 } },
  "co-6": { estado: "pendiente", porDefecto: 310 },

  // Licencia profesional vencida.
  "co-7": { porDefecto: 150, excepciones: { licencia_profesional: -12 } },

  "co-8": {
    porDefecto: 540,
    faltantes: [
      "licencia_profesional",
      "certificado_antecedentes",
      "hoja_vida_conductor",
    ],
  },
  "co-9": { porDefecto: 260, excepciones: { licencia_profesional: 260 } },
  "co-10": { porDefecto: 480, excepciones: { licencia_profesional: 480 } },
  "co-11": { porDefecto: 205, excepciones: { licencia_profesional: 205 } },
  "co-12": { porDefecto: 180, excepciones: { licencia_profesional: 27 } },
  "co-13": { porDefecto: 700, excepciones: { licencia_profesional: 700 } },
  "co-14": { porDefecto: 150, excepciones: { licencia_profesional: 150 } },
  "co-15": { porDefecto: 380, excepciones: { licencia_profesional: 380 } },
  "co-16": { porDefecto: 88, excepciones: { licencia_profesional: 88 } },
  "co-17": { porDefecto: 240, excepciones: { licencia_profesional: 240 } },
  "co-18": { porDefecto: 330, excepciones: { licencia_profesional: 330 } },

  // Licencia por vencer en menos de dos semanas.
  "co-19": { porDefecto: 300, excepciones: { licencia_profesional: 12 } },

  "co-20": { porDefecto: 460, excepciones: { licencia_profesional: 460 } },
};

function crearGrupo(
  hoy: Date,
  propietarioId: string,
  tipos: TipoDocumento[],
  perfil: Perfil,
): Documento[] {
  return tipos
    .filter((tipo) => !perfil.faltantes?.includes(tipo))
    .map((tipo) => {
      const offset = perfil.excepciones?.[tipo] ?? perfil.porDefecto;
      const sinVencimiento = SIN_VENCIMIENTO.includes(tipo);
      const estadoBase = perfil.estado ?? "aprobado";

      return {
        id: `doc-${propietarioId}-${tipo}`,
        propietarioId,
        tipo,
        archivo: `/mock/documentos/${propietarioId}-${tipo}.jpg`,
        // Emitido un año antes de vencer, o hace un año si no vence.
        fechaEmision: dias(hoy, sinVencimiento ? -400 : offset - 365),
        fechaVencimiento: sinVencimiento ? undefined : dias(hoy, offset),
        estado: estadoBase,
        motivoRechazo:
          estadoBase === "rechazado" ? perfil.motivoRechazo : undefined,
      } satisfies Documento;
    });
}

export function crearDocumentos(hoy: Date): Documento[] {
  const documentos: Documento[] = [];

  for (const [carrierId, perfil] of Object.entries(PERFIL_CUENTA)) {
    documentos.push(...crearGrupo(hoy, carrierId, DOCS_CUENTA, perfil));
  }

  for (const vehiculo of VEHICULOS) {
    const perfil = PERFIL_VEHICULO[vehiculo.id];
    if (!perfil) continue;
    documentos.push(
      ...crearGrupo(hoy, vehiculo.id, docsDeVehiculo(vehiculo.interurbano), perfil),
    );
  }

  for (const [conductorId, perfil] of Object.entries(PERFIL_CONDUCTOR)) {
    documentos.push(...crearGrupo(hoy, conductorId, DOCS_CONDUCTOR, perfil));
  }

  return documentos;
}
