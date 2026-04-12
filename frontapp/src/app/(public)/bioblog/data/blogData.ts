export interface Category {
    name: string;
    href: string;
    active?: boolean;
}

export const blogCategories: Category[] = [
    { name: 'Todos', href: '/bioblog', active: true },
    { name: 'Salud Alimentaria', href: '/bioblog/salud-alimentaria' },
    { name: 'Salud Ambiental', href: '/bioblog/salud-ambiental' },
    { name: 'Salud Emocional', href: '/bioblog/salud-emocional' },
    { name: 'Salud Espiritual', href: '/bioblog/salud-espiritual' },
    { name: 'Salud Familiar', href: '/bioblog/salud-familiar' },
];

export interface HeroPost {
    id: string;
    img: string;
    alt: string;
    category: string;
    title: string;
    url: string;
    date: string;
    excerpt: string;
}

export const heroPosts: HeroPost[] = [
    {
        id: '1',
        img: '/img/bioblog/laptop.jpg',
        alt: 'Guía práctica para llevar tu negocio al mundo digital sin complicaciones',
        category: 'SALUD ALIMENTARIA',
        title: 'Guía práctica para llevar tu negocio al mundo digital sin complicaciones',
        url: 'https://lyriumbiomarketplace.com/guia-practica-para-llevar-tu-negocio-al-mundo-digital-sin-complicaciones/',
        date: 'MAYO 20, 2025',
        excerpt: 'Descubre las estrategias clave para digitalizar tu negocio de alimentación saludable...',
    },
    {
        id: '2',
        img: '/img/bioblog/joven-sentado.jpg',
        alt: '¿Tienes una tienda física? Esto es lo que necesitas para vender por internet',
        category: 'SALUD AMBIENTAL',
        title: '¿Tienes una tienda física? Vende por internet fácilmente',
        url: 'https://lyriumbiomarketplace.com/tienes-una-tienda-fisica-esto-es-lo-que-necesitas-para-vender-por-internet/',
        date: 'MAYO 20, 2025',
        excerpt: 'Transición ecológica y digital: todo lo que necesitas saber para expandir tu alcance...',
    },
    {
        id: '3',
        img: '/img/bioblog/chica-sentada.jpg',
        alt: 'El poder de la meditación',
        category: 'SALUD EMOCIONAL',
        title: 'El poder de la meditación para una vida plena',
        url: 'https://lyriumbiomarketplace.com/el-poder-de-la-meditacion/',
        date: 'MAYO 4, 2025',
        excerpt: 'Encuentra el equilibrio interior y mejora tu bienestar emocional con estas técnicas...',
    },
    {
        id: '4',
        img: '/img/bioblog/blog-teclas.jpg',
        alt: 'Cómo elegir el mejor método de pago para tu eCommerce',
        category: 'SALUD AMBIENTAL',
        title: 'Métodos de pago sostenibles para tu eCommerce',
        url: 'https://lyriumbiomarketplace.com/entrada-5/',
        date: 'ABRIL 24, 2025',
        excerpt: 'Optimiza tus transacciones y reduce la huella de carbono digital...',
    },
];

export interface BlogPost {
    id: string;
    img: string;
    category: string;
    title: string;
    url: string;
    date: string;
    excerpt: string;
}

