import { TermSection } from './termsData';

export const manualSections: TermSection[] = [
  {
    id: 'intro',
    title: 'Introducción',
    content: `
      <h4 class="text-lg font-bold text-[#333333] mb-2">LYRIUM BIOMARKETPLACE — SALUD EN CADA PEDIDO</h4>
      <p class="mb-4">Lyrium Biomarketplace es una plataforma especializada en productos saludables: alimentos naturales y orgánicos, frutas y verduras frescas, suplementos vitamínicos, medicamentos, productos de bienestar personal y mucho más. Todo lo que vendemos tiene como propósito cuidar la salud y la calidad de vida de nuestros clientes.</p>
      <p class="mb-4">Por eso, empacar bien en Lyrium no es solo un proceso logístico — es parte directa de nuestro compromiso con la salud. Un producto que llega roto, contaminado o en mal estado no solo genera un reclamo: puede afectar directamente el bienestar de quien lo recibe.</p>
      <h4 class="text-lg font-bold text-[#333333] mb-2">POR QUÉ EL EMPAQUE ES PARTE DE LA SALUD EN LYRIUM</h4>
      <p class="mb-4">Un aceite esencial que se rompe durante el envío pierde sus propiedades terapéuticas. Un medicamento expuesto al calor o a la luz solar puede perder su eficacia o volverse dañino. Un alimento fresco mal embalado se contamina, se daña o llega podrido al cliente. Un suplemento con el sello de seguridad roto no puede usarse con confianza. Cada vez que empacas bien, estás protegiendo la salud de una persona real.</p>
      <h4 class="text-lg font-bold text-[#333333] mb-2">Productos saludables que manejamos en Lyrium</h4>
      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead><tr class="bg-gray-100"><th class="p-2 border text-left font-bold">Categoría</th><th class="p-2 border text-left font-bold">Ejemplos de productos</th><th class="p-2 border text-left font-bold">Cuidado principal</th></tr></thead>
          <tbody>
            <tr class="border-b"><td class="p-2 border">Alimentos frescos y orgánicos</td><td class="p-2 border">Frutas, verduras, hierbas, hongos, granos integrales.</td><td class="p-2 border">Cadena de frío, ventilación y protección del aplastamiento.</td></tr>
            <tr class="border-b"><td class="p-2 border">Superfoods y alimentos funcionales</td><td class="p-2 border">Acai, spirulina, moringa, maca, quínoa, semillas.</td><td class="p-2 border">Hermeticidad, protección de la luz y la humedad.</td></tr>
            <tr class="border-b"><td class="p-2 border">Suplementos vitamínicos</td><td class="p-2 border">Vitaminas, minerales, cápsulas, polvos, colágeno.</td><td class="p-2 border">Sello intacto, fecha vigente, protección del calor.</td></tr>
            <tr class="border-b"><td class="p-2 border">Medicina natural y fitoterapia</td><td class="p-2 border">Aceites esenciales, tinturas, tés medicinales, cremas naturales.</td><td class="p-2 border">Protección UV, hermeticidad, frascos bien sellados.</td></tr>
            <tr class="border-b"><td class="p-2 border">Lácteos y proteínas saludables</td><td class="p-2 border">Yogur, kéfir, proteínas vegetales, quesos artesanales.</td><td class="p-2 border">Cadena de frío 2-4 grados obligatoria.</td></tr>
            <tr class="border-b"><td class="p-2 border">Bebidas saludables</td><td class="p-2 border">Jugos cold press, kombuchas, aguas funcionales, batidos.</td><td class="p-2 border">Vidrio protegido con colmena, hermeticidad y orientación.</td></tr>
            <tr class="border-b"><td class="p-2 border">Cosmética natural y orgánica</td><td class="p-2 border">Cremas, aceites, jabones artesanales, fitocosméticos.</td><td class="p-2 border">Frascos protegidos, temperatura controlada.</td></tr>
            <tr class="border-b"><td class="p-2 border">Equipos y accesorios de bienestar</td><td class="p-2 border">Termómetros, nebulizadores, tensiómetros, dispositivos.</td><td class="p-2 border">Embalaje rígido, protección de impactos, frágil.</td></tr>
          </tbody>
        </table>
      </div>
      <div class="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-xl mb-4">
        <p class="font-bold text-green-800">RECUERDA SIEMPRE</p>
        <p class="text-green-700">El cliente de Lyrium eligió un producto saludable porque cuida su bienestar. Cuando empacas con cuidado, estás siendo parte de esa promesa de salud. Un buen empaque es tan importante como el producto mismo.</p>
      </div>
    `
  },
  {
    id: 'guia-rapida',
    title: 'Guía Rápida — 5 Pasos para cada pedido',
    content: `
      <p class="mb-4">Cada vez que procesas un pedido, sigue estos 5 pasos en orden. Las secciones siguientes explican cada uno con detalle y fotos.</p>
      <p class="font-bold mb-1">1. Elige la caja correcta</p>
      <p class="mb-3">Usa la tabla de cajas (XXS a XL) para elegir el tamaño según el producto y su peso.</p>
      <p class="font-bold mb-1">2. Revisa que la caja esté en buen estado</p>
      <p class="mb-3">Que esté firme, seca y sin golpes. Si está dañada, toma otra.</p>
      <p class="font-bold mb-1">3. Protege lo que va adentro</p>
      <p class="mb-3">Envuelve con burbujas, pon relleno y haz la prueba del movimiento antes de cerrar.</p>
      <p class="font-bold mb-1">4. Toma la foto antes de cerrar</p>
      <p class="mb-3">Pon los papeles del pedido y fotografía todo desde arriba. SIN CERRAR todavía.</p>
      <p class="font-bold mb-1">5. Sella, etiqueta y despacha</p>
      <p class="mb-3">Cinta en patrón H, etiqueta del courier en la cara de arriba y listo.</p>
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl mb-4">
        <p class="font-bold text-yellow-800">REGLA DE ORO — SIEMPRE ANTES DE CERRAR</p>
        <p class="text-yellow-700">Cierra la caja sin sellarla y agítala con fuerza. Si escuchas o sientes que algo se mueve adentro: NO la cierres todavía. Agrega más relleno hasta que todo quede completamente quieto.</p>
      </div>
    `
  },
  {
    id: 'parte-1',
    title: 'Parte 1 — ¿Qué caja uso?',
    content: `
      <p class="mb-4">Lyrium usa 7 tamaños de caja. Elegir bien es muy importante: si la caja es muy grande el producto se mueve y se golpea. Si es muy pequeña no hay espacio para el relleno protector.</p>
      <p class="mb-4">Las 7 cajas del sistema Lyrium ordenadas de menor a mayor: XXS, XS, S, M, ML, L y XL.</p>
      <h4 class="text-base font-bold text-[#333333] mb-2">Medidas y uso de cada caja Lyrium</h4>
      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead><tr class="bg-gray-100"><th class="p-2 border text-left font-bold">Código</th><th class="p-2 border text-left font-bold">Tamaño</th><th class="p-2 border text-left font-bold">Medidas Largo x Ancho x Alto</th><th class="p-2 border text-left font-bold">Peso Máximo</th><th class="p-2 border text-left font-bold">Ideal para</th></tr></thead>
          <tbody>
            <tr class="border-b"><td class="p-2 border font-bold">XXS</td><td class="p-2 border">Extra Extra Small</td><td class="p-2 border">15 x 10 x 10 cm</td><td class="p-2 border">hasta 0.5 kg</td><td class="p-2 border">Joyería, pastillas, accesorios muy pequeños.</td></tr>
            <tr class="border-b"><td class="p-2 border font-bold">XS</td><td class="p-2 border">Extra Small</td><td class="p-2 border">25 x 20 x 12 cm</td><td class="p-2 border">hasta 1 kg</td><td class="p-2 border">Cosméticos pequeños, ropa interior, snacks.</td></tr>
            <tr class="border-b"><td class="p-2 border font-bold">S</td><td class="p-2 border">Small</td><td class="p-2 border">30 x 20 x 12 cm</td><td class="p-2 border">hasta 2 kg</td><td class="p-2 border">Ropa liviana, calzado de bebé, suplementos.</td></tr>
            <tr class="border-b"><td class="p-2 border font-bold">M</td><td class="p-2 border">Medium</td><td class="p-2 border">40 x 30 x 20 cm</td><td class="p-2 border">hasta 5 kg</td><td class="p-2 border">Ropa, calzado adulto, electrónica mediana.</td></tr>
            <tr class="border-b"><td class="p-2 border font-bold">ML</td><td class="p-2 border">Medium-Large</td><td class="p-2 border">50 x 40 x 25 cm</td><td class="p-2 border">hasta 10 kg</td><td class="p-2 border">Varios productos juntos, botellas con accesorios.</td></tr>
            <tr class="border-b"><td class="p-2 border font-bold">L</td><td class="p-2 border">Large</td><td class="p-2 border">60 x 40 x 30 cm</td><td class="p-2 border">hasta 10 kg</td><td class="p-2 border">Pedidos grandes, juguetes, equipos deportivos.</td></tr>
            <tr class="border-b"><td class="p-2 border font-bold">XL</td><td class="p-2 border">Extra Large</td><td class="p-2 border">80 x 60 x 40 cm</td><td class="p-2 border">hasta 25 kg</td><td class="p-2 border">Pedidos muy grandes, equipos, alimentos en volumen.</td></tr>
          </tbody>
        </table>
      </div>
      <h4 class="text-base font-bold text-[#333333] mb-2">¿Cómo elegir el tamaño correcto?</h4>
      <ul class="list-disc pl-5 space-y-1 mb-4">
        <li>El producto debe entrar con comodidad, sin forzarlo ni aplastarlo.</li>
        <li>Debe quedar espacio en los costados (al menos 3 a 5 cm por lado) para el relleno.</li>
        <li>Si el producto ocupa más del 85% de la caja sin relleno: usa el siguiente tamaño.</li>
        <li>Si hay demasiado espacio libre: baja un tamaño o agrega más relleno.</li>
      </ul>
      <h4 class="text-base font-bold text-[#333333] mb-2">REGLA FÁCIL PARA RECORDAR</h4>
      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead><tr class="bg-gray-100"><th class="p-2 border text-left font-bold">Situación</th><th class="p-2 border text-left font-bold">Acción</th></tr></thead>
          <tbody>
            <tr class="border-b"><td class="p-2 border">Caja muy pequeña: el producto casi no entra.</td><td class="p-2 border">Sube de tamaño.</td></tr>
            <tr class="border-b"><td class="p-2 border">Caja correcta: el producto entra con 3 a 5 cm libres en los lados para el relleno.</td><td class="p-2 border">Está bien.</td></tr>
            <tr class="border-b"><td class="p-2 border">Caja muy grande: el producto queda flotando.</td><td class="p-2 border">Baja de tamaño o agrega más relleno.</td></tr>
          </tbody>
        </table>
      </div>
      <h4 class="text-base font-bold text-[#333333] mb-2">Tipo de cartón según lo que vas a enviar</h4>
      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead><tr class="bg-gray-100"><th class="p-2 border text-left font-bold">Cajas</th><th class="p-2 border text-left font-bold">Tipo de cartón</th><th class="p-2 border text-left font-bold">Cuándo usarlo</th></tr></thead>
          <tbody>
            <tr class="border-b"><td class="p-2 border">XXS, XS</td><td class="p-2 border">Cartón sencillo (más delgado)</td><td class="p-2 border">Productos livianos que no son frágiles.</td></tr>
            <tr class="border-b"><td class="p-2 border">S, M</td><td class="p-2 border">Cartón sencillo reforzado</td><td class="p-2 border">Ropa, calzado, suplementos, cosméticos.</td></tr>
            <tr class="border-b"><td class="p-2 border">ML, L</td><td class="p-2 border">Cartón doble (más grueso y fuerte)</td><td class="p-2 border">Vidrio, electrónicos, líquidos y frágiles.</td></tr>
            <tr class="border-b"><td class="p-2 border">XL</td><td class="p-2 border">Cartón doble o triple pesado</td><td class="p-2 border">Pedidos muy pesados, equipos, químicos.</td></tr>
          </tbody>
        </table>
      </div>
      <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl mb-4">
        <p class="font-bold text-red-800">PARA VIDRIO, LÍQUIDOS Y ELECTRÓNICOS</p>
        <p class="text-red-700">Si el pedido incluye botellas de vidrio, frascos, tablets, celulares o cualquier cosa que pueda romperse: usa MÍNIMO la caja ML o L aunque el producto sea liviano. Las cajas ML, L y XL tienen cartón más grueso que aguanta mejor los golpes del camino.</p>
      </div>
    `
  },
  {
    id: 'parte-2',
    title: 'Parte 2 — ¿Qué tipo de producto es?',
    content: `
      <p class="mb-4">Antes de empacar, identifica a cuál de estos 3 grupos pertenece tu pedido. Cada grupo necesita un cuidado diferente.</p>

      <h4 class="text-base font-bold text-[#333333] mb-2">GRUPO 1 — Productos blandos (ropa, tela, peluches)</h4>
      <p class="mb-2">Son todo lo que puedes doblar o comprimir sin que se dañe: ropa, textiles, peluches, almohadas, toallas, bolsos de tela, sábanas, etc.</p>
      <p class="font-semibold mb-1">Cómo empacarlos:</p>
      <ol class="list-decimal pl-6 space-y-1 mb-3">
        <li>Dóblalos o enróllalos para que ocupen menos espacio.</li>
        <li>Mételos en una bolsa de plástico transparente antes de ponerlos en la caja.</li>
        <li>Para ropa delicada (seda, bordados, lino): dobla con cuidado y pon papel de seda entre capas.</li>
        <li>Para ropa de bebé (0 a 4 años): usa SIEMPRE bolsas con hoyitos pequeños (anti-asfixia).</li>
      </ol>
      <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl mb-4">
        <p class="font-bold text-red-800">NUNCA empaques ropa con humedad.</p>
        <p class="text-red-700">Si la ropa tiene humedad, puede generar moho durante el envío. Siempre verifica que esté completamente seca antes de meterla en la bolsa.</p>
      </div>

      <h4 class="text-base font-bold text-[#333333] mb-2 mt-6">GRUPO 2 — Productos duros o frágiles (vidrio, electrónicos, cerámica)</h4>
      <p class="mb-2">Son todo lo que puede romperse o rayarse si se golpea: botellas, frascos, tablets, celulares, vajillas, cerámicas, acuarios, espejos, etc.</p>
      <p class="font-semibold mb-1">Por qué se rompen en el camino:</p>
      <p class="mb-3">Cuando el producto va suelto dentro de la caja, cada vez que el camión pega un bache, el producto se mueve y choca contra las paredes. Ese choque directo es lo que lo rompe.</p>
      <p class="font-semibold mb-1">Cómo empacarlos:</p>
      <ol class="list-decimal pl-6 space-y-1 mb-3">
        <li>Envuelve cada producto POR SEPARADO con plástico de burbujas (mínimo 2 vueltas completas).</li>
        <li>Pon relleno en el fondo, los lados y la tapa (chips blancos o papel kraft arrugado).</li>
        <li>Agita la caja antes de cerrarla. Si algo se mueve o hace ruido: agrega más relleno.</li>
        <li>Para botellas o frascos en grupo: usa los separadores de cartón (colmena) para que no choquen entre sí.</li>
      </ol>
      <p class="mb-3">La colmena de cartón separa cada botella en su propio espacio. Imprescindible para vidrio en grupo.</p>
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl mb-4">
        <p class="font-bold text-yellow-800">POR QUÉ NO PUEDEN TOCARSE LAS BOTELLAS</p>
        <p class="text-yellow-700">Cuando dos botellas de vidrio se golpean entre sí, aunque sea un golpe suave, se crean microfracturas invisibles en el vidrio. A la siguiente sacudida del camión, la botella puede estallar completamente.</p>
        <p class="text-yellow-700 mt-2">La solución: una colmena de cartón que aísla cada botella en su propio compartimento separado.</p>
      </div>

      <h4 class="text-base font-bold text-[#333333] mb-2 mt-6">GRUPO 3 — Productos especiales</h4>
      <p class="font-semibold mb-1">Medicamentos y suplementos:</p>
      <ul class="list-disc pl-5 space-y-1 mb-3">
        <li>Antes de empacar, revisa que el sello de la tapa esté intacto (el anillo de plástico o el precinto de fábrica).</li>
        <li>Revisa la fecha de vencimiento. Si vence en menos de 30 días: NO lo despaches, avisa a tu supervisor.</li>
        <li>Que el prospecto o instructivo esté dentro de la caja del producto.</li>
        <li>Protege de la luz del sol: la caja debe cerrar completamente sin que entre luz.</li>
      </ul>
      <p class="font-semibold mb-1">Alimentos frescos (frutas, verduras):</p>
      <ul class="list-disc pl-5 space-y-1 mb-3">
        <li>Las cajas deben tener hoyitos para que circule el aire. Las frutas respiran y si no hay ventilación se pudren.</li>
        <li>Nunca pongas cosas pesadas encima de frutas blandas como fresas, uvas o berries.</li>
        <li>Los lácteos y embutidos necesitan frío (2 a 4 grados). Usa gel refrigerante si el envío dura más de 2 horas.</li>
      </ul>
      <p class="font-semibold mb-1">Químicos de limpieza (detergentes, desinfectantes):</p>
      <ul class="list-disc pl-5 space-y-1 mb-4">
        <li>Sella la tapa del frasco con cinta encima de la tapa original.</li>
        <li>Antes de poner en la caja, mételo dentro de una bolsa con cierre Ziploc por si gotea.</li>
        <li>NUNCA en la misma caja junto a alimentos o medicamentos.</li>
      </ul>

      <h4 class="text-base font-bold text-[#333333] mb-2">LISTA DE VERIFICACIÓN PARA MEDICAMENTOS Y SUPLEMENTOS — ANTES DE EMPACAR</h4>
      <ul class="space-y-2 mb-4">
        <li class="flex items-start gap-2"><span class="inline-block w-5 h-5 border-2 border-gray-400 rounded flex-shrink-0 mt-0.5"></span> <span>El sello de la tapa está INTACTO (no fue roto ni abierto antes).</span></li>
        <li class="flex items-start gap-2"><span class="inline-block w-5 h-5 border-2 border-gray-400 rounded flex-shrink-0 mt-0.5"></span> <span>La fecha de vencimiento tiene más de 30 días.</span></li>
        <li class="flex items-start gap-2"><span class="inline-block w-5 h-5 border-2 border-gray-400 rounded flex-shrink-0 mt-0.5"></span> <span>El prospecto o instructivo está dentro de la caja del producto.</span></li>
        <li class="flex items-start gap-2"><span class="inline-block w-5 h-5 border-2 border-gray-400 rounded flex-shrink-0 mt-0.5"></span> <span>El código de registro del laboratorio es visible en el empaque.</span></li>
        <li class="flex items-start gap-2"><span class="inline-block w-5 h-5 border-2 border-gray-400 rounded flex-shrink-0 mt-0.5"></span> <span>La caja de despacho cerrará completamente sin que entre luz solar.</span></li>
      </ul>
    `
  },
  {
    id: 'parte-3',
    title: 'Parte 3 — Revisa la caja antes de usarla',
    content: `
      <p class="mb-4">No todas las cajas están en condición de usarse. Una caja dañada o húmeda puede hacer que el producto llegue roto al cliente, aunque lo hayas empacado perfecto por dentro.</p>
      <h4 class="text-base font-bold text-[#333333] mb-2">Los 5 puntos que debes revisar antes de usar cualquier caja</h4>
      <p class="font-bold mb-1">1. Firmeza.</p>
      <p class="mb-3">Presiona las caras laterales con la mano. Si la caja cede o se dobla fácilmente: NO la uses, busca otra.</p>
      <p class="font-bold mb-1">2. Humedad.</p>
      <p class="mb-3">Toca y mira toda la caja. Si hay zonas oscuras, húmedas, con moho o con olor extraño: NO la uses.</p>
      <p class="font-bold mb-1">3. Golpes y cortes.</p>
      <p class="mb-3">Revisa que no tenga hoyos grandes, cortes profundos o esquinas abiertas que afecten la resistencia.</p>
      <p class="font-bold mb-1">4. Tapas (solapas).</p>
      <p class="mb-3">Abre y cierra las 4 solapas. Deben moverse bien. Si están rotas o muy dobladas de usos anteriores: NO la uses.</p>
      <p class="font-bold mb-1">5. Reutilización excesiva.</p>
      <p class="mb-3">Si la caja ya fue usada muchas veces y se nota muy desgastada: NO la uses.</p>
      <div class="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-xl mb-4">
        <p class="font-bold text-green-800">REGLA SIMPLE: SI TIENES DUDAS, NO LA USES</p>
        <p class="text-green-700">Siempre es mejor tomar una caja nueva. Una caja en mal estado puede romperse en el camino y el producto llega dañado o perdido. No hay ninguna urgencia que justifique usar una caja en mal estado.</p>
      </div>
      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead><tr class="bg-gray-100"><th class="p-2 border text-left font-bold">CORRECTO</th><th class="p-2 border text-left font-bold">INCORRECTO</th></tr></thead>
          <tbody>
            <tr class="border-b"><td class="p-2 border">Caja firme al presionarla con la mano.</td><td class="p-2 border">Caja que se dobla sola o al presionarla.</td></tr>
            <tr class="border-b"><td class="p-2 border">Sin manchas ni zonas húmedas en ninguna cara.</td><td class="p-2 border">Zonas oscuras, húmedas o con olor extraño.</td></tr>
            <tr class="border-b"><td class="p-2 border">Solapas que abren y cierran sin problemas.</td><td class="p-2 border">Solapas rotas o dobladas muchas veces.</td></tr>
            <tr class="border-b"><td class="p-2 border">Esquinas firmes sin separaciones ni capas peladas.</td><td class="p-2 border">Cartón separado o con capas despegadas en esquinas.</td></tr>
          </tbody>
        </table>
      </div>
      <h4 class="text-base font-bold text-[#333333] mb-2">POR QUÉ EL CARTÓN DOBLE AGUANTA MÁS</h4>
      <p class="mb-4">Cuando hay varias cajas apiladas en el camión, las de abajo aguantan el peso de todas las de arriba. Si el cartón es muy delgado, se aplasta con ese peso y el producto de adentro se daña. Las cajas ML, L y XL de Lyrium tienen cartón doble: aguantan más peso sin deformarse. Para vidrio, líquidos o electrónicos: usa siempre las cajas con cartón doble (ML, L o XL).</p>
    `
  },
  {
    id: 'parte-4',
    title: 'Parte 4 — ¿Cómo protejo lo que va adentro?',
    content: `
      <p class="mb-4">Esta es la parte más importante del empaque. Un producto puede salir perfecto de la zona de empaque, pero si no va bien protegido, los golpes y vibraciones del camino lo dañan.</p>
      <h4 class="text-base font-bold text-[#333333] mb-2">El plástico de burbujas — cómo usarlo correctamente</h4>
      <p class="mb-2">El error más común: poner el plástico de burbujas al revés. Las burbujas tienen que quedar en contacto directo con el producto para amortiguar los golpes.</p>
      <ol class="list-decimal pl-6 space-y-1 mb-3">
        <li><strong>Corta el plástico.</strong> Corta un pedazo suficiente para dar 2 vueltas completas alrededor del producto.</li>
        <li><strong>Orientación correcta.</strong> Pon el producto en el CENTRO del plástico con las burbujas mirando HACIA el producto.</li>
        <li><strong>Cubre los extremos.</strong> Dobla los laterales del plástico cubriendo los extremos del producto por arriba y por abajo.</li>
        <li><strong>Primera vuelta.</strong> Da la primera vuelta completa alrededor del producto cubriendo la cara principal.</li>
        <li><strong>Segunda vuelta.</strong> Da la segunda vuelta en sentido contrario o perpendicular a la primera.</li>
        <li><strong>Sella con cinta.</strong> Pega con cinta adhesiva transparente. No uses cinta de color directamente sobre el producto.</li>
        <li><strong>Verifica la cobertura.</strong> Revisa que no quede ninguna parte del producto sin cubrir por el plástico de burbujas.</li>
      </ol>
      <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl mb-4">
        <p class="font-bold text-red-800">ERROR CRÍTICO — BURBUJAS AL REVÉS</p>
        <p class="text-red-700">Si las burbujas miran hacia afuera y no hacia el producto, no protegen de nada. Es como poner un colchón al revés: el producto queda desprotegido ante cualquier golpe. Antes de comenzar a envolver, siempre verifica la orientación del plástico.</p>
      </div>
      <h4 class="text-base font-bold text-[#333333] mb-2">Materiales de relleno — cuándo usar cada uno</h4>
      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead><tr class="bg-gray-100"><th class="p-2 border text-left font-bold">Material</th><th class="p-2 border text-left font-bold">Para qué sirve</th><th class="p-2 border text-left font-bold">Cuándo NO usarlo</th></tr></thead>
          <tbody>
            <tr class="border-b"><td class="p-2 border">Plástico de burbujas</td><td class="p-2 border">Envolver productos duros o frágiles: vidrio, electrónicos, cerámica, cosméticos en frasco.</td><td class="p-2 border">No hace falta para ropa o telas blandas.</td></tr>
            <tr class="border-b"><td class="p-2 border">Chips blancos de relleno</td><td class="p-2 border">Rellenar los espacios vacíos dentro de la caja alrededor del producto ya envuelto.</td><td class="p-2 border">No es suficiente como protección única para productos muy frágiles.</td></tr>
            <tr class="border-b"><td class="p-2 border">Papel kraft arrugado</td><td class="p-2 border">Rellenar espacios en productos que no son tan frágiles. Más económico que los chips.</td><td class="p-2 border">No usarlo como protección única para vidrio, electrónicos o cerámica frágil.</td></tr>
            <tr class="border-b"><td class="p-2 border">Bolsitas de gel de sílice</td><td class="p-2 border">Evitar la humedad dentro de la caja. Para zapatos, cuero, ropa en envíos largos o marítimos.</td><td class="p-2 border">No reemplaza al plástico de burbujas ni a los chips de relleno.</td></tr>
          </tbody>
        </table>
      </div>
      <h4 class="text-base font-bold text-[#333333] mb-2">La prueba del movimiento — la más importante de todas</h4>
      <p class="mb-2">Antes de sellar: agita la caja en todas las direcciones. Si escuchas o sientes algo que se mueve adentro, agrega más relleno y repite.</p>
      <ol class="list-decimal pl-6 space-y-1 mb-4">
        <li>Cierra las tapas SIN pegar la cinta todavía.</li>
        <li>Toma la caja con las dos manos firmemente.</li>
        <li>Sacúdela de izquierda a derecha, de adelante a atrás y de arriba a abajo.</li>
        <li>ESCUCHA: no debe haber ningún golpe ni ruido de algo que se mueve adentro.</li>
        <li>SIENTE: no debe sentirse ningún movimiento a través de las paredes de la caja.</li>
        <li>Si escuchas o sientes algo: abre, agrega más relleno y repite la prueba.</li>
        <li>Solo cuando todo está completamente quieto: puedes proceder a sellar la caja.</li>
      </ol>
      <h4 class="text-base font-bold text-[#333333] mb-2">Protocolo para líquidos y químicos — 4 pasos de contención</h4>
      <p class="mb-2">Si el pedido incluye líquidos (jugos, aceites, champú, desinfectantes, medicamentos líquidos), sigue estos pasos adicionales antes de meterlo en la caja:</p>
      <ol class="list-decimal pl-6 space-y-1 mb-4">
        <li>Sella la tapa del frasco con cinta adhesiva encima de la tapa original del producto.</li>
        <li>Envuelve el frasco con 2 capas de plástico stretch o una bolsa gruesa de plástico.</li>
        <li>Mételo dentro de una bolsa con cierre tipo Ziploc. Cierra bien el cierre hermético.</li>
        <li>Pon papel absorbente o una almohadilla absorbente en el fondo de la caja.</li>
      </ol>
      <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl mb-4">
        <p class="font-bold text-red-800">QUÍMICOS DE LIMPIEZA — REGLA CRÍTICA</p>
        <p class="text-red-700">Los productos de limpieza (ácidos, cloro, desengrasantes) NUNCA van en la misma caja que alimentos o medicamentos. Si un frasco se rompe, el líquido puede contaminar todo lo demás y el envío entero se pierde. Además puede generar responsabilidad legal.</p>
      </div>
    `
  },
  {
    id: 'parte-5',
    title: 'Parte 5 — La foto antes de cerrar',
    content: `
      <p class="mb-4">Antes de cerrar CUALQUIER caja tienes que tomar una foto del interior. Esta foto es tu protección: si el cliente dice que algo llegó roto o que faltaba algo, la foto demuestra cómo salió el pedido de Lyrium.</p>
      <h4 class="text-base font-bold text-[#333333] mb-2">Reglas para tomar la foto</h4>
      <ul class="list-disc pl-5 space-y-1 mb-4">
        <li>Para el 100% de los pedidos. No importa si el pedido es pequeño o de bajo valor.</li>
        <li>Desde arriba (cenital): el celular directamente sobre la caja abierta, mirando hacia adentro.</li>
        <li>Con buena luz. Sin sombras que oculten el contenido.</li>
        <li>Nítida: si la foto sale movida o borrosa, toma otra inmediatamente.</li>
        <li>Sin filtros ni edición: la foto tal como la tomas, sin cambiarle nada.</li>
      </ul>
      <h4 class="text-base font-bold text-[#333333] mb-2">VERIFICACIÓN ANTES DE TOMAR LA FOTO</h4>
      <ul class="space-y-2 mb-4">
        <li class="flex items-start gap-2"><span class="inline-block w-5 h-5 border-2 border-gray-400 rounded flex-shrink-0 mt-0.5"></span> <span>El producto está bien empacado (con burbuja, bolsa o como corresponde a su tipo).</span></li>
        <li class="flex items-start gap-2"><span class="inline-block w-5 h-5 border-2 border-gray-400 rounded flex-shrink-0 mt-0.5"></span> <span>El relleno (chips o papel kraft) está visible alrededor del producto en todos los lados.</span></li>
        <li class="flex items-start gap-2"><span class="inline-block w-5 h-5 border-2 border-gray-400 rounded flex-shrink-0 mt-0.5"></span> <span>La boleta o factura de Lyrium está encima del contenido, visible en la foto.</span></li>
        <li class="flex items-start gap-2"><span class="inline-block w-5 h-5 border-2 border-gray-400 rounded flex-shrink-0 mt-0.5"></span> <span>Si había accesorios o productos extras, se ven todos presentes en la foto.</span></li>
        <li class="flex items-start gap-2"><span class="inline-block w-5 h-5 border-2 border-gray-400 rounded flex-shrink-0 mt-0.5"></span> <span>Si el producto requiere indicación de frágil u otra, se ve claramente.</span></li>
      </ul>
      <h4 class="text-base font-bold text-[#333333] mb-2">¿Dónde guardo la foto?</h4>
      <ul class="list-disc pl-5 space-y-1 mb-4">
        <li>Nombre del archivo: número del pedido (Ejemplo: LYR-2025-001234.jpg).</li>
        <li>Guárdala en la carpeta compartida del equipo, organizada por fecha de despacho.</li>
        <li>Debes poder encontrarla en menos de 5 minutos si hay un reclamo del cliente.</li>
        <li>Consérvala por al menos 90 días desde la fecha de despacho.</li>
      </ul>
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl mb-4">
        <p class="font-bold text-yellow-800">POR QUÉ ES TAN IMPORTANTE LA FOTO</p>
        <p class="text-yellow-700">Si un cliente dice que el producto llegó roto o que faltaba algo, la foto demuestra que cuando salió de Lyrium estaba perfecto y bien empacado. Sin foto, no hay forma de saber si el problema fue en el empaque de Lyrium o en el camino con el courier. La foto es la protección del equipo ante cualquier reclamo o disputa con el cliente.</p>
      </div>
    `
  },
  {
    id: 'parte-6',
    title: 'Parte 6 — Cómo cerrar bien la caja',
    content: `
      <p class="mb-4">El sellado de la caja le da seguridad al paquete durante todo el viaje. Un mal sellado puede hacer que la caja se abra sola en el camino y el producto llegue dañado o se pierda.</p>
      <h4 class="text-base font-bold text-[#333333] mb-2">El patrón de sellado en H — la única forma correcta</h4>
      <p class="mb-2">Cuando ves la caja desde arriba, la cinta debe quedar en forma de H: una tira larga en el centro de la tapa y dos tiras cortas en los bordes izquierdo y derecho. Este patrón sella todos los puntos débiles de la caja.</p>
      <pre class="bg-gray-100 p-4 rounded-xl mb-2 font-mono text-xs leading-relaxed">
          BORDE
    ┌──────────────┐
    │              │
    │   TIRA CENTRAL (de punta a punta de la caja)
    │              │
    └──────────────┘
          BORDE
      </pre>
      <p class="mb-4">Los dos BORDES laterales más la TIRA CENTRAL forman la letra H que sella la caja completamente.</p>
      <h4 class="text-base font-bold text-[#333333] mb-2">Qué tipo de cinta usar</h4>
      <ul class="list-disc pl-5 space-y-1 mb-4">
        <li>Ancho MÍNIMO 5 centímetros (2 pulgadas). Si la cinta es más angosta, no sirve para sellar bien.</li>
        <li>Cinta de embalaje de polipropileno: la transparente o marrón típica de despacho.</li>
        <li>Para cajas de más de 10 kg (ML, L, XL): usa cinta reforzada más gruesa.</li>
        <li>NUNCA uses: cinta masking de papel, cinta scotch angosta de papelería ni cinta eléctrica.</li>
      </ul>
      <h4 class="text-base font-bold text-[#333333] mb-2">Pasos para cerrar la caja correctamente</h4>
      <ol class="list-decimal pl-6 space-y-1 mb-4">
        <li><strong>Sella la base primero.</strong> Antes de cargar la caja, cierra el fondo con el mismo patrón H: tira central más dos bordes.</li>
        <li><strong>Carga y prueba.</strong> Mete el producto y el relleno. Haz la prueba del movimiento: agita y verifica que nada se mueva.</li>
        <li><strong>Cierra las tapas.</strong> Cierra las 4 solapas superiores bien alineadas entre sí.</li>
        <li><strong>Tira central.</strong> Pega la cinta a lo largo del centro de la tapa de punta a punta. Que sobrepase 5 cm en cada lateral.</li>
        <li><strong>Bordes laterales.</strong> Pega una tira de cinta sobre cada borde lateral cubriendo la unión entre la tapa y la pared.</li>
        <li><strong>Pasa el dedo.</strong> Pasa el dedo con presión sobre toda la cinta para que pegue bien, sin burbujas de aire.</li>
      </ol>
      <h4 class="text-base font-bold text-[#333333] mb-2">ERRORES MÁS COMUNES AL CERRAR</h4>
      <ul class="list-disc pl-5 space-y-1 mb-4">
        <li>Poner solo una tira en el centro sin los bordes laterales: la caja se abre por las esquinas.</li>
        <li>Cinta que no sobrepasa los laterales 5 cm: se despega bajo la presión del viaje.</li>
        <li>Pegar la cinta sobre cartón húmedo o sucio: no adhiere correctamente.</li>
        <li>Cerrar la caja sin haber hecho la prueba del movimiento primero.</li>
      </ul>
      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead><tr class="bg-gray-100"><th class="p-2 border text-left font-bold">CORRECTO</th><th class="p-2 border text-left font-bold">INCORRECTO</th></tr></thead>
          <tbody>
            <tr class="border-b"><td class="p-2 border">Patrón H completo: tira central más dos bordes laterales.</td><td class="p-2 border">Solo una tira en el centro (sin los bordes laterales).</td></tr>
            <tr class="border-b"><td class="p-2 border">Cinta de embalaje de mínimo 5 cm de ancho.</td><td class="p-2 border">Cinta masking o cinta scotch angosta de papelería.</td></tr>
            <tr class="border-b"><td class="p-2 border">La cinta pasa 5 cm sobre cada lateral de la caja.</td><td class="p-2 border">La cinta termina exactamente al borde de la caja.</td></tr>
            <tr class="border-b"><td class="p-2 border">Cartón limpio y seco antes de pegar la cinta.</td><td class="p-2 border">Pegar la cinta sobre cartón húmedo o con polvo.</td></tr>
          </tbody>
        </table>
      </div>
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl mb-4">
        <p class="font-bold text-yellow-800">EL PLÁSTICO STRETCH VA DESPUÉS DE LA CINTA, NO EN VEZ DE ELLA</p>
        <p class="text-yellow-700">El plástico transparente que se enrolla alrededor de la caja protege contra lluvia y sirve como evidencia de inviolabilidad. Primero sellas con la cinta en patrón H. Luego, si es necesario, enrollas el plástico stretch encima. Siempre verifica que la etiqueta del courier quede visible a través del plástico.</p>
      </div>
    `
  },
  {
    id: 'parte-7',
    title: 'Parte 7 — Los papeles del pedido',
    content: `
      <p class="mb-4">Todo pedido debe salir con sus papeles. Los papeles le dicen al cliente qué recibió, cuánto pagó y le dan la garantía de su compra.</p>
      <h4 class="text-base font-bold text-[#333333] mb-2">Dentro de la caja — la forma más común</h4>
      <p class="mb-2">La boleta o packing list de Lyrium va siempre ENCIMA del producto, protegida en una bolsa plástica transparente para que no se moje durante el envío.</p>
      <ol class="list-decimal pl-6 space-y-1 mb-4">
        <li>La boleta de venta o factura electrónica: el comprobante del pedido con nombre del cliente, productos y precio.</li>
        <li>El packing list (lista de contenidos): si hay varios productos, ayuda al cliente a verificar que recibió todo.</li>
        <li>Instrucciones de uso o garantía si el producto las incluye.</li>
      </ol>
      <h4 class="text-base font-bold text-[#333333] mb-2">CÓMO COLOCARLOS</h4>
      <p class="mb-4">Los papeles van ENCIMA de los productos (nunca debajo), dentro de una bolsa plástica transparente para que no se mojen. El cliente tiene que verlos al abrir la caja, no tener que buscarlos debajo de todo.</p>
      <h4 class="text-base font-bold text-[#333333] mb-2">En sobre exterior transparente — alternativa práctica</h4>
      <p class="mb-4">Puedes usar un sobre plástico transparente que se pega en la CARA SUPERIOR de la caja. Algunos couriers lo prefieren porque verifican el documento sin abrir el paquete.</p>
      <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl mb-4">
        <p class="font-bold text-red-800">NUNCA DESPACHES SIN PAPELES</p>
        <p class="text-red-700">Un pedido sin boleta o factura no puede tramitar cambio, devolución ni garantía con Lyrium ni con el proveedor. Los papeles mojados, rotos o ilegibles tampoco sirven. Usa siempre una bolsa plástica para protegerlos.</p>
      </div>
    `
  },
  {
    id: 'parte-8',
    title: 'Parte 8 — La etiqueta del courier',
    content: `
      <p class="mb-4">La etiqueta es la dirección del paquete. Si está mal pegada, con datos ilegibles o en el lugar equivocado, el paquete puede perderse o volver a Lyrium.</p>
      <h4 class="text-base font-bold text-[#333333] mb-2">Dónde va la etiqueta</h4>
      <ul class="list-disc pl-5 space-y-1 mb-4">
        <li>SIEMPRE en la CARA SUPERIOR de la caja (la tapa, la cara de arriba).</li>
        <li>Nunca sobre la cinta de sellado ni sobre los pliegues del cartón.</li>
        <li>Nunca en la cara lateral ni en la base de la caja.</li>
        <li>Completamente lisa, sin arrugas y con todos los datos legibles.</li>
      </ul>
      <h4 class="text-base font-bold text-[#333333] mb-2">Datos que debe tener la etiqueta</h4>
      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead><tr class="bg-gray-100"><th class="p-2 border text-left font-bold">Dato</th><th class="p-2 border text-left font-bold">Cómo completarlo</th></tr></thead>
          <tbody>
            <tr class="border-b"><td class="p-2 border">Nombre completo del destinatario</td><td class="p-2 border">Nombre y apellidos completos como en el DNI. Sin apodos ni abreviaturas.</td></tr>
            <tr class="border-b"><td class="p-2 border">DNI / CE / RUC</td><td class="p-2 border">El número de documento de identidad de quien recibe el paquete.</td></tr>
            <tr class="border-b"><td class="p-2 border">Dirección exacta</td><td class="p-2 border">Calle, número de puerta, piso, departamento y nombre de la urbanización.</td></tr>
            <tr class="border-b"><td class="p-2 border">Referencias de dirección</td><td class="p-2 border">Indicaciones para encontrar la casa: "cerca a...", "frente a...", color de la puerta.</td></tr>
            <tr class="border-b"><td class="p-2 border">Distrito completo</td><td class="p-2 border">Nombre completo del distrito de destino. Sin abreviaturas.</td></tr>
            <tr class="border-b"><td class="p-2 border">Provincia y Departamento</td><td class="p-2 border">Ambos completos y sin abreviaturas.</td></tr>
            <tr class="border-b"><td class="p-2 border">Teléfono de contacto</td><td class="p-2 border">Celular activo del destinatario. Si puede, agrega un segundo número alternativo.</td></tr>
            <tr class="border-b"><td class="p-2 border">Contenido del paquete</td><td class="p-2 border">Ejemplo: "Ropa", "Electrónico Tablet", "Cerámica Frágil", "Medicamento".</td></tr>
            <tr class="border-b"><td class="p-2 border">Peso del paquete en kg</td><td class="p-2 border">Peso total. Si da 2.3 kg, escribe 2.5 (siempre redondea al 0.5 kg superior).</td></tr>
          </tbody>
        </table>
      </div>
      <h4 class="text-base font-bold text-[#333333] mb-2">Detalles por courier</h4>
      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead><tr class="bg-gray-100"><th class="p-2 border text-left font-bold">Courier</th><th class="p-2 border text-left font-bold">Cómo generar la etiqueta</th><th class="p-2 border text-left font-bold">Zona donde es más fuerte</th><th class="p-2 border text-left font-bold">Nota importante</th></tr></thead>
          <tbody>
            <tr class="border-b"><td class="p-2 border font-bold">SHALOM</td><td class="p-2 border">Desde la plataforma web de Shalom o etiqueta manual aprobada.</td><td class="p-2 border">Sierra y Selva: Cajamarca, Piura, Loreto, Arequipa, Cusco.</td><td class="p-2 border">Consultar cobertura en zonas muy remotas antes de despachar.</td></tr>
            <tr class="border-b"><td class="p-2 border font-bold">OLVA</td><td class="p-2 border">Solo desde la app o web olvaexpress.pe. No acepta etiqueta manual.</td><td class="p-2 border">Lima Metropolitana y ciudades principales de la costa peruana.</td><td class="p-2 border">Tiene tracking en tiempo real. Ideal para envíos en Lima.</td></tr>
            <tr class="border-b"><td class="p-2 border font-bold">SHARF</td><td class="p-2 border">Etiqueta manual o impresa. Letra mínima tamaño 12 puntos.</td><td class="p-2 border">Verificar cobertura según el distrito de destino específico.</td><td class="p-2 border">Llamar al punto Sharf más cercano para zonas no estándar.</td></tr>
            <tr class="border-b"><td class="p-2 border font-bold">URBANO EXPRESS</td><td class="p-2 border">Solo desde la plataforma Urbano o vía API de Lyrium.</td><td class="p-2 border">Lima Metropolitana. Servicio Same Day disponible en Lima.</td><td class="p-2 border">Integrado con Lyrium vía API. Recomendado para envíos express Lima.</td></tr>
          </tbody>
        </table>
      </div>
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl mb-4">
        <p class="font-bold text-yellow-800">CONSEJO PRÁCTICO</p>
        <p class="text-yellow-700">Siempre que puedas, imprime la etiqueta desde el sistema del courier en vez de escribirla a mano. La letra impresa es mucho más legible y reduce los errores de entrega. Una etiqueta ilegible o con datos incompletos puede hacer que el paquete vuelva a Lyrium o que el courier cobre extra por corregirla.</p>
      </div>
    `
  },
  {
    id: 'parte-9',
    title: 'Parte 9 — Los símbolos en la caja',
    content: `
      <p class="mb-4">Hay símbolos internacionales que se pegan en la caja para decirle a quienes la manejan en el camino cómo deben tratarla. Son reconocidos en todo el mundo sin necesidad de palabras.</p>
      <h4 class="text-base font-bold text-[#333333] mb-2">Los 3 símbolos que debes conocer y usar siempre</h4>
      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead><tr class="bg-gray-100"><th class="p-2 border text-left font-bold">Símbolo (sticker o etiqueta adhesiva)</th><th class="p-2 border text-left font-bold">Qué significa</th><th class="p-2 border text-left font-bold">Cuándo usarlo</th><th class="p-2 border text-left font-bold">Dónde pegarlo</th></tr></thead>
          <tbody>
            <tr class="border-b"><td class="p-2 border">ESTE LADO ARRIBA — dos flechas hacia arriba</td><td class="p-2 border">La caja no debe voltearse en ningún momento del viaje.</td><td class="p-2 border">Líquidos, medicamentos, electrónicos, productos asimétricos.</td><td class="p-2 border">En los dos lados laterales de la caja.</td></tr>
            <tr class="border-b"><td class="p-2 border">FRÁGIL — dibujo de una copa rota</td><td class="p-2 border">El contenido se puede romper. Manejo muy cuidadoso.</td><td class="p-2 border">Vidrio, cerámica, electrónicos, cosméticos en frasco.</td><td class="p-2 border">En la tapa y en al menos un lateral.</td></tr>
            <tr class="border-b"><td class="p-2 border">MANTENER SECO — dibujo de paraguas</td><td class="p-2 border">El contenido no debe mojarse ni estar en ambiente húmedo.</td><td class="p-2 border">Electrónicos, ropa fina, calzado, medicamentos, alimentos secos.</td><td class="p-2 border">En la tapa y en la cara frontal.</td></tr>
          </tbody>
        </table>
      </div>
      <h4 class="text-base font-bold text-[#333333] mb-2">Otros símbolos útiles según el tipo de producto saludable</h4>
      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead><tr class="bg-gray-100"><th class="p-2 border text-left font-bold">Símbolo</th><th class="p-2 border text-left font-bold">Qué significa</th><th class="p-2 border text-left font-bold">Cuándo usarlo en productos Lyrium</th></tr></thead>
          <tbody>
            <tr class="border-b"><td class="p-2 border">NO APILAR — mano con palma abierta</td><td class="p-2 border">No poner nada encima de esta caja.</td><td class="p-2 border">Electrónicos grandes, acuarios de vidrio, equipos médicos frágiles.</td></tr>
            <tr class="border-b"><td class="p-2 border">LÍMITE DE PILAS — número en círculo</td><td class="p-2 border">Solo se puede apilar ese número de cajas encima.</td><td class="p-2 border">Frutas, lácteos y productos frágiles en pedidos de volumen.</td></tr>
            <tr class="border-b"><td class="p-2 border">NO EXPONER AL SOL — sol tachado</td><td class="p-2 border">Mantener fuera de la luz solar directa en todo momento.</td><td class="p-2 border">Medicamentos, aceites esenciales, vinos, suplementos vitamínicos.</td></tr>
            <tr class="border-b"><td class="p-2 border">MANTENER FRÍO — termómetro</td><td class="p-2 border">Necesita temperatura fría para conservarse en buen estado.</td><td class="p-2 border">Lácteos, embutidos, medicamentos refrigerados, frutas perecederas.</td></tr>
          </tbody>
        </table>
      </div>
      <h4 class="text-base font-bold text-[#333333] mb-2">¿Cómo usarlos en el día a día?</h4>
      <ul class="list-disc pl-5 space-y-1 mb-4">
        <li>Ten siempre stickers de los 3 principales (FRÁGIL, MANTENER SECO y ESTE LADO ARRIBA) listos en la zona de empaque.</li>
        <li>Pégalos ANTES de poner la etiqueta del courier para que sean visibles en todo el recorrido.</li>
        <li>Pega el mismo símbolo en DOS caras de la caja para que se vea desde cualquier ángulo.</li>
        <li>Tamaño mínimo del sticker: 10 cm x 10 cm para que sea visible desde lejos.</li>
      </ul>
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl mb-4">
        <p class="font-bold text-yellow-800">CONSEJO ECONÓMICO</p>
        <p class="text-yellow-700">Los stickers de símbolos se consiguen económicos en proveedores de materiales de embalaje. También puedes imprimirlos en papel adhesivo A4 para mayor ahorro en operaciones de alto volumen.</p>
      </div>
    `
  },
  {
    id: 'tabla-rapida',
    title: 'Tabla de Referencia Rápida',
    content: `
      <p class="mb-4">Usa esta tabla para consultar rápido cuando tienes un pedido en mano. Para más detalles de cada proceso, ve a la parte correspondiente del manual.</p>
      <h4 class="text-base font-bold text-[#333333] mb-2">Alimentos frescos, orgánicos y bebidas</h4>
      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead><tr class="bg-gray-100"><th class="p-2 border text-left font-bold">Producto</th><th class="p-2 border text-left font-bold">Caja</th><th class="p-2 border text-left font-bold">Cómo protegerlo</th><th class="p-2 border text-left font-bold">Símbolo en la caja</th></tr></thead>
          <tbody>
            <tr class="border-b"><td class="p-2 border">Fresas, uvas, berries (Lyrium Fresh)</td><td class="p-2 border">S o M ventilada</td><td class="p-2 border">Bandeja o clamshell individual por fruta. NO aplastes.</td><td class="p-2 border">FRÁGIL + No apilar.</td></tr>
            <tr class="border-b"><td class="p-2 border">Paltas, mangos, manzanas</td><td class="p-2 border">M ventilada</td><td class="p-2 border">Bandeja alveolada una por fruta.</td><td class="p-2 border">Límite apilamiento.</td></tr>
            <tr class="border-b"><td class="p-2 border">Sandías, melones, piñas</td><td class="p-2 border">L o XL</td><td class="p-2 border">Caja rígida. Nada encima.</td><td class="p-2 border">No apilar.</td></tr>
            <tr class="border-b"><td class="p-2 border">Verduras de hoja (lechugas, espinacas)</td><td class="p-2 border">M ventilada</td><td class="p-2 border">Bolsa perforada. Caja con hoyitos de ventilación.</td><td class="p-2 border">Mantener seco + Arriba.</td></tr>
            <tr class="border-b"><td class="p-2 border">Jugos cold press, kombuchas (en vidrio)</td><td class="p-2 border">ML o L con colmena</td><td class="p-2 border">Colmena de cartón, una botella por celda.</td><td class="p-2 border">FRÁGIL + Arriba.</td></tr>
            <tr class="border-b"><td class="p-2 border">Aceites y conservas en frasco</td><td class="p-2 border">M o ML con colmena</td><td class="p-2 border">Colmena de cartón. Tapa sellada con cinta.</td><td class="p-2 border">FRÁGIL + Arriba.</td></tr>
            <tr class="border-b"><td class="p-2 border">Huevos de campo (maple)</td><td class="p-2 border">M o ML</td><td class="p-2 border">Maple de celulosa. NADA encima del paquete.</td><td class="p-2 border">FRÁGIL + Arriba + No apilar.</td></tr>
            <tr class="border-b"><td class="p-2 border">Chocolates orgánicos, confites</td><td class="p-2 border">XS o S</td><td class="p-2 border">Caja bien cerrada. Evitar calor durante el viaje.</td><td class="p-2 border">Proteger del calor.</td></tr>
            <tr class="border-b"><td class="p-2 border">Embutidos y chorizos artesanales</td><td class="p-2 border">M o ML</td><td class="p-2 border">Empaque al vacío. Cadena de frío 2 a 4 grados.</td><td class="p-2 border">Mantener frío + Arriba.</td></tr>
          </tbody>
        </table>
      </div>
      <h4 class="text-base font-bold text-[#333333] mb-2">Salud, suplementos y bienestar</h4>
      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead><tr class="bg-gray-100"><th class="p-2 border text-left font-bold">Producto</th><th class="p-2 border text-left font-bold">Caja</th><th class="p-2 border text-left font-bold">Cuidado especial</th><th class="p-2 border text-left font-bold">Símbolo en la caja</th></tr></thead>
          <tbody>
            <tr class="border-b"><td class="p-2 border">Vitaminas y suplementos en cápsula</td><td class="p-2 border">XS o S</td><td class="p-2 border">Verificar 5 puntos del checklist. Proteger del sol.</td><td class="p-2 border">No exponer al sol + Mantener seco.</td></tr>
            <tr class="border-b"><td class="p-2 border">Suplementos que necesitan frío</td><td class="p-2 border">M o ML con gel pack</td><td class="p-2 border">Caja térmica con gel pre-congelado. Indicador temperatura.</td><td class="p-2 border">Mantener frío + No exponer al sol.</td></tr>
            <tr class="border-b"><td class="p-2 border">Superfoods en polvo (moringa, spirulina)</td><td class="p-2 border">XS o S</td><td class="p-2 border">Frasco bien sellado. Hermético. Proteger de luz y calor.</td><td class="p-2 border">No exponer al sol + Mantener seco.</td></tr>
            <tr class="border-b"><td class="p-2 border">Aceites esenciales en vidrio ámbar</td><td class="p-2 border">S o M con colmena</td><td class="p-2 border">Colmena de cartón. Tapa sellada. Caja oscura.</td><td class="p-2 border">FRÁGIL + No exponer al sol + Arriba.</td></tr>
            <tr class="border-b"><td class="p-2 border">Equipos médicos y de bienestar</td><td class="p-2 border">M o L según tamaño</td><td class="p-2 border">Burbuja a medida. Caja de cartón doble.</td><td class="p-2 border">FRÁGIL + No apilar + Arriba.</td></tr>
          </tbody>
        </table>
      </div>
      <h4 class="text-base font-bold text-[#333333] mb-2">Moda saludable, calzado y accesorios</h4>
      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead><tr class="bg-gray-100"><th class="p-2 border text-left font-bold">Producto</th><th class="p-2 border text-left font-bold">Caja</th><th class="p-2 border text-left font-bold">Cómo empacar</th><th class="p-2 border text-left font-bold">Nota adicional</th></tr></thead>
          <tbody>
            <tr class="border-b"><td class="p-2 border">Ropa casual, deportiva y orgánica</td><td class="p-2 border">XS a M según cantidad</td><td class="p-2 border">Enrollar. Bolsa plástica individual por prenda.</td><td class="p-2 border">Bolsitas de silica si el envío es largo o en temporada de lluvia.</td></tr>
            <tr class="border-b"><td class="p-2 border">Ropa delicada (seda, bordados naturales)</td><td class="p-2 border">S o M</td><td class="p-2 border">Doblar con cuidado. Papel de seda entre capas.</td><td class="p-2 border">FRÁGIL si tiene bordados en relieve.</td></tr>
            <tr class="border-b"><td class="p-2 border">Ropa de bebé (0 a 4 años)</td><td class="p-2 border">XS o S</td><td class="p-2 border">Bolsa con hoyitos OBLIGATORIO. Son las bolsas anti-asfixia.</td><td class="p-2 border">Verificar que la bolsa tenga hoyitos antes de cerrarla.</td></tr>
            <tr class="border-b"><td class="p-2 border">Calzado adulto y niño</td><td class="p-2 border">M o ML</td><td class="p-2 border">Caja del zapato adentro. Tissue paper. Bolsitas de silica.</td><td class="p-2 border">Mantener seco.</td></tr>
            <tr class="border-b"><td class="p-2 border">Bolsos y mochilas</td><td class="p-2 border">S a ML</td><td class="p-2 border">Bolsa plástica grande. Relleno si la estructura es rígida.</td><td class="p-2 border">FRÁGIL si la estructura es rígida.</td></tr>
          </tbody>
        </table>
      </div>
      <h4 class="text-base font-bold text-[#333333] mb-2">Cosmética natural, mascotas y químicos</h4>
      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead><tr class="bg-gray-100"><th class="p-2 border text-left font-bold">Producto</th><th class="p-2 border text-left font-bold">Caja</th><th class="p-2 border text-left font-bold">Cómo empacar</th><th class="p-2 border text-left font-bold">Nota</th></tr></thead>
          <tbody>
            <tr class="border-b"><td class="p-2 border">Perfumes y fragancias orgánicas (vidrio)</td><td class="p-2 border">S o M con colmena</td><td class="p-2 border">Colmena de cartón más burbuja alrededor de cada frasco.</td><td class="p-2 border">FRÁGIL + Arriba.</td></tr>
            <tr class="border-b"><td class="p-2 border">Cosméticos naturales en tarro o compacto</td><td class="p-2 border">XS o S</td><td class="p-2 border">Burbuja cortada a medida. Muy frágil a las vibraciones.</td><td class="p-2 border">FRÁGIL.</td></tr>
            <tr class="border-b"><td class="p-2 border">Cremas y aceites cosméticos naturales</td><td class="p-2 border">XS o S</td><td class="p-2 border">Verificar que la tapa cierre bien. Ziploc si son varios.</td><td class="p-2 border">Arriba si es líquida.</td></tr>
            <tr class="border-b"><td class="p-2 border">Champú y acondicionador natural</td><td class="p-2 border">S o M</td><td class="p-2 border">Bloquear el dosificador. Bolsa Ziploc por si gotea.</td><td class="p-2 border">Arriba.</td></tr>
            <tr class="border-b"><td class="p-2 border">Alimento seco para mascotas (saco)</td><td class="p-2 border">L o XL</td><td class="p-2 border">Saco bien sellado. Film stretch exterior en palet.</td><td class="p-2 border">Límite de apilamiento.</td></tr>
            <tr class="border-b"><td class="p-2 border">Acuario de vidrio (cualquier tamaño)</td><td class="p-2 border">XL o caja especial</td><td class="p-2 border">Burbuja en TODAS las caras. Siempre en posición VERTICAL.</td><td class="p-2 border">FRÁGIL + No apilar + Arriba.</td></tr>
            <tr class="border-b"><td class="p-2 border">Productos de limpieza ecológicos</td><td class="p-2 border">M o ML</td><td class="p-2 border">Tapa sellada más Ziploc más absorbente en el fondo.</td><td class="p-2 border">Arriba. NUNCA con alimentos.</td></tr>
          </tbody>
        </table>
      </div>
    `
  }
];
