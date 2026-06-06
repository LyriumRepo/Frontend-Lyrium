import { useState, useMemo } from "react";

export type EstadoSolicitud = "ACEPTADO" | "REVISION" | "RECHAZADO";
export type RiesgoSolicitud = "BAJO" | "MEDIO" | "ALTO";

export interface Solicitud {
  id: number;
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  dni: string;
  correo: string;
  score: number;
  riesgo: RiesgoSolicitud;
  estado: EstadoSolicitud;
  diagnostico: string[];
  fechaRegistro: string;
}

const MOCK_DATA: Solicitud[] = [
  {
    id: 1,
    ruc: "20512345671",
    razonSocial: "LABORATORIOS VIDA NATURAL S.A.C.",
    nombreComercial: "Vida Natural",
    dni: "17885791",
    correo: "ventas@vidanatural.pe",
    score: 88,
    riesgo: "BAJO",
    estado: "ACEPTADO",
    diagnostico: [
      "RUC activo y habido",
      "Actividad económica alineada al rubro",
      "Evidencia URL coherente con el negocio",
      "Nombre comercial detectado en sitio web",
    ],
    fechaRegistro: "2025-06-01T09:14:00Z",
  },
  {
    id: 2,
    ruc: "20487654321",
    razonSocial: "NUTRIFARMA PERU E.I.R.L.",
    nombreComercial: "NutriFarma",
    dni: "45231876",
    correo: "contacto@nutrifarma.pe",
    score: 61,
    riesgo: "MEDIO",
    estado: "REVISION",
    diagnostico: [
      "RUC activo y habido",
      "Actividad económica parcialmente alineada",
      "Evidencia PDF no contiene nombre comercial",
      "Score insuficiente para aprobación automática",
    ],
    fechaRegistro: "2025-06-01T10:32:00Z",
  },
  {
    id: 3,
    ruc: "20399887766",
    razonSocial: "IMPORTACIONES GENERALES DEL NORTE S.A.C.",
    nombreComercial: "ImportNorte",
    dni: "32178654",
    correo: "admin@importnorte.com",
    score: 22,
    riesgo: "ALTO",
    estado: "RECHAZADO",
    diagnostico: [
      "RUC activo",
      "Actividad económica no relacionada al rubro salud/bienestar",
      "Evidencia sin coherencia con el marketplace",
      "Riesgo de fraude detectado",
    ],
    fechaRegistro: "2025-06-01T11:05:00Z",
  },
  {
    id: 4,
    ruc: "20601234509",
    razonSocial: "BIOHEALTH SOLUTIONS PERU S.A.C.",
    nombreComercial: "BioHealth",
    dni: "71234509",
    correo: "info@biohealth.pe",
    score: 94,
    riesgo: "BAJO",
    estado: "ACEPTADO",
    diagnostico: [
      "RUC activo y habido",
      "Actividad económica completamente alineada al rubro",
      "Sitio web con contenido médico y de bienestar verificado",
      "Nombre comercial presente en evidencia",
    ],
    fechaRegistro: "2025-06-01T13:48:00Z",
  },
  {
    id: 5,
    ruc: "20534512378",
    razonSocial: "FARMACIA Y BOTICA SAN LUIS S.R.L.",
    nombreComercial: "Botica San Luis",
    dni: "09876543",
    correo: "sanluis.botica@gmail.com",
    score: 75,
    riesgo: "BAJO",
    estado: "ACEPTADO",
    diagnostico: [
      "RUC activo y habido",
      "Actividad económica alineada (farmacia)",
      "Factura reciente con productos del rubro",
    ],
    fechaRegistro: "2025-05-31T16:20:00Z",
  },
  {
    id: 6,
    ruc: "20456123789",
    razonSocial: "TECNO MEDICA ANDINA S.A.C.",
    nombreComercial: "TecnoMédica",
    dni: "56781234",
    correo: "ventas@tecnomedica.pe",
    score: 58,
    riesgo: "MEDIO",
    estado: "REVISION",
    diagnostico: [
      "RUC activo",
      "Actividad económica relacionada a equipos médicos",
      "Ficha técnica sin mencionar razón social",
      "Requiere revisión manual",
    ],
    fechaRegistro: "2025-05-31T08:55:00Z",
  },
];

export type FiltroEstado = "TODOS" | EstadoSolicitud;

export function useSellers() {
  const [buscar, setBuscar] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("TODOS");
  const [expandido, setExpandido] = useState<number | null>(null);
  const [pagina, setPagina] = useState(1);
  const POR_PAGINA = 5;

  const datosFiltrados = useMemo(() => {
    return MOCK_DATA.filter((s) => {
      const coincideBusqueda =
        buscar === "" ||
        s.ruc.includes(buscar) ||
        s.razonSocial.toLowerCase().includes(buscar.toLowerCase()) ||
        s.nombreComercial.toLowerCase().includes(buscar.toLowerCase()) ||
        s.correo.toLowerCase().includes(buscar.toLowerCase());

      const coincideEstado =
        filtroEstado === "TODOS" || s.estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [buscar, filtroEstado]);

  const totalPaginas = Math.ceil(datosFiltrados.length / POR_PAGINA);
  const datosPagina = datosFiltrados.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA
  );

  const resumen = useMemo(() => ({
    total:     MOCK_DATA.length,
    aceptados: MOCK_DATA.filter((s) => s.estado === "ACEPTADO").length,
    revision:  MOCK_DATA.filter((s) => s.estado === "REVISION").length,
    rechazados:MOCK_DATA.filter((s) => s.estado === "RECHAZADO").length,
  }), []);

  const toggleExpandido = (id: number) =>
    setExpandido((prev) => (prev === id ? null : id));

  const cambiarPagina = (n: number) => {
    if (n >= 1 && n <= totalPaginas) setPagina(n);
  };

  return {
    datos: datosPagina,
    buscar, setBuscar,
    filtroEstado, setFiltroEstado,
    expandido, toggleExpandido,
    pagina, totalPaginas, cambiarPagina,
    resumen,
    totalFiltrado: datosFiltrados.length,
  };
}