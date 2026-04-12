import { categories } from './categories';

export interface Topic {
  id: number;
  categoria_id: number;
  usuario_id: number | null;
  anonimo_nombre: string | null;
  rol: string;
  titulo: string;
  contenido: string;
  created: string;
  estado: string;
  likes_count: number;
  love_count: number;
  haha_count: number;
  wow_count: number;
  sad_count: number;
  angry_count: number;
  total_reacciones: number;
  reply_count: number;
  views: number;
  cat_nombre?: string;
  autor?: string;
}

const getCategoryName = (id: number) => {
  const cat = categories.find((c) => c.id === id);
  return cat ? cat.nombre : 'General';
};

export const topics: Topic[] = [
  {
    id: 1,
    categoria_id: 1,
    usuario_id: 1,
    anonimo_nombre: null,
    rol: 'vendedor',
    titulo: 'Los mejores alimentos para fortalecer el sistema inmune',
    contenido:
      'Quiero compartir con ustedes una lista de alimentos que han demostrado científicamente fortalecer nuestro sistema inmunológico. Algunos de los más efectivos son los cítricos, el ajo, el jengibre, las bayas y los vegetales de hoja verde. ¿Qué alimentos incluyen ustedes en su dieta diaria para cuidar su salud?',
    created: '2025-12-15 10:30:00',
    estado: 'activo',
    likes_count: 15,
    love_count: 8,
    haha_count: 2,
    wow_count: 3,
    sad_count: 0,
    angry_count: 0,
    total_reacciones: 28,
    reply_count: 12,
    views: 234,
    cat_nombre: 'Nutrición y Salud',
    autor: 'MariaGarcia',
  },
  {
    id: 2,
    categoria_id: 3,
    usuario_id: 2,
    anonimo_nombre: null,
    rol: 'cliente',
    titulo: 'Remedio casero para la tos con miel y limón',
    contenido:
      'Hola comunidad, quería compartir este remedio que me funciona muy bien cuando me da tos. Es非常简单: mezcla una cucharada de miel con el jugo de medio limón y toma antes de dormir. Lo he usado toda mi vida y funciona genial. ¿Tienen otros remedios caseros que funcionen?',
    created: '2025-12-14 15:45:00',
    estado: 'activo',
    likes_count: 22,
    love_count: 12,
    haha_count: 1,
    wow_count: 2,
    sad_count: 0,
    angry_count: 0,
    total_reacciones: 37,
    reply_count: 8,
    views: 189,
    cat_nombre: 'Bienestar y Remedios Naturales',
    autor: 'CarlosLopez',
  },
  {
    id: 3,
    categoria_id: 2,
    usuario_id: null,
    anonimo_nombre: 'Anónimo-4521',
    rol: 'anonimo',
    titulo: 'Dónde comprar té matcha orgánico de buena calidad',
    contenido:
      'Estoy buscando recomendaciones de lugares confiables para comprar té matcha orgánico. He visto muchas opciones en línea pero no sé cuál elegir. ¿Alguien ha comprado matcha de buena calidad? ¿Dónde lo consiguen?',
    created: '2025-12-13 09:20:00',
    estado: 'activo',
    likes_count: 8,
    love_count: 3,
    haha_count: 0,
    wow_count: 1,
    sad_count: 0,
    angry_count: 0,
    total_reacciones: 12,
    reply_count: 15,
    views: 156,
    cat_nombre: 'Productos Orgánicos',
    autor: 'Anónimo-4521',
  },
  {
    id: 4,
    categoria_id: 5,
    usuario_id: 4,
    anonimo_nombre: null,
    rol: 'vendedor',
    titulo: 'Mi experiencia vendiendo productos naturales en Lyrium',
    contenido:
      'Hola a todos!Quiero compartir mi experiencia como vendedor en Lyrium. Llevo 6 meses vendiendo productos naturales y he tenido muy buenos resultados. Les recomiendo ser constantes, responder rápido a los clientes y mantener una buena descripción de productos. ¿Cuánto tiempo llevan vendiendo?',
    created: '2025-12-12 14:00:00',
    estado: 'activo',
    likes_count: 18,
    love_count: 25,
    haha_count: 5,
    wow_count: 4,
    sad_count: 0,
    angry_count: 0,
    total_reacciones: 52,
    reply_count: 23,
    views: 312,
    cat_nombre: 'Emprendimiento',
    autor: 'PedroRamirez',
  },
  {
    id: 5,
    categoria_id: 4,
    usuario_id: 3,
    anonimo_nombre: null,
    rol: 'cliente',
    titulo: 'Consejos para reducir el plástico en el hogar',
    contenido:
      'Quiero iniciar un hilo sobre alternativas al plástico en nuestra vida cotidiana. Algunos cambios que he implementado: bolsas de tela, cubiertos de bambú, recipientes de vidrio y evitar productos de un solo uso. ¿Qué otras alternativas recomiendan?',
    created: '2025-12-11 11:30:00',
    estado: 'activo',
    likes_count: 30,
    love_count: 14,
    haha_count: 1,
    wow_count: 5,
    sad_count: 0,
    angry_count: 0,
    total_reacciones: 50,
    reply_count: 18,
    views: 267,
    cat_nombre: 'Ecología y Sustentabilidad',
    autor: 'AnaMartinez',
  },
  {
    id: 6,
    categoria_id: 6,
    usuario_id: null,
    anonimo_nombre: 'Anónimo-7832',
    rol: 'anonimo',
    titulo: 'Bienvenidos al nuevo foro de Lyrium',
    contenido:
      '¡Hola a todos! Me alegra mucho ver que tenemos un espacio donde la comunidad puede interactuar. Espero que este foro crezca y podamos compartir muchos conocimientos. ¡Saludos a todos!',
    created: '2025-12-10 08:15:00',
    estado: 'activo',
    likes_count: 45,
    love_count: 20,
    haha_count: 3,
    wow_count: 8,
    sad_count: 0,
    angry_count: 0,
    total_reacciones: 76,
    reply_count: 30,
    views: 456,
    cat_nombre: 'General',
    autor: 'Anónimo-7832',
  },
  {
    id: 7,
    categoria_id: 1,
    usuario_id: 5,
    anonimo_nombre: null,
    rol: 'cliente',
    titulo: 'Dieta cetogénica:Mi experiencia después de 3 meses',
    contenido:
      'Llevo 3 meses siguiendo una dieta cetogénica y quiero contarles mis resultados. He perdido 8 kilos, tengo más energía y duermo mejor. Aunque al principio fue difícil adaptarse, ahora me siento genial. ¿Alguien más sigue esta dieta?',
    created: '2025-12-09 16:45:00',
    estado: 'activo',
    likes_count: 12,
    love_count: 6,
    haha_count: 4,
    wow_count: 9,
    sad_count: 1,
    angry_count: 0,
    total_reacciones: 32,
    reply_count: 25,
    views: 298,
    cat_nombre: 'Nutrición y Salud',
    autor: 'LauraHernandez',
  },
  {
    id: 8,
    categoria_id: 3,
    usuario_id: 1,
    anonimo_nombre: null,
    rol: 'vendedor',
    titulo: 'Aceites esenciales: Guía para principiantes',
    contenido:
      'Para los que están interesados en comenzar a usar aceites esenciales, les comparto esta guía básica. Los más versátiles son: lavanda (relajante), árbol de té (antiséptico), menta (digestivo) y eucalipto (respiratorio). Siempre diluyan antes de aplicar sobre la piel.',
    created: '2025-12-08 12:00:00',
    estado: 'activo',
    likes_count: 35,
    love_count: 18,
    haha_count: 2,
    wow_count: 6,
    sad_count: 0,
    angry_count: 1,
    total_reacciones: 62,
    reply_count: 14,
    views: 341,
    cat_nombre: 'Bienestar y Remedios Naturales',
    autor: 'MariaGarcia',
  },
];

export const getTopicById = (id: number): Topic | undefined => {
  return topics.find((topic) => topic.id === id);
};

export const getTopicsByCategory = (categoryId?: number): Topic[] => {
  let filtered = [...topics];
  if (categoryId) {
    filtered = filtered.filter((t) => t.categoria_id === categoryId);
  }
  return filtered.sort((a, b) => {
    const hoursA = Math.abs(
      (new Date().getTime() - new Date(a.created).getTime()) / (1000 * 60 * 60)
    );
    const hoursB = Math.abs(
      (new Date().getTime() - new Date(b.created).getTime()) / (1000 * 60 * 60)
    );
    if (hoursA < 2 && hoursB >= 2) return -1;
    if (hoursB < 2 && hoursA >= 2) return 1;
    if (hoursA < 2 && hoursB < 2) return b.total_reacciones - a.total_reacciones;
    return new Date(b.created).getTime() - new Date(a.created).getTime();
  });
};
