'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEchoPublic } from '@laravel/echo-react';
import { useToast } from '@/shared/lib/context/ToastContext';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags'; // 👈 Importado idéntico al carrito

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: { src: string } | null;
  description: string;
  type: string;
  sort_order: number;
  count: number;
  parent: number;
  children?: Category[];
}

export interface CategoryNode extends Category {
  children: CategoryNode[];
  level: number;
}

// ─── Helpers de autenticación (Copiado exactamente de cartRepository) ─────────

let _tokenCache: { value: string | null; ts: number } | null = null;

async function getAuthToken(): Promise<string | null> {
  const now = Date.now();
  if (_tokenCache && now - _tokenCache.ts < 30_000) {
    return _tokenCache.value;
  }
  try {
    const res = await fetch('/api/auth-token', {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const { token } = await res.json();
    const clean = token?.replace(/^["']|["']$/g, '').trim() || null;
    _tokenCache = { value: clean, ts: now };
    return clean;
  } catch {
    return null;
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken(); // 👈 Ahora obtiene el token de forma asíncrons

  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Peticiones API ───────────────────────────────────────────────────────────

async function fetchCategories(): Promise<Category[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${LARAVEL_API_URL}/categories?tree=1&per_page=400`, {
    headers,
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

async function apiCreateCategory(data: {
  name: string;
  parent?: number;
  description?: string;
  type?: string;
  sort_order?: number;
}): Promise<Category> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${LARAVEL_API_URL}/categories`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || err.message || 'Error al crear categoría');
  }
  return res.json();
}

async function apiUpdateCategory(
  id: number,
  data: {
    name?: string;
    description?: string;
    parent?: number | null;
    type?: string;
    sort_order?: number;
  },
): Promise<Category> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${LARAVEL_API_URL}/categories/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(
      err.error || err.message || 'Error al actualizar categoría',
    );
  }
  return res.json();
}

async function apiDeleteCategory(id: number): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${LARAVEL_API_URL}/categories/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || err.message || 'Error al eliminar categoría');
  }
}

async function apiUploadImage(id: number, file: File): Promise<string> {
  const token = await getAuthToken(); // 👈 Adaptado para usar el mismo token asíncrono

  const form = new FormData();
  form.append('image', file);

  const res = await fetch(`${LARAVEL_API_URL}/categories/${id}/image`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al subir imagen');
  }
  const json = await res.json();
  return json.image;
}

// ─── Helpers de estructura de árbol ───────────────────────────────────────────

function flattenTree(nodes: Category[], level = 0): CategoryNode[] {
  const result: CategoryNode[] = [];
  for (const node of nodes) {
    const children = node.children ?? [];
    result.push({ ...node, children: [], level });
    if (children.length > 0) {
      result.push(...flattenTree(children, level + 1));
    }
  }
  return result;
}

function buildTree(categories: Category[]): CategoryNode[] {
  function mapNode(cat: Category, level: number): CategoryNode {
    const children = (cat.children ?? []).map((c) => mapNode(c, level + 1));
    return { ...cat, children, level };
  }
  return categories.map((c) => mapNode(c, 0));
}

// flattenTree vacía `children` en cada nodo (ver arriba), así que para saber
// los hijos/descendientes reales de una categoría hay que buscarla en el
// árbol anidado original, no en la lista aplanada.
function findNodeInTree(nodes: Category[], id: number): Category | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNodeInTree(node.children ?? [], id);
    if (found) return found;
  }
  return null;
}

function collectDescendantIds(node: Category): number[] {
  const ids: number[] = [];
  for (const child of node.children ?? []) {
    ids.push(child.id, ...collectDescendantIds(child));
  }
  return ids;
}

// ─── Hook Personalizado ───────────────────────────────────────────────────────

export const useCategories = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const {
    data: categories = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });

  useEchoPublic('categories', 'CategoryUpdated', () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
  });

  const createMutation = useMutation({
    mutationFn: apiCreateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      showToast('Categoría creada correctamente', 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Error al crear la categoría', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Parameters<typeof apiUpdateCategory>[1];
    }) => apiUpdateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      showToast('Categoría actualizada', 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Error al actualizar la categoría', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: apiDeleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setSelectedCategoryId(null);
      showToast('Categoría eliminada', 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Error al eliminar la categoría', 'error');
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      apiUploadImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['mega-menu'] });
      showToast('Imagen subida correctamente', 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Error al subir la imagen', 'error');
    },
  });

  const categoryTree = useMemo(() => buildTree(categories), [categories]);
  const flatCategories = useMemo(() => flattenTree(categories), [categories]);

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return flatCategories.find((c) => c.id === selectedCategoryId) ?? null;
  }, [flatCategories, selectedCategoryId]);

  const parentOptions = useMemo(() => {
    return flatCategories.filter((c) => c.level < 2);
  }, [flatCategories]);

  // Para el formulario de edición: excluye la categoría seleccionada y todos
  // sus descendientes, así no se puede elegir como padre a un hijo/nieto
  // propio (evita ciclos que cuelgan buildTree en recursión infinita).
  const editableParentOptions = useMemo(() => {
    if (!selectedCategoryId) return parentOptions;
    const node = findNodeInTree(categories, selectedCategoryId);
    if (!node) return parentOptions;
    const excludedIds = new Set<number>([
      selectedCategoryId,
      ...collectDescendantIds(node),
    ]);
    return parentOptions.filter((p) => !excludedIds.has(p.id));
  }, [parentOptions, categories, selectedCategoryId]);

  // Hijos directos reales de la categoría seleccionada (selectedCategory.children
  // siempre es [] porque viene de flatCategories/flattenTree). Se usa para
  // advertir antes de borrar una categoría con subcategorías.
  const selectedCategoryChildrenCount = useMemo(() => {
    if (!selectedCategoryId) return 0;
    const node = findNodeInTree(categories, selectedCategoryId);
    return node?.children?.length ?? 0;
  }, [categories, selectedCategoryId]);

  const addCategory = useCallback(
    (data: {
      name: string;
      parent?: number;
      description?: string;
      type?: string;
      sort_order?: number;
    }) => createMutation.mutateAsync(data),
    [createMutation],
  );

  const editCategory = useCallback(
    (id: number, data: Parameters<typeof apiUpdateCategory>[1]) =>
      updateMutation.mutateAsync({ id, data }),
    [updateMutation],
  );

  const removeCategory = useCallback(
    (id: number) => deleteMutation.mutateAsync(id),
    [deleteMutation],
  );

  const uploadImage = useCallback(
    async (id: number, file: File): Promise<string | undefined> => {
      const result = await uploadImageMutation.mutateAsync({ id, file });
      return result;
    },
    [uploadImageMutation],
  );

  return {
    categories,
    categoryTree,
    flatCategories,
    loading:
      isLoading ||
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      uploadImageMutation.isPending,
    error: error ? (error as Error).message : null,
    selectedCategory,
    selectedCategoryId,
    setSelectedCategoryId,
    parentOptions,
    editableParentOptions,
    selectedCategoryChildrenCount,
    refresh: refetch,
    addCategory,
    editCategory,
    removeCategory,
    uploadImage,
  };
};
