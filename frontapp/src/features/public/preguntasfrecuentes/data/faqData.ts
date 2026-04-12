export interface FAQItem {
    question: string;
    answer: string;
}

export interface FAQCategory {
    id: string;
    title: string;
    icon: string;
    description: string;
    color: string;
    items: FAQItem[];
}

export const faqData: FAQCategory[] = [
    {
        id: 'todos',
        title: 'Para todos',
        icon: '👥',
        description: 'Información general',
        color: 'sky',
        items: [
            {
                question: '¿Qué es LYRIUM BIOMARKETPLACE?',
                answer: 'Es un centro comercial online donde coexisten tiendas, productos y servicios saludables y muchos compradores.',
            },
            {
                question: '¿Qué tipos de productos y servicios ofrece LYRIUM BIOMARKETPLACE?',
                answer: 'Ofrece productos y servicios saludables en distintas categorías (bienestar, belleza, digestión, servicios médicos, etc.).',
            },
            {
                question: '¿Cómo puedo contactarme con LYRIUM BIOMARKETPLACE?',
                answer: 'Puedes contactarnos desde la sección "Contáctanos", redes sociales o WhatsApp (botón flotante).',
            },
        ],
    },
    {
        id: 'comprador',
        title: 'Si soy comprador',
        icon: '🛒',
        description: 'Compras, pagos y entregas',
        color: 'emerald',
        items: [
            {
                question: '¿Cuál es el horario de atención de LYRIUM BIOMARKETPLACE?',
                answer: 'LYRIUM BIOMARKETPLACE atiende las 24 horas del día, los 7 días de la semana durante todo el año; sin embargo, las tiendas registradas poseen propios y distintos horarios de atención.',
            },
            {
                question: '¿Cómo puedo comprar en LYRIUM BIOMARKETPLACE?',
                answer: 'Selecciona el producto/servicio, agrégalo al carrito y completa el proceso de compra con tus datos.',
            },
            {
                question: '¿Cuáles son los métodos de pago de LYRIUM BIOMARKETPLACE?',
                answer: 'Los métodos dependen de la tienda. Usualmente se aceptan tarjetas y otros medios habilitados por la plataforma.',
            },
            {
                question: '¿Cómo logro recibir mi(s) producto(s) luego de comprarlo(s) en LYRIUM BIOMARKETPLACE?',
                answer: 'Coordinas envío/entrega según la tienda y la zona; se mostrará la información disponible al finalizar la compra.',
            },
            {
                question: '¿Cómo logro recibir mi(s) servicio(s) luego de comprarlo(s) en LYRIUM BIOMARKETPLACE?',
                answer: 'La tienda/proveedor coordina contigo el agendamiento o la atención del servicio.',
            },
            {
                question: '¿Cómo realizo una devolución en LYRIUM BIOMARKETPLACE?',
                answer: 'Revisa la política de la tienda y solicita la devolución dentro del plazo indicado en términos y condiciones.',
            },
            {
                question: '¿Cómo se realizó un reembolso en LYRIUM BIOMARKETPLACE?',
                answer: 'Los reembolsos se gestionan según el medio de pago y la aprobación de la tienda, respetando tiempos bancarios.',
            },
        ],
    },
    {
        id: 'vendedor',
        title: 'Si soy vendedor',
        icon: '🏪',
        description: 'Registro y ventas',
        color: 'violet',
        items: [
            {
                question: '¿Qué tipos de tiendas pueden registrarse en LYRIUM BIOMARKETPLACE?',
                answer: 'Pueden registrarse vendedores con personería natural y jurídica cuyo rubro esté incluido en cualquiera de las categorías de productos y servicios que figuran en el menú de la página principal del sitio web.',
            },
            {
                question: '¿Cómo puedo vender en LYRIUM BIOMARKETPLACE?',
                answer: 'Registra tu tienda, completa tus datos, publica productos/servicios y gestiona tus ventas desde tu panel.',
            },
        ],
    },
];

export const benefitsData = [
    {
        title: 'Todo salud',
        description: 'Tiendas saludables y ecoamigables para tu bienestar',
        icon: 'heart',
        color: 'sky',
    },
    {
        title: 'Tiendas selectas',
        description: 'Tiendas de calidad cuidadosamente seleccionadas para ti',
        icon: 'store',
        color: 'emerald',
    },
    {
        title: 'Mejores precios',
        description: 'Mejores ofertas, promociones y descuentos',
        icon: 'tag',
        color: 'amber',
    },
    {
        title: 'Seguridad',
        description: 'Biomarketplace 100% seguro',
        icon: 'shield',
        color: 'violet',
    },
    {
        title: 'Rapidez',
        description: 'Mayor rapidez en tus compras',
        icon: 'zap',
        color: 'lime',
    },
    {
        title: 'Más tiempo',
        description: 'Ahorra tiempo en transportarte y en colas presenciales',
        icon: 'clock',
        color: 'slate',
    },
    {
        title: 'Donde quieras',
        description: 'Envíos a todo el Perú',
        icon: 'globe',
        color: 'rose',
    },
];
