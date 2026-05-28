/**
 * ubigeo.ts
 * ARCHIVO: src/features/public/checkout/lib/ubigeo.ts
 *
 * Datos estáticos de ubigeo peruano para el formulario de envío.
 * Los más comunes — ampliar según necesidad.
 */

export interface Provincia {
  nombre: string;
  distritos: string[];
}

export interface Departamento {
  nombre: string;
  provincias: Provincia[];
}

export const UBIGEO: Departamento[] = [
  {
    nombre: 'Lima',
    provincias: [
      {
        nombre: 'Lima',
        distritos: [
          'Ate',
          'Barranco',
          'Breña',
          'Carabayllo',
          'Chorrillos',
          'Cieneguilla',
          'Comas',
          'El Agustino',
          'Independencia',
          'Jesús María',
          'La Molina',
          'La Victoria',
          'Lima',
          'Lince',
          'Los Olivos',
          'Lurigancho',
          'Lurín',
          'Magdalena del Mar',
          'Miraflores',
          'Pachacámac',
          'Pucusana',
          'Pueblo Libre',
          'Puente Piedra',
          'Punta Hermosa',
          'Punta Negra',
          'Rímac',
          'San Bartolo',
          'San Borja',
          'San Isidro',
          'San Juan de Lurigancho',
          'San Juan de Miraflores',
          'San Luis',
          'San Martín de Porres',
          'San Miguel',
          'Santa Anita',
          'Santa María del Mar',
          'Santa Rosa',
          'Santiago de Surco',
          'Surquillo',
          'Villa El Salvador',
          'Villa María del Triunfo',
        ],
      },
      {
        nombre: 'Callao',
        distritos: [
          'Bellavista',
          'Callao',
          'Carmen de La Legua Reynoso',
          'La Perla',
          'La Punta',
          'Mi Perú',
          'Ventanilla',
        ],
      },
      {
        nombre: 'Huaral',
        distritos: ['Huaral', 'Aucallama', 'Chancay', 'Ihuarí'],
      },
    ],
  },
  {
    nombre: 'Arequipa',
    provincias: [
      {
        nombre: 'Arequipa',
        distritos: [
          'Alto Selva Alegre',
          'Arequipa',
          'Cayma',
          'Cerro Colorado',
          'Characato',
          'Jacobo Hunter',
          'José Luis Bustamante y Rivero',
          'La Joya',
          'Mariano Melgar',
          'Miraflores',
          'Mollebaya',
          'Paucarpata',
          'Pocsi',
          'Polobaya',
          'Quequeña',
          'Sabandía',
          'Sachaca',
          'San Juan de Siguas',
          'San Juan de Tarucani',
          'Santa Isabel de Siguas',
          'Santa Rita de Siguas',
          'Socabaya',
          'Tiabaya',
          'Uchumayo',
          'Vitor',
          'Yarabamba',
          'Yura',
        ],
      },
    ],
  },
  {
    nombre: 'La Libertad',
    provincias: [
      {
        nombre: 'Trujillo',
        distritos: [
          'El Porvenir',
          'Florencia de Mora',
          'Huanchaco',
          'La Esperanza',
          'Laredo',
          'Moche',
          'Poroto',
          'Salaverry',
          'Simbal',
          'Trujillo',
          'Victor Larco Herrera',
        ],
      },
    ],
  },
  {
    nombre: 'Piura',
    provincias: [
      {
        nombre: 'Piura',
        distritos: [
          'Castilla',
          'Catacaos',
          'Cura Morí',
          'El Tallán',
          'La Arena',
          'La Unión',
          'Las Lomas',
          'Piura',
          'Tambogrande',
          '26 de Octubre',
        ],
      },
      {
        nombre: 'Sullana',
        distritos: [
          'Bellavista',
          'Ignacio Escudero',
          'Lancones',
          'Marcavelica',
          'Miguel Checa',
          'Querecotillo',
          'Salitral',
          'Sullana',
        ],
      },
    ],
  },
  {
    nombre: 'Cusco',
    provincias: [
      {
        nombre: 'Cusco',
        distritos: [
          'Ccorca',
          'Cusco',
          'Poroy',
          'San Jerónimo',
          'San Sebastián',
          'Santiago',
          'Saylla',
          'Wanchaq',
        ],
      },
    ],
  },
  {
    nombre: 'Lambayeque',
    provincias: [
      {
        nombre: 'Chiclayo',
        distritos: [
          'Chiclayo',
          'Chongoyape',
          'Eten',
          'Eten Puerto',
          'José Leonardo Ortiz',
          'La Victoria',
          'Lagunas',
          'Monsefú',
          'Nueva Arica',
          'Oyotún',
          'Picsi',
          'Pimentel',
          'Pomalca',
          'Pucalá',
          'Reque',
          'Saña',
          'Santa Rosa',
          'Tumán',
        ],
      },
    ],
  },
  {
    nombre: 'Junín',
    provincias: [
      {
        nombre: 'Huancayo',
        distritos: [
          'Carhuacallanga',
          'Chacapampa',
          'Chicche',
          'Chilca',
          'Chongos Alto',
          'Chupuro',
          'Colca',
          'Cullhuas',
          'El Tambo',
          'Huacrapuquio',
          'Hualhuas',
          'Huancan',
          'Huancayo',
          'Huasicancha',
          'Huayucachi',
          'Ingenio',
          'Pariahuanca',
          'Pilcomayo',
          'Pucará',
          'Quichuay',
          'Quilcas',
          'San Agustín de Cajas',
          'San Jerónimo de Tunán',
          'Santo Domingo de Acobamba',
          'Sapallanga',
          'Sicaya',
          'Viques',
        ],
      },
    ],
  },
  {
    nombre: 'Ica',
    provincias: [
      {
        nombre: 'Ica',
        distritos: [
          'Ica',
          'La Tinguiña',
          'Los Aquijes',
          'Ocucaje',
          'Pachacútec',
          'Parcona',
          'Pueblo Nuevo',
          'Salas',
          'San José de Los Molinos',
          'San Juan Bautista',
          'Santiago',
          'Subtanjalla',
          'Tate',
          'Yauca del Rosario',
        ],
      },
    ],
  },
  {
    nombre: 'Ancash',
    provincias: [
      {
        nombre: 'Huaraz',
        distritos: [
          'Cochapeti',
          'Colcabamba',
          'Huanchay',
          'Huaraz',
          'Independencia',
          'Jangas',
          'La Libertad',
          'Llanganuco',
          'Pampas',
          'Paro',
          'Pira',
          'Tarica',
        ],
      },
    ],
  },
  {
    nombre: 'Loreto',
    provincias: [
      {
        nombre: 'Maynas',
        distritos: [
          'Alto Nanay',
          'Belén',
          'Fernando Lores',
          'Indiana',
          'Iquitos',
          'Las Amazonas',
          'Mazan',
          'Napo',
          'Punchana',
          'San Juan Bautista',
          'Torres Causana',
        ],
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getDepartamentos(): string[] {
  return UBIGEO.map((d) => d.nombre);
}

export function getProvincias(departamento: string): string[] {
  const dep = UBIGEO.find((d) => d.nombre === departamento);
  return dep ? dep.provincias.map((p) => p.nombre) : [];
}

export function getDistritos(
  departamento: string,
  provincia: string,
): string[] {
  const dep = UBIGEO.find((d) => d.nombre === departamento);
  const prov = dep?.provincias.find((p) => p.nombre === provincia);
  return prov ? prov.distritos : [];
}
