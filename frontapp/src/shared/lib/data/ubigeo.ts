export const DEPARTAMENTOS = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho',
  'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco',
  'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima',
  'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura',
  'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali',
];

export const PROVINCIAS: Record<string, string[]> = {
  Amazonas: ['Chachapoyas', 'Bagua', 'Bongará', 'Condorcanqui', 'Luya', 'Rodríguez de Mendoza', 'Utcubamba'],
  Áncash: ['Huaraz', 'Aija', 'Antonio Raymondi', 'Asunción', 'Bolognesi', 'Carhuaz', 'Carlos Fermín Fitzcarrald', 'Casma', 'Corongo', 'Huari', 'Huarmey', 'Huaylas', 'Mariscal Luzuriaga', 'Ocros', 'Pallasca', 'Pomabamba', 'Recuay', 'Santa', 'Sihuas', 'Yungay'],
  Apurímac: ['Abancay', 'Andahuaylas', 'Antabamba', 'Aymaraes', 'Cotabambas', 'Chincheros', 'Grau'],
  Arequipa: ['Arequipa', 'Camaná', 'Caravelí', 'Caylloma', 'Condesuyos', 'Islay', 'La Unión'],
  Ayacucho: ['Huamanga', 'Cangallo', 'Huanca Sancos', 'Huanta', 'La Mar', 'Lucanas', 'Parinacochas', 'Páucar del Sara Sara', 'Sucre', 'Víctor Fajardo', 'Vilcas Huamán'],
  Cajamarca: ['Cajamarca', 'Cajabamba', 'Celendín', 'Chota', 'Contumazá', 'Cutervo', 'Hualgayoc', 'Jaén', 'San Ignacio', 'San Marcos', 'San Miguel', 'San Pablo', 'Santa Cruz'],
  Callao: ['Callao'],
  Cusco: ['Cusco', 'Acomayo', 'Anta', 'Calca', 'Canas', 'Canchis', 'Chumbivilcas', 'Espinar', 'La Convención', 'Paruro', 'Paucartambo', 'Quispicanchi', 'Urubamba'],
  Huancavelica: ['Huancavelica', 'Acobamba', 'Angaraes', 'Castrovirreyna', 'Churcampa', 'Huaytará', 'Tayacaja'],
  Huánuco: ['Huánuco', 'Ambo', 'Dos de Mayo', 'Huacaybamba', 'Huamalíes', 'Leoncio Prado', 'Marañón', 'Pachitea', 'Puerto Inca', 'Lauricocha', 'Yarowilca'],
  Ica: ['Ica', 'Chincha', 'Nazca', 'Palpa', 'Pisco'],
  Junín: ['Huancayo', 'Chanchamayo', 'Chupaca', 'Concepción', 'Jauja', 'Junín', 'Satipo', 'Tarma', 'Yauli'],
  'La Libertad': ['Trujillo', 'Ascope', 'Bolívar', 'Chepén', 'Gran Chimú', 'Julcán', 'Otuzco', 'Pacasmayo', 'Pataz', 'Sánchez Carrión', 'Santiago de Chuco', 'Virú'],
  Lambayeque: ['Chiclayo', 'Ferreñafe', 'Lambayeque'],
  Lima: ['Lima', 'Barranca', 'Cajatambo', 'Canta', 'Cañete', 'Huaral', 'Huarochirí', 'Huaura', 'Oyón', 'Yauyos'],
  Loreto: ['Maynas', 'Alto Amazonas', 'Datem del Marañón', 'Loreto', 'Mariscal Ramón Castilla', 'Putumayo', 'Requena', 'San Pablo', 'Ucayali'],
  'Madre de Dios': ['Tambopata', 'Manu', 'Tahuamanu'],
  Moquegua: ['Mariscal Nieto', 'General Sánchez Cerro', 'Ilo'],
  Pasco: ['Pasco', 'Daniel Alcides Carrión', 'Oxapampa'],
  Piura: ['Piura', 'Ayabaca', 'Huancabamba', 'Morropón', 'Paita', 'Sullana', 'Talara', 'Sechura'],
  Puno: ['Puno', 'Azángaro', 'Carabaya', 'Chucuito', 'El Collao', 'Huancané', 'Lampa', 'Melgar', 'Moho', 'San Antonio de Putina', 'San Román', 'Sandia', 'Yunguyo'],
  'San Martín': ['Moyobamba', 'Bellavista', 'El Dorado', 'Huallaga', 'Lamas', 'Mariscal Cáceres', 'Picota', 'Rioja', 'San Martín', 'Tocache'],
  Tacna: ['Tacna', 'Candarave', 'Jorge Basadre', 'Tarata'],
  Tumbes: ['Tumbes', 'Contralmirante Villar', 'Zarumilla'],
  Ucayali: ['Coronel Portillo', 'Atalaya', 'Padre Abad', 'Purús'],
};

