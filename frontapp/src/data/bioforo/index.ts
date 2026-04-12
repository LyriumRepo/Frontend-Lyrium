export * from './categories';
export * from './users';
export * from './topics';
export * from './posts';

export interface Stats {
  total_topics: number;
  total_posts: number;
  usuarios_registrados: number;
  usuarios_en_linea: number;
}

export const stats: Stats = {
  total_topics: 70,
  total_posts: 273,
  usuarios_registrados: 45,
  usuarios_en_linea: 23,
};

export const getStats = (): Stats => {
  return {
    ...stats,
    usuarios_en_linea: Math.floor(Math.random() * 30) + 10,
  };
};
