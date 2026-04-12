import { LogisticsConfig } from './types';

export const MOCK_LOGISTICS_CONFIG: LogisticsConfig = {
    globalConfig: {
        envioGratuitoEnabled: true,
        montoMinimoGratuito: 150.00,
        recojoTiendaEnabled: true,
        direccionTienda: 'Av. Javier Prado Este 4200, Santiago de Surco, Lima',
        deliveryEnabled: true,
        puertaAPuertaEnabled: true,
        recojoAgenciaEnabled: true,
        localEnabled: true,
        interprovincialEnabled: false
    },
    cityRates: [
        {
            department: 'Lima',
            city: 'Lima Metropolitana',
            rate: 10.00,
            agencies: [
                { id: 1, name: 'Shalom - Sede Lurín', address: 'Av. Industrial 450', logo: '/img/SHALOM.png' },
                { id: 2, name: 'Olva - Sede Surco', address: 'Av. Caminos del Inca 250', logo: '/img/OLVA.png' }
            ]
        },
        {
            department: 'Lima',
            city: 'Huacho',
            rate: 15.00,
            agencies: [
                { id: 3, name: 'Shalom - Sede Huacho', address: 'Calle Real 123', logo: '/img/SHALOM.png' }
            ]
        },
        {
            department: 'Arequipa',
            city: 'Arequipa (Ciudad)',
            rate: 20.00,
            agencies: [
                { id: 4, name: 'Shalom - Arequipa', address: 'Av. Independencia 400', logo: '/img/SHALOM.png' },
                { id: 5, name: 'Olva - Yanahuara', address: 'Calle Lima 302', logo: '/img/OLVA.png' }
            ]
        }
    ],
    operators: {
        shalom: { enabled: true, name: 'Shalom', discount: 15 },
        olva: { enabled: true, name: 'Olva Courier', discount: 10 },
        express: { enabled: true, name: 'Servicios Express', discount: 10 }
    }
};