export const blogPosts: BlogPost[] = [
    {
        id: '1',
        img: '/img/bioblog/blog-teclas.jpg',
        category: 'SALUD EMOCIONAL',
        title: 'El poder de la meditación',
        url: 'https://lyriumbiomarketplace.com/el-poder-de-la-meditacion/',
        date: 'MAYO 4, 2025',
        excerpt: 'El poder de la meditación La meditación es una práctica milenaria que ha demostrado tener un impacto profundo en el',
    },
    {
        id: '2',
        img: '/img/bioblog/joven-sentado.jpg',
        category: 'SALUD AMBIENTAL',
        title: 'Cómo elegir el mejor método de pago para tu eCommerce',
        url: 'https://lyriumbiomarketplace.com/entrada-5/',
        date: 'ABRIL 24, 2025',
        excerpt: 'Explora las principales pasarelas de pago disponibles y aprende a seleccionar la más adecuada según las necesidades de tu tienda',
    },
    {
        id: '3',
        img: '/img/bioblog/Fondos_BioBlog-6.webp',
        category: 'SALUD ESPIRITUAL',
        title: 'Guía rápida para nuevos vendedores en un marketplace',
        url: 'https://lyriumbiomarketplace.com/entrada-4/',
        date: 'ABRIL 24, 2025',
        excerpt: '¿Eres nuevo vendiendo en un marketplace como Dokan? Esta guía te ayudará a configurar tu tienda, subir productos y comenzar',
    },
    {
        id: '4',
        img: '/img/bioblog/laptop.jpg',
        category: 'SALUD FAMILIAR',
        title: 'Cómo convertir tu tienda física en una tienda online',
        url: 'https://lyriumbiomarketplace.com/entrada-3/',
        date: 'ABRIL 21, 2025',
        excerpt: 'En transformando tu negocio, descubre los pasos esenciales para migrar tu tienda física al entorno digital con éxito.',
    },
];

export interface VideoItem {
    id: string;
    title: string;
    category: string;
    categoryLabel: string;
    videoId: string;
}

export const videoCategories = [
    { id: '*', name: 'Todos los videos' },
    { id: 'salud-alimentaria', name: 'SALUD ALIMENTARIA' },
    { id: 'salud-ambiental', name: 'SALUD AMBIENTAL' },
    { id: 'salud-emocional', name: 'SALUD EMOCIONAL' },
    { id: 'salud-espiritual', name: 'SALUD ESPIRITUAL' },
    { id: 'salud-familiar', name: 'SALUD FAMILIAR' },
    { id: 'salud-fisica', name: 'SALUD FISICA' },
    { id: 'salud-mental', name: 'SALUD MENTAL' },
    { id: 'salud-sexual', name: 'SALUD SEXUAL' },
    { id: 'salud-social', name: 'SALUD SOCIAL' },
];

export const videos: VideoItem[] = [
    { id: '1', title: 'Mejorando mi calidad de vida', category: 'salud-alimentaria', categoryLabel: 'SALUD ALIMENTARIA', videoId: 'ACPkTAPJLnM' },
    { id: '2', title: 'Cambiar mis hábitos para bien', category: 'salud-alimentaria', categoryLabel: 'SALUD ALIMENTARIA', videoId: 'E0bria5w1lc' },
    { id: '3', title: 'Salud, Belleza y Bienestar', category: 'salud-alimentaria', categoryLabel: 'SALUD ALIMENTARIA', videoId: 'wiJzsSP_5Ao' },
    { id: '4', title: 'Impacto de las emociones en la salud', category: 'salud-espiritual', categoryLabel: 'SALUD ESPIRITUAL', videoId: '9reNgtVBcJ4' },
    { id: '5', title: 'La salud mental también es importante', category: 'salud-mental', categoryLabel: 'SALUD MENTAL', videoId: 'G2vjOVda6og' },
    { id: '6', title: 'COMIDA SALUDABLE', category: 'salud-alimentaria', categoryLabel: 'SALUD ALIMENTARIA', videoId: 'wiJzsSP_5Ao' },
    { id: '7', title: 'Relaciones y Salud Social', category: 'salud-social', categoryLabel: 'SALUD SOCIAL', videoId: 'wiJzsSP_5Ao' },
    { id: '8', title: 'Bienestar Emocional Diario', category: 'salud-emocional', categoryLabel: 'SALUD EMOCIONAL', videoId: 'ACPkTAPJLnM' },
    { id: '9', title: 'Nuevas Historias Inspiradoras', category: 'salud-familiar', categoryLabel: 'SALUD FAMILIAR', videoId: 'E0bria5w1lc' },
];
