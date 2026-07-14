const API_BASE = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('laravel_token');
}

export async function downloadExport(endpoint: string, filename: string): Promise<void> {
  const token = getToken();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const detail = response.status === 404 ? 'Recurso no encontrado' : `Error del servidor (${response.status})`;
    throw new Error(`No se pudo generar el reporte: ${detail}`);
  }
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('text/html')) {
    throw new Error('El servidor devolvió HTML en vez del archivo esperado. Verifique los filtros e intente de nuevo.');
  }
  const blob = await response.blob();
  if (blob.size === 0) {
    throw new Error('El archivo generado está vacío. No hay datos para el rango seleccionado.');
  }
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}
