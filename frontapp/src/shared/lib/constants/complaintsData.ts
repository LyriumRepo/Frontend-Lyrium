export const complaintsConfig = {
    header: {
        title: 'Libro de reclamaciones',
        intro: 'Conforme a lo establecido en el Código de Protección y Defensa del Consumidor este establecimiento cuenta con un Libro de Reclamaciones Virtual a tu disposición.',
    },
    helpTexts: {
        reclamo: {
            title: 'Reclamo',
            info: 'Disconformidad relacionada a un producto/servicio adquirido (calidad, entrega, garantía, etc.).',
            placeholder: 'Describe el problema con el producto/servicio, cuándo ocurrió y qué solución solicitas.'
        },
        queja: {
            title: 'Queja',
            info: 'Disconformidad frente a una mala atención del proveedor (sin relación directa con el producto/servicio).',
            placeholder: 'Describe la atención recibida, fecha, canal, persona que te atendió y lo ocurrido.'
        }
    },
    options: {
        tipo_persona: ['Persona natural', 'Persona jurídica'],
        tipo_documento: ['DNI', 'CE', 'Pasaporte', 'RUC'],
        bien_contratado: ['Producto', 'Servicio'],
        comprobante_pago: ['Boleta', 'Factura', 'Sin comprobante'],
        tiendas: ['VIDA NATURAL', 'LYRIUM']
    }
};
