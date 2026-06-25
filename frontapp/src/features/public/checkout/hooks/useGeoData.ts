'use client';

import { useState, useEffect } from 'react';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

const geoCache = {
  departamentos: null as string[] | null,
  provincias:    new Map<string, string[]>(),
  distritos:     new Map<string, string[]>(),
};

function provKey(dept: string)               { return dept.trim().toUpperCase(); }
function distKey(dept: string, prov: string) { return `${dept}||${prov}`.toUpperCase(); }

async function fetchDepartamentos(): Promise<string[]> {
  if (geoCache.departamentos) return geoCache.departamentos;
  const res  = await fetch(`${LARAVEL_API_URL}/logistics/departamentos`);
  const json = await res.json();
  const data = (json.departamentos ?? json.data ?? []).map(
    (d: { nombre: string } | string) => typeof d === 'string' ? d : d.nombre
  ) as string[];
  geoCache.departamentos = data;
  return data;
}

async function fetchProvincias(departamento: string): Promise<string[]> {
  const key = provKey(departamento);
  if (geoCache.provincias.has(key)) return geoCache.provincias.get(key)!;
  const res  = await fetch(`${LARAVEL_API_URL}/logistics/provincias/${encodeURIComponent(departamento)}`);
  const json = await res.json();
  const data = (json.provincias ?? json.data ?? []).map(
    (p: { nombre: string } | string) => typeof p === 'string' ? p : p.nombre
  ) as string[];
  geoCache.provincias.set(key, data);
  return data;
}

async function fetchDistritos(departamento: string, provincia: string): Promise<string[]> {
  const key    = distKey(departamento, provincia);
  if (geoCache.distritos.has(key)) return geoCache.distritos.get(key)!;
  const params = new URLSearchParams({ depto: departamento, prov: provincia });
  const res    = await fetch(`${LARAVEL_API_URL}/logistics/distritos?${params}`);
  const json   = await res.json();
  const data   = (json.distritos ?? json.data ?? []) as string[];
  geoCache.distritos.set(key, data);
  return data;
}

interface UseGeoDataReturn {
  departamentos:     string[];
  provincias:        string[];
  distritos:         string[];
  loadingDepts:      boolean;
  loadingProvincias: boolean;
  loadingDistritos:  boolean;
}

export function useGeoData(selectedDept: string, selectedProv: string): UseGeoDataReturn {
  const [departamentos,     setDepartamentos]     = useState<string[]>([]);
  const [provincias,        setProvincias]         = useState<string[]>([]);
  const [distritos,         setDistritos]          = useState<string[]>([]);
  const [loadingDepts,      setLoadingDepts]       = useState(false);
  const [loadingProvincias, setLoadingProvincias]  = useState(false);
  const [loadingDistritos,  setLoadingDistritos]   = useState(false);

  useEffect(() => {
    let c = false;
    setLoadingDepts(true);
    fetchDepartamentos()
      .then((d) => { if (!c) setDepartamentos(d); })
      .catch(console.error)
      .finally(() => { if (!c) setLoadingDepts(false); });
    return () => { c = true; };
  }, []);

  useEffect(() => {
    if (!selectedDept) { setProvincias([]); setDistritos([]); return; }
    let c = false;
    setProvincias([]); setDistritos([]); setLoadingProvincias(true);
    fetchProvincias(selectedDept)
      .then((d) => { if (!c) setProvincias(d); })
      .catch(console.error)
      .finally(() => { if (!c) setLoadingProvincias(false); });
    return () => { c = true; };
  }, [selectedDept]);

  useEffect(() => {
    if (!selectedDept || !selectedProv) { setDistritos([]); return; }
    let c = false;
    setDistritos([]); setLoadingDistritos(true);
    fetchDistritos(selectedDept, selectedProv)
      .then((d) => { if (!c) setDistritos(d); })
      .catch(console.error)
      .finally(() => { if (!c) setLoadingDistritos(false); });
    return () => { c = true; };
  }, [selectedDept, selectedProv]);

  return { departamentos, provincias, distritos, loadingDepts, loadingProvincias, loadingDistritos };
}
