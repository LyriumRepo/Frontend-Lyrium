"use client";

import React, { useState } from "react";
import { useSellers, type Solicitud, type FiltroEstado } from "./hooks/useSellers";
import ModuleHeader from "@/components/layout/shared/ModuleHeader";
import Icon from "@/components/ui/Icon";

// ─── Utilidades ──────────────────────────────────────────────────────────────

function formatFecha(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", {
    day: "2-digit", month: "short", year: "numeric",
  }) + " · " + d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

// ─── Badges ──────────────────────────────────────────────────────────────────

const ESTADO_CONFIG = {
  ACEPTADO:  { bg: "bg-emerald-500/10", text: "text-emerald-400", ring: "ring-emerald-500/20", dot: "bg-emerald-400", label: "Aceptado"  },
  REVISION:  { bg: "bg-amber-500/10",   text: "text-amber-400",   ring: "ring-amber-500/20",   dot: "bg-amber-400",   label: "Revisión"  },
  RECHAZADO: { bg: "bg-rose-500/10",    text: "text-rose-400",    ring: "ring-rose-500/20",    dot: "bg-rose-400",    label: "Rechazado" },
};

const RIESGO_CONFIG = {
  BAJO:  { text: "text-emerald-400", label: "Bajo"  },
  MEDIO: { text: "text-amber-400",   label: "Medio" },
  ALTO:  { text: "text-rose-400",    label: "Alto"  },
};

function EstadoBadge({ estado }: { estado: Solicitud["estado"] }) {
  const c = ESTADO_CONFIG[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${c.bg} ${c.text} ${c.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function RiesgoBadge({ riesgo }: { riesgo: Solicitud["riesgo"] }) {
  const c = RIESGO_CONFIG[riesgo];
  return <span className={`text-xs font-semibold tracking-wide ${c.text}`}>{c.label}</span>;
}

// ─── Score Bar ────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-emerald-500"
    : score >= 50 ? "bg-amber-500"
    : "bg-rose-500";

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-sm font-bold text-[var(--text-primary)] w-6 shrink-0">{score}</span>
      <div className="flex-1 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, accent,
}: {
  label: string; value: number; accent: string;
}) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl px-5 py-4 flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-widest text-[var(--text-secondary)] font-medium">{label}</span>
      <span className={`text-3xl font-bold tabular-nums ${accent}`}>{value}</span>
    </div>
  );
}

// ─── Filtros ─────────────────────────────────────────────────────────────────

const FILTROS: { value: FiltroEstado; label: string }[] = [
  { value: "TODOS",     label: "Todos"     },
  { value: "ACEPTADO",  label: "Aceptados" },
  { value: "REVISION",  label: "Revisión"  },
  { value: "RECHAZADO", label: "Rechazados"},
];

// ─── Diagnóstico expandido ────────────────────────────────────────────────────

