"use client";

import React, { useState } from "react";
import { useSellers, type Solicitud, type FiltroEstado } from "./hooks/useSellers";
import ModuleHeader from "@/components/layout/shared/ModuleHeader";
import Icon from "@/components/ui/Icon";

function formatFecha(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", {
    day: "2-digit", month: "short", year: "numeric",
  }) + " · " + d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

const ESTADO_CONFIG = {
  ACEPTADO:  { bg: "bg-[var(--color-success)]/10", text: "text-[var(--color-success)]", ring: "border-[var(--color-success)]/20", dot: "bg-[var(--color-success)]", label: "Aceptado"  },
  REVISION:  { bg: "bg-[var(--color-warning)]/10", text: "text-[var(--color-warning)]", ring: "border-[var(--color-warning)]/20", dot: "bg-[var(--color-warning)]", label: "Revisión"  },
  RECHAZADO: { bg: "bg-[var(--color-error)]/10",   text: "text-[var(--color-error)]",   ring: "border-[var(--color-error)]/20",   dot: "bg-[var(--color-error)]",   label: "Rechazado" },
};

const RIESGO_CONFIG = {
  BAJO:  { text: "text-[var(--color-success)]", label: "Bajo"  },
  MEDIO: { text: "text-[var(--color-warning)]", label: "Medio" },
  ALTO:  { text: "text-[var(--color-error)]",   label: "Alto"  },
};

