import { ChatConversation } from './types';

export const MOCK_CHAT_DATA: ChatConversation[] = [
    {
        id: 1,
        nombre: 'Ricardo Sánchez',
        email: 'rsanchez@agricola.pe',
        dni: '45889922',
        avatar: 'https://i.pravatar.cc/150?u=1',
        ultimoMensaje: 'Gracias por el soporte técnico',
        fecha: '10:45 AM',
        type: 'tech',
        critical: false,
        mensajes: [
            { sender: 'other', contenido: 'Hola, tengo una duda con mi último pedido.', hora: '10:30' }
        ]
    },
    {
        id: 2,
        nombre: 'Elena Torres',
        email: 'etorres@gmail.com',
        dni: '10223344',
        avatar: 'https://i.pravatar.cc/150?u=2',
        ultimoMensaje: '¡Excelente servicio!',
        fecha: 'AYER',
        type: 'comment',
        critical: false,
        mensajes: [
            { sender: 'other', contenido: 'Solo quería decir que el producto es genial.', hora: '16:00' }
        ]
    },
    {
        id: 3,
        nombre: 'Marcos Ruiz',
        email: 'mruiz@outlook.com',
        dni: '70889911',
        avatar: 'https://i.pravatar.cc/150?u=3',
        ultimoMensaje: 'Soporte técnico urgente',
        fecha: 'LUNES',
        type: 'tech',
        critical: true,
        mensajes: [
            { sender: 'other', contenido: 'Mi sistema no arranca, necesito ayuda ya.', hora: '09:15' }
        ]
    },
    {
        id: 4,
        nombre: 'Ana Belén',
        email: 'abelen@empresa.com',
        dni: '20334455',
        avatar: 'https://i.pravatar.cc/150?u=4',
        ultimoMensaje: '¿Dónde está mi factura?',
        fecha: '02/02/26',
        type: 'admin',
        critical: false,
        mensajes: [
            { sender: 'other', contenido: 'Hola, necesito el duplicado de mi boleta de enero.', hora: '11:45' }
        ]
    },
    {
        id: 5,
        nombre: 'Bruno Díaz',
        email: 'bdiaz@industrias.pe',
        dni: '10556677',
        avatar: 'https://i.pravatar.cc/150?u=5',
        ultimoMensaje: 'Información sobre nuevos planes',
        fecha: '11:20 AM',
        type: 'info',
        critical: false,
        mensajes: [
            { sender: 'other', contenido: 'Quisiera conocer los costos por volumen.', hora: '11:00' }
        ]
    }
];

const AUTO_RESPONSES = [
    'Gracias por contactarnos. Un especialista te atenderá pronto.',
    'Hemos recibido tu mensaje. Estamos revisando tu caso.',
    'Entendemos tu situación. Te daremos una solución a la brevedad.',
    'Tu consulta es importante para nosotros. En breve te respondemos.',
];

export function getAutoResponse(conversationId: number): { sender: 'other'; contenido: string; hora: string } {
    const now = new Date();
    const hora = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const contenido = AUTO_RESPONSES[conversationId % AUTO_RESPONSES.length];
    return { sender: 'other', contenido, hora };
}