function FilaDiagnostico({
  diagnostico, colSpan,
}: {
  diagnostico: string[]; colSpan: number;
}) {
  return (
    <tr className="bg-[var(--bg-card)]">
      <td colSpan={colSpan} className="px-6 pb-4 pt-0">
        <div className="border border-[var(--border-subtle)] rounded-xl p-4 bg-[var(--bg-secondary)]">
          <p className="text-[11px] uppercase tracking-widest text-[var(--text-secondary)] mb-2.5 font-semibold">
            Diagnóstico del RPA
          </p>
          <ul className="space-y-1.5">
            {diagnostico.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--border-subtle)] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </td>
    </tr>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function SellersSolicitudes() {
  const {
    datos, buscar, setBuscar,
    filtroEstado, setFiltroEstado,
    expandido, toggleExpandido,
    pagina, totalPaginas, cambiarPagina,
    resumen, totalFiltrado,
  } = useSellers();

  return (
    <div className="space-y-8 animate-fadeIn pb-20">

      {/* ── Header ── */}
      <ModuleHeader
        title="Solicitudes de Registro"
        subtitle="Evaluación automática por RPA · Marketplace Bienestar & Salud"
        icon="Users"
      />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total"       value={resumen.total}      accent="text-[var(--text-primary)]" />
        <StatCard label="Aceptados"   value={resumen.aceptados}  accent="text-emerald-400" />
        <StatCard label="En revisión" value={resumen.revision}   accent="text-amber-400"   />
        <StatCard label="Rechazados"  value={resumen.rechazados} accent="text-rose-400"    />
      </div>

      {/* ── Tabla ── */}
      <div className="space-y-4">

        {/* Barra superior */}
        <div className="flex items-center justify-between px-1">

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-sky-500/10 dark:bg-[var(--icons-green)]/15 rounded-xl flex items-center justify-center border border-sky-500/20 dark:border-[var(--icons-green)]/20 text-sky-400 dark:text-[var(--icons-green)]">
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

          <div className="flex items-center gap-2">
            {/* Buscador */}
            <div className="relative">
              <Icon name="Search" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)] pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por RUC, empresa, correo…"
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[11px] font-bold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-indigo-500/50 dark:focus:border-[var(--icons-green)]/50 transition-colors w-52"
              />
            </div>

            {/* Filtros de estado */}
            <div className="flex items-center gap-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-1">
              {FILTROS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFiltroEstado(f.value)}
                  className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wide rounded-lg transition-all ${
                    filtroEstado === f.value
                      ? "bg-sky-500/20 dark:bg-[var(--icons-green)]/20 text-sky-40 dark:text-[var(--icons-green)] border border-sky-500/30 dark:border-[var(--icons-green)]/30"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                  {["RUC", "Empresa", "DNI", "Correo", "Score", "Riesgo", "Estado", "Registro", ""].map((h, i, arr) => (
                    <th
                      key={h || `col-${i}`}
                      className={`px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] whitespace-nowrap
                        ${i === 0 ? "rounded-tl-2xl" : ""}
                        ${i === arr.length - 1 ? "rounded-tr-2xl" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {datos.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-[var(--text-secondary)] text-sm">
                      Sin resultados para los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  datos.map((s) => (
                    <React.Fragment key={s.id}>
                      <tr
                        onClick={() => toggleExpandido(s.id)}

                        className={`border-b border-[var(--border-subtle)] cursor-pointer transition-colors
                          ${expandido === s.id ? "bg-[var(--bg-secondary)]" : "hover:bg-[var(--bg-secondary)]"}`}
                      >
                        {/* RUC */}
                        <td className="px-4 py-4 font-mono text-xs text-[var(--text-secondary)] whitespace-nowrap">
                          {s.ruc}
                        </td>

                        {/* Empresa */}
                        <td className="px-4 py-4 min-w-[200px]">
                          <p className="font-semibold text-[var(--text-primary)] leading-tight">{s.nombreComercial}</p>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-tight">{s.razonSocial}</p>
                        </td>

                        {/* DNI */}
                        <td className="px-4 py-4 font-mono text-xs text-[var(--text-secondary)] whitespace-nowrap">
                          {s.dni}
                        </td>

                        {/* Correo */}
                        <td className="px-4 py-4 text-[var(--text-secondary)] text-xs whitespace-nowrap">
                          {s.correo}
                        </td>

                        {/* Score */}
                        <td className="px-4 py-4 min-w-[110px]">
                          <ScoreBar score={s.score} />
                        </td>

                        {/* Riesgo */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <RiesgoBadge riesgo={s.riesgo} />
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <EstadoBadge estado={s.estado} />
                        </td>

                        {/* Fecha */}
                        <td className="px-4 py-4 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                          {formatFecha(s.fechaRegistro)}
                        </td>

                        {/* Expand icon */}
                        <td className="px-4 py-4">
                          <Icon
                            name="ChevronDown"
                            className={`w-4 h-4 text-[var(--text-secondary)] transition-transform duration-200 ${
                              expandido === s.id ? "rotate-180" : ""
                            }`}
                          />
                        </td>
                      </tr>

                      {/* Diagnóstico expandible */}
                      {expandido === s.id && (
                        <FilaDiagnostico diagnostico={s.diagnostico} colSpan={9} />
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Paginación ── */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                Página {pagina} de {totalPaginas} · {totalFiltrado} resultado{totalFiltrado !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => cambiarPagina(pagina - 1)}
                  disabled={pagina === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Icon name="ChevronLeft" className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => cambiarPagina(n)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-black transition-colors
                      ${n === pagina
                        ? "bg-sky-500/20 dark:bg-[var(--icons-green)]/20 text-sky-400 dark:text-[var(--icons-green)] border border-sky-500/30 dark:border-[var(--icons-green)]/30"
                        : "border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                  >
                    {n}
                  </button>
                ))}

                <button
                  onClick={() => cambiarPagina(pagina + 1)}
                  disabled={pagina === totalPaginas}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Icon name="ChevronRight" className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <p className="text-center text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
          Haz clic en cualquier fila para ver el diagnóstico completo del RPA
        </p>
      </div>

    </div>
  );
}