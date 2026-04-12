export interface Category {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string;
  topic_count: number;
  post_count: number;
  estado: number;
  orden: number;
}

export const categories: Category[] = [
  {
    id: 1,
    nombre: 'Nutrición y Salud',
    slug: 'nutricion-salud',
    descripcion: 'Consejos sobre alimentación saludable y hábitos de vida',
    topic_count: 12,
    post_count: 45,
    estado: 1,
    orden: 1,
  },
  {
    id: 2,
    nombre: 'Productos Orgánicos',
    slug: 'productos-organicos',
    descripcion: 'Discute sobre productos orgánicos y naturales',
    topic_count: 8,
    post_count: 23,
    estado: 1,
    orden: 2,
  },
  {
    id: 3,
    nombre: 'Bienestar y Remedios Naturales',
    slug: 'bienestar-remedios',
    descripcion: 'Comparte remedios caseros y consejos de bienestar',
    topic_count: 15,
    post_count: 67,
    estado: 1,
    orden: 3,
  },
  {
    id: 4,
    nombre: 'Ecología y Sustentabilidad',
    slug: 'ecologia-sustentabilidad',
    descripcion: 'Hablemos sobre cuidado del medio ambiente',
    topic_count: 6,
    post_count: 18,
    estado: 1,
    orden: 4,
  },
  {
    id: 5,
    nombre: 'Emprendimiento',
    slug: 'emprendimiento',
    descripcion: 'Comparte tu experiencia como emprendedor',
    topic_count: 9,
    post_count: 31,
    estado: 1,
    orden: 5,
  },
  {
    id: 6,
    nombre: 'General',
    slug: 'general',
    descripcion: 'Tema libre para la comunidad',
    topic_count: 20,
    post_count: 89,
    estado: 1,
    orden: 6,
  },
];

export const getCategoryById = (id: number): Category | undefined => {
  return categories.find((cat) => cat.id === id);
};

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find((cat) => cat.slug === slug);
};
