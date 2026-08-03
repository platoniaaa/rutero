import type {
  TipoDocumento,
  TipoDocumentoConductor,
  TipoDocumentoCuenta,
  TipoDocumentoVehiculo,
} from "@/lib/mock/types";

/** Documentos que la sección 5 exige por tipo de propietario. */

export const DOCS_CUENTA: TipoDocumentoCuenta[] = [
  "rut_erut",
  "inicio_actividades",
  "inscripcion_ds80_servicio",
  "seguro_responsabilidad_civil",
  "seguro_personal_conduccion",
];

export const DOCS_VEHICULO: TipoDocumentoVehiculo[] = [
  "inscripcion_ds80_vehiculo",
  "permiso_circulacion",
  "revision_tecnica",
  "soap",
  "certificado_emisiones",
];

export const DOCS_CONDUCTOR: TipoDocumentoConductor[] = [
  "licencia_profesional",
  "certificado_antecedentes",
  "hoja_vida_conductor",
];

/** El tacógrafo solo se exige a quien presta servicios interurbanos. */
export function docsDeVehiculo(interurbano: boolean): TipoDocumentoVehiculo[] {
  return interurbano ? [...DOCS_VEHICULO, "tacografo"] : DOCS_VEHICULO;
}

/** Documentos que se fotografían por ambos lados. */
export const DOCS_DOS_CARAS: TipoDocumento[] = ["licencia_profesional", "rut_erut"];

/** Documentos que no vencen. */
export const DOCS_SIN_VENCIMIENTO: TipoDocumento[] = [
  "rut_erut",
  "inicio_actividades",
];

export const AYUDA_DOCUMENTO: Partial<Record<TipoDocumento, string>> = {
  inscripcion_ds80_servicio:
    "Certificado de inscripción del servicio en el Registro Nacional de Transporte Privado Remunerado de Pasajeros. Es el trámite TTEPRIV en la Seremitt.",
  inscripcion_ds80_vehiculo:
    "Certificado que acredita que este vehículo está inscrito en tu servicio DS 80.",
  licencia_profesional:
    "Clase A2 para vehículos de 10 a 17 asientos, A3 sin límite de capacidad. Foto por ambos lados.",
  tacografo: "Obligatorio para servicios interurbanos.",
  seguro_personal_conduccion:
    "Seguro que cubre al personal de conducción durante el servicio.",
};
