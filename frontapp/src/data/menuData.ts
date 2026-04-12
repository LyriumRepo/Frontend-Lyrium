/**
 * Datos del menú de navegación y mega-menú
 * Extraídos de PublicHeader.tsx para mantener SRP
 * Futuro: estos datos vendrán de la API de Laravel
 */

export interface MenuItem {
    label: string;
    href: string;
    icon?: string;
    children?: MenuItem[];
}

export interface MegaCategoryData {
    icons: { title: string; img: string; href: string }[];
    cols: { h: string; items: string[] }[];
}

export const megaMenuData: Record<string, MegaCategoryData> = {
    'Bebés y recién nacidos': {
        icons: [
            { title: 'De paseo y en el coche', img: '/img/Productos/Bebes/1.webp', href: '/productos/bebes/paseo' },
            { title: 'Alimentación', img: '/img/Productos/Bebes/2.webp', href: '/productos/bebes/alimentacion' },
            { title: 'Juguetes', img: '/img/Productos/Bebes/3.webp', href: '/productos/bebes/juguetes' },
            { title: 'Ropa', img: '/img/Productos/Bebes/4.webp', href: '/productos/bebes/ropa' },
            { title: 'Calzado', img: '/img/Productos/Bebes/5.webp', href: '/productos/bebes/calzado' },
            { title: 'Lactancia y chupetes', img: '/img/Productos/Bebes/6.webp', href: '/productos/bebes/lactancia' },
        ],
        cols: [
            { h: 'ALIMENTACIÓN', items: ['Menaje infantil', 'Suplementos nutricionales', 'Tronas y elevadores'] },
            { h: 'CALZADO', items: ['Bebé (0–2 años)', 'Infante (2–4 años)'] },
            { h: 'DE PASEO Y EN EL COCHE', items: ['De paseo', 'En el coche'] },
            { h: 'DESCANSO', items: ['Accesorios para dormitorio', 'Cunas y moisés', 'Proyectores', 'Relax y juego'] },
            { h: 'ROPA', items: ['Bebé (0–2 años)', 'Infante (2–4 años)'] },
        ],
    },
    'Belleza': {
        icons: [
            { title: 'Hombres', img: '/img/Productos/Belleza/1.webp', href: '/productos/belleza/hombres' },
            { title: 'Mujeres', img: '/img/Productos/Belleza/2.webp', href: '/productos/belleza/mujeres' },
            { title: 'Adolescentes, Niños y bebes', img: '/img/Productos/Belleza/3.webp', href: '/productos/belleza/jovenes' },
        ],
        cols: [
            { h: 'ADOLESCENTES', items: ['Aseo e higiene personal', 'Coloración', 'Cuidado corporal', 'Cuidado del cabello', 'Cuidado facial', 'Maquillaje'] },
            { h: 'HOMBRE', items: ['Aseo e higiene personal', 'Coloración', 'Cuidado del cabello', 'Cuidado facial', 'Maquillaje'] },
            { h: 'MUJER', items: ['Aseo e higiene personal', 'Coloración', 'Cuidado corporal', 'Cuidado del cabello', 'Cuidado facial', 'Maquillaje'] },
        ],
    },
    'Bienestar emocional y medicina natural': {
        icons: [
            { title: 'Sistema Nervioso', img: '/img/Productos/Bienestar/1.webp', href: '/productos/bienestar/nervioso' },
            { title: 'Sistema Digestivo', img: '/img/Productos/Bienestar/2.webp', href: '/productos/bienestar/digestivo' },
            { title: 'Sistema Circulatorio', img: '/img/Productos/Bienestar/3.webp', href: '/productos/bienestar/circulatorio' },
            { title: 'Sistema Oseo', img: '/img/Productos/Bienestar/4.webp', href: '/productos/bienestar/oseo' },
            { title: 'Sistema Muscular', img: '/img/Productos/Bienestar/5.webp', href: '/productos/bienestar/muscular' },
            { title: 'Sistema Inmunologico', img: '/img/Productos/Bienestar/6.webp', href: '/productos/bienestar/inmune' },
        ],
        cols: [
            { h: 'RELAX', items: ['Aromas', 'Velas', 'Difusores'] },
            { h: 'SUEÑO', items: ['Melatonina', 'Tés', 'Rutina nocturna'] },
            { h: 'MEDICINA NATURAL', items: ['Extractos', 'Plantas', 'Jarabes'] },
            { h: 'MENTE', items: ['Mindfulness', 'Journaling'] },
            { h: 'BIENESTAR', items: ['Packs', 'Promos'] },
        ],
    },
    'Bienestar físico y deportes': {
        icons: [
            { title: 'Calzado Mujer', img: '/img/Productos/BienestarF/1.webp', href: '/productos/deportes/calzado-mujer' },
            { title: 'Ropa mujer', img: '/img/Productos/BienestarF/2.webp', href: '/productos/deportes/ropa-mujer' },
            { title: 'Calzado Hombre', img: '/img/Productos/BienestarF/3.webp', href: '/productos/deportes/calzado-hombre' },
            { title: 'Ropa Hombre', img: '/img/Productos/BienestarF/4.webp', href: '/productos/deportes/ropa-hombre' },
            { title: 'Deportes Niños', img: '/img/Productos/BienestarF/5.webp', href: '/productos/deportes/ninos' },
            { title: 'Deportes Hombre', img: '/img/Productos/BienestarF/6.webp', href: '/productos/deportes/deportes-hombre' },
        ],
        cols: [
            { h: 'CALZADO MUJER', items: ['Basquet', 'Calzado plataforma', 'Chimpunes', 'Gimnasio', 'Running', 'Sandalias'] },
            { h: 'ACCESORIOS MUJER', items: ['Balones', 'Mochilas', 'Gorras', 'Guantes', 'Medias'] },
            { h: 'DEPORTES', items: ['Basquet', 'Buceo', 'Ciclismo', 'Futbol', 'Gimnasio', 'Natacion', 'Running'] },
            { h: 'ROPA MUJER', items: ['Bras', 'Buzos', 'Camisetas', 'Casacas', 'Faldas', 'Licras', 'Pantalones'] },
            { h: 'CALZADO HOMBRE', items: ['Basquet', 'Calzado plataforma', 'Chimpunes', 'Gimnasio', 'Running', 'Sandalias'] },
        ],
    },
    'Digestión saludable': {
        icons: [
            { title: 'Abarrotes', img: '/img/Productos/Digestion/1.webp', href: '/productos/digestion/abarrotes' },
            { title: 'Desayunos', img: '/img/Productos/Digestion/2.webp', href: '/productos/digestion/desayunos' },
            { title: 'Lácteos y frescos', img: '/img/Productos/Digestion/3.webp', href: '/productos/digestion/lacteos' },
            { title: 'Bebidas', img: '/img/Productos/Digestion/4.webp', href: '/productos/digestion/bebidas' },
            { title: 'Dulces y snacks', img: '/img/Productos/Digestion/5.webp', href: '/productos/digestion/dulces' },
            { title: 'Panadería', img: '/img/Productos/Digestion/6.webp', href: '/productos/digestion/panaderia' },
        ],
        cols: [
            { h: 'ABARROTES', items: ['Aceites', 'Arroz', 'Cereales', 'Conservas', 'Harinas', 'Pastas'] },
            { h: 'BEBIDAS', items: ['Jugos', 'Refrescos', 'Aguas', 'Tés'] },
            { h: 'LÁCTEOS', items: ['Leche', 'Yogurt', 'Quesos', 'Mantequilla'] },
            { h: 'DULCES', items: ['Chocolates', 'Galletas', 'Caramelos'] },
            { h: 'PANADERÍA', items: ['Pan', 'Tortillas', 'Bizcochos'] },
        ],
    },
    'Equipos y dispositivos médicos': {
        icons: [
            { title: 'Diagnóstico', img: '/img/Productos/Equipos/1.webp', href: '/productos/equipos/diagnostico' },
            { title: 'Tratamiento', img: '/img/Productos/Equipos/2.webp', href: '/productos/equipos/tratamiento' },
            { title: 'Rehabilitación', img: '/img/Productos/Equipos/3.webp', href: '/productos/equipos/rehabilitacion' },
            { title: 'Movilidad', img: '/img/Productos/Equipos/4.webp', href: '/productos/equipos/movilidad' },
            { title: 'Cuidado en casa', img: '/img/Productos/Equipos/5.webp', href: '/productos/equipos/casa' },
            { title: 'Emergencias', img: '/img/Productos/Equipos/6.webp', href: '/productos/equipos/emergencias' },
        ],
        cols: [
            { h: 'DIAGNÓSTICO', items: ['Básculas', 'Glucómetros', 'Oxímetros', 'Termómetros', 'Tensiómetros'] },
            { h: 'TRATAMIENTO', items: ['Nebulizadores', 'Concentrador de oxígeno', 'Bombas de infusión'] },
            { h: 'REHABILITACIÓN', items: ['Ejercitadores', 'Fisioterapia', 'Terapias'] },
            { h: 'MOVILIDAD', items: ['Sillas de ruedas', 'Bastones', 'Andadores', 'Grúas'] },
            { h: 'EMERGENCIAS', items: ['Kits de primeros auxilios', 'Desfibriladores'] },
        ],
    },
    'Mascotas': {
        icons: [
            { title: 'Perros', img: '/img/Productos/Mascotas/1.webp', href: '/productos/mascotas/perros' },
            { title: 'Gatos', img: '/img/Productos/Mascotas/2.webp', href: '/productos/mascotas/gatos' },
            { title: 'Aves', img: '/img/Productos/Mascotas/3.webp', href: '/productos/mascotas/aves' },
            { title: 'Peces', img: '/img/Productos/Mascotas/4.webp', href: '/productos/mascotas/peces' },
            { title: 'Otros', img: '/img/Productos/Mascotas/5.webp', href: '/productos/mascotas/otros' },
        ],
        cols: [
            { h: 'PERROS', items: ['Alimento', 'Juguetes', 'Camas', 'Collares', 'Medicamentos'] },
            { h: 'GATOS', items: ['Alimento', 'Juguetes', 'Camas', 'Arena', 'Medicamentos'] },
            { h: 'AVES', items: ['Alimento', 'Jaulas', 'Juguetes', 'Suplementos'] },
            { h: 'PECES', items: ['Alimento', 'Acuarios', 'Filtros', 'Decoración'] },
            { h: 'OTROS', items: ['Roedores', 'Reptiles', 'Suplementos'] },
        ],
    },
    'Protección limpieza y desinfección': {
        icons: [
            { title: 'Limpieza Hogar', img: '/img/Productos/Limpieza/1.webp', href: '/productos/limpieza/hogar' },
            { title: 'Desinfección', img: '/img/Productos/Limpieza/2.webp', href: '/productos/limpieza/desinfeccion' },
            { title: 'Protección Personal', img: '/img/Productos/Limpieza/3.webp', href: '/productos/limpieza/proteccion' },
            { title: 'Antibacteriales', img: '/img/Productos/Limpieza/4.webp', href: '/productos/limpieza/antibacteriales' },
        ],
        cols: [
            { h: 'LIMPIEZA HOGAR', items: ['Detergentes', 'Suavizantes', 'Limpiadores', 'Escobas', 'Trapeadores'] },
            { h: 'DESINFECCIÓN', items: ['Cloro', 'Alcohol', 'Gel antibacterial', 'Sprays'] },
            { h: 'PROTECCIÓN', items: ['Guantes', 'Mascarillas', 'Cofias', 'Batas'] },
            { h: 'ANTIBACTERIALES', items: ['Jabón líquido', 'Toallas húmedas', 'Desinfectantes'] },
        ],
    },
    'Suplementos vitamínicos': {
        icons: [
            { title: 'Vitaminas', img: '/img/Productos/Suplementos/1.webp', href: '/productos/suplementos/vitaminas' },
            { title: 'Minerales', img: '/img/Productos/Suplementos/2.webp', href: '/productos/suplementos/minerales' },
            { title: 'Proteínas', img: '/img/Productos/Suplementos/3.webp', href: '/productos/suplementos/proteinas' },
            { title: 'Aminoácidos', img: '/img/Productos/Suplementos/4.webp', href: '/productos/suplementos/aminoacidos' },
            { title: 'Hierbas', img: '/img/Productos/Suplementos/5.webp', href: '/productos/suplementos/hierbas' },
            { title: 'Deportivos', img: '/img/Productos/Suplementos/6.webp', href: '/productos/suplementos/deportivos' },
        ],
        cols: [
            { h: 'VITAMINAS', items: ['Vitamina A', 'Vitamina C', 'Vitamina D', 'Vitamina E', 'Vitamina B'] },
            { h: 'MINERALES', items: ['Hierro', 'Calcio', 'Magnesio', 'Zinc', 'Potasio'] },
            { h: 'PROTEÍNAS', items: ['Whey', 'Caseína', 'Vegetal', 'BCAA'] },
            { h: 'HIERBAS', items: ['Ginseng', 'Valeriana', 'Té verde', 'Espirulina'] },
            { h: 'DEPORTIVOS', items: ['Pre-workout', 'Creatina', 'Glutamina', 'Carnitina'] },
        ],
    },
    'Servicios médicos': {
        icons: [
            { title: 'Gastroenterología', img: '/img/Servicios/ServiciosMedicos/1.svg', href: '#' },
            { title: 'Geriatría', img: '/img/Servicios/ServiciosMedicos/2.svg', href: '#' },
            { title: 'Laboratorio clínico', img: '/img/Servicios/ServiciosMedicos/3.svg', href: '#' },
            { title: 'Medicina general', img: '/img/Servicios/ServiciosMedicos/4.svg', href: '#' },
            { title: 'Nutriología', img: '/img/Servicios/ServiciosMedicos/5.svg', href: '#' },
            { title: 'Pediatría', img: '/img/Servicios/ServiciosMedicos/6.svg', href: '#' },
            { title: 'Psicología', img: '/img/Servicios/ServiciosMedicos/7.svg', href: '#' },
        ],
        cols: [
            { h: 'ESPECIALIDADES', items: ['Cardiología', 'Radiología', 'Dermatología', 'Medicina General', 'Endocrinología', 'Enfermería'] },
            { h: 'ESPECIALIDADES', items: ['Geriatría', 'Ginecología', 'Laboratorio Clínico', 'Medicina Física', 'Neumología', 'Neurología'] },
            { h: 'ESPECIALIDADES', items: ['Odontología', 'Oftalmología', 'Oncología', 'Pediatría', 'Psicología', 'Psiquiatría'] },
        ],
    },
    'Belleza servicios': {
        icons: [
            { title: 'Peluquerías', img: '/img/Servicios/Belleza/1.svg', href: '#' },
            { title: 'Spas', img: '/img/Servicios/Belleza/2.svg', href: '#' },
        ],
        cols: [
            { h: 'TRATAMIENTOS', items: ['Limpieza Facial', 'Anti-Edah', 'Acné'] },
            { h: 'SERVICIOS', items: ['Depilación', 'Masajes', 'Spa'] },
        ],
    },
    'Deportes servicios': {
        icons: [
            { title: 'Gimnasio', img: '/img/Servicios/Deportes/1.png', href: '#' },
        ],
        cols: [
            { h: 'SERVICIOS', items: ['Fisioterapia', 'Rehabilitación'] },
            { h: 'ENTRENAMIENTO', items: ['Entrenamiento Funcional'] },
        ],
    },
};