function EstadoBadge({ estado }: { estado: Solicitud["estado"] }) {
  const c = ESTADO_CONFIG[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border ${c.bg} ${c.text} ${c.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-emerald-500"
    : score >= 50 ? "bg-amber-500"
    : "bg-rose-500";
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-[var(--text-primary)] w-5 shrink-0 tabular-nums">{score}</span>
      <div className="flex-1 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl px-5 py-4 flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-widest text-[var(--text-secondary)] font-medium">{label}</span>
      <span className={`text-3xl font-bold tabular-nums ${accent}`}>{value}</span>
    </div>
  );
}

const FILTROS: { value: FiltroEstado; label: string }[] = [
  { value: "TODOS",     label: "Todos"     },
  { value: "ACEPTADO",  label: "Aceptados" },
  { value: "REVISION",  label: "Revisión"  },
  { value: "RECHAZADO", label: "Rechazados"},
];

function SolicitudCard({ s, expandido, onToggle }: { s: Solicitud; expandido: boolean; onToggle: () => void }) {
  const cfg = ESTADO_CONFIG[s.estado];
  const riesgo = RIESGO_CONFIG[s.riesgo];

  return (
    <div className={`border-b border-[var(--border-subtle)] last:border-b-0 transition-colors ${expandido ? "bg-[var(--bg-secondary)]" : "hover:bg-[var(--bg-secondary)]"}`}>
      {/* Fila principal */}
      <div
        className="p-4 flex items-start gap-3 cursor-pointer"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onToggle(); }}
      >
        {/* Avatar inicial */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] font-black text-sm">
            {s.nombreComercial?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--bg-card)] ${cfg.dot}`} />
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-black text-[var(--text-primary)] truncate leading-tight">{s.nombreComercial}</p>
              <p className="text-[11px] text-[var(--text-secondary)] truncate leading-tight">{s.correo}</p>
            </div>
            <EstadoBadge estado={s.estado} />
          </div>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] font-mono">{s.ruc}</span>
            <span className="text-[10px] text-[var(--text-secondary)]">·</span>
            <span className={`text-[10px] font-bold ${riesgo.text}`}>Riesgo: {riesgo.label}</span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] text-[var(--text-secondary)] font-semibold shrink-0">Score</span>
            <div className="flex-1 max-w-[120px]">
              <ScoreBar score={s.score} />
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 gap-2">
            <span className="text-[10px] text-[var(--text-secondary)]">{formatFecha(s.fechaRegistro)}</span>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--icons-green)] text-[10px] font-black transition-colors border border-[var(--border-subtle)]">
              Diagnóstico
              <Icon name="ChevronDown" className={`w-3 h-3 transition-transform duration-200 ${expandido ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Panel de diagnóstico expandible */}
      {expandido && (
        <div className="px-4 pb-4 pt-0 ml-13">
          <div className="border border-[var(--border-subtle)] rounded-xl p-4 bg-[var(--bg-card)]">
            <p className="text-[11px] uppercase tracking-widest text-[var(--text-secondary)] mb-2.5 font-semibold">
              Diagnóstico del RPA
            </p>
            <ul className="space-y-1.5">
              {s.diagnostico.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--border-subtle)] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SellersSolicitudes() {
  const {
    datos, buscar, setBuscar,
    filtroEstado, setFiltroEstado,
    expandido, toggleExpandido,
    pagina, totalPaginas, cambiarPagina,
    resumen, totalFiltrado, loading,
  } = useSellers();

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <ModuleHeader
        title="Solicitudes de Registro"
        subtitle="Evaluación automática por RPA · Marketplace Bienestar & Salud"
        icon="Users"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total"       value={resumen.total}      accent="text-[var(--text-primary)]" />
        <StatCard label="Aceptados"   value={resumen.aceptados}  accent="text-[var(--color-success)]" />
        <StatCard label="En revisión" value={resumen.revision}   accent="text-[var(--color-warning)]" />
        <StatCard label="Rechazados"  value={resumen.rechazados} accent="text-[var(--color-error)]"   />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[var(--text-secondary)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--icons-green)] mr-3" />
          Cargando solicitudes...
        </div>
      ) : (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-start justify-between gap-3 px-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[var(--icons-green)]/15 rounded-xl flex items-center justify-center border border-[var(--icons-green)]/20 text-[var(--icons-green)]">
                <Icon name="Users" className="w-4 h-4 stroke-[2.5px]" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">
                  Solicitudes Registradas
                </h2>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                  {totalFiltrado} resultado{totalFiltrado !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Icon name="Search" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar por RUC, empresa, correo…"
                  value={buscar}
                  onChange={(e) => setBuscar(e.target.value)}
                  className="w-full sm:w-52 pl-8 pr-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[11px] font-bold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--icons-green)]/50 transition-colors"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-1">
                {FILTROS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFiltroEstado(f.value)}
                    className={`px-3.5 py-2 min-h-[36px] text-[10px] font-black uppercase tracking-wide rounded-lg transition-all ${
                      filtroEstado === f.value
                        ? "bg-[var(--icons-green)]/20 text-[var(--icons-green)] border border-[var(--icons-green)]/30"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lista de tarjetas */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[2.5rem] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">
                  Solicitudes Registradas
                </h3>
                <p className="text-[10px] text-[var(--text-secondary)] font-medium mt-0.5">
                  Evaluación RPA · Haz clic para ver el diagnóstico
                </p>
              </div>
              <span className="px-3 py-1.5 bg-[var(--icons-green)]/10 text-[var(--icons-green)] border border-[var(--icons-green)]/20 rounded-full text-[10px] font-black">
                {totalFiltrado} resultado{totalFiltrado !== 1 ? "s" : ""}
              </span>
            </div>

            {datos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-[var(--text-secondary)]">
                <Icon name="Search" className="w-10 h-10 opacity-30" />
                <p className="text-sm font-bold">Sin resultados para los filtros aplicados</p>
                <p className="text-xs opacity-60">Ajusta los filtros de búsqueda</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {datos.map((s) => (
                  <SolicitudCard
                    key={s.id}
                    s={s}
                    expandido={expandido === s.id}
                    onToggle={() => toggleExpandido(s.id)}
                  />
                ))}
              </div>
            )}

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)]">
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                  Página {pagina} de {totalPaginas} · {totalFiltrado} resultado{totalFiltrado !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => cambiarPagina(pagina - 1)}
                    disabled={pagina === 1}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Icon name="ChevronLeft" className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => cambiarPagina(n)}
                      className={`min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[10px] font-black transition-colors
                        ${n === pagina
                          ? "bg-[var(--icons-green)]/20 text-[var(--icons-green)] border border-[var(--icons-green)]/30"
                          : "border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => cambiarPagina(pagina + 1)}
                    disabled={pagina === totalPaginas}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Icon name="ChevronRight" className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
