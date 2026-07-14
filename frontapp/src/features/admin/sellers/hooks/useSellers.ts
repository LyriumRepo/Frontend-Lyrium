import { useState, useMemo, useEffect, useCallback, useRef } from "react";

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

const LARAVEL_API = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://127.0.0.1:8000/api";

async function fetchToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth-token", { credentials: "include" });
    if (!res.ok) return null;
    const { token } = await res.json();
    return token?.replace(/^["']|["']$/g, "").trim() || null;
  } catch {
    return null;
  }
}

function mapApiItem(item: any): Solicitud {
  return {
    id: item.id,
    ruc: item.ruc || "",
    razonSocial: item.razon_social || "",
    nombreComercial: item.nombre_comercial || "",
    dni: item.dni || "",
    correo: item.correo || "",
    score: item.score ?? 0,
    riesgo: (item.riesgo || "medio").toUpperCase() as RiesgoSolicitud,
    estado: item.estado as EstadoSolicitud,
    diagnostico: Array.isArray(item.diagnostico) ? item.diagnostico : [],
    fechaRegistro: item.created_at || new Date().toISOString(),
  };
}

export type FiltroEstado = "TODOS" | EstadoSolicitud;

export function useSellers() {
  const [buscar, setBuscar] = useState("");
  const [debouncedBuscar, setDebouncedBuscar] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("TODOS");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedBuscar(buscar), 300);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [buscar]);
  const [expandido, setExpandido] = useState<number | null>(null);
  const [pagina, setPagina] = useState(1);
  const [data, setData] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const POR_PAGINA = 5;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = await fetchToken();
      const params = new URLSearchParams({ per_page: "50" });
      if (filtroEstado !== "TODOS") {
        params.set("estado", filtroEstado);
      }
      if (debouncedBuscar) {
        params.set("buscar", debouncedBuscar);
      }

      const res = await fetch(`${LARAVEL_API}/admin/seller-applications?${params}`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (!res.ok) {
        console.warn("Error fetching seller applications, falling back to empty");
        setData([]);
        setTotalCount(0);
        return;
      }

      const json = await res.json();
      const mapped = (json.data || []).map(mapApiItem);
      setData(mapped);
      setTotalCount(json.pagination?.total || mapped.length);
    } catch (err) {
      console.error("Error fetching seller applications:", err);
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedBuscar, filtroEstado]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const datosFiltrados = useMemo(() => {
    return data.filter((s) => {
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
  }, [data, buscar, filtroEstado]);

  const totalPaginas = Math.ceil(datosFiltrados.length / POR_PAGINA);
  const datosPagina = datosFiltrados.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA,
  );

  const resumen = useMemo(() => ({
    total: data.length,
    aceptados: data.filter((s) => s.estado === "ACEPTADO").length,
    revision: data.filter((s) => s.estado === "REVISION").length,
    rechazados: data.filter((s) => s.estado === "RECHAZADO").length,
  }), [data]);

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
    loading,
  };
}
