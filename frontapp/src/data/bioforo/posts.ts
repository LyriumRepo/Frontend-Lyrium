export interface Post {
  id: number;
  tema_id: number;
  usuario_id: number | null;
  anonimo_nombre: string | null;
  rol: string;
  contenido: string;
  respuesta_a_id: number | null;
  creado_en: string;
  estado: string;
  likes_count: number;
  angry_count: number;
  autor?: string;
  cita_autor?: string;
  cita_contenido?: string;
}

export const posts: Post[] = [
  // Respuestas para tema 1
  {
    id: 1,
    tema_id: 1,
    usuario_id: 2,
    anonimo_nombre: null,
    rol: 'cliente',
    contenido:
      'Excelente información! Yo incluyo mucho ajo y jengibre en mis comidas. También consumo equinacea en invierno para prevenir gripes.',
    respuesta_a_id: null,
    creado_en: '2025-12-15 11:00:00',
    estado: 'activo',
    likes_count: 8,
    angry_count: 0,
    autor: 'CarlosLopez',
  },
  {
    id: 2,
    tema_id: 1,
    usuario_id: 3,
    anonimo_nombre: null,
    rol: 'cliente',
    contenido:
      'Añadiría los hongos shitake a la lista, tienen propiedades inmunoestimulantes muy buenas.',
    respuesta_a_id: null,
    creado_en: '2025-12-15 12:30:00',
    estado: 'activo',
    likes_count: 5,
    angry_count: 0,
    autor: 'AnaMartinez',
  },
  {
    id: 3,
    tema_id: 1,
    usuario_id: null,
    anonimo_nombre: 'Anónimo-1234',
    rol: 'anonimo',
    contenido:
      'Gracias por la info! Yo consumo vitamina C todos los días y noto la diferencia.',
    respuesta_a_id: null,
    creado_en: '2025-12-15 14:00:00',
    estado: 'activo',
    likes_count: 3,
    angry_count: 0,
    autor: 'Anónimo-1234',
  },

  // Respuestas para tema 2
  {
    id: 4,
    tema_id: 2,
    usuario_id: 1,
    anonimo_nombre: null,
    rol: 'vendedor',
    contenido:
      'Remedio clásico y efectivo! Yo le añado un poco de canela para darle sabor y beneficios adicionales.',
    respuesta_a_id: null,
    creado_en: '2025-12-14 16:30:00',
    estado: 'activo',
    likes_count: 12,
    angry_count: 0,
    autor: 'MariaGarcia',
  },
  {
    id: 5,
    tema_id: 2,
    usuario_id: 4,
    anonimo_nombre: null,
    rol: 'vendedor',
    contenido:
      'También funciona el vapor de eucalipto para descongestionar las vías respiratorias.',
    respuesta_a_id: null,
    creado_en: '2025-12-14 17:45:00',
    estado: 'activo',
    likes_count: 9,
    angry_count: 0,
    autor: 'PedroRamirez',
  },

  // Respuestas para tema 4
  {
    id: 6,
    tema_id: 4,
    usuario_id: 2,
    anonimo_nombre: null,
    rol: 'cliente',
    contenido:
      'Felicidades por los resultados! Yo apenas estoy empezando, qué consejos darías para alguien que vende por primera vez?',
    respuesta_a_id: null,
    creado_en: '2025-12-12 15:30:00',
    estado: 'activo',
    likes_count: 4,
    angry_count: 0,
    autor: 'CarlosLopez',
  },
  {
    id: 7,
    tema_id: 4,
    usuario_id: 4,
    anonimo_nombre: null,
    rol: 'vendedor',
    contenido:
      'Gracias! Mi principal consejo es tener fotos de muy buena calidad y descripción detallada. También es importante responder rápido a las consultas.',
    respuesta_a_id: 6,
    creado_en: '2025-12-12 16:00:00',
    estado: 'activo',
    likes_count: 7,
    angry_count: 0,
    autor: 'PedroRamirez',
    cita_autor: 'CarlosLopez',
    cita_contenido: 'qué consejos darías para alguien que vende por primera vez?',
  },
  {
    id: 8,
    tema_id: 4,
    usuario_id: 5,
    anonimo_nombre: null,
    rol: 'cliente',
    contenido:
      'Coincido con Pedro. Yo llevaba 1 año vendiendo y cuando cambié a fotos profesionales mis ventas aumentaron 50%.',
    respuesta_a_id: null,
    creado_en: '2025-12-12 18:30:00',
    estado: 'activo',
    likes_count: 6,
    angry_count: 0,
    autor: 'LauraHernandez',
  },
];

export const getPostsByTopic = (topicId: number): Post[] => {
  return posts
    .filter((p) => p.tema_id === topicId && p.estado === 'activo')
    .sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime());
};

export const getPostById = (id: number): Post | undefined => {
  return posts.find((p) => p.id === id);
};