export const DISTRITOS: Record<string, string[]> = {
  // === AMAZONAS ===
  Chachapoyas: ['Chachapoyas', 'Asunción', 'Balsas', 'Cheto', 'Chiliquín', 'Chuquibamba', 'Granada', 'Huancas', 'La Jalca', 'Leimebamba', 'Levanto', 'Magdalena', 'Mariscal Castilla', 'Molinopampa', 'Montevideo', 'Olleros', 'Quinjalca', 'San Francisco de Daguas', 'San Isidro de Maino', 'Soloco', 'Sonche'],
  Bagua: ['Bagua', 'Aramango', 'Copallín', 'El Parco', 'Imaza', 'La Peca'],
  Bongará: ['Jumbilla', 'Chisquilla', 'Churuja', 'Corosha', 'Cuispes', 'Florida', 'Jazán', 'Recta', 'San Carlos', 'Shipasbamba', 'Valera', 'Yambrasbamba'],
  Condorcanqui: ['Nieva', 'El Cenepa', 'Río Santiago'],
  Luya: ['Lamud', 'Camporredondo', 'Cocabamba', 'Colcamar', 'Conila', 'Inguilpata', 'Longuita', 'Lonya Chico', 'Luya', 'Luya Viejo', 'María', 'Ocalli', 'Ocumal', 'Pisuquía', 'Providencia', 'San Cristóbal', 'San Francisco de Yeso', 'San Jerónimo', 'San Juan de Lopecancha', 'Santa Catalina', 'Santo Tomás', 'Tingo', 'Trita'],
  'Rodríguez de Mendoza': ['San Nicolás', 'Chirimoto', 'Cochamal', 'Huambo', 'Limabamba', 'Longar', 'Mariscal Benavides', 'Milpuc', 'Omia', 'Santa Rosa', 'Totora', 'Vista Alegre'],
  Utcubamba: ['Bagua Grande', 'Cajaruro', 'Cumba', 'El Milagro', 'Jamalca', 'Lonya Grande', 'Yamón'],

  // === ÁNCASH ===
  Huaraz: ['Huaraz', 'Cochabamba', 'Colcabamba', 'Huanchay', 'Independencia', 'Jangas', 'La Libertad', 'Olleros', 'Pampas Grande', 'Pariacoto', 'Pira', 'Tarica'],
  Aija: ['Aija', 'Coris', 'Huacllán', 'La Merced', 'Succha'],
  'Antonio Raymondi': ['Llamellín', 'Aczo', 'Chaccho', 'Chingas', 'Mirgas', 'San Juan de Rontoy'],
  Asunción: ['Chacas', 'Acochaca'],
  Bolognesi: ['Chiquián', 'Abelardo Pardo Lezameta', 'Antonio Raymondi', 'Aquia', 'Cajacay', 'Canis', 'Colquioc', 'Huallanca', 'Huasta', 'Huayllacayán', 'La Primavera', 'Mangas', 'Pacllón', 'San Miguel de Corpanqui', 'Ticllos'],
  Carhuaz: ['Carhuaz', 'Acopampa', 'Amashca', 'Anta', 'Ataquero', 'Marcará', 'Pariahuanca', 'San Miguel de Aco', 'Shilla', 'Tinco', 'Yungar'],
  'Carlos Fermín Fitzcarrald': ['San Luis', 'San Nicolás', 'Yauya'],
  Casma: ['Casma', 'Buena Vista Alta', 'Comandante Noel', 'Yaután'],
  Corongo: ['Corongo', 'Aco', 'Bambas', 'Cusca', 'La Pampa', 'Yánac', 'Yupan'],
  Huari: ['Huari', 'Anra', 'Cajay', 'Chavín de Huántar', 'Huacachi', 'Huacchis', 'Huachis', 'Huántar', 'Masin', 'Paucas', 'Ponto', 'Rahuapampa', 'Rapayán', 'San Marcos', 'San Pedro de Chaná', 'Uco'],
  Huarmey: ['Huarmey', 'Cochapeti', 'Culebras', 'Huayan', 'Malvas'],
  Huaylas: ['Caraz', 'Huallanca', 'Huata', 'Huaylas', 'Mato', 'Pamparomas', 'Pueblo Libre', 'Santa Cruz', 'Santo Toribio', 'Yuracmarca'],
  'Mariscal Luzuriaga': ['Piscobamba', 'Casca', 'Eleazar Guzmán Barón', 'Fidel Olivas Escudero', 'Llama', 'Llumpa', 'Lucma', 'Musga', 'Ocros'],
  Ocros: ['Ocros', 'Acas', 'Cajamarquilla', 'Carhuapampa', 'Cochas', 'Congas', 'Llipa', 'San Cristóbal de Raján', 'San Pedro', 'Santiago de Chilcas'],
  Pallasca: ['Cabana', 'Bolognesi', 'Conchucos', 'Huacaschuque', 'Huandoval', 'Lacabamba', 'Llapo', 'Pallasca', 'Pampas', 'Santa Rosa', 'Tauca'],
  Pomabamba: ['Pomabamba', 'Huayllán', 'Parobamba', 'Quinuabamba'],
  Recuay: ['Recuay', 'Catac', 'Cotaparaco', 'Huayllapampa', 'Llacllín', 'Marca', 'Pampas Chico', 'Pararín', 'Tapacocha', 'Ticapampa'],
  Santa: ['Chimbote', 'Cáceres del Perú', 'Coishco', 'Macate', 'Moro', 'Nepeña', 'Samanco', 'Santa', 'Nuevo Chimbote'],
  Sihuas: ['Sihuas', 'Acobamba', 'Alfonso Ugarte', 'Cashapampa', 'Chingalpo', 'Huayllabamba', 'Quiches', 'Ragash', 'San Juan', 'Sicsibamba'],
  Yungay: ['Yungay', 'Cascapara', 'Mancos', 'Matacoto', 'Quillo', 'Ranrahirca', 'Shupluy', 'Yanama'],

  // === APURÍMAC ===
  Abancay: ['Abancay', 'Chacoche', 'Circa', 'Curahuasi', 'Huanipaca', 'Lambrama', 'Pichirhua', 'San Pedro de Cachora', 'Tamburco'],
  Andahuaylas: ['Andahuaylas', 'Andarapa', 'Chiara', 'Huancarama', 'Huancaray', 'Huayana', 'José María Arguedas', 'Kaquiabamba', 'Kishuara', 'Pacobamba', 'Pacucha', 'Pampachiri', 'Pomacocha', 'San Antonio de Cachi', 'San Jerónimo', 'San Miguel de Chaccrampa', 'Santa María de Chicmo', 'Talavera', 'Tumay Huaraca', 'Turpo'],
  Antabamba: ['Antabamba', 'El Oro', 'Huaquirca', 'Juan Espinoza Medrano', 'Oropesa', 'Pachaconas', 'Sabaino'],
  Aymaraes: ['Chalhuanca', 'Capaya', 'Caraybamba', 'Chapimarca', 'Colcabamba', 'Cotaruse', 'Huayllo', 'Justo Apu Sahuaraura', 'Lucre', 'Pocohuanca', 'San Juan de Chacña', 'Sañayca', 'Soraya', 'Taparqa', 'Tintay', 'Toraya', 'Yanaca'],
  Cotabambas: ['Tambobamba', 'Cotabambas', 'Coyllurqui', 'Haquira', 'Mara', 'Challhuahuacho'],
  Chincheros: ['Chincheros', 'Anco_Huallo', 'Cocharcas', 'Huaccana', 'Ocobamba', 'Ongoy', 'Uranmarca', 'Ranracancha'],
  Grau: ['Chuquibambilla', 'Curpahuasi', 'Gamarra', 'Huayllati', 'Mamara', 'Micaela Bastidas', 'Pataypampa', 'Progreso', 'San Antonio', 'Santa Rosa', 'Turpay', 'Vilcabamba', 'Virundo'],

  // === AREQUIPA ===
  Arequipa: ['Arequipa', 'Alto Selva Alegre', 'Cayma', 'Cerro Colorado', 'Characato', 'Chiguata', 'Jacobo Hunter', 'José Luis Bustamante y Rivero', 'Mariano Melgar', 'Miraflores', 'Mollebaya', 'Paucarpata', 'Pocsi', 'Polobaya', 'Quequeña', 'Sabandía', 'Sachaca', 'San Juan de Siguas', 'San Juan de Tarucani', 'Santa Isabel de Siguas', 'Santa Rita de Siguas', 'Socabaya', 'Tiabaya', 'Uchumayo', 'Vítor', 'Yanahuara', 'Yarabamba', 'Yura', 'Cercado'],
  Camaná: ['Camaná', 'José María Quimper', 'Mariano Nicolás Valcárcel', 'Mariscal Cáceres', 'Nicolás de Piérola', 'Ocoña', 'Quilca', 'Samuel Pastor'],
  Caravelí: ['Caravelí', 'Acarí', 'Atico', 'Atiquipa', 'Bella Unión', 'Cahuacho', 'Chala', 'Chaparra', 'Huanuhuanu', 'Jaquí', 'Lomas', 'Quicacha', 'Yauca'],
  Caylloma: ['Chivay', 'Achoma', 'Cabanaconde', 'Callalli', 'Caylloma', 'Coporaque', 'Huambo', 'Huanca', 'Ichupampa', 'Lari', 'Lluta', 'Maca', 'Madrigal', 'Majes', 'San Antonio de Chuca', 'Sibayo', 'Tapay', 'Tisco', 'Tuti', 'Yanque'],
  Condesuyos: ['Chuquibamba', 'Andaray', 'Cayarani', 'Chichas', 'Iray', 'Río Grande', 'Salamanca', 'Yanaquihua'],
  Islay: ['Mollendo', 'Cocachacra', 'Deán Valdivia', 'Islay', 'Mejía', 'Punta de Bombón'],
  'La Unión': ['Cotahuasi', 'Alca', 'Charcana', 'Huaynacotas', 'Pampamarca', 'Puyca', 'Quechualla', 'Sayla', 'Tauría', 'Tomepampa', 'Toro'],

  // === AYACUCHO ===
  Huamanga: ['Ayacucho', 'Acocro', 'Acos Vinchos', 'Carmen Alto', 'Chiara', 'Jesús Nazareno', 'Ocros', 'Pacaycasa', 'Quinua', 'San José de Ticllas', 'San Juan Bautista', 'Santiago de Pischa', 'Socos', 'Tambillo', 'Vinchos'],
  Cangallo: ['Cangallo', 'Chuschi', 'Los Morochucos', 'María Parado de Bellido', 'Paras', 'Totos'],
  'Huanca Sancos': ['Huanca Sancos', 'Carapo', 'Sacsamarca', 'Santiago de Lucanamarca'],
  Huanta: ['Huanta', 'Ayahuanco', 'Huamanguilla', 'Iguain', 'Luricocha', 'Santillana', 'Sivia', 'Llochegua'],
  'La Mar': ['San Miguel', 'Anco', 'Ayna', 'Chilcas', 'Chungui', 'Luis Carranza', 'Santa Rosa', 'Samugari', 'Tambo'],
  Lucanas: ['Puquio', 'Aucara', 'Cabana', 'Carmen Salcedo', 'Chaviña', 'Chipao', 'Huac-Huas', 'Laramate', 'Leoncio Prado', 'Llauta', 'Lucanas', 'Ocaña', 'Otoca', 'Saisa', 'San Cristóbal', 'San Juan', 'San Pedro', 'San Pedro de Palco', 'Sancos', 'Santa Ana de Huaycahuacho', 'Santa Lucía'],
  Parinacochas: ['Coracora', 'Chumpi', 'Coronel Castañeda', 'Pacapausa', 'Pullo', 'Puyusca', 'San Francisco de Ravacayco', 'Upahuacho'],
  'Páucar del Sara Sara': ['Pausa', 'Colta', 'Corculla', 'Lampa', 'Marcabamba', 'Oyolo', 'Pararca', 'San Javier de Alpabamba', 'San José de Ushua', 'Sara Sara'],
  Sucre: ['Querobamba', 'Belén', 'Chalcos', 'Chilcayoc', 'Huacaña', 'Morcolla', 'Paico', 'San Pedro de Larcay', 'San Salvador de Quije', 'Santiago de Paucaray', 'Soras'],
  'Víctor Fajardo': ['Huancapi', 'Alcamenca', 'Apongo', 'Asquipata', 'Canaria', 'Cayara', 'Colca', 'Huamanquiquia', 'Huancaraylla', 'Huaya', 'Sarhua', 'Vilcanchos'],
  'Vilcas Huamán': ['Vilcas Huamán', 'Accomarca', 'Carhuanca', 'Concepción', 'Huambalpa', 'Independencia', 'Saurama', 'Vischongo'],

  // === CAJAMARCA ===
  Cajamarca: ['Cajamarca', 'Asunción', 'Chetilla', 'Cospán', 'Encañada', 'Jesús', 'Llacanora', 'Los Baños del Inca', 'Magdalena', 'Matara', 'Namora', 'San Juan'],
  Cajabamba: ['Cajabamba', 'Cachachi', 'Condebamba', 'Sitacocha'],
  Celendín: ['Celendín', 'Chumuch', 'Cortegana', 'Huasmin', 'Jorge Chávez', 'José Gálvez', 'Miguel Iglesias', 'Oxamarca', 'Sorochuco', 'Sucre', 'Utco'],
  Chota: ['Chota', 'Anguía', 'Chadín', 'Chiguirip', 'Chimban', 'Choropampa', 'Cochabamba', 'Conchán', 'Huambos', 'Lajas', 'Llama', 'Miracosta', 'Paccha', 'Pión', 'Querocoto', 'San Juan de Licupis', 'Tacabamba', 'Tocmoche'],
  Contumazá: ['Contumazá', 'Chilete', 'Cupisnique', 'Guzmango', 'San Benito', 'Santa Cruz de Toledo', 'Tantarica', 'Yonán'],
  Cutervo: ['Cutervo', 'Callayuc', 'Choros', 'Cujillo', 'La Ramada', 'Pimpingos', 'Querocotillo', 'San Andrés de Cutervo', 'San Juan de Cutervo', 'San Luis de Lucma', 'Santa Cruz', 'Santo Domingo de la Capilla', 'Santo Tomás', 'Socota', 'Toribio Casanova'],
  Hualgayoc: ['Bambamarca', 'Chugur', 'Hualgayoc'],
  Jaén: ['Jaén', 'Bellavista', 'Chontali', 'Colasay', 'Huabal', 'Las Pirias', 'Pomahuaca', 'Pucará', 'Sallique', 'San Felipe', 'San José del Alto', 'Santa Rosa'],
  'San Ignacio': ['San Ignacio', 'Chirinos', 'Huarango', 'La Coipa', 'Namballe', 'San José de Lourdes', 'Tabaconas'],
  'San Marcos': ['Pedro Gálvez', 'Chancay', 'Eduardo Villanueva', 'Gregorio Pita', 'Ichocán', 'José Manuel Quiroz', 'José Sabogal'],
  'San Miguel': ['San Miguel', 'Bolívar', 'Calquis', 'Catilluc', 'El Prado', 'La Florida', 'Llapa', 'Nanchoc', 'Niepos', 'San Gregorio', 'San Silvestre de Cochan', 'Tongod', 'Unión Agua Blanca'],
  'San Pablo': ['San Pablo', 'San Bernardino', 'San Luis', 'Tumbadén'],
  'Santa Cruz': ['Santa Cruz', 'Andabamba', 'Catache', 'Chancaybaños', 'La Esperanza', 'Ninabamba', 'Pulán', 'Saucepampa', 'Sexi', 'Uticyacu', 'Yauyucán'],

  // === CALLAO ===
  Callao: ['Callao', 'Bellavista', 'Carmen de la Legua Reynoso', 'La Perla', 'La Punta', 'Mi Perú', 'Ventanilla'],

  // === CUSCO ===
  Cusco: ['Cusco', 'Ccorca', 'Poroy', 'San Jerónimo', 'San Sebastián', 'Santiago', 'Saylla', 'Wánchaq'],
  Acomayo: ['Acomayo', 'Acopía', 'Acos', 'Mosoc Llacta', 'Pomacanchi', 'Rondocan', 'Sangarará'],
  Anta: ['Anta', 'Ancahuasi', 'Cachimayo', 'Chinchaypujio', 'Huarocondo', 'Limatambo', 'Mollepata', 'Pucyura', 'Zurite'],
  Calca: ['Calca', 'Coya', 'Lamay', 'Lares', 'Písac', 'San Salvador', 'Taray', 'Yanatile'],
  Canas: ['Yanaoca', 'Checca', 'Kunturkanki', 'Langui', 'Layo', 'Pampamarca', 'Quehue', 'Túpac Amaru'],
  Canchis: ['Sicuani', 'Checacupe', 'Combapata', 'Marangani', 'Pitumarca', 'San Pablo', 'San Pedro', 'Tinta'],
  Chumbivilcas: ['Santo Tomás', 'Capacmarca', 'Chamaca', 'Colquemarca', 'Livitaca', 'Llusco', 'Quiñota', 'Velille'],
  Espinar: ['Yauri', 'Condoroma', 'Coporaque', 'Ocoruro', 'Pallpata', 'Pichigua', 'Suyckutambo'],
  'La Convención': ['Quillabamba', 'Santa Ana', 'Echarate', 'Huayopata', 'Maranura', 'Ocobamba', 'Pichari', 'Quelloúno', 'Santa Teresa', 'Vilcabamba', 'Villa Kintiarina', 'Villa Virgen'],
  Paruro: ['Paruro', 'Accha', 'Ccapi', 'Colcha', 'Huanoquite', 'Omacha', 'Paccaritambo', 'Pillpinto', 'Yaurisque'],
  Paucartambo: ['Paucartambo', 'Caicay', 'Challabamba', 'Colquepata', 'Huancarán', 'Kosñipata'],
  Quispicanchi: ['Urcos', 'Andahuaylillas', 'Camanti', 'Ccarhuayo', 'Ccatca', 'Cusipata', 'Huaro', 'Lucre', 'Marcapata', 'Ocongate', 'Oropesa', 'Quiquijana'],
  Urubamba: ['Urubamba', 'Chinchero', 'Huayllabamba', 'Machupicchu', 'Maras', 'Ollantaytambo', 'Yucay'],

  // === HUANCAVELICA ===
  Huancavelica: ['Huancavelica', 'Acobambilla', 'Acoria', 'Ascensión', 'Conayca', 'Cuenca', 'Huachocolpa', 'Huando', 'Huayllahuara', 'Izcuchaca', 'Laria', 'Manta', 'Mariscal Cáceres', 'Moya', 'Nuevo Occoro', 'Palca', 'Pilchaca', 'Vilca', 'Yauli'],
  Acobamba: ['Acobamba', 'Andabamba', 'Anta', 'Caja', 'Marcas', 'Paucará', 'Pomacocha', 'Rosario'],
  Angaraes: ['Lircay', 'Anchonga', 'Callanmarca', 'Ccochaccasa', 'Chincho', 'Congalla', 'Huanca Huanca', 'Huayllay Grande', 'Julcamarca', 'San Antonio de Antaparco', 'Santo Tomás de Pata', 'Secclla'],
  Castrovirreyna: ['Castrovirreyna', 'Arma', 'Aurahua', 'Capillas', 'Chupamarca', 'Cocas', 'Huachos', 'Huamatambo', 'Mollepampa', 'San Juan', 'Santa Ana', 'Tantara', 'Ticrapo'],
  Churcampa: ['Churcampa', 'Anco', 'Chinchihuasi', 'El Carmen', 'La Merced', 'Locroja', 'Paucarbamba', 'San Miguel de Mayocc', 'San Pedro de Coris', 'Pachamarca', 'Cosme'],
  Huaytará: ['Huaytará', 'Ayaví', 'Córdova', 'Huayacundo Arma', 'Laramarca', 'Ocoyo', 'Pilpichaca', 'Querco', 'Quito-Arma', 'San Antonio de Cusicancha', 'San Francisco de Sangayaico', 'San Isidro', 'Santiago de Chocorvos', 'Santiago de Quirahuara', 'Santo Domingo de Capillas', 'Tambo'],
  Tayacaja: ['Pampas', 'Acostambo', 'Acraquia', 'Ahuaycha', 'Colcabamba', 'Daniel Hernández', 'Huachocolpa', 'Huaribamba', 'Ñahuimpuquio', 'Pazos', 'Quishuar', 'Salcabamba', 'Salcahuasi', 'San Marcos de Rocchac', 'Surcubamba', 'Tintay Puncu', 'Quichuas', 'Santiago de Tucuma'],

  // === HUÁNUCO ===
  Huánuco: ['Huánuco', 'Amarilis', 'Chinchao', 'Churubamba', 'Margos', 'Quisqui', 'San Francisco de Cayrán', 'San Pedro de Chaulán', 'Santa María del Valle', 'Yacus', 'Yarumayo'],
  Ambo: ['Ambo', 'Cayna', 'Colpas', 'Conchamarca', 'Huácar', 'San Francisco', 'San Rafael', 'Tomay Kichwa'],
  'Dos de Mayo': ['La Unión', 'Chuquis', 'Marías', 'Pachas', 'Quivilla', 'Ripán', 'Shunqui', 'Sillapata', 'Yanas'],
  Huacaybamba: ['Huacaybamba', 'Canchabamba', 'Cochabamba', 'Pinra'],
  Huamalíes: ['Llata', 'Arancay', 'Chavín de Pariarca', 'Jacas Grande', 'Jircan', 'Miraflores', 'Monzón', 'Punchao', 'Puños', 'Singa', 'Tantamayo'],
  'Leoncio Prado': ['Tingo María', 'Castillo Grande', 'Daniel Alomía Robles', 'Hermilio Valdizán', 'José Crespo y Castillo', 'Luyando', 'Mariano Dámaso Beraún', 'Rupa-Rupa'],
  Marañón: ['Huacrachuco', 'Cholón', 'San Buenaventura'],
  Pachitea: ['Panao', 'Chaglla', 'Molino', 'Umari'],
  'Puerto Inca': ['Puerto Inca', 'Código del Pozuzo', 'Honoria', 'Tournavista', 'Yuyapichis'],
  Lauricocha: ['Jesús', 'Baños', 'Jivia', 'Queropalca', 'Rondos', 'San Francisco de Asís', 'San Miguel de Cauri'],
  Yarowilca: ['Chavinillo', 'Cahuac', 'Chacabamba', 'Aparicio Pomares', 'Jacas Chico', 'Obas', 'Pampamarca', 'Choras'],

  // === ICA ===
  Ica: ['Ica', 'La Tinguiña', 'Los Aquijes', 'Ocucaje', 'Pachacutec', 'Parcona', 'Pueblo Nuevo', 'Salas', 'San José de los Molinos', 'San Juan Bautista', 'Santiago', 'Subtanjalla', 'Tate', 'Yauca del Rosario'],
  Chincha: ['Chincha Alta', 'Alto Larán', 'Chavín', 'Chincha Baja', 'El Carmen', 'Grocio Prado', 'Pueblo Nuevo', 'San Juan de Yanac', 'San Pedro de Huacarpana', 'Sunampe', 'Tambo de Mora'],
  Nazca: ['Nazca', 'Changuillo', 'El Ingenio', 'Marcona', 'Vista Alegre'],
  Palpa: ['Palpa', 'Llipata', 'Río Grande', 'Santa Cruz', 'Tibillo'],
  Pisco: ['Pisco', 'Huancano', 'Humay', 'Independencia', 'Paracas', 'San Andrés', 'San Clemente', 'Túpac Amaru Inca'],

  // === JUNÍN ===
  Huancayo: ['Huancayo', 'Carhuacallanga', 'Chacapampa', 'Chicche', 'Chilca', 'Chongos Alto', 'Chupuro', 'Colca', 'Cullhuas', 'El Tambo', 'Huacrapuquio', 'Hualhuas', 'Huancán', 'Huasicancha', 'Huayucachi', 'Ingenio', 'Pariahuanca', 'Pilcomayo', 'Pucará', 'Quichuay', 'Quilcas', 'San Agustín', 'San Jerónimo de Tunán', 'San Pedro de Saño', 'Santo Domingo de Acobamba', 'Sapallanga', 'Sicaya', 'Viques'],
  Chanchamayo: ['La Merced', 'Chanchamayo', 'Perené', 'Pichanaqui', 'San Luis de Shuaro', 'San Ramón', 'Vítoc'],
  Chupaca: ['Chupaca', 'Áhuac', 'Chongos Bajo', 'Huáchac', 'Huamancaca Chico', 'San Juan de Iscos', 'San Juan de Jarpa', 'Tres de Diciembre', 'Yanacancha'],
  Concepción: ['Concepción', 'Aco', 'Andamarca', 'Chambara', 'Cochas', 'Comas', 'Heroínas Toledo', 'Manzanares', 'Mariscal Castilla', 'Matahuasi', 'Mito', 'Nueve de Julio', 'Orcotuna', 'San José de Quero', 'Santa Rosa de Ocopa'],
  Jauja: ['Jauja', 'Acolla', 'Apata', 'Ataura', 'Canchayllo', 'Curicaca', 'El Mantaro', 'Huamalí', 'Huaripampa', 'Huertas', 'Janjaillo', 'Julcán', 'Leonor Ordóñez', 'Llocllapampa', 'Marco', 'Masma', 'Masma Chicche', 'Molinos', 'Monobamba', 'Muqui', 'Muquiyauyo', 'Paca', 'Paccha', 'Pancán', 'Parco', 'Pomacancha', 'Ricrán', 'San Lorenzo', 'San Pedro de Chunán', 'Sausa', 'Sincos', 'Tunanmarca', 'Yauli', 'Yauyos'],
  Junín: ['Junín', 'Carhuamayo', 'Ondores', 'Ulcumayo'],
  Satipo: ['Satipo', 'Coviriali', 'Llaylla', 'Mazamari', 'Pampa Hermosa', 'Pangoa', 'Río Negro', 'Río Tambo', 'San Martín de Pangoa', 'Santa Rosa'],
  Tarma: ['Tarma', 'Acobamba', 'Huaricolca', 'Huasahuasi', 'La Unión', 'Palca', 'Palcamayo', 'San Pedro de Cajas', 'Tapo'],
  Yauli: ['La Oroya', 'Chacapalpa', 'Huayhuay', 'Marcapomacocha', 'Morococha', 'Paccha', 'Santa Bárbara de Carhuacayán', 'Santa Rosa de Sacco', 'Suitucancha', 'Yauli'],

  // === LA LIBERTAD ===
  Trujillo: ['Trujillo', 'El Porvenir', 'Florencia de Mora', 'Huanchaco', 'La Esperanza', 'Laredo', 'Moche', 'Poroto', 'Salaverry', 'Simbal', 'Víctor Larco Herrera'],
  Ascope: ['Ascope', 'Chicama', 'Chocope', 'Magdalena de Cao', 'Paiján', 'Rázuri', 'Santiago de Cao', 'Casa Grande'],
  Bolívar: ['Bolívar', 'Bambamarca', 'Condormarca', 'Longotea', 'Uchumarca', 'Ucuncha'],
  Chepén: ['Chepén', 'Pacanga', 'Pueblo Nuevo'],
  'Gran Chimú': ['Cascas', 'Lucma', 'Marmot', 'Sayapullo'],
  Julcán: ['Julcán', 'Calamarca', 'Carabamba', 'Huaso'],
  Otuzco: ['Otuzco', 'Agallpampa', 'Charat', 'Huaranchal', 'La Cuesta', 'Mache', 'Paranday', 'Salpo', 'Sinsicap', 'Usquil'],
  Pacasmayo: ['San Pedro de Lloc', 'Guadalupe', 'Jequetepeque', 'Pacasmayo', 'San José'],
  Pataz: ['Tayabamba', 'Buldibuyo', 'Chillia', 'Huancaspata', 'Huaylillas', 'Huayo', 'Ongón', 'Parcoy', 'Pataz', 'Pías', 'Santiago de Challas', 'Taurija', 'Urpay'],
  'Sánchez Carrión': ['Huamachuco', 'Chugay', 'Cochorco', 'Curgos', 'Marcabal', 'Sanagorán', 'Sarin', 'Sartimbamba'],
  'Santiago de Chuco': ['Santiago de Chuco', 'Angasmarca', 'Cachicadán', 'Mollebamba', 'Mollepata', 'Quiruvilca', 'Santa Cruz de Chuca', 'Sitabamba'],
  Virú: ['Virú', 'Chao', 'Guadalupito'],

  // === LAMBAYEQUE ===
  Chiclayo: ['Chiclayo', 'Chongoyape', 'Eten', 'Eten Puerto', 'José Leonardo Ortiz', 'La Victoria', 'Lagunas', 'Monsefú', 'Nueva Arica', 'Oyotún', 'Picsi', 'Pimentel', 'Pomalca', 'Pucalá', 'Reque', 'Santa Rosa', 'Saña', 'Cayaltí', 'Patapo', 'Pueblo Nuevo'],
  Ferreñafe: ['Ferreñafe', 'Cañaris', 'Incahuasi', 'Manuel Antonio Mesones Muro', 'Pitipo', 'Pueblo Nuevo'],
  Lambayeque: ['Lambayeque', 'Chóchope', 'Íllimo', 'Jayanca', 'Mochumí', 'Mórrope', 'Motupe', 'Olmos', 'Pacora', 'Salas', 'San José', 'Túcume'],

  // === LIMA ===
  Lima: ['Lima', 'Ancón', 'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo', 'Chorrillos', 'Cieneguilla', 'Comas', 'El Agustino', 'Independencia', 'Jesús María', 'La Molina', 'La Victoria', 'Lince', 'Los Olivos', 'Lurigancho', 'Lurín', 'Magdalena del Mar', 'Miraflores', 'Pachacámac', 'Pucusana', 'Pueblo Libre', 'Puente Piedra', 'Punta Hermosa', 'Punta Negra', 'Rímac', 'San Bartolo', 'San Borja', 'San Isidro', 'San Juan de Lurigancho', 'San Juan de Miraflores', 'San Luis', 'San Martín de Porres', 'San Miguel', 'Santa Anita', 'Santa María del Mar', 'Santa Rosa', 'Santiago de Surco', 'Surquillo', 'Villa El Salvador', 'Villa María del Triunfo'],
  Barranca: ['Barranca', 'Paramonga', 'Pativilca', 'Supe', 'Supe Puerto'],
  Cajatambo: ['Cajatambo', 'Copa', 'Gorgor', 'Huancapón', 'Manas'],
  Canta: ['Canta', 'Arahuay', 'Huamantanga', 'Huaros', 'Lachaqui', 'San Buenaventura', 'Santa Rosa de Quives'],
  Cañete: ['San Vicente de Cañete', 'Asia', 'Calango', 'Cerro Azul', 'Chilca', 'Coayllo', 'Imperial', 'Lunahuaná', 'Mala', 'Nuevo Imperial', 'Pacarán', 'Quilmaná', 'San Antonio', 'San Luis', 'Santa Cruz de Flores', 'Zúñiga'],
  Huaral: ['Huaral', 'Atavillos Alto', 'Atavillos Bajo', 'Aucallama', 'Chancay', 'Ihuarí', 'Lampian', 'Pacaraos', 'San Miguel de Acos', 'Santa Cruz de Andamarca', 'Sumbilca', 'Veintisiete de Noviembre'],
  Huarochirí: ['Matucana', 'Antioquía', 'Callahuanca', 'Carampoma', 'Chicla', 'Cuenca', 'Huachupampa', 'Huanza', 'Huarochirí', 'Lahuaytambo', 'Langa', 'Laraos', 'Mariatana', 'Ricardo Palma', 'San Andrés de Tupicocha', 'San Antonio', 'San Bartolomé', 'San Damian', 'San Juan de Iris', 'San Juan de Tantaranche', 'San Lorenzo de Quinti', 'San Mateo', 'San Mateo de Otao', 'San Pedro de Casta', 'San Pedro de Huancayre', 'Sangallaya', 'Santa Cruz de Cocachacra', 'Santa Eulalia', 'Santiago de Anchucaya', 'Santiago de Tuna', 'Santo Domingo de los Olleros', 'Surco'],
  Huaura: ['Huacho', 'Ámbar', 'Caleta de Carquín', 'Checras', 'Hualmay', 'Huaura', 'Leoncio Prado', 'Paccho', 'Santa Leonor', 'Santa María', 'Sayan', 'Vegueta'],
  Oyón: ['Oyón', 'Andajes', 'Caujul', 'Cochamarca', 'Navan', 'Pachangara'],
  Yauyos: ['Yauyos', 'Alis', 'Ayauca', 'Ayaviri', 'Azángaro', 'Cacra', 'Carania', 'Catahuasi', 'Chocos', 'Cochas', 'Colonia', 'Hongos', 'Huampara', 'Huancaya', 'Huangascar', 'Huantán', 'Huañec', 'Laraos', 'Lincha', 'Madean', 'Miraflores', 'Omas', 'Putinza', 'Quinches', 'Quinocay', 'San Joaquín', 'San Pedro de Pilas', 'Tanta', 'Tauripampa', 'Tomas', 'Tupe', 'Viñac', 'Vitis'],

  // === LORETO ===
  Maynas: ['Iquitos', 'Alto Nanay', 'Fernando Lores', 'Indiana', 'Las Amazonas', 'Mazán', 'Napo', 'Punchana', 'Putumayo', 'San Juan Bautista', 'Teniente Manuel Clavero', 'Torres Causana', 'Yaquerana', 'Belen', 'Trompeteros'],
  'Alto Amazonas': ['Yurimaguas', 'Balsapuerto', 'Jeberos', 'Lagunas', 'Santa Cruz', 'Teniente César López Rojas'],
  'Datem del Marañón': ['San Lorenzo', 'Barranca', 'Cahuapanas', 'Manseriche', 'Morona', 'Pastaza', 'Andoas'],
  Loreto: ['Nauta', 'Parinari', 'Tigre', 'Trompeteros', 'Urarinas'],
  'Mariscal Ramón Castilla': ['Caballococha', 'San Pablo', 'Yavarí', 'San Antonio del Estrecho'],
  Putumayo: ['Putumayo', 'Rosa Panduro', 'Teniente César López Rojas', 'Yaguas'],
  Requena: ['Requena', 'Alto Tapiche', 'Capelo', 'Emilio San Martín', 'Maquía', 'Puinahua', 'Saquena', 'Soplin', 'Tapiche', 'Jenaro Herrera', 'Yaquerana'],
  // @ts-expect-error duplicate key is a data error; keep for runtime lookup
  'San Pablo': ['San Pablo', 'Samur', 'Yuril'],
  Ucayali: ['Contamana', 'Inahuaya', 'Padre Márquez', 'Pampa Hermosa', 'Sarayacu', 'Vargas Guerra'],

  // === MADRE DE DIOS ===
  Tambopata: ['Tambopata', 'Inambari', 'Las Piedras', 'Laberinto'],
  Manu: ['Manu', 'Fitzcarrald', 'Madre de Dios', 'Huepetuhe'],
  Tahuamanu: ['Iñapari', 'Iberia', 'Tahuamanu'],

  // === MOQUEGUA ===
  'Mariscal Nieto': ['Moquegua', 'Carumas', 'Cuchumbaya', 'Samegua', 'San Cristóbal', 'Torata'],
  'General Sánchez Cerro': ['Omate', 'Chojata', 'Coalaque', 'Ichuña', 'La Capilla', 'Lloque', 'Matalaque', 'Puquina', 'Quintistaquilla', 'Ubinas', 'Yunga'],
  Ilo: ['Ilo', 'El Algarrobal', 'Pacocha'],

  // === PASCO ===
  Pasco: ['Cerro de Pasco', 'Chaupimarca', 'Huachón', 'Huariaca', 'Huayllay', 'Ninacaca', 'Pallanchacra', 'Paucartambo', 'San Francisco de Asís de Yarusyacán', 'Simón Bolívar', 'Ticlacayán', 'Tinyahuarco', 'Vicco', 'Yanacancha'],
  'Daniel Alcides Carrión': ['Yanahuanca', 'Chacayán', 'Goyllarisquizga', 'Paucar', 'San Pedro de Pillao', 'Santa Ana de Tusi', 'Tapuc', 'Vilcabamba'],
  Oxapampa: ['Oxapampa', 'Chontabamba', 'Huancabamba', 'Palcazú', 'Pozuzo', 'Puerto Bermúdez', 'Villa Rica', 'Constitución'],

  // === PIURA ===
  Piura: ['Piura', 'Castilla', 'Catacaos', 'Cura Mori', 'El Tallán', 'La Arena', 'La Unión', 'Las Lomas', 'Tambo Grande'],
  Ayabaca: ['Ayabaca', 'Frias', 'Jililí', 'Lagunas', 'Montero', 'Pacaipampa', 'Paimas', 'Sapillica', 'Sicchez', 'Suyo'],
  Huancabamba: ['Huancabamba', 'Canchaque', 'El Carmen de la Frontera', 'Huarmaca', 'Lalaquiz', 'San Miguel de El Faique', 'Sondor', 'Sondorillo'],
  Morropón: ['Chulucanas', 'Buenos Aires', 'Chalaco', 'La Matanza', 'Morropón', 'Salitral', 'San Juan de Bigote', 'Santa Catalina de Mossa', 'Santo Domingo', 'Yamango'],
  Paita: ['Paita', 'Amotape', 'Arenal', 'Colán', 'La Huaca', 'Tamarindo', 'Vichayal'],
  Sullana: ['Sullana', 'Bellavista', 'Ignacio Escudero', 'Lancones', 'Marcavelica', 'Miguel Checa', 'Querecotillo', 'Salitral'],
  Talara: ['Talara', 'El Alto', 'La Brea', 'Lobitos', 'Los Órganos', 'Máncora', 'Pariñas'],
  Sechura: ['Sechura', 'Bellavista de la Unión', 'Bernal', 'Cristo Nos Valga', 'Rinconada Llicuar', 'Vice'],

  // === PUNO ===
  Puno: ['Puno', 'Ácora', 'Amantaní', 'Atuncolla', 'Capachica', 'Chucuito', 'Coata', 'Huata', 'Mañazo', 'Paucarcolla', 'Pichacani', 'Platería', 'San Antonio', 'Tiquillaca', 'Vilque'],
  Azángaro: ['Azángaro', 'Achaya', 'Arapa', 'Asillo', 'Caminaca', 'Chupa', 'José Domingo Choquehuanca', 'Muñani', 'Potoni', 'Saman', 'San Antón', 'San José', 'San Juan de Salinas', 'Santiago de Pupuja', 'Tirapata'],
  Carabaya: ['Macusani', 'Ajoyani', 'Ayapata', 'Coasa', 'Corani', 'Crucero', 'Ituata', 'Ollachea', 'San Gaban', 'Usicayos'],
  Chucuito: ['Juli', 'Desaguadero', 'Huacullani', 'Kelluyo', 'Pisacoma', 'Pomata', 'Zepita'],
  'El Collao': ['Ilave', 'Capazo', 'Pilcuyo', 'Santa Rosa', 'Conduriri'],
  Huancané: ['Huancané', 'Cojata', 'Huatasani', 'Inchupalla', 'Pusi', 'Rosaspata', 'Taraco', 'Vilque Chico'],
  Lampa: ['Lampa', 'Cabanilla', 'Calapuja', 'Nicasio', 'Ocuviri', 'Palca', 'Paratia', 'Pucará', 'Santa Lucía', 'Vilavila'],
  Melgar: ['Ayaviri', 'Antauta', 'Cupi', 'Llalli', 'Macari', 'Nuñoa', 'Orurillo', 'Santa Rosa', 'Umachiri'],
  Moho: ['Moho', 'Conima', 'Huaraya Moho', 'Tilali'],
  'San Antonio de Putina': ['Putina', 'Ananea', 'Pedro Vilca Apaza', 'Quilcapuncu', 'Sina'],
  'San Román': ['Juliaca', 'Cabana', 'Cabanillas', 'Caracoto', 'San Miguel'],
  Sandia: ['Sandia', 'Cuyocuyo', 'Limbani', 'Patambuco', 'Phara', 'Quiaca', 'San Juan del Oro', 'Yanahuaya', 'Alto Inambari', 'San Pedro de Putina Punco'],
  Yunguyo: ['Yunguyo', 'Copani', 'Cuturapi', 'Ollaraya', 'Tinicachi', 'Unicachi'],

  // === SAN MARTÍN ===
  Moyobamba: ['Moyobamba', 'Calzada', 'Habana', 'Jepelacio', 'Soritor', 'Yantaló'],
  Bellavista: ['Bellavista', 'Alto Biavo', 'Bajo Biavo', 'Huallaga', 'San Pablo', 'San Rafael'],
  'El Dorado': ['San José de Sisa', 'Agua Blanca', 'San Martín', 'Santa Rosa', 'Shatoja'],
  Huallaga: ['Saposoa', 'Alto Saposoa', 'El Eslabón', 'Piscoyacu', 'Sacanche', 'Tingo de Saposoa'],
  Lamas: ['Lamas', 'Alonso de Alvarado', 'Barranquita', 'Caynarachi', 'Cuñumbuqui', 'Pinto Recodo', 'Rumisapa', 'San Roque de Cumbaza', 'Shanao', 'Tabalosos', 'Zapatero'],
  'Mariscal Cáceres': ['Juanjuí', 'Campanilla', 'Huicungo', 'Pachiza', 'Pajarillo'],
  Picota: ['Picota', 'Buenos Aires', 'Caspisapa', 'Pilluana', 'Pucacaca', 'San Cristóbal', 'San Hilarión', 'Shamboyacu', 'Tingo de Ponasa', 'Tres Unidos'],
  Rioja: ['Rioja', 'Awajun', 'Elías Soplin Vargas', 'Nueva Cajamarca', 'Pardo Miguel', 'Posic', 'San Fernando', 'Yorongos', 'Yuracyacu'],
  'San Martín': ['Tarapoto', 'Alberto Leveau', 'Cacatachi', 'Chazuta', 'Chipurana', 'El Porvenir', 'Huimbayoc', 'Juan Guerra', 'La Banda de Shilcayo', 'Morales', 'Papaplaya', 'San Antonio', 'Sauce', 'Shapaja'],
  Tocache: ['Tocache', 'Nuevo Progreso', 'Polvora', 'Shunte', 'Uchiza'],

  // === TACNA ===
  Tacna: ['Tacna', 'Alto de la Alianza', 'Calana', 'Ciudad Nueva', 'Inclán', 'Pachía', 'Palca', 'Pocollay', 'Sama', 'Coronel Gregorio Albarracín Lanchipa', 'La Yarada Los Palos'],
  Candarave: ['Candarave', 'Cairani', 'Camilaca', 'Curibaya', 'Huanuara', 'Quilahuani'],
  'Jorge Basadre': ['Locumba', 'Ilabaya', 'Ite'],
  Tarata: ['Tarata', 'Héroes Albarracín', 'Estique', 'Estique Pampa', 'Sitajara', 'Susapaya', 'Tarucachi', 'Ticaco'],

  // === TUMBES ===
  Tumbes: ['Tumbes', 'Corrales', 'La Cruz', 'Pampas de Hospital', 'San Jacinto', 'San Juan de la Virgen'],
  'Contralmirante Villar': ['Zorritos', 'Casitas', 'Canoas de Punta Sal'],
  Zarumilla: ['Zarumilla', 'Aguas Verdes', 'Matapalo', 'Papayal'],

  // === UCAYALI ===
  'Coronel Portillo': ['Pucallpa', 'Callería', 'Campoverde', 'Iparía', 'Manantay', 'Masisea', 'Nueva Requena', 'Yarinacocha'],
  Atalaya: ['Atalaya', 'Raymondi', 'Sepahua', 'Tahuanía', 'Yurúa'],
  'Padre Abad': ['Aguaytía', 'Curimaná', 'Neshuya', 'San Alejandro'],
  Purús: ['Purús'],
};
