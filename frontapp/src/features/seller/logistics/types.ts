export interface Agency {
    id: number;
    name: string;
    address: string;
    logo: string;
}

export interface CityRate {
    department: string;
    city: string;
    rate: number;
    agencies: Agency[];
}

export interface GlobalLogisticsConfig {
    envioGratuitoEnabled: boolean;
    montoMinimoGratuito: number;
    recojoTiendaEnabled: boolean;
    direccionTienda: string;
    deliveryEnabled: boolean;
    puertaAPuertaEnabled: boolean;
    recojoAgenciaEnabled: boolean;
    localEnabled: boolean;
    interprovincialEnabled: boolean;
}

export interface CarrierOperator {
    enabled: boolean;
    name: string;
    discount: number;
}

export interface LogisticsConfig {
    globalConfig: GlobalLogisticsConfig;
    cityRates: CityRate[];
    operators: {
        shalom: CarrierOperator;
        olva: CarrierOperator;
        express: CarrierOperator;
    };
}
