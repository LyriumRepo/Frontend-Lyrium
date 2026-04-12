export interface PrivacySection {
    id: string;
    title: string;
    content: string;
    badge?: string;
    subSections?: { title: string; text: string }[];
    list?: string[];
}

export const privacyData: PrivacySection[] = [
    {
        id: 'pp-1',
        title: '1. Quiénes somos',
        content: 'Bienvenido(a) a LYRIUM BIO MARKETPLACE. Somos un marketplace donde conviven tiendas, productos y servicios saludables, conectando compradores y vendedores en un entorno seguro.',
        badge: 'Dirección: Piura – Perú',
    },
    {
        id: 'pp-2',
        title: '2. Información que recopilamos',
        content: '',
        subSections: [
            {
                title: 'Información de Registro',
                text: 'Cuando creas una cuenta, podemos solicitar datos como nombre, correo electrónico, teléfono, dirección y otra información necesaria para operar el servicio.',
            },
            {
                title: 'Información de Transacción',
                text: 'Recopilamos información relacionada a compras/ventas dentro del marketplace (por ejemplo, productos/servicios adquiridos, confirmaciones, envío y soporte).',
            },
            {
                title: 'Información Técnica',
                text: 'Podemos registrar información del dispositivo y navegación (IP, navegador, páginas visitadas, tiempos de carga) para mejorar seguridad y experiencia.',
            },
            {
                title: 'Cookies y Tecnologías Similares',
                text: 'Usamos cookies para recordar preferencias, medir el rendimiento y habilitar funciones esenciales del sitio.',
            },
        ],
    },
    {
        id: 'pp-3',
        title: '3. Uso de la información',
        content: 'Usamos la información recopilada para:',
        list: [
            'Proporcionar y mejorar nuestros servicios.',
            'Procesar transacciones y enviar confirmaciones.',
            'Responder consultas y brindar soporte al cliente.',
            'Personalizar tu experiencia y mostrar contenido relevante.',
            'Enviar comunicaciones (promos/actualizaciones) cuando corresponda.',
            'Cumplir obligaciones legales y de seguridad.',
        ],
    },
    {
        id: 'pp-4',
        title: '4. Compartir su información',
        content: 'Podremos divulgar información si es requerida por autoridades competentes o para proteger derechos, seguridad y prevenir fraudes.',
        subSections: [
            {
                title: 'Transferencias Comerciales',
                text: 'En caso de fusión, adquisición o venta de activos, la información podría transferirse bajo medidas de protección.',
            },
        ],
    },
    {
        id: 'pp-5',
        title: '5. Seguridad',
        content: 'Aplicamos medidas razonables para proteger tu información contra acceso no autorizado, alteración, divulgación o destrucción. Sin embargo, ningún método de transmisión o almacenamiento es 100% infalible.',
    },
    {
        id: 'pp-6',
        title: '6. Cookies',
        content: 'Las cookies son pequeños archivos que se almacenan en tu dispositivo. Nos ayudan a mejorar la experiencia.',
        subSections: [
            {
                title: 'Tipos de cookies que utilizamos',
                text: 'Cookies de sesión (temporales), Cookies persistentes (permanecen hasta que las elimines) y Cookies de terceros (servicios externos).',
            },
            {
                title: 'Cómo controlar las cookies',
                text: 'Puedes configurar tu navegador para bloquear o eliminar cookies. Ten en cuenta que algunas funciones podrían dejar de funcionar correctamente.',
            },
        ],
    },
    {
        id: 'pp-7',
        title: '7. Contenido incrustado de otros sitios web',
        content: 'Algunas páginas pueden incluir contenido incrustado (videos, imágenes, widgets). Este contenido se comporta como si visitaras el sitio de origen y podría recopilar datos según sus propias políticas.',
    },
    {
        id: 'pp-8',
        title: '8. Con quién compartimos sus datos',
        content: 'Compartimos datos únicamente con proveedores esenciales para operar el marketplace (por ejemplo, pagos, hosting y soporte técnico), y solo en la medida necesaria.',
    },
    {
        id: 'pp-9',
        title: '9. Cuánto tiempo conservamos sus datos',
        content: 'Conservamos la información durante el tiempo necesario para cumplir con los fines del servicio, obligaciones legales, auditorías o resolución de disputas.',
    },
    {
        id: 'pp-10',
        title: '10. Qué derechos tiene sobre sus datos',
        content: 'Dependiendo de tu ubicación, puedes tener derechos como acceso, corrección, eliminación o limitación del uso de tus datos. Para ejercerlos, contáctanos.',
    },
    {
        id: 'pp-11',
        title: '11. Dónde se envía su información',
        content: 'Tus datos podrían procesarse en servicios de infraestructura ubicados fuera de tu país. En esos casos, aplicamos medidas razonables para mantener la protección.',
    },
    {
        id: 'pp-12',
        title: '12. Cambios a esta política',
        content: 'Podemos actualizar esta Política de Privacidad cuando sea necesario. Publicaremos cambios en esta página y, cuando aplique, ajustaremos la fecha de actualización.',
    },
    {
        id: 'pp-13',
        title: '13. Contacto',
        content: 'Si tienes preguntas sobre esta Política de Privacidad, contáctanos:',
        list: [
            'Correo: info@lyriumbiomarketplace.com',
            'Dirección: Piura – Perú',
            'Teléfono: 969 343 913',
        ],
    },
];
