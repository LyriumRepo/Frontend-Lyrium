import { BlogCategory, categories } from './categories';

export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image: string;
    category_id: number;
    category_name: string;
    author: string;
    author_avatar: string;
    published_at: string;
    views: number;
    comments_count: number;
}

export const posts: BlogPost[] = [
    {
        id: 1,
        title: 'El poder de la meditación para una vida plena',
        slug: 'el-poder-de-la-meditacion',
        excerpt: 'El poder de la meditación La meditación es una práctica milenaria que ha demostrado tener un impacto profundo en el bienestar físico y mental.',
        content: `
            <p>La meditación es una práctica milenaria que ha demostrado tener un impacto profundo en el bienestar físico y mental. En este artículo exploraremos los beneficios de incorporar la meditación en tu rutina diaria.</p>
            
            <h2>Beneficios de la meditación</h2>
            <p>Los estudios científicos han demostrado que la meditación regular puede:</p>
            <ul>
                <li>Reducir el estrés y la ansiedad</li>
                <li>Mejorar la concentración</li>
                <li>Promover un sueño más reparador</li>
                <li>Incrementar la autoconciencia</li>
            </ul>
            
            <h2>Cómo comenzar</h2>
            <p>Para empezar, solo necesitas 5-10 minutos al día. Encuentra un lugar tranquilo, siéntate cómodamente y concéntrate en tu respiración.</p>
        `,
        featured_image: '/img/bioblog/chica-sentada.jpg',
        category_id: 4,
        category_name: 'SALUD EMOCIONAL',
        author: 'María García',
        author_avatar: '',
        published_at: '2025-05-04T00:00:00Z',
        views: 1250,
        comments_count: 8,
    },
    {
        id: 2,
        title: 'Cómo elegir el mejor método de pago para tu eCommerce',
        slug: 'como-elegir-el-mejor-metodo-de-pago-para-tu-ecommerce',
        excerpt: 'Explora las principales pasarelas de pago disponibles y aprende a seleccionar la más adecuada según las necesidades de tu tienda.',
        content: `
            <p>Elegir el método de pago correcto es crucial para el éxito de tu tienda online. En este artículo analizamos las principales opciones.</p>
            
            <h2>Pasarelas de pago populares</h2>
            <p>Existen múltiples opciones disponibles en el mercado, cada una con sus propias ventajas y desventajas.</p>
        `,
        featured_image: '/img/bioblog/blog-teclas.jpg',
        category_id: 3,
        category_name: 'SALUD AMBIENTAL',
        author: 'Carlos López',
        author_avatar: '',
        published_at: '2025-04-24T00:00:00Z',
        views: 980,
        comments_count: 5,
    },
    {
        id: 3,
        title: 'Guía rápida para nuevos vendedores en un marketplace',
        slug: 'guia-rapida-nuevos-vendedores-marketplace',
        excerpt: '¿Eres nuevo vendiendo en un marketplace como Dokan? Esta guía te ayudará a configurar tu tienda, subir productos y comenzar a vender.',
        content: `
            <p>Comenzar a vender en un marketplace puede parecer abrumador, pero con esta guía lo tendrás listo en poco tiempo.</p>
            
            <h2>Primeros pasos</h2>
            <p>1. Crea tu cuenta de vendedor</p>
            <p>2. Configura tu perfil</p>
            <p>3. Añade tus primeros productos</p>
        `,
        featured_image: '/img/bioblog/Fondos_BioBlog-6.webp',
        category_id: 5,
        category_name: 'SALUD ESPIRITUAL',
        author: 'Ana Martínez',
        author_avatar: '',
        published_at: '2025-04-24T00:00:00Z',
        views: 756,
        comments_count: 3,
    },
    {
        id: 4,
        title: 'Cómo convertir tu tienda física en una tienda online',
        slug: 'convertir-tienda-fisica-en-tienda-online',
        excerpt: 'En transformando tu negocio, descubre los pasos esenciales para migrar tu tienda física al entorno digital con éxito.',
        content: `
            <p>La transformación digital es esencial para cualquier negocio moderno. Aquí te mostramos cómo hacerlo.</p>
        `,
        featured_image: '/img/bioblog/laptop.jpg',
        category_id: 6,
        category_name: 'SALUD FAMILIAR',
        author: 'Pedro Ramírez',
        author_avatar: '',
        published_at: '2025-04-21T00:00:00Z',
        views: 1100,
        comments_count: 12,
    },
    {
        id: 5,
        title: 'Guía práctica para llevar tu negocio al mundo digital',
        slug: 'guia-practica-llevar-negocio-mundo-digital',
        excerpt: 'Descubre las estrategias clave para digitalizar tu negocio de alimentación saludable y aumentar tus ventas.',
        content: `
            <p>La digitalización ofrece enormes oportunidades para los negocios de alimentación saludable.</p>
        `,
        featured_image: '/img/bioblog/laptop.jpg',
        category_id: 2,
        category_name: 'SALUD ALIMENTARIA',
        author: 'Laura Hernández',
        author_avatar: '',
        published_at: '2025-05-20T00:00:00Z',
        views: 2100,
        comments_count: 15,
    },
    {
        id: 6,
        title: 'Tienes una tienda física? Esto es lo que necesitas para vender por internet',
        slug: 'tienda-fisica-vender-por-internet',
        excerpt: 'Transición ecológica y digital: todo lo que necesitas saber para expandir tu alcance online.',
        content: `
            <p>Vender por internet te permite llegar a más clientes más allá de tu ubicación física.</p>
        `,
        featured_image: '/img/bioblog/joven-sentado.jpg',
        category_id: 3,
        category_name: 'SALUD AMBIENTAL',
        author: 'Juan Pérez',
        author_avatar: '',
        published_at: '2025-05-20T00:00:00Z',
        views: 1850,
        comments_count: 9,
    },
];

export const getPostById = (id: number): BlogPost | undefined => {
    return posts.find((post) => post.id === id);
};

export const getPostBySlug = (slug: string): BlogPost | undefined => {
    return posts.find((post) => post.slug === slug);
};

export const getPostsByCategory = (categorySlug?: string): BlogPost[] => {
    if (!categorySlug || categorySlug === 'todos') {
        return posts;
    }
    const category = categories.find((c) => c.slug === categorySlug);
    if (!category) return posts;
    return posts.filter((post) => post.category_id === category.id);
};

export const getFeaturedPosts = (limit: number = 4): BlogPost[] => {
    return [...posts].sort((a, b) => b.views - a.views).slice(0, limit);
};

export const getRecentPosts = (limit: number = 6): BlogPost[] => {
    return [...posts]
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
        .slice(0, limit);
};