export const menuItems: MenuItem[] = [
    {
        label: 'PRODUCTOS',
        href: '/productos',
        icon: 'shopping-bag',
        children: [
            { 
                label: 'Bebés y recién nacidos', 
                href: '/productos/bebes',
                children: [
                    { 
                        label: 'Alimentación', 
                        href: '/productos/bebes/alimentacion',
                        children: [
                            { label: 'Biberones y tetinas', href: '/productos/bebes/alimentacion/biberones' },
                            { label: 'Papillas y purés', href: '/productos/bebes/alimentacion/papillas' },
                            { label: 'Leches infantiles', href: '/productos/bebes/alimentacion/leches' },
                            { label: 'Accesorios de alimentación', href: '/productos/bebes/alimentacion/accesorios' },
                        ]
                    },
                    { label: 'Ropa', href: '/productos/bebes/ropa' },
                    { label: 'Calzado', href: '/productos/bebes/calzado' },
                    { label: 'Juguetes', href: '/productos/bebes/juguetes' },
                    { label: 'Lactancia y chupetes', href: '/productos/bebes/lactancia' },
                    { label: 'De paseo y en el coche', href: '/productos/bebes/paseo' },
                ]
            },
            { 
                label: 'Belleza', 
                href: '/productos/belleza',
                children: [
                    { 
                        label: 'Hombres', 
                        href: '/productos/belleza/hombres',
                        children: [
                            { label: 'Aseo e higiene', href: '/productos/belleza/hombres/aseo' },
                            { label: 'Cuidado facial', href: '/productos/belleza/hombres/facial' },
                            { label: 'Cuidado capilar', href: '/productos/belleza/hombres/capilar' },
                        ]
                    },
                    { 
                        label: 'Mujeres', 
                        href: '/productos/belleza/mujeres',
                        children: [
                            { label: 'Maquillaje', href: '/productos/belleza/mujeres/maquillaje' },
                            { label: 'Cuidado facial', href: '/productos/belleza/mujeres/facial' },
                            { label: 'Cuidado corporal', href: '/productos/belleza/mujeres/corporal' },
                        ]
                    },
                    { 
                        label: 'Adolescentes, Niños y bebes', 
                        href: '/productos/belleza/jovenes',
                        children: [
                            { label: 'Aseo infantil', href: '/productos/belleza/jovenes/aseo' },
                            { label: 'Cuidado solar', href: '/productos/belleza/jovenes/solar' },
                        ]
                    },
                ]
            },
            { 
                label: 'Bienestar emocional y medicina natural', 
                href: '/productos/bienestar',
                children: [
                    { 
                        label: 'Sistema Nervioso', 
                        href: '/productos/bienestar/nervioso',
                        children: [
                            { label: 'Ansiedad y estrés', href: '/productos/bienestar/nervioso/ansiedad' },
                            { label: 'Sueño y relax', href: '/productos/bienestar/nervioso/sueno' },
                            { label: 'Vitaminas del grupo B', href: '/productos/bienestar/nervioso/vitaminas-b' },
                        ]
                    },
                    { 
                        label: 'Sistema Digestivo', 
                        href: '/productos/bienestar/digestivo',
                        children: [
                            { label: 'Probióticos', href: '/productos/bienestar/digestivo/probioticos' },
                            { label: 'Enzimas digestivas', href: '/productos/bienestar/digestivo/enzimas' },
                            { label: 'Fibra y reguladores', href: '/productos/bienestar/digestivo/fibra' },
                        ]
                    },
                    { 
                        label: 'Sistema Circulatorio', 
                        href: '/productos/bienestar/circulatorio',
                        children: [
                            { label: 'Circulación piernas', href: '/productos/bienestar/circulatorio/piernas' },
                            { label: 'Tensión arterial', href: '/productos/bienestar/circulatorio/tension' },
                            { label: 'Colesterol', href: '/productos/bienestar/circulatorio/colesterol' },
                        ]
                    },
                    { 
                        label: 'Sistema Oseo', 
                        href: '/productos/bienestar/oseo',
                        children: [
                            { label: 'Calcio y vitamina D', href: '/productos/bienestar/oseo/calcio' },
                            { label: 'Colágeno', href: '/productos/bienestar/oseo/colageno' },
                            { label: 'Articulaciones', href: '/productos/bienestar/oseo/articulaciones' },
                        ]
                    },
                    { 
                        label: 'Sistema Muscular', 
                        href: '/productos/bienestar/muscular',
                        children: [
                            { label: 'Magnesium', href: '/productos/bienestar/muscular/magnesio' },
                            { label: 'Recuperación muscular', href: '/productos/bienestar/muscular/recuperacion' },
                        ]
                    },
                    { 
                        label: 'Sistema Inmunologico', 
                        href: '/productos/bienestar/inmune',
                        children: [
                            { label: 'Vitamina C', href: '/productos/bienestar/inmune/vitamina-c' },
                            { label: 'Equinacea', href: '/productos/bienestar/inmune/equinacea' },
                            { label: 'Zinc', href: '/productos/bienestar/inmune/zinc' },
                        ]
                    },
                ]
            },
            { 
                label: 'Bienestar físico y deportes', 
                href: '/productos/deportes',
                children: [
                    { 
                        label: 'Calzado Mujer', 
                        href: '/productos/deportes/calzado-mujer',
                        children: [
                            { label: 'Zapatillas running', href: '/productos/deportes/calzado-mujer/running' },
                            { label: 'Zapatillas entrenamiento', href: '/productos/deportes/calzado-mujer/entrenamiento' },
                            { label: 'Sandalias deportivas', href: '/productos/deportes/calzado-mujer/sandalias' },
                        ]
                    },
                    { 
                        label: 'Ropa mujer', 
                        href: '/productos/deportes/ropa-mujer',
                        children: [
                            { label: 'Camisetas deportivas', href: '/productos/deportes/ropa-mujer/camisetas' },
                            { label: 'Leggings y shorts', href: '/productos/deportes/ropa-mujer/leggings' },
                            { label: 'Sudaderas', href: '/productos/deportes/ropa-mujer/sudaderas' },
                        ]
                    },
                    { 
                        label: 'Calzado Hombre', 
                        href: '/productos/deportes/calzado-hombre',
                        children: [
                            { label: 'Zapatillas running', href: '/productos/deportes/calzado-hombre/running' },
                            { label: 'Zapatillas entrenamiento', href: '/productos/deportes/calzado-hombre/entrenamiento' },
                        ]
                    },
                    { 
                        label: 'Ropa Hombre', 
                        href: '/productos/deportes/ropa-hombre',
                        children: [
                            { label: 'Camisetas deportivas', href: '/productos/deportes/ropa-hombre/camisetas' },
                            { label: 'Pantalones cortos', href: '/productos/deportes/ropa-hombre/pantalones' },
                        ]
                    },
                    { 
                        label: 'Deportes Niños', 
                        href: '/productos/deportes/ninos',
                        children: [
                            { label: 'Ropa deportiva niño', href: '/productos/deportes/ninos/ropa' },
                            { label: 'Calzado deportivo niño', href: '/productos/deportes/ninos/calzado' },
                        ]
                    },
                    { 
                        label: 'Deportes Hombre', 
                        href: '/productos/deportes/deportes-hombre',
                        children: [
                            { label: 'Fitness', href: '/productos/deportes/deportes-hombre/fitness' },
                            { label: 'Running', href: '/productos/deportes/deportes-hombre/running' },
                        ]
                    },
                ]
            },
            { 
                label: 'Digestión saludable', 
                href: '/productos/digestion',
                children: [
                    { 
                        label: 'Abarrotes', 
                        href: '/productos/digestion/abarrotes',
                        children: [
                            { label: 'Arroz y legumbres', href: '/productos/digestion/abarrotes/arroz' },
                            { label: 'Pasta', href: '/productos/digestion/abarrotes/pasta' },
                            { label: 'Aceites y vinagres', href: '/productos/digestion/abarrotes/aceites' },
                        ]
                    },
                    { 
                        label: 'Desayunos', 
                        href: '/productos/digestion/desayunos',
                        children: [
                            { label: 'Cereales', href: '/productos/digestion/desayunos/cereales' },
                            { label: 'Mermeladas y miel', href: '/productos/digestion/desayunos/mermeladas' },
                            { label: 'Galletas integrales', href: '/productos/digestion/desayunos/galletas' },
                        ]
                    },
                    { 
                        label: 'Lácteos y frescos', 
                        href: '/productos/digestion/lacteos',
                        children: [
                            { label: 'Leche descremada', href: '/productos/digestion/lacteos/leche' },
                            { label: 'Yogur natural', href: '/productos/digestion/lacteos/yogur' },
                            { label: 'Quesos bajos en grasa', href: '/productos/digestion/lacteos/quesos' },
                        ]
                    },
                    { 
                        label: 'Bebidas', 
                        href: '/productos/digestion/bebidas',
                        children: [
                            { label: 'Jugos naturales', href: '/productos/digestion/bebidas/jugos' },
                            { label: 'Infusiones', href: '/productos/digestion/bebidas/infusiones' },
                            { label: 'Agua mineral', href: '/productos/digestion/bebidas/agua' },
                        ]
                    },
                    { 
                        label: 'Dulces y snacks', 
                        href: '/productos/digestion/dulces',
                        children: [
                            { label: 'Chocolate oscuro', href: '/productos/digestion/dulces/chocolate' },
                            { label: 'Frutos secos', href: '/productos/digestion/dulces/frutos' },
                        ]
                    },
                    { 
                        label: 'Panadería', 
                        href: '/productos/digestion/panaderia',
                        children: [
                            { label: 'Pan integral', href: '/productos/digestion/panaderia/integral' },
                            { label: 'Pan sin gluten', href: '/productos/digestion/panaderia/sin-gluten' },
                        ]
                    },
                ]
            },
            { 
                label: 'Equipos y dispositivos médicos', 
                href: '/productos/equipos',
                children: [
                    { label: 'Diagnóstico', href: '/productos/equipos/diagnostico' },
                    { label: 'Tratamiento', href: '/productos/equipos/tratamiento' },
                    { label: 'Rehabilitación', href: '/productos/equipos/rehabilitacion' },
                    { label: 'Movilidad', href: '/productos/equipos/movilidad' },
                    { label: 'Cuidado en casa', href: '/productos/equipos/casa' },
                    { label: 'Emergencias', href: '/productos/equipos/emergencias' },
                ]
            },
            { 
                label: 'Mascotas', 
                href: '/productos/mascotas',
                children: [
                    { 
                        label: 'Perros', 
                        href: '/productos/mascotas/perros',
                        children: [
                            { label: 'Alimento seco', href: '/productos/mascotas/perros/seco' },
                            { label: 'Alimento húmedo', href: '/productos/mascotas/perros/humedo' },
                            { label: 'Juguetes', href: '/productos/mascotas/perros/juguetes' },
                            { label: 'Camas y mantas', href: '/productos/mascotas/perros/camas' },
                            { label: 'Collares y correas', href: '/productos/mascotas/perros/collares' },
                        ]
                    },
                    { 
                        label: 'Gatos', 
                        href: '/productos/mascotas/gatos',
                        children: [
                            { label: 'Alimento seco', href: '/productos/mascotas/gatos/seco' },
                            { label: 'Alimento húmedo', href: '/productos/mascotas/gatos/humedo' },
                            { label: 'Arena para gatos', href: '/productos/mascotas/gatos/arena' },
                            { label: 'Juguetes', href: '/productos/mascotas/gatos/juguetes' },
                        ]
                    },
                    { 
                        label: 'Aves', 
                        href: '/productos/mascotas/aves',
                        children: [
                            { label: 'Alimento para aves', href: '/productos/mascotas/aves/alimento' },
                            { label: 'Jaulas', href: '/productos/mascotas/aves/jaulas' },
                            { label: 'Juguetes', href: '/productos/mascotas/aves/juguetes' },
                        ]
                    },
                    { 
                        label: 'Peces', 
                        href: '/productos/mascotas/peces',
                        children: [
                            { label: 'Alimento para peces', href: '/productos/mascotas/peces/alimento' },
                            { label: 'Acuarios', href: '/productos/mascotas/peces/acuarios' },
                            { label: 'Filtros y bombas', href: '/productos/mascotas/peces/filtros' },
                        ]
                    },
                    { 
                        label: 'Otros', 
                        href: '/productos/mascotas/otros',
                        children: [
                            { label: 'Roedores', href: '/productos/mascotas/otros/roedores' },
                            { label: 'Reptiles', href: '/productos/mascotas/otros/reptiles' },
                        ]
                    },
                ]
            },
            { 
                label: 'Protección limpieza y desinfección', 
                href: '/productos/limpieza',
                children: [
                    { 
                        label: 'Limpieza Hogar', 
                        href: '/productos/limpieza/hogar',
                        children: [
                            { label: 'Detergentes', href: '/productos/limpieza/hogar/detergentes' },
                            { label: 'Suavizantes', href: '/productos/limpieza/hogar/suavizantes' },
                            { label: 'Limpiadores multiuso', href: '/productos/limpieza/hogar/limpiadores' },
                            { label: 'Escobas y trapeadores', href: '/productos/limpieza/hogar/escobas' },
                        ]
                    },
                    { 
                        label: 'Desinfección', 
                        href: '/productos/limpieza/desinfeccion',
                        children: [
                            { label: 'Cloro', href: '/productos/limpieza/desinfeccion/cloro' },
                            { label: 'Alcohol', href: '/productos/limpieza/desinfeccion/alcohol' },
                            { label: 'Sprays antibacteriales', href: '/productos/limpieza/desinfeccion/sprays' },
                        ]
                    },
                    { 
                        label: 'Protección Personal', 
                        href: '/productos/limpieza/proteccion',
                        children: [
                            { label: 'Guantes', href: '/productos/limpieza/proteccion/guantes' },
                            { label: 'Mascarillas', href: '/productos/limpieza/proteccion/mascarillas' },
                            { label: 'Cofias y batas', href: '/productos/limpieza/proteccion/cofias' },
                        ]
                    },
                    { 
                        label: 'Antibacteriales', 
                        href: '/productos/limpieza/antibacteriales',
                        children: [
                            { label: 'Jabón líquido', href: '/productos/limpieza/antibacteriales/jabon' },
                            { label: 'Toallas húmedas', href: '/productos/limpieza/antibacteriales/toallas' },
                            { label: 'Desinfectantes de manos', href: '/productos/limpieza/antibacteriales/manos' },
                        ]
                    },
                ]
            },
            { 
                label: 'Suplementos vitamínicos', 
                href: '/productos/suplementos',
                children: [
                    { 
                        label: 'Vitaminas', 
                        href: '/productos/suplementos/vitaminas',
                        children: [
                            { label: 'Vitamina C', href: '/productos/suplementos/vitaminas/vitamina-c' },
                            { label: 'Vitamina D', href: '/productos/suplementos/vitaminas/vitamina-d' },
                            { label: 'Vitamina E', href: '/productos/suplementos/vitaminas/vitamina-e' },
                            { label: 'Complejo B', href: '/productos/suplementos/vitaminas/complejo-b' },
                        ]
                    },
                    { 
                        label: 'Minerales', 
                        href: '/productos/suplementos/minerales',
                        children: [
                            { label: 'Magnesio', href: '/productos/suplementos/minerales/magnesio' },
                            { label: 'Zinc', href: '/productos/suplementos/minerales/zinc' },
                            { label: 'Hierro', href: '/productos/suplementos/minerales/hierro' },
                            { label: 'Calcio', href: '/productos/suplementos/minerales/calcio' },
                        ]
                    },
                    { 
                        label: 'Proteínas', 
                        href: '/productos/suplementos/proteinas',
                        children: [
                            { label: 'Whey protein', href: '/productos/suplementos/proteinas/whey' },
                            { label: 'Proteína vegetal', href: '/productos/suplementos/proteinas/vegetal' },
                            { label: 'Aminoácidos BCAA', href: '/productos/suplementos/proteinas/bcaa' },
                        ]
                    },
                    { 
                        label: 'Aminoácidos', 
                        href: '/productos/suplementos/aminoacidos',
                        children: [
                            { label: 'L-Glutamina', href: '/productos/suplementos/aminoacidos/glutamina' },
                            { label: 'L-Arginina', href: '/productos/suplementos/aminoacidos/arginina' },
                        ]
                    },
                    { 
                        label: 'Hierbas', 
                        href: '/productos/suplementos/hierbas',
                        children: [
                            { label: 'Valeriana', href: '/productos/suplementos/hierbas/valeriana' },
                            { label: 'Ginkgo biloba', href: '/productos/suplementos/hierbas/ginkgo' },
                            { label: 'Equinacea', href: '/productos/suplementos/hierbas/equinacea' },
                        ]
                    },
                    { 
                        label: 'Deportivos', 
                        href: '/productos/suplementos/deportivos',
                        children: [
                            { label: 'Pre-entreno', href: '/productos/suplementos/deportivos/pre-entreno' },
                            { label: 'Creatina', href: '/productos/suplementos/deportivos/creatina' },
                            { label: 'Reponedores electrolitos', href: '/productos/suplementos/deportivos/electrolitos' },
                        ]
                    },
                ]
            },
        ],
    },
    {
        label: 'SERVICIOS',
        href: '/servicios',
        icon: 'headset',
        children: [
            { 
                label: 'Servicios médicos', 
                href: '/servicios/consultas',
                children: [
                    { 
                        label: 'Medicina general', 
                        href: '/servicios/consultas/medicina-general',
                        children: [
                            { label: 'Chequeo general', href: '/servicios/consultas/medicina-general/chequeo' },
                            { label: 'Atención primaria', href: '/servicios/consultas/medicina-general/atencion' },
                        ]
                    },
                    { 
                        label: 'Pediatría', 
                        href: '/servicios/consultas/pediatria',
                        children: [
                            { label: 'Control de crecimiento', href: '/servicios/consultas/pediatria/crecimiento' },
                            { label: 'Vacunación', href: '/servicios/consultas/pediatria/vacunacion' },
                        ]
                    },
                    { 
                        label: 'Ginecología', 
                        href: '/servicios/consultas/ginecologia',
                        children: [
                            { label: 'Revisión anual', href: '/servicios/consultas/ginecologia/anual' },
                            { label: 'Ecografías', href: '/servicios/consultas/ginecologia/ecografias' },
                        ]
                    },
                    { 
                        label: 'Cardiología', 
                        href: '/servicios/consultas/cardiologia',
                        children: [
                            { label: 'Electrocardiograma', href: '/servicios/consultas/cardiologia/ecg' },
                            { label: 'Ecocardiograma', href: '/servicios/consultas/cardiologia/ecocardiograma' },
                        ]
                    },
                ]
            },
            { 
                label: 'Belleza servicios', 
                href: '/servicios/belleza',
                children: [
                    { 
                        label: 'Tratamientos faciales', 
                        href: '/servicios/belleza/faciales',
                        children: [
                            { label: 'Limpieza facial', href: '/servicios/belleza/faciales/limpieza' },
                            { label: 'Hidratación facial', href: '/servicios/belleza/faciales/hidratacion' },
                            { label: 'Antiaging', href: '/servicios/belleza/faciales/antiaging' },
                        ]
                    },
                    { 
                        label: 'Tratamientos corporales', 
                        href: '/servicios/belleza/corporales',
                        children: [
                            { label: 'Masajes reductores', href: '/servicios/belleza/corporales/masajes' },
                            { label: 'Drenaje linfático', href: '/servicios/belleza/corporales/drenaje' },
                            { label: 'Tratamientos celulitis', href: '/servicios/belleza/corporales/celulitis' },
                        ]
                    },
                    { 
                        label: 'Maquillaje profesional', 
                        href: '/servicios/belleza/maquillaje',
                        children: [
                            { label: 'Maquillaje social', href: '/servicios/belleza/maquillaje/social' },
                            { label: 'Maquillaje novias', href: '/servicios/belleza/maquillaje/novias' },
                        ]
                    },
                ]
            },
            { 
                label: 'Deportes servicios', 
                href: '/servicios/deportes',
                children: [
                    { 
                        label: 'Entrenamiento personal', 
                        href: '/servicios/deportes/entrenamiento',
                        children: [
                            { label: 'Planes personalizado', href: '/servicios/deportes/entrenamiento/planes' },
                            { label: 'Evaluación física', href: '/servicios/deportes/entrenamiento/evaluacion' },
                        ]
                    },
                    { 
                        label: 'Fisioterapia deportiva', 
                        href: '/servicios/deportes/fisioterapia',
                        children: [
                            { label: 'Rehabilitación', href: '/servicios/deportes/fisioterapia/rehabilitacion' },
                            { label: 'Terapia manual', href: '/servicios/deportes/fisioterapia/manual' },
                        ]
                    },
                    { 
                        label: 'Nutrición deportiva', 
                        href: '/servicios/deportes/nutricion',
                        children: [
                            { label: 'Planes nutricionales', href: '/servicios/deportes/nutricion/planes' },
                            { label: 'Suplementación', href: '/servicios/deportes/nutricion/suplementacion' },
                        ]
                    },
                ]
            },
        ],
    },
    {
        label: 'NOSOTROS',
        href: '/nosotros',
        icon: 'info',
    },
    {
        label: 'REGISTRA TU TIENDA',
        href: '/login',
        icon: 'storefront',
    },
    {
        label: 'TIENDAS REGISTRADAS',
        href: '/tiendasregistradas',
        icon: 'buildings',
    },
    {
        label: 'CONTÁCTANOS',
        href: '/contactanos',
        icon: 'phone-call',
    },
    {
        label: 'BIOBLOG',
        href: '/bioblog',
        icon: 'newspaper',
    },
    {
        label: 'BIOFORO',
        href: '/bioforo',
        icon: 'chats-circle',
    },
];
