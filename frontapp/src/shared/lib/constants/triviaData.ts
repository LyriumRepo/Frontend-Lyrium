export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'lirios' | 'lyrium' | 'salud' | 'peru' | 'variado';
}

export const triviaQuestions: TriviaQuestion[] = [
  {
    id: 'lirios-1',
    question: '¿Cuántos Lirios equivalen a S/ 1 de descuento?',
    options: ['10 Lirios', '100 Lirios', '1,000 Lirios', '10,000 Lirios'],
    correctIndex: 2,
    explanation: 'En Lyrium, 1,000 Lirios equivalen a S/ 1 de descuento en tus compras.',
    category: 'lirios'
  },
  {
    id: 'lirios-2',
    question: '¿Cuál es el descuento máximo que puedes aplicar con Lirios?',
    options: ['1% del total', '3% del total', '5% del total', '10% del total'],
    correctIndex: 1,
    explanation: 'El descuento máximo con Lirios está limitado al 3% del total de la compra.',
    category: 'lirios'
  },
  {
    id: 'lyrium-1',
    question: '¿Qué tipo de productos se venden en Lyrium Biomarketplace?',
    options: ['Solo medicamentos', 'Productos saludables y bienestar', 'Ropa y accesorios', 'Electrodomésticos'],
    correctIndex: 1,
    explanation: 'Lyrium es un marketplace especializado en productos saludables: alimentos orgánicos, suplementos, cosmética natural y más.',
    category: 'lyrium'
  },
  {
    id: 'salud-1',
    question: '¿A qué temperatura deben mantenerse los lácteos durante el envío?',
    options: ['0 a 2 °C', '2 a 4 °C', '4 a 6 °C', '6 a 8 °C'],
    correctIndex: 1,
    explanation: 'Los lácteos y embutidos necesitan una cadena de frío de 2 a 4 grados para conservarse.',
    category: 'salud'
  },
  {
    id: 'peru-1',
    question: '¿Qué entidad regula la protección al consumidor en Perú?',
    options: ['SUNAT', 'INDECOPI', 'SBS', 'MINSA'],
    correctIndex: 1,
    explanation: 'INDECOPI es el Instituto Nacional de Defensa de la Competencia y de la Protección de la Propiedad Intelectual.',
    category: 'peru'
  },
  {
    id: 'variado-1',
    question: '¿Cuál es el animal más rápido del mundo?',
    options: ['Guepardo', 'Halcón peregrino', 'Pez vela', 'León'],
    correctIndex: 1,
    explanation: 'El halcón peregrino alcanza los 390 km/h en picada. El guepardo es el más rápido en tierra (120 km/h).',
    category: 'variado'
  },
  {
    id: 'variado-2',
    question: '¿Cuál es el país más pequeño del mundo?',
    options: ['Mónaco', 'San Marino', 'El Vaticano', 'Liechtenstein'],
    correctIndex: 2,
    explanation: 'El Vaticano mide solo 0.44 km² y es el país más pequeño del mundo en extensión y población.',
    category: 'variado'
  },
  {
    id: 'variado-3',
    question: '¿Cuántos huesos tiene el cuerpo humano adulto?',
    options: ['106', '206', '306', '406'],
    correctIndex: 1,
    explanation: 'Un adulto tiene 206 huesos. Los bebés nacen con unos 300 que se fusionan al crecer.',
    category: 'variado'
  },
  {
    id: 'variado-4',
    question: '¿En qué año llegó el hombre a la Luna?',
    options: ['1967', '1968', '1969', '1970'],
    correctIndex: 2,
    explanation: 'El Apolo 11 aterrizó en la Luna el 20 de julio de 1969 con Neil Armstrong y Buzz Aldrin.',
    category: 'variado'
  },
  {
    id: 'variado-5',
    question: '¿Cuál es el océano más grande del mundo?',
    options: ['Atlántico', 'Índico', 'Pacífico', 'Ártico'],
    correctIndex: 2,
    explanation: 'El océano Pacífico cubre unos 165 millones de km², más grande que todos los continentes juntos.',
    category: 'variado'
  },
  {
    id: 'variado-6',
    question: '¿De qué está hecho el diamante?',
    options: ['Cuarzo', 'Carbono', 'Oro', 'Silicio'],
    correctIndex: 1,
    explanation: 'El diamante es carbono puro cristalizado sometido a altísima presión y temperatura.',
    category: 'variado'
  },
  {
    id: 'variado-7',
    question: '¿Cuál es el río más largo del mundo?',
    options: ['Amazonas', 'Nilo', 'Misisipi', 'Yangtsé'],
    correctIndex: 0,
    explanation: 'El Amazonas mide unos 7,062 km, superando al Nilo (6,650 km) como el río más largo.',
    category: 'variado'
  },
  {
    id: 'variado-8',
    question: '¿Qué planeta es conocido como el "Planeta Rojo"?',
    options: ['Venus', 'Júpiter', 'Marte', 'Saturno'],
    correctIndex: 2,
    explanation: 'Marte tiene un color rojizo por el óxido de hierro (herrumbre) en su superficie.',
    category: 'variado'
  },
  {
    id: 'variado-9',
    question: '¿Cuántos días tiene un año bisiesto?',
    options: ['364', '365', '366', '367'],
    correctIndex: 2,
    explanation: 'Cada 4 años se agrega un día (29 de febrero) para ajustar el calendario solar: son 366 días.',
    category: 'variado'
  },
  {
    id: 'variado-10',
    question: '¿Cuál es el idioma más hablado del mundo por número de hablantes nativos?',
    options: ['Inglés', 'Español', 'Mandarín', 'Hindi'],
    correctIndex: 2,
    explanation: 'El mandarín tiene más de 920 millones de hablantes nativos, seguido del español y el inglés.',
    category: 'variado'
  },
  {
    id: 'variado-11',
    question: '¿Qué animal es conocido como el "rey de la selva"?',
    options: ['Tigre', 'León', 'Oso', 'Elefante'],
    correctIndex: 1,
    explanation: 'El león es tradicionalmente llamado el "rey de la selva", aunque en realidad habita en sabanas.',
    category: 'variado'
  },
  {
    id: 'variado-12',
    question: '¿Cuál es el metal más abundante en la corteza terrestre?',
    options: ['Hierro', 'Aluminio', 'Cobre', 'Oro'],
    correctIndex: 1,
    explanation: 'El aluminio es el metal más abundante (8% de la corteza), aunque el hierro es el más usado.',
    category: 'variado'
  },
  {
    id: 'variado-13',
    question: '¿Cuántas teclas tiene un piano estándar?',
    options: ['61', '76', '88', '108'],
    correctIndex: 2,
    explanation: 'Un piano de concierto tiene 88 teclas: 52 blancas y 36 negras.',
    category: 'variado'
  },
  {
    id: 'variado-14',
    question: '¿En qué país se inventó el papel?',
    options: ['India', 'Egipto', 'China', 'Grecia'],
    correctIndex: 2,
    explanation: 'El papel fue inventado en China alrededor del año 105 d.C. por Cai Lun.',
    category: 'variado'
  },
  {
    id: 'variado-15',
    question: '¿Cuál es el monumento más famoso de Perú?',
    options: ['Líneas de Nazca', 'Machu Picchu', 'Sacsayhuamán', 'Huaca Pucllana'],
    correctIndex: 1,
    explanation: 'Machu Picchu, la ciudad inca en lo alto de los Andes, es el ícono más reconocido del Perú.',
    category: 'variado'
  },
  {
    id: 'variado-16',
    question: '¿Cuál es el color de la esperanza?',
    options: ['Azul', 'Rojo', 'Verde', 'Amarillo'],
    correctIndex: 2,
    explanation: 'El verde simboliza la esperanza, la naturaleza y la vida en muchas culturas.',
    category: 'variado'
  },
  {
    id: 'variado-17',
    question: '¿Cuántos lados tiene un hexágono?',
    options: ['4', '5', '6', '8'],
    correctIndex: 2,
    explanation: 'Hexágono significa "seis ángulos" en griego. Tiene 6 lados y 6 vértices.',
    category: 'variado'
  },
  {
    id: 'variado-18',
    question: '¿Cuál es la fruta más consumida en el mundo?',
    options: ['Manzana', 'Banana', 'Naranja', 'Uva'],
    correctIndex: 1,
    explanation: 'La banana (plátano) es la fruta más consumida del mundo, seguida de la manzana y la naranja.',
    category: 'variado'
  },
  {
    id: 'variado-19',
    question: '¿Qué instrumento mide la temperatura?',
    options: ['Barómetro', 'Termómetro', 'Higrómetro', 'Velocímetro'],
    correctIndex: 1,
    explanation: 'El termómetro mide la temperatura. El barómetro mide presión y el higrómetro humedad.',
    category: 'variado'
  },
  {
    id: 'variado-20',
    question: '¿Cuál es el único mamífero que puede volar realmente?',
    options: ['Ardilla voladora', 'Murciélago', 'Pterodáctilo', 'Colibrí'],
    correctIndex: 1,
    explanation: 'El murciélago es el único mamífero capaz de volar activamente (no solo planear).',
    category: 'variado'
  },
  {
    id: 'variado-21',
    question: '¿Cuál es el número más pequeño?',
    options: ['1', '0', '-1', 'No existe'],
    correctIndex: 2,
    explanation: 'En los números enteros, el -1 es más pequeño que el 0. Pero no hay un número "más pequeño" porque los negativos son infinitos.',
    category: 'variado'
  },
  {
    id: 'variado-22',
    question: '¿Qué significa "gracias" en inglés?',
    options: ['Hello', 'Goodbye', 'Thank you', 'Please'],
    correctIndex: 2,
    explanation: '"Thank you" es la forma más común de decir "gracias" en inglés.',
    category: 'variado'
  },
  {
    id: 'variado-23',
    question: '¿En qué continente está Perú?',
    options: ['África', 'Europa', 'América del Sur', 'Asia'],
    correctIndex: 2,
    explanation: 'Perú está ubicado en América del Sur, en la costa occidental del continente.',
    category: 'variado'
  },
  {
    id: 'variado-24',
    question: '¿Cuál es la moneda oficial de Perú?',
    options: ['Peso', 'Dólar', 'Sol', 'Euro'],
    correctIndex: 2,
    explanation: 'La moneda oficial del Perú es el Sol (S/), que reemplazó al Nuevo Sol en 2018.',
    category: 'variado'
  },
  {
    id: 'variado-25',
    question: '¿Qué gas respiramos principalmente del aire?',
    options: ['Oxígeno', 'Nitrógeno', 'Dióxido de carbono', 'Hidrógeno'],
    correctIndex: 1,
    explanation: 'El aire es 78% nitrógeno y solo 21% oxígeno. Respiramos más nitrógeno que oxígeno.',
    category: 'variado'
  },
];
