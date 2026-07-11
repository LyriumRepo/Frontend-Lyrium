export const companyColors = {
    lima: '#B7E000',
    verde: '#8FD400',
    turquesaClaro: '#66D6A8',
    turquesa: '#4EC7B8',
    celeste: '#69BEEB',
    azulCeleste: '#5AAFE6',
} as const;

export type CompanyColorName = keyof typeof companyColors;

export const circleColors: { color: CompanyColorName; hex: string }[] = [
    { color: 'lima', hex: companyColors.lima },
    { color: 'verde', hex: companyColors.verde },
    { color: 'turquesaClaro', hex: companyColors.turquesaClaro },
    { color: 'turquesa', hex: companyColors.turquesa },
    { color: 'celeste', hex: companyColors.celeste },
    { color: 'azulCeleste', hex: companyColors.azulCeleste },
];

export const chartColorMap: Record<string, string> = {
    ingresosBrutos: companyColors.lima,
    ingresosNetos: companyColors.verde,
    roi: companyColors.turquesaClaro,
    ticketPromedio: companyColors.turquesa,
    ingresosReales: companyColors.celeste,
    ventasTotales: companyColors.azulCeleste,
    leadTime: companyColors.turquesaClaro,
    defectuosos: companyColors.turquesa,
    ltv: companyColors.celeste,
    cuotaMercado: companyColors.azulCeleste,
    stockRotacion: companyColors.verde,
    tiempoRespuesta: companyColors.turquesaClaro,
    csat: companyColors.turquesa,
};
