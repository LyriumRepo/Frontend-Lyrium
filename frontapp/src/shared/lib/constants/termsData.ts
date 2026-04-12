export interface TermSection {
    id: string;
    title: string;
    content: string; // HTML allowed or plain text
}

export interface TermsConfig {
    subtitle: string;
    pdfLabel: string;
    pdfHref: string;
    pdfName: string;
}

export const termsData: { [key: string]: TermSection[] } = {
    cliente: [
        {
            id: 'primero-privacidad',
            title: '1. Privacidad',
            content: `
        <p class="mb-4">El uso del Marketplace lyriumbiomarketplace.com estará sujeto a la aceptación de los Términos y Condiciones detallados a continuación:</p>
        <div class="font-bold text-gray-900 mb-2">1.1 Información que recopilamos</div>
        <p class="mb-4">Los datos personales requeridos por el Marketplace, tales como nombres, apellidos, RUC (opcional), tipo de documento de identidad, número de documento de identidad, domicilio, departamento, provincia, número de contacto y correo electrónico serán de uso exclusivo del sitio para concretar las operaciones de compra y venta que el usuario desee realizar.</p>
        <p class="mb-4">La información que indirectamente nos proporcione, tales como cookies (preferencias del usuario cuando visite nuestra página web o redes sociales), direcciones IP, conexiones y sistemas de información; podrán ser usadas con el único fin de brindar una mejor experiencia al usuario y gestionar mejoras de productos/servicios.</p>
        <div class="font-bold text-gray-900 mb-2">1.2 Guardamos su información de manera segura</div>
        <p class="mb-4">El sitio guarda toda su información personal de forma segura y confidencial. Sólo personal autorizado podrá acceder a su información personal en cumplimiento de los términos y condiciones.</p>
        <div class="font-bold text-gray-900 mb-2">1.3 Finalidades del tratamiento</div>
        <p class="mb-4">Los datos personales que usted libremente proporciona serán tratados para: atender consultas, quejas, reclamos y hacer seguimiento; enviar información o publicidad sobre productos/servicios; invitar a participar en concursos/actividades; encuestas de satisfacción; administración interna; estudios de mercado; comercio electrónico; entrega de pedidos, entre otros.</p>
        <div class="font-bold text-gray-900 mb-2">1.4 Acceso y Transferencia</div>
        <p class="mb-4">El sitio podrá compartir con terceros sus datos personales bajo circunstancias limitadas (socios, proveedores de internet, administradores web, managers de redes sociales, call centers, mensajería, transportes, etc.) para cumplir finalidades antes descritas. También podrá facilitar información a organismos públicos o autoridades competentes si es requerido por ley.</p>
      `
        },
        {
            id: 'segundo-modificacion',
            title: '2. Modificación de los T&C',
            content: `
        <p class="mb-4">El sitio se reserva el derecho de actualizar y/o modificar los Términos y Condiciones del uso del Marketplace, poniéndolos a disposición de los usuarios para su conocimiento con el objetivo final de mejorar el servicio de nuestra comunidad.</p>
      `
        },
        {
            id: 'tercero-creacion-cuenta',
            title: '3. Creación de Cuenta',
            content: `
        <p class="mb-4">Para comprar productos y/o servicios en el sitio no es necesario estar registrado; sin embargo, aquel usuario que esté registrado o cree una cuenta podrá recibir beneficios adicionales.</p>
        <p class="mb-4">Un usuario podrá crear una cuenta completando el formulario que aparece en el sitio web. Al registrarse acepta que:</p>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li>Proveerá información básica y real sobre su persona/empresa.</li>
          <li>Actualizará esta información si cambia.</li>
          <li>Será responsable por la veracidad de la información y por mantener la confidencialidad de sus credenciales.</li>
        </ul>
      `
        },
        {
            id: 'quinto-metodo-pago',
            title: '5. Método de Pago',
            content: `
        <p class="mb-4">Los productos y servicios ofrecidos sólo podrán ser pagados bajo la modalidad de pago en línea. Los pagos en línea son procesados por una pasarela de pagos; el uso de tarjetas se sujetará a lo establecido por su banco emisor y al marco contractual correspondiente.</p>
        <p class="mb-4">Los reembolsos por devoluciones se realizarán a través del mismo medio de pago utilizado, sujeto a las políticas del banco emisor.</p>
      `
        },
        {
            id: 'sexto-consentimiento',
            title: '6. Formación del Consentimiento',
            content: `
        <p class="mb-4">Las empresas vendedoras realizan ofertas de bienes y servicios que pueden concretarse mediante la aceptación del usuario (en línea) y usando los mecanismos del sitio. Toda aceptación quedará sujeta a la condición suspensiva de validación de la transacción por parte del sitio.</p>
      `
        },
        {
            id: 'septimo-envios',
            title: '7. Envíos',
            content: `
        <p class="mb-4">El sitio permite despachos a nivel nacional de productos. Estos estarán sujetos a las políticas de despacho de cada empresa vendedora. La accesibilidad de destinos será identificada por el usuario al momento de comprar.</p>
      `
        },
        {
            id: 'octavo-devoluciones',
            title: '8. Devoluciones',
            content: `
        <p class="mb-4">Los procedimientos de devoluciones de cada artículo o producto están sujetos a las decisiones de cada empresa vendedora del Marketplace LYRIUM.</p>
      `
        },
        {
            id: 'noveno-reembolsos',
            title: '9. Reembolsos',
            content: `
        <p class="mb-4">Los procedimientos de reembolso de cada producto y/o servicio están sujetos a las decisiones de cada empresa vendedora del Marketplace LYRIUM.</p>
      `
        },
        {
            id: 'decimo-exoneracion',
            title: '10. Exoneración de Responsabilidad',
            content: `
        <p class="mb-4">LYRIUM se constituye como un Marketplace que reúne a vendedores y compradores; por tanto, no será responsable de las características del producto adquirido, su envío y/o despacho, los cuales corresponden a la empresa vendedora.</p>
      `
        }
    ],
    vendedor: [
        {
            id: 'vend-primero',
            title: '1. Obligaciones del Vendedor',
            content: `
        <p class="mb-4">El vendedor se compromete a publicar información veraz y completa sobre sus productos/servicios, incluyendo precios, stock, condiciones, imágenes y restricciones aplicables.</p>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li>Cumplir con los plazos de despacho y la atención posventa ofrecida.</li>
          <li>Gestionar garantías, devoluciones y reclamos según su política y la normativa aplicable.</li>
          <li>Responder por la calidad, idoneidad y legalidad de los bienes/servicios ofrecidos.</li>
        </ul>
      `
        }
    ]
};

export const termsConfigs: { [key: string]: TermsConfig } = {
    cliente: {
        subtitle: "TÉRMINOS Y CONDICIONES GENERALES APLICABLES A LOS CLIENTES",
        pdfLabel: "Descargar PDF Cliente",
        pdfHref: "/pdf/cliente.pdf",
        pdfName: "cliente.pdf"
    },
    vendedor: {
        subtitle: "TÉRMINOS Y CONDICIONES GENERALES APLICABLES A LOS VENDEDORES",
        pdfLabel: "Descargar PDF Vendedor",
        pdfHref: "/pdf/vendedor.pdf",
        pdfName: "vendedor.pdf"
    }
};
