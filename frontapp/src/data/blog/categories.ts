export interface BlogCategory {
    id: number;
    name: string;
    slug: string;
    post_count: number;
}

export const categories: BlogCategory[] = [
    { id: 1, name: 'Todos', slug: 'todos', post_count: 0 },
    { id: 2, name: 'Salud Alimentaria', slug: 'salud-alimentaria', post_count: 12 },
    { id: 3, name: 'Salud Ambiental', slug: 'salud-ambiental', post_count: 8 },
    { id: 4, name: 'Salud Emocional', slug: 'salud-emocional', post_count: 15 },
    { id: 5, name: 'Salud Espiritual', slug: 'salud-espiritual', post_count: 6 },
    { id: 6, name: 'Salud Familiar', slug: 'salud-familiar', post_count: 10 },
];

export const getCategoryBySlug = (slug: string): BlogCategory | undefined => {
    return categories.find((cat) => cat.slug === slug);
};

export const getCategoryById = (id: number): BlogCategory | undefined => {
    return categories.find((cat) => cat.id === id);
};
