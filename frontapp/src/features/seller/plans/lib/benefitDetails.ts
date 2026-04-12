// ============================================
// BENEFIT DETAILS — Datos de respaldo
// Migrado del bloque <script> hardcodeado en Planes.php
//
// En el sistema original PHP, estos datos se inyectaban como
// var benefitDetails = {...} en el HTML.
// Se usan como FALLBACK cuando el plan no tiene detailedBenefits
// configurados en la BD (campo plan_beneficios_detallados).
// ============================================

export interface BenefitDetail {
  title: string;
  description: string;
  icon: string;
}

export const benefitDetailsFallback: Record<string, BenefitDetail[]> = {
  basic: [
    { icon: '🔍', title: 'Exposición de productos al buscar en LYRIUM',         description: 'Tus productos aparecerán en los resultados de búsqueda de LYRIUM Biomarketplace, permitiendo que potenciales compradores encuentren tus ofertas fácilmente.' },
    { icon: '🏪', title: 'Espacio propio para personalizar tu tienda',           description: 'Obtén una tienda virtual completamente personalizable donde puedes mostrar tu marca, productos y servicios con tu propio estilo.' },
    { icon: '🎨', title: 'Logotipo, información y banner publicitario',          description: 'Sube tu logotipo empresarial, agrega información de tu empresa y configura un banner publicitario atractivo para captar la atención de visitantes.' },
    { icon: '📦', title: 'Exposición de productos y servicios',                  description: 'Publica y exhibe tus productos y servicios con descripciones detalladas, imágenes de alta calidad y precios competitivos.' },
    { icon: '📱', title: 'Redes sociales en tu tienda',                          description: 'Integra los enlaces de tus redes sociales directamente en tu tienda para que los visitantes puedan seguirte y conectar contigo.' },
    { icon: '📂', title: 'Clasificador propio para productos/servicios',         description: 'Organiza tus productos y servicios en categorías personalizadas para facilitar la navegación de tus clientes.' },
    { icon: '✉️', title: 'Formulario de contacto para compradores',              description: 'Los compradores interesados pueden enviarte consultas directamente a través de un formulario de contacto integrado.' },
    { icon: '💼', title: 'Tarjeta empresarial en catálogo LYRIUM',               description: 'Tu empresa tendrá una tarjeta de presentación visible en el catálogo general de LYRIUM, aumentando tu visibilidad.' },
    { icon: '🎬', title: 'Instructivos audiovisuales de inducción',              description: 'Accede a tutoriales en video que te guiarán paso a paso para configurar y aprovechar al máximo tu tienda en LYRIUM.' },
    { icon: '📊', title: 'Instructivos del panel de control (dashboard)',         description: 'Aprende a utilizar todas las funciones del panel de control con instructivos detallados y fáciles de seguir.' },
    { icon: '⭐', title: 'Logo en marcas destacadas de página principal',        description: 'Tu logotipo aparecerá en la sección de marcas destacadas de la página principal de LYRIUM, dándote exposición premium.' },
  ],
  emprende: [
    { icon: '🔍', title: 'Exposición de productos al buscar en LYRIUM',         description: 'Tus productos aparecerán en los resultados de búsqueda de LYRIUM Biomarketplace, permitiendo que potenciales compradores encuentren tus ofertas fácilmente.' },
    { icon: '🏪', title: 'Espacio propio para personalizar tu tienda',           description: 'Obtén una tienda virtual completamente personalizable donde puedes mostrar tu marca, productos y servicios con tu propio estilo.' },
    { icon: '🎨', title: 'Logotipo, información y banner publicitario',          description: 'Sube tu logotipo empresarial, agrega información de tu empresa y configura un banner publicitario atractivo para captar la atención de visitantes.' },
    { icon: '📦', title: 'Exposición de productos y servicios',                  description: 'Publica y exhibe tus productos y servicios con descripciones detalladas, imágenes de alta calidad y precios competitivos.' },
    { icon: '📱', title: 'Redes sociales en tu tienda',                          description: 'Integra los enlaces de tus redes sociales directamente en tu tienda para que los visitantes puedan seguirte y conectar contigo.' },
    { icon: '📂', title: 'Clasificador propio para productos/servicios',         description: 'Organiza tus productos y servicios en categorías personalizadas para facilitar la navegación de tus clientes.' },
    { icon: '✉️', title: 'Formulario de contacto para compradores',              description: 'Los compradores interesados pueden enviarte consultas directamente a través de un formulario de contacto integrado.' },
    { icon: '💼', title: 'Tarjeta empresarial en catálogo LYRIUM',               description: 'Tu empresa tendrá una tarjeta de presentación visible en el catálogo general de LYRIUM, aumentando tu visibilidad.' },
    { icon: '🎬', title: 'Instructivos audiovisuales de inducción',              description: 'Accede a tutoriales en video que te guiarán paso a paso para configurar y aprovechar al máximo tu tienda en LYRIUM.' },
    { icon: '📊', title: 'Instructivos del panel de control (dashboard)',         description: 'Aprende a utilizar todas las funciones del panel de control con instructivos detallados y fáciles de seguir.' },
    { icon: '⭐', title: 'Logo en marcas destacadas de página principal',        description: 'Tu logotipo aparecerá en la sección de marcas destacadas de la página principal de LYRIUM, dándote exposición premium.' },
  ],
  standard: [
    { icon: '✅', title: 'Todo lo del plan Emprende',                            description: 'Incluye absolutamente todos los beneficios del plan Emprende: tienda personalizable, exposición de productos, formulario de contacto, tarjeta empresarial y más.' },
    { icon: '🏆', title: 'Logo en banners principales de LYRIUM',                description: 'Tu logotipo se exhibirá en los banners principales de la plataforma, garantizando máxima visibilidad ante todos los visitantes.' },
    { icon: '🎓', title: 'Capacitaciones online en postventa',                   description: 'Accede a sesiones de capacitación online enfocadas en estrategias de postventa para fidelizar clientes y aumentar ventas recurrentes.' },
    { icon: '🏅', title: 'Medalla de producto recomendado por LYRIUM',           description: 'Tus productos llevarán una medalla especial de "Recomendado por LYRIUM", generando confianza y credibilidad ante los compradores.' },
    { icon: '🛎️', title: 'Atención preferencial por LYRIUM',                   description: 'Recibe soporte prioritario del equipo de LYRIUM con tiempos de respuesta reducidos para resolver cualquier consulta o incidencia.' },
    { icon: '🎁', title: 'Merchandising y material especial postventa',          description: 'Obtén material de merchandising y recursos especiales para entregar a tus clientes después de la compra, mejorando su experiencia.' },
    { icon: '📈', title: 'Asesorías de seguimiento comercial',                   description: 'Un asesor comercial te acompañará con seguimiento personalizado para optimizar tus estrategias de venta y crecimiento.' },
    { icon: '💻', title: 'Capacitaciones del dashboard del vendedor',            description: 'Sesiones especializadas para dominar todas las herramientas avanzadas del dashboard y maximizar tu productividad como vendedor.' },
    { icon: '🛒', title: 'Capacitaciones de comercio electrónico',               description: 'Aprende las mejores prácticas del e-commerce con capacitaciones profesionales sobre marketing digital, conversión y tendencias del mercado.' },
    { icon: '🤝', title: 'Capacitaciones en atención al cliente',                description: 'Mejora tu servicio al cliente con capacitaciones especializadas en comunicación efectiva, resolución de conflictos y satisfacción del comprador.' },
  ],
  crece: [
    { icon: '✅', title: 'Todo lo del plan Emprende',                            description: 'Incluye absolutamente todos los beneficios del plan Emprende: tienda personalizable, exposición de productos, formulario de contacto, tarjeta empresarial y más.' },
    { icon: '🏆', title: 'Logo en banners principales de LYRIUM',                description: 'Tu logotipo se exhibirá en los banners principales de la plataforma, garantizando máxima visibilidad ante todos los visitantes.' },
    { icon: '🎓', title: 'Capacitaciones online en postventa',                   description: 'Accede a sesiones de capacitación online enfocadas en estrategias de postventa para fidelizar clientes y aumentar ventas recurrentes.' },
    { icon: '🏅', title: 'Medalla de producto recomendado por LYRIUM',           description: 'Tus productos llevarán una medalla especial de "Recomendado por LYRIUM", generando confianza y credibilidad ante los compradores.' },
    { icon: '🛎️', title: 'Atención preferencial por LYRIUM',                   description: 'Recibe soporte prioritario del equipo de LYRIUM con tiempos de respuesta reducidos para resolver cualquier consulta o incidencia.' },
    { icon: '🎁', title: 'Merchandising y material especial postventa',          description: 'Obtén material de merchandising y recursos especiales para entregar a tus clientes después de la compra, mejorando su experiencia.' },
    { icon: '📈', title: 'Asesorías de seguimiento comercial',                   description: 'Un asesor comercial te acompañará con seguimiento personalizado para optimizar tus estrategias de venta y crecimiento.' },
    { icon: '💻', title: 'Capacitaciones del dashboard del vendedor',            description: 'Sesiones especializadas para dominar todas las herramientas avanzadas del dashboard y maximizar tu productividad como vendedor.' },
    { icon: '🛒', title: 'Capacitaciones de comercio electrónico',               description: 'Aprende las mejores prácticas del e-commerce con capacitaciones profesionales sobre marketing digital, conversión y tendencias del mercado.' },
    { icon: '🤝', title: 'Capacitaciones en atención al cliente',                description: 'Mejora tu servicio al cliente con capacitaciones especializadas en comunicación efectiva, resolución de conflictos y satisfacción del comprador.' },
  ],
  premium: [
    { icon: '✅', title: 'Todo lo del plan Crece',                               description: 'Incluye absolutamente todos los beneficios del plan Crece: banners principales, capacitaciones, medalla recomendado, atención preferencial y mucho más.' },
    { icon: '🏆', title: 'Logo en banners principales de LYRIUM',                description: 'Presencia premium en los banners más visibles de toda la plataforma con diseño destacado y posicionamiento preferente.' },
    { icon: '🎓', title: 'Capacitaciones online en postventa',                   description: 'Capacitaciones avanzadas y exclusivas con casos de estudio reales para dominar las estrategias de postventa más efectivas del sector.' },
    { icon: '🏅', title: 'Medalla de producto recomendado por LYRIUM',           description: 'Medalla exclusiva premium con diseño diferenciado que destaca aún más tus productos en los resultados de búsqueda.' },
    { icon: '⚡', title: 'Atención preferencial prioritaria',                    description: 'Soporte VIP con canal de comunicación dedicado y tiempos de respuesta inmediatos. Tu satisfacción es nuestra máxima prioridad.' },
    { icon: '🎁', title: 'Merchandising y material especial postventa',          description: 'Kit completo de merchandising premium personalizado con tu marca y materiales exclusivos para impresionar a tus clientes.' },
    { icon: '📈', title: 'Asesorías de seguimiento comercial avanzadas',         description: 'Programa intensivo de asesoría comercial con análisis de datos, estrategias personalizadas y seguimiento continuo de tus métricas de venta.' },
    { icon: '💻', title: 'Capacitaciones avanzadas del dashboard',               description: 'Masterclasses exclusivas sobre funcionalidades avanzadas del dashboard con técnicas de automatización y optimización profesional.' },
    { icon: '🛒', title: 'Capacitaciones avanzadas de e-commerce',              description: 'Formación de élite en comercio electrónico con expertos del sector, incluyendo estrategias de growth hacking y marketing avanzado.' },
    { icon: '🤝', title: 'Capacitaciones avanzadas en atención al cliente',      description: 'Programa completo de excelencia en servicio al cliente con certificación, incluyendo técnicas de retención y experiencia del usuario.' },
  ],
  especial: [
    { icon: '✅', title: 'Todo lo del plan Crece',                               description: 'Incluye absolutamente todos los beneficios del plan Crece: banners principales, capacitaciones, medalla recomendado, atención preferencial y mucho más.' },
    { icon: '🏆', title: 'Logo en banners principales de LYRIUM',                description: 'Presencia premium en los banners más visibles de toda la plataforma con diseño destacado y posicionamiento preferente.' },
    { icon: '🎓', title: 'Capacitaciones online en postventa',                   description: 'Capacitaciones avanzadas y exclusivas con casos de estudio reales para dominar las estrategias de postventa más efectivas del sector.' },
    { icon: '🏅', title: 'Medalla de producto recomendado por LYRIUM',           description: 'Medalla exclusiva premium con diseño diferenciado que destaca aún más tus productos en los resultados de búsqueda.' },
    { icon: '⚡', title: 'Atención preferencial prioritaria',                    description: 'Soporte VIP con canal de comunicación dedicado y tiempos de respuesta inmediatos. Tu satisfacción es nuestra máxima prioridad.' },
    { icon: '🎁', title: 'Merchandising y material especial postventa',          description: 'Kit completo de merchandising premium personalizado con tu marca y materiales exclusivos para impresionar a tus clientes.' },
    { icon: '📈', title: 'Asesorías de seguimiento comercial avanzadas',         description: 'Programa intensivo de asesoría comercial con análisis de datos, estrategias personalizadas y seguimiento continuo de tus métricas de venta.' },
    { icon: '💻', title: 'Capacitaciones avanzadas del dashboard',               description: 'Masterclasses exclusivas sobre funcionalidades avanzadas del dashboard con técnicas de automatización y optimización profesional.' },
    { icon: '🛒', title: 'Capacitaciones avanzadas de e-commerce',               description: 'Formación de élite en comercio electrónico con expertos del sector, incluyendo estrategias de growth hacking y marketing avanzado.' },
    { icon: '🤝', title: 'Capacitaciones avanzadas en atención al cliente',      description: 'Programa completo de excelencia en servicio al cliente con certificación, incluyendo técnicas de retención y experiencia del usuario.' },
  ],
};
