export interface TermSection {
  id: string;
  title: string;
  content: string; // HTML allowed or plain text
}

export interface TermsConfig {
  subtitle: string;
  pdfLabel: string;
  pdfHref: string;
  pdfName: string;
}

export const termsData: { [key: string]: TermSection[] } = {
  cliente: [
    {
      id: 'primero-privacidad',
      title: 'Primero: Privacidad',
      content: `
        <p class="mb-4">El uso del Marketplace lyriumbiomarketplace.com estará sujeto a la aceptación de los Términos y Condiciones detallados a continuación:</p>
        <div class="font-bold text-[#333333] mb-2">1.1 La información que recolectamos a través de nuestro sitio web</div>
        <p class="mb-4">Para gestionar las transacciones que el Usuario realice dentro de Lyrium Biomarketplace, la plataforma recopila datos de identificación y contacto como nombres completos, tipo y número de documento, RUC cuando aplique, domicilio, distrito, provincia y medios de comunicación registrados con el único propósito de ejecutar adecuadamente cada operación de compra o venta.</p>
        <p class="mb-4">De forma complementaria, durante la navegación por el sitio web o las redes sociales asociadas, la plataforma obtiene datos de manera automática, entre ellos cookies, dirección IP, preferencias de búsqueda y registros de conexión, exclusivamente para optimizar la experiencia del Usuario y mejorar el funcionamiento continuo de los productos y servicios disponibles.</p>
        <p class="mb-4">Toda la información recabada queda incorporada a una base de datos bajo titularidad de Lyrium Biomarketplace, gestionada en plena conformidad con la normativa vigente en materia de protección de datos personales.</p>
        <div class="font-bold text-[#333333] mb-2">1.2 Guardamos su información de manera segura</div>
        <p class="mb-4">La seguridad de la información personal de sus usuarios constituye una prioridad para Lyrium Biomarketplace. Con ese fin, la plataforma aplica medidas técnicas y organizativas razonables orientadas a impedir accesos no autorizados, usos indebidos o divulgaciones que comprometan la confidencialidad de los datos.</p>
        <p class="mb-4">El acceso a dicha información queda restringido al personal expresamente habilitado por Lyrium Biomarketplace, y únicamente dentro del alcance definido por la Política de Privacidad y los presentes Términos y Condiciones.</p>
        <div class="font-bold text-[#333333] mb-2">1.3 Finalidades del tratamiento de sus datos personales</div>
        <p class="mb-4">Los datos que el Usuario facilite voluntariamente a través de Lyrium Biomarketplace habilitan a la plataforma para llevar a cabo las siguientes actividades:</p>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li>Gestionar el registro del Usuario y la creación de su cuenta dentro de la plataforma.</li>
          <li>Verificar la identidad del Usuario y validar la información proporcionada durante el proceso de registro.</li>
          <li>Atender consultas, solicitudes de información, quejas, reclamos y cualquier otra comunicación realizada por el Usuario, brindando el seguimiento correspondiente hasta su atención.</li>
          <li>Gestionar la relación comercial entre el Usuario y Lyrium Biomarketplace.</li>
          <li>Procesar, administrar y gestionar las compras, ventas y demás transacciones realizadas a través de la plataforma.</li>
          <li>Coordinar la preparación, despacho, entrega y seguimiento de los pedidos efectuados mediante el Biomarketplace.</li>
          <li>Administrar la base de datos de usuarios, clientes, vendedores y demás participantes del ecosistema Lyrium para fines operativos y administrativos.</li>
          <li>Enviar comunicaciones relacionadas con el funcionamiento de la plataforma, tales como notificaciones, alertas, actualizaciones de seguridad, cambios en los servicios y aspectos necesarios para la correcta prestación del servicio.</li>
          <li>Enviar comunicaciones comerciales, publicitarias o promocionales sobre productos, servicios, campañas, beneficios, descuentos y novedades del ecosistema Lyrium, siempre que el Usuario haya otorgado el consentimiento correspondiente cuando este sea exigible por la normativa aplicable.</li>
          <li>Invitar al Usuario a participar en concursos, sorteos, promociones, actividades o eventos organizados por Lyrium Biomarketplace.</li>
          <li>Realizar encuestas de satisfacción, estudios de opinión y evaluaciones de la calidad del servicio con la finalidad de mejorar la experiencia del Usuario.</li>
          <li>Elaborar estudios de mercado, análisis estadísticos, reportes e indicadores comerciales utilizando información agregada o, cuando corresponda, datos tratados conforme a la normativa vigente.</li>
          <li>Mejorar el funcionamiento, seguridad, rendimiento y experiencia de uso de la plataforma mediante el análisis de la interacción de los Usuarios con los servicios ofrecidos.</li>
          <li>Cumplir con obligaciones legales, regulatorias, administrativas y tributarias que resulten aplicables a Lyrium Biomarketplace.</li>
          <li>Detectar, prevenir e investigar posibles actividades fraudulentas, accesos no autorizados, incumplimientos de los Términos y Condiciones o cualquier conducta que pueda afectar la seguridad de la plataforma o de sus Usuarios.</li>
        </ul>
        <div class="font-bold text-[#333333] mb-2">1.4 Acceso y Transferencia</div>
        <p class="mb-4">Lyrium Biomarketplace comparte datos personales con terceros únicamente en los supuestos estrictamente necesarios que se describen a continuación:</p>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li>En el marco operativo de la plataforma, ciertos colaboradores como socios estratégicos, proveedores de infraestructura digital, gestores de redes sociales, centros de atención al cliente, servicios de mensajería y empresas de logística, pueden acceder a los datos del Usuario cuando ello resulte indispensable para cumplir con las finalidades previamente autorizadas. Algunos de estos colaboradores pueden estar ubicados fuera del territorio nacional.</li>
          <li>Cuando una disposición legal o un requerimiento expreso de autoridad competente así lo exija, Lyrium Biomarketplace entrega la información personal correspondiente a los organismos públicos o entidades judiciales y administrativas que la soliciten, conforme al ordenamiento jurídico aplicable.</li>
        </ul>
      `
    },
    {
      id: 'segundo-modificacion',
      title: 'Segundo: Modificación de los Términos y Condiciones',
      content: `
        <p class="mb-4">Lyrium Biomarketplace mantiene la potestad de actualizar, ampliar o modificar los presentes Términos y Condiciones en el momento que lo estime conveniente. Toda actualización realizada será publicada dentro de la plataforma en un apartado de acceso permanente, donde los usuarios podrán consultarla, leerla y descargarla en cualquier momento.</p>
      `
    },
    {
      id: 'tercero-creacion-cuenta',
      title: 'Tercero: Creación de Cuenta',
      content: `
        <p class="mb-4">Explorar los productos y servicios disponibles en lyriumbiomarketplace.com es completamente libre y no requiere registro previo. No obstante, para concretar la compra de cualquier Producto y/o Servicio, el Cliente deberá contar con una cuenta de usuario activa dentro de la plataforma. Adicionalmente, los usuarios que completen su registro podrán acceder a beneficios exclusivos definidos por Lyrium.</p>
        <p class="mb-4">El proceso de registro se realiza a través del formulario habilitado en el sitio web. Al completarlo, el usuario asume los siguientes compromisos:</p>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li>Proporcionar información veraz, completa y actualizada sobre su persona o empresa.</li>
          <li>Mantener dicha información al día ante cualquier cambio que se produzca.</li>
        </ul>
        <p class="mb-4">La veracidad, exactitud e integridad de los datos ingresados es responsabilidad exclusiva del Cliente. La información consignada se presumirá verdadera e inequívoca, por lo que lyriumbiomarketplace.com queda eximido de toda responsabilidad ante consecuencias derivadas de datos falsos, incompletos o erróneos. De verificarse la falsedad de la información registrada, el Marketplace se reserva el derecho de suspender o desactivar la cuenta sin previo aviso.</p>
        <p class="mb-4">Quienes ya cuenten con una cuenta activa no necesitarán ingresar nuevamente sus datos personales en cada compra posterior. Esta información se almacenará de forma segura y será tratada conforme a lo estipulado en las Políticas de Privacidad de la plataforma.</p>
        <p class="mb-4">Una vez creada la cuenta, el Cliente podrá acceder a ella mediante el correo electrónico y la contraseña registrados. Dicho acceso tiene carácter estrictamente personal, confidencial e intransferible. El Cliente podrá actualizar su contraseña en cualquier momento siguiendo el procedimiento dispuesto en el sitio web.</p>
        <p class="mb-4">La custodia de las credenciales de acceso —correo electrónico y contraseña— es responsabilidad exclusiva del Cliente, dado que a través de ellas se gestionan pedidos, consultas y demás operaciones vinculadas a su cuenta. La divulgación o cesión de la contraseña a terceros, bajo cualquier circunstancia, libera a lyriumbiomarketplace.com de toda responsabilidad por el uso indebido que estos pudieran hacer de la cuenta. Por tanto, el Cliente acepta responder económicamente por cualquier operación realizada a través de su cuenta, incluyendo aquellas efectuadas por terceros con su autorización, así como por menores de edad que residan en su domicilio y pudieran hacer uso de sus credenciales de acceso.</p>
      `
    },
    {
      id: 'cuarto-precios-promociones',
      title: 'Cuarto: Precios, Descuentos, Ofertas, Promociones, Artículos Nuevos y de Edición Limitada',
      content: `
        <p class="mb-4">Los precios publicados en lyriumbiomarketplace.com tienen validez exclusiva dentro de este sitio web y, cuando corresponda, en sus redes sociales oficiales. Dichos precios no son necesariamente extensibles a otros canales de venta que los Sellers pudieran utilizar de forma independiente, tales como establecimientos físicos, ventas telefónicas, otros portales de comercio electrónico, catálogos u otros medios de distribución propios.</p>
        <p class="mb-4">Todos los precios se expresan en soles peruanos (S/), salvo que se indique expresamente lo contrario, en cuyo caso se aplicará el tipo de cambio oficial publicado por la SUNAT. Los valores consignados corresponden únicamente al precio del bien o servicio ofertado y no comprenden costos adicionales como transporte, manipulación, envío, accesorios u otros cargos complementarios, a menos que se especifique lo contrario en la publicación correspondiente.</p>
        <p class="mb-4">En cuanto a las modalidades de precio especial disponibles en la plataforma, cada una opera bajo las siguientes condiciones:</p>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li><strong>Descuentos:</strong> cuentan con una fecha de inicio y una fecha de término definidas por cada Seller. La fecha de término puede ser indefinida, manteniéndose vigente hasta el agotamiento del stock disponible.</li>
          <li><strong>Ofertas:</strong> tienen una fecha de inicio y una fecha de término obligatoria, la cual no podrá extenderse más allá de 3 (tres) meses, salvo que el stock se agote con anterioridad.</li>
          <li><strong>Promociones:</strong> disponibles únicamente para productos, con fecha de inicio y fecha de término establecidas libremente por cada Seller para cada uno de sus artículos.</li>
          <li><strong>Publicaciones nuevas y de edición limitada:</strong> cuentan igualmente con una fecha de inicio y una fecha de término definidas por el Seller al momento de su configuración.</li>
        </ul>
        <p class="mb-4">Los Sellers están facultados para actualizar en cualquier momento la información publicada en su tienda dentro de lyriumbiomarketplace.com, incluyendo descripciones, precios, stock y condiciones de venta, los cuales están sujetos a la revisión y aceptación previa por parte de la administración de Lyrium Biomarketplace.</p>
        <p class="mb-4">Por su parte, Lyrium podrá desarrollar campañas globales de marketing y publicidad orientadas a posicionar la plataforma en el mercado, las cuales podrán coordinarse con los Sellers con el propósito de diseñar acciones comerciales más efectivas que contribuyan también a la difusión de sus productos, marcas y tiendas dentro del ecosistema Lyrium Biomarketplace.</p>
        <div class="font-bold text-[#333333] mb-2">Programa de fidelización "Lyrios"</div>
        <p class="mb-4">Adicionalmente, lyriumbiomarketplace.com pone a disposición de sus Usuarios el programa de fidelización "Lyrios", a través del cual podrán acumular puntos por sus compras y utilizarlos como descuento en adquisiciones futuras dentro de la plataforma, bajo las siguientes condiciones:</p>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li>Por cada compra realizada, el Usuario acumulará Lyrios equivalentes al 1% del valor de venta del Producto y/o Servicio adquirido, considerando de forma independiente cada ítem distinto dentro de un mismo pedido. La equivalencia será de 1 Lyrio = S/ 0.01.</li>
          <li>Los Lyrios acumulados podrán consultarse en todo momento desde el panel del Cliente, junto con su equivalencia monetaria disponible.</li>
          <li>Los Lyrios podrán utilizarse como descuento en cualquier tienda de Lyrium Biomarketplace, siempre que el Cliente cuente con un saldo mínimo equivalente a S/ 2.00, y hasta un máximo del 3% del precio del Producto y/o Servicio sobre el cual se aplique el descuento.</li>
        </ul>
        <p class="mb-4">El uso de los Lyrios se sujeta a las condiciones vigentes que Lyrium establezca y comunique a través de la plataforma, pudiendo estas ser actualizadas conforme a lo señalado en la Cláusula Segunda de los presentes Términos y Condiciones.</p>
      `
    },
    {
      id: 'quinto-metodo-pago',
      title: 'Quinto: Métodos de Pago',
      content: `
        <p class="mb-4">Las transacciones realizadas en lyriumbiomarketplace.com se efectúan exclusivamente a través de pago en línea, no encontrándose habilitados otros medios de pago al momento de concretar una compra.</p>
        <p class="mb-4">El procesamiento de los pagos efectuados a través de Lyrium Biomarketplace se realiza mediante una pasarela de pagos autorizada, la cual es responsable de la validación, autorización y seguridad de cada transacción. Los medios de pago aceptados comprenden tarjetas de débito y crédito de las marcas Visa, MasterCard, American Express y Diners Club.</p>
        <p class="mb-4">El uso de estos medios de pago se encuentra sujeto, en primer lugar, a los presentes Términos y Condiciones, que regulan la relación contractual entre el Usuario o Cliente y Lyrium Biomarketplace respecto de las compras realizadas a través de la plataforma. Asimismo, el uso de tarjetas de crédito o débito se encuentra sujeto a las condiciones establecidas por la entidad financiera emisora de la tarjeta, incluyendo el correspondiente Contrato de Apertura, Contrato de Emisión, Reglamento de Uso o cualquier otro instrumento contractual aplicable suscrito entre el Usuario y dicha entidad financiera.</p>
        <p class="mb-4">En consecuencia, cualquier aspecto relacionado con la emisión, vigencia, disponibilidad de fondos, límites de crédito, autorizaciones, bloqueos, rechazos de operaciones, intereses, comisiones u otras condiciones propias del medio de pago será regulado exclusivamente por el contrato celebrado entre el Usuario y la entidad financiera emisora de la tarjeta. En caso de existir discrepancia entre las condiciones aplicables al medio de pago y los presentes Términos y Condiciones, prevalecerán las disposiciones del contrato suscrito entre el Usuario y la entidad financiera emisora en lo que respecta al uso de la tarjeta y a la operación financiera correspondiente.</p>
        <p class="mb-4">Todo lo relacionado con las características propias de las tarjetas bancarias aceptadas en la plataforma —fecha de emisión, fecha de vencimiento, límite disponible, bloqueos, clave secreta y demás condiciones asociadas— se regula exclusivamente por el contrato suscrito entre el titular y su entidad emisora, sin que lyriumbiomarketplace.com asuma responsabilidad alguna sobre dichos aspectos. La plataforma podrá, adicionalmente, establecer condiciones particulares de compra según el medio de pago seleccionado por el usuario.</p>
        <p class="mb-4">Al aceptar los presentes Términos y Condiciones, el Cliente autoriza expresamente que el monto total de la orden de compra sea cargado a la tarjeta utilizada. Los precios confirmados al momento de cerrar una orden se mantendrán vigentes para esa transacción, con independencia de cualquier variación de precios que pudiera producirse en lyriumbiomarketplace.com con posterioridad a dicho cierre.</p>
        <p class="mb-4">Con el propósito de garantizar la seguridad de cada operación y prevenir el uso fraudulento de medios de pago, lyriumbiomarketplace.com y/o la pasarela de pagos contratada podrán contactar al Cliente para verificar la legitimidad de una transacción. De no lograrse dicha confirmación o de no ser posible ubicar al Cliente, la operación podrá quedar sin efecto en resguardo de su propia seguridad, notificándose dicha situación a la entidad emisora de la tarjeta involucrada. Esta medida de verificación podrá activarse en cualquier etapa del proceso de compra, aun cuando el Cliente ya hubiera recibido la confirmación de la orden o la aprobación del pago.</p>
      `
    },
    {
      id: 'sexto-consentimiento',
      title: 'Sexto: Formación del Consentimiento en los Contratos Celebrados a través de este Sitio',
      content: `
        <p class="mb-4">La contratación de bienes y servicios ofrecidos por los Sellers en lyriumbiomarketplace.com podrá realizarse por medios electrónicos mediante los mecanismos que el propio sitio web disponga para tales efectos. Sin embargo, la existencia de una manifestación de voluntad por parte del Usuario no producirá, por sí sola, la conclusión del contrato, ya que su eficacia dependerá de que la transacción sea revisada y aprobada por lyriumbiomarketplace.com. En tanto no se emita dicha conformidad, no se entenderá perfeccionado el consentimiento respecto de la operación correspondiente.</p>
        <p class="mb-4">Para que una transacción sea considerada válida, lyriumbiomarketplace.com verificará el cumplimiento de los siguientes requisitos:</p>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li>Que el medio de pago ofrecido por el Usuario sea aceptado y validado por la plataforma.</li>
          <li>Que los datos registrados por el Cliente en el sitio sean consistentes con los proporcionados al momento de aceptar la oferta.</li>
          <li>Que el pago haya sido debidamente acreditado por el Usuario.</li>
          <li>Que la dirección de entrega se encuentre dentro de la República del Perú.</li>
        </ul>
        <p class="mb-4">Una vez cumplidos estos requisitos, lyriumbiomarketplace.com remitirá al Usuario una confirmación de compra al correo electrónico registrado en la plataforma, o a través de cualquier otro medio de comunicación que garantice su conocimiento oportuno, pudiendo considerarse también como confirmación el envío efectivo del producto. El consentimiento se tendrá por formado desde el momento en que dicha confirmación escrita sea enviada al Usuario y en el lugar desde el cual fue expedida.</p>
        <p class="mb-4">La oferta realizada por el Usuario tiene carácter irrevocable, salvo en circunstancias excepcionales que justifiquen su revisión, tales como una modificación sustancial en la descripción del artículo efectuada por el Seller con posterioridad a la aceptación, o la existencia de un error tipográfico manifiesto que altere de forma evidente las condiciones de la oferta original.</p>
      `
    },
    {
      id: 'septimo-envios',
      title: 'Séptimo: Envíos',
      content: `
        <p class="mb-4">Los Productos y/o Servicios publicados en lyriumbiomarketplace.com podrán ser comercializados y entregados en cualquier departamento del territorio nacional de la República del Perú. No obstante, las condiciones aplicables al perfeccionamiento del pedido, como el despacho, la entrega, la cobertura geográfica, los plazos y demás aspectos relacionados con el cumplimiento de cada operación, serán determinadas exclusivamente por el Seller correspondiente, conforme a sus propias políticas de envío, entrega o despacho del pedido. En consecuencia, será responsabilidad del Cliente verificar, al momento de realizar la compra, la disponibilidad del servicio de entrega para el destino seleccionado, mediante la elección del departamento y la provincia correspondientes.</p>
        <p class="mb-4">Para la recepción de Productos, el Cliente podrá elegir libremente entre los siguientes tipos de envío. Cada tipo tiene sus respectivos estados:</p>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li><strong>Entrega a Domicilio:</strong> Validado por el Seller → En Preparación → Despachado → En camino → Listo en Domicilio → Confirmado por el Cliente.</li>
          <li><strong>Recojo en Agencia:</strong> Validado por el Seller → En Preparación → Despachado → En camino → Listo para Recojo en Agencia → Confirmado por el Cliente.</li>
          <li><strong>Recojo en Tienda:</strong> Validado por el Seller → En Preparación → Despachado → Listo para Recojo en Tienda → Confirmado por el Cliente.</li>
        </ul>
        <p class="mb-4">Para la prestación de Servicios, la modalidad de atención disponible es la Atención en Centro de Salud, mediante la cual el Cliente acude al establecimiento señalado por el Seller para recibir el Servicio contratado.</p>
        <p class="mb-4">Una vez seleccionada la modalidad correspondiente, el Cliente podrá realizar el seguimiento del estado de su pedido o cita a través de la plataforma, siendo el Seller el responsable exclusivo de la correcta ejecución, coordinación y cumplimiento de los plazos asociados a la modalidad elegida.</p>
        <p class="mb-4">Asimismo, con el fin de brindar mayor transparencia al Usuario, Lyrium Biomarketplace calcula de forma automática el costo de envío de cada pedido al momento de realizar la compra, considerando el operador logístico seleccionado, el peso y las dimensiones del paquete, y demás variables propias de la operación de despacho. El Usuario reconoce que este cálculo puede presentar un margen de variación razonable respecto de las condiciones exactas del despacho, sin que ello afecte el monto a pagar, el cual será siempre el que se muestre en la pantalla de pago (checkout) antes de confirmar la compra.</p>
        <p class="mb-4">Cualquier consulta relacionada con el costo de envío de su pedido podrá ser canalizada directamente con el Seller a través del módulo "Chat con Vendedores" disponible en su panel, conforme a lo previsto en la Cláusula Octava de los presentes Términos y Condiciones.</p>
      `
    },
    {
      id: 'octavo-devoluciones',
      title: 'Octavo: Cancelaciones, Devoluciones, Cambio, Garantía y Reprogramaciones',
      content: `
        <p class="mb-4">Las condiciones aplicables a cancelaciones, devoluciones, cambios, garantías y reprogramaciones de cada Producto y/o Servicio son determinadas de forma autónoma por cada Seller dentro de su tienda en Lyrium Biomarketplace, sin que ello genere responsabilidad alguna para la plataforma respecto de dichas políticas ni de su cumplimiento. Las reprogramaciones, en particular, aplican exclusivamente a los Servicios, no siendo extensibles a la adquisición de Productos.</p>
        <p class="mb-4">Ante cualquier solicitud de este tipo, Lyrium Biomarketplace actúa únicamente como facilitador de los canales de comunicación disponibles en la plataforma para gestionar el requerimiento. La decisión sobre la procedencia, atención y ejecución de cada solicitud recae de manera exclusiva en el Seller correspondiente, bajo su plena responsabilidad.</p>
      `
    },
    {
      id: 'noveno-reembolsos',
      title: 'Noveno: Reembolsos',
      content: `
        <p class="mb-4">Toda solicitud de reembolso derivada de la adquisición de Productos y/o Servicios se regirá exclusivamente por las políticas de reembolso establecidas por el Seller correspondiente. En consecuencia, LYRIUM no será responsable por la evaluación, aprobación, denegatoria, ejecución o cualquier otra actuación relacionada con dichos procedimientos de reembolsos.</p>
      `
    },
    {
      id: 'decimo-exoneracion',
      title: 'Décimo: Exoneración de Responsabilidad',
      content: `
        <p class="mb-4">LYRIUM actúa exclusivamente como una plataforma tecnológica de intermediación, también conocida como Marketplace, destinada a facilitar el contacto entre Sellers y Clientes para la comercialización de Productos y/o Servicios. En tal condición, no participa en la gestión operativa de las tiendas administradas por los Sellers dentro de Lyrium Biomarketplace, ni asume responsabilidad por las actividades desarrolladas por estos.</p>
        <p class="mb-4">En consecuencia, LYRIUM no será responsable, de manera enunciativa mas no limitativa, por el perfeccionamiento del pedido, la validación de pedidos, la facturación, la preparación, el embalaje, el almacenamiento, el despacho, el transporte, la distribución, la entrega de Productos, la prestación de Servicios, la logística de última milla, la atención posventa, las garantías, las devoluciones, los reembolsos, ni por cualquier otra obligación derivada de la operación comercial realizada por cada Seller, siendo todas ellas de su exclusiva responsabilidad.</p>
      `
    }
  ],
  vendedor: [
    {
      id: 'vend-primero',
      title: 'Primero: Antecedentes Generales',
      content: `
        <p class="mb-4"><span class="font-black">1.1.</span> LYRIUM E.I.R.L. (en adelante, "Lyrium") es una empresa constituida bajo las leyes de la República del Perú, cuya actividad principal
           comprende la comercialización de productos y servicios de terceros vinculados al sector de bienestar y salud. Con este propósito, Lyrium ha
           desarrollado una plataforma propia denominada "Lyrium Biomarketplace", disponible en el dominio de su titularidad exclusiva:
           www.lyriumbiomarketplace.com (en adelante, "La Plataforma web"). Lyrium Biomarketplace está diseñada para ser utilizada por proveedores
           especializados en el rubro de bienestar y salud (denominados individualmente "Seller" y en conjunto "Sellers"), quienes, previa autorización
           de Lyrium, quedan habilitados para comercializar directamente en el Perú sus propios productos y servicios a los Clientes que visiten la
           Plataforma web, bajo su exclusiva cuenta y riesgo.
        </p>
        <p class="mb-4">
        <span class="font-black">1.2.</span> Una vez que Lyrium autorice e incorpore al Seller como proveedor registrado, este tendrá acceso a la plataforma Lyrium Biomarketplace, la
           cual le permitirá: </p>
        <p class="mb-4 pl-4">
        <strong>(i)</strong> Publicar, ofrecer y vender sus propios productos y servicios a Clientes de nivel nacional.<br>
        <strong>(ii)</strong> Gestionar las órdenes de compra generadas por los consumidores respecto de uno o más productos y/o servicios de su tienda.<br>
        <strong>(iii)</strong> Administrar y monitorear el flujo de órdenes recibidas, identificando los productos y servicios requeridos y accediendo a la información relevante de cada Cliente.
        </p>
        <p class="mb-4">
    <span class="font-black">1.3.</span> Para garantizar una adecuada operación comercial dentro de la plataforma y bajo los estándares definidos por Lyrium, este prestará a los
    Sellers los siguientes servicios (en adelante, los "Servicios"):
</p>

<p class="mb-4 pl-4">
    <strong>a.)</strong> Facilitar al Seller un espacio virtual que le permita promocionar sus productos y/o servicios e impulsar el crecimiento de sus ventas de
    manera ágil y eficiente.<br><br>

    <strong>b.)</strong> Proporcionar al Seller un panel de control desde el cual pueda administrar y gestionar de forma integral la venta de sus productos y/o
    servicios dentro de la plataforma.<br><br>

    <strong>c.)</strong> Coordinar el servicio de postventa vinculado a los productos del Seller, abarcando, cuando corresponda, procesos de cancelación,
    devolución, cambio, garantía o reembolso. Sin perjuicio de ello, el Seller reconoce que la atención oportuna, adecuada y correcta de toda
    solicitud postventa asociada a sus productos es de su exclusiva responsabilidad. Lyrium no asumirá responsabilidad alguna por las decisiones,
    gestiones o actos relacionados con dichos procesos, limitando su participación a labores de coordinación según corresponda.<br><br>

    <strong>d.)</strong> Proponer políticas y lineamientos orientados a la mejora continua en materia de calidad, innovación y servicio postventa, con el objetivo de
    potenciar el desempeño de los Sellers dentro de la plataforma.<br><br>

    <strong>e.)</strong> Garantizar la protección del entorno digital de Lyrium Biomarketplace para la comercialización de los Productos y/o Servicios publicados por
    el Seller, mediante la implementación de medidas técnicas, administrativas y de seguridad informática acordes con las buenas prácticas de la
    industria, incluyendo mecanismos de autenticación, cifrado, monitoreo y protección de datos que salvaguarden las operaciones realizadas
    dentro de la plataforma. Dicha garantía será aplicable exclusivamente a las operaciones efectuadas dentro del ecosistema de Lyrium
    Biomarketplace. En consecuencia, cualquier redirección, enlace o utilización de plataformas, sitios web o medios de pago externos no
    autorizados por Lyrium eximirá a este de toda responsabilidad por los riesgos, pérdidas o daños que pudieran derivarse, constituyendo
    además causal automática de resolución de la relación contractual.<br><br>

    <strong>f.)</strong> Desarrollar campañas globales de marketing y publicidad orientadas a posicionar Lyrium Biomarketplace en el mercado, las cuales podrán
    coordinarse con los Sellers a fin de diseñar acciones más efectivas que también contribuyan a la visibilidad de cada tienda y sus productos o
    servicios.<br><br>

    <strong>g.)</strong> Brindar al Seller una capacitación inicial sobre el uso y funcionamiento de la plataforma Lyrium Biomarketplace, con el objetivo de facilitar
    su incorporación y operación dentro del ecosistema Lyrium.<br><br>

    <strong>h.)</strong> Gestionar la recaudación de los pagos efectuados por los Clientes a través de la plataforma, asegurando el procesamiento seguro de cada
    transacción.<br><br>

    <strong>i.)</strong> Generar y emitir, por cada operación de compra efectivamente concretada por un Cliente respecto de los productos y/o servicios del Seller,
    la factura, en el cual se consigne de manera separada la comisión aplicada por el uso de la plataforma. Este comprobante será remitido
    automáticamente al correo electrónico registrado por el Seller al momento de su ingreso en Lyrium Biomarketplace.<br><br>

    <strong>j.)</strong> Liquidar semanalmente al Seller el importe correspondiente a sus ventas del período anterior. Cada lunes se revisarán las ventas realizadas
    durante la semana inmediata anterior y el monto resultante, deducida la comisión de Lyrium, será transferido a la cuenta bancaria registrada
    por el Seller en un plazo máximo de 3 (tres) días hábiles, es decir, hasta el miércoles de cada semana, mediante transferencia bancaria, BCP
    Banca Móvil o a través de cajero automático.<br><br>

    <strong>k.)</strong> Otorgar los beneficios complementarios comprendidos en el plan que haya sido contratado o adquirido por el Seller, incluyendo, de manera
    enunciativa mas no limitativa, los previstos en el Plan Emprende, el cual se constituye como plan gratuito y por defecto con el que todo Seller
    inicia su participación en la plataforma Lyrium Biomarketplace. Sin perjuicio de ello, se deja expresa constancia de que la comisión por ventas
    aplicable a cada uno de los planes es la misma y constituye un cargo a favor de Lyrium Biomarketplace, conforme a lo establecido en los
    presentes Términos y Condiciones Generales para Sellers, en el Acuerdo suscrito por el Seller y en sus respectivos anexos.<br><br>

    <strong>l.)</strong> Lyrium ofrece los siguientes planes de participación dentro de la plataforma Lyrium Biomarketplace:
    </p>
    <p class="mb-4 pl-4">
    · <strong>Plan Emprende:</strong> plan gratuito y por defecto con el que todo Seller inicia su participación en la plataforma. Tiene una vigencia de 12 (doce) meses.<br>
    · <strong>Plan Especial:</strong> plan gratuito, que cuenta con los mismos beneficios del Plan Crece, con excepción de la posibilidad de elegir su temporalidad, ya que su vigencia es fija de 6 (seis) meses. Este plan solo podrá ser adquirido una única vez por cada Seller.<br>
    · <strong>Plan Crece:</strong> plan de pago que el Seller podrá adquirir en la temporalidad de su elección: 1 (uno), 2 (dos), 3 (tres) o 4 (cuatro) años, o de forma indefinida.
    </p>
    <p class="mb-4">
    Todos los planes se encuentran sujetos al cumplimiento de la venta mínima mensual establecida por Lyrium, equivalente a S/ 350.00
    (trescientos cincuenta soles) en comercialización de Productos y a S/ 450.00 (cuatrocientos cincuenta soles) en prestación de Servicios,
    salvo por un período de gracia único de 6 (seis) meses, contado por única vez desde la fecha en que el Seller obtiene su reconocimiento como
    vendedor registrado en Lyrium Biomarketplace, independientemente del plan bajo el cual se haya registrado inicialmente. Vencido dicho
    período de gracia, la exigencia de venta mínima resultará aplicable de forma inmediata y continua, incluso si el Seller renueva el Acuerdo,
    cambia de plan o adquiere el Plan Crece, sin que corresponda el otorgamiento de un nuevo período de gracia.
    </p>
    <p class="mb-4">
    Toda referencia contenida en los presentes Términos y Condiciones Generales para Sellers y en el Acuerdo a la vigencia del plan o a la exigencia
    de venta mínima deberá entenderse sujeta a lo aquí establecido.
    </p>
      `
    },

    {
      id: 'vend-segundo',
      title: 'Segundo: Alcance de los términos y condiciones generales',
      content: `
    <p class="mb-4">
        <span class="font-black">2.1.</span> Los presentes Términos y Condiciones Generales aplicables a los Sellers de lyriumbiomarketplace.com rigen la totalidad de los acuerdos
        específicos que se suscriban entre Lyrium y cada Seller para el uso de la plataforma virtual y la recepción de sus servicios, formando parte
        integrante de dichos acuerdos para todos los efectos legales que correspondan. Cada acuerdo suscrito entre Lyrium y un Seller será
        denominado en adelante el "Acuerdo".
    </p>

    <p class="mb-4">
        <span class="font-black">2.2.</span> Con la suscripción del Acuerdo, el Seller manifiesta haber leído, comprendido y aceptado en su totalidad las condiciones aquí establecidas,
        constituyendo dicho acto un requisito indispensable para dar inicio a la relación contractual con Lyrium, así como para la comercialización de
        sus Productos y/o Servicios a través de su tienda en Lyrium Biomarketplace.
    </p>

    <p class="mb-4">
        Asimismo, el Seller acepta de manera anticipada que cualquier modificación que Lyrium introduzca a los presentes Términos y Condiciones le
        será aplicable automáticamente, entendiéndose incorporada al Acuerdo al día siguiente de su comunicación, ya sea mediante la plataforma o a
        través de correo electrónico dirigido a su Administrador del Acuerdo. Si el Seller no estuviera conforme con las modificaciones realizadas,
        podrá resolver el Acuerdo, lo que conllevará el cierre de su cuenta como Seller dentro de la plataforma.
    </p>

    <p class="mb-4">
        <span class="font-black">2.3.</span> El Seller es consciente que tanto los presentes Términos y Condiciones como las estipulaciones del Acuerdo tienen aplicación exclusiva
        dentro del territorio de la República del Perú, limitándose su alcance a la comercialización de Productos y/o Servicios a través de la plataforma
        Lyrium Biomarketplace en el mercado nacional.
    </p>
    `
    },

    {
      id: 'vend-tercero',
      title: 'Tercero: Utilización de la plataforma virtual y prestación de los servicios',
      content: `
    <p class="mb-4">
        <span class="font-black">3.1.</span> Sujeto a la suscripción del Acuerdo, Lyrium autorizará al Seller para que se registre como proveedor habilitado para comercializar, a su
        tienda virtual, mediante el uso de Lyrium Biomarketplace, única y exclusivamente los productos y/o servicios de su titularidad que hayan sido
        previamente aprobados por Lyrium y que se encuentren expresamente detallados en el Acuerdo, en adelante, los "Productos y Servicios".
        Asimismo, Lyrium prestará al Seller los servicios que correspondan conforme a lo establecido en el Acuerdo y en los presentes Términos y
        Condiciones Generales para Sellers. Por su parte, el Seller se obliga a ofertar, comercializar y/o vender a través de su tienda virtual, brindada y
        por intermedio de Lyrium Biomarketplace, únicamente los Productos y Servicios de su titularidad autorizados por Lyrium.
    </p>

    <p class="mb-4">
        <span class="font-black">3.2.</span> El Seller se obliga a cumplir de manera estricta, íntegra y oportuna con todas las obligaciones derivadas de los presentes Términos y
        Condiciones Generales para Sellers, del Acuerdo y de la normativa legal, administrativa, tributaria, sectorial y reglamentaria que resulte
        aplicable a la comercialización de los Productos y Servicios, debiendo actuar en todo momento con la diligencia debida exigible a un proveedor
        profesional.
    </p>

    <p class="mb-4">
        <span class="font-black">3.3.</span> El Seller declara, garantiza y asegura a Lyrium que cuenta con la organización, experiencia, capacidad técnica, operativa, administrativa,
        financiera y logística necesarias, así como con la infraestructura, recursos humanos, materiales y demás medios suficientes para comercializar
        los Productos y Servicios a través de su tienda virtual, mediante Lyrium Biomarketplace, de forma íntegra, autónoma e independiente, y bajo
        su exclusiva cuenta, costo y riesgo, cumpliendo en tiempo, forma y calidad con todas las obligaciones asumidas, incluyendo, sin limitarse a
        ello, la atención y cumplimiento de las órdenes de compra que reciba. El Seller reconoce que las anteriores declaraciones y garantías han sido
        determinantes para la celebración del Acuerdo por parte de Lyrium.
    </p>
    `
    },

    {
      id: 'vend-cuarto',
      title: 'Cuarto: Comercialización de Productos y Servicios en el Sitio Web a través de la Plataforma Lyrium Biomarketplace',
      content: `
    <p class="mb-4">
        <span class="font-black">4.1.</span> Generalidades
    </p>

    <p class="mb-4">
        <span class="font-black">4.1.1.</span> Toda transacción de compraventa o prestación de servicios que se origine a través de la tienda del Seller en Lyrium Biomarketplace se
        perfecciona de manera directa entre el Seller y el Cliente. Lyrium no forma parte de dicho vínculo contractual ni interviene como parte en
        ningún contrato que pudiera derivarse de la adquisición de Productos y/o Servicios ofrecidos por el Seller. Por tanto, las obligaciones y
        derechos emergentes de cada transacción vinculan exclusivamente al Seller y al Cliente correspondiente.
    </p>

    <p class="mb-4">
        En este marco, recae de manera íntegra y exclusiva sobre el Seller el cumplimiento de todas las obligaciones establecidas en la Ley N° 29571
        — Código de Protección y Defensa del Consumidor, así como en cualquier norma concordante, complementaria, modificatoria y/o sustitutoria
        que se encuentre vigente o que sea aprobada en el futuro (en adelante, el "CPC"). Entre dichas obligaciones se incluyen, a modo enunciativo y
        no limitativo, las siguientes:
    </p>

    <p class="mb-4 pl-4">
        <strong>a.)</strong> Alcanzar la venta mínima establecida por Lyrium, una vez vencido el período de gracia único a que se refiere el literal l) de la Cláusula
        Primera.<br><br>

        <strong>b.)</strong> Responder por la idoneidad, calidad, seguridad y conformidad de los Productos y/o Servicios publicados en su tienda dentro de la
        plataforma; por la autenticidad de las marcas, rótulos, leyendas y demás elementos distintivos que exhiban; por la coherencia entre la
        publicidad comercial y las características reales del producto; así como por el contenido, estado, vigencia y vida útil de cada Producto.<br><br>

        <strong>c.)</strong> Poner a disposición de los Clientes, a través de su tienda en la plataforma, información redactada en idioma castellano que sea veraz,
        oportuna, suficiente, comprensible, visible y fácilmente accesible, de modo que les permita tomar decisiones de consumo informadas y hacer
        un uso adecuado de los Productos y/o Servicios adquiridos.<br><br>

        <strong>d.)</strong> Abstenerse de incluir o transmitir a los consumidores, a través de su tienda en Lyrium Biomarketplace o de cualquier otro canal vinculado a
        la comercialización, información que pudiera inducir a error en relación con la naturaleza, origen, modo de fabricación, componentes, usos,
        volumen, peso, medidas, precio, forma de empleo, características, propiedades, idoneidad, cantidad, calidad u otras características relevantes
        de los Productos.<br><br>

        <strong>e.)</strong> Mostrar de manera destacada y en moneda nacional peruana (S/.), el precio total de los Productos y/o Servicios, incluyendo los tributos,
        comisiones y cargos que resulten aplicables. El Cliente no podrá ser requerido a asumir pagos o recargos adicionales fuera del precio
        informado, salvo que se trate de servicios accesorios como transporte, instalación u otros de naturaleza similar, cuyo costo no esté
        comprendido en dicho precio.<br><br>

        <strong>f.)</strong> Facilitar a los consumidores, cuando corresponda, información sobre ingredientes, componentes, condiciones de garantía, manuales de uso,
        advertencias, riesgos previsibles y medidas a adoptar en caso de daño derivado del uso o consumo de los Productos.<br><br>

        <strong>g.)</strong> Cuando se trate de Productos cuya producción, fabricación, ensamble, importación, distribución o comercialización no contemple el
        suministro oportuno de partes, accesorios o servicios de reparación y mantenimiento o en los que dichos suministros se brinden con
        limitaciones, el Seller deberá informarlo al consumidor de manera clara e inequívoca antes de concretar la transacción.<br><br>

        <strong>h.)</strong> Comunicar de forma previa, clara y suficiente las condiciones, restricciones y requisitos de acceso aplicables a los Productos y/o Servicios
        ofrecidos en su tienda dentro de la plataforma.<br><br>

        <strong>i.)</strong> Abstenerse de emplear métodos, mecanismos contractuales y/o comerciales de carácter abusivo en el marco de sus operaciones
        comerciales.<br><br>

        <strong>j.)</strong> Desarrollar toda transacción comercial bajo estándares de trato justo, honesto, empático, transparente y equitativo, sin incurrir en ningún
        tipo de acto o práctica discriminatoria hacia los Clientes.<br><br>

        <strong>k.)</strong> Reponer, reparar y/o devolver los Productos adquiridos por los Clientes en cumplimiento de lo dispuesto en el CPC, garantizando una
        atención diligente y el uso de componentes o repuestos nuevos y adecuados para cada caso.<br><br>

        <strong>l.)</strong> Atender y dar respuesta a los reclamos presentados por sus Clientes dentro de los plazos legales aplicables. Con este propósito, Lyrium
        pondrá a disposición de los Clientes, dentro de la plataforma, el libro de reclamaciones correspondiente a cada Seller, en cumplimiento del
        Reglamento del Libro de Reclamaciones aprobado mediante Decreto Supremo N° 011-2011-PCM o de cualquier norma que lo modifique. La
        gestión, contenido, oportunidad y procedencia de cada reclamo es responsabilidad exclusiva del Seller, dado que la relación de consumo se
        establece directamente entre este y el consumidor, sin que Lyrium forme parte de dicha relación.<br><br>

        <strong>m.)</strong> En el caso de empresas prestadoras de servicios, el Seller deberá ejecutar el servicio contratado en la fecha y hora pactadas, coordinando
        directamente con el Cliente cualquier ajuste o reprogramación que resulte necesaria, a fin de garantizar una experiencia satisfactoria dentro
        de la plataforma Lyrium Biomarketplace.
    </p>

    <p class="mb-4">
    <span class="font-black">4.1.2.</span> Los Productos y/o Servicios que el Seller publique y comercialice a través de su tienda en Lyrium Biomarketplace deberán ser, en todos
    los casos, productos nuevos y servicios ejecutados con implementos nuevos, cuya comercialización esté expresamente permitida por la
    legislación vigente de la República del Perú, cumpliendo con la totalidad de disposiciones legales aplicables para su debida oferta en el
    mercado.
</p>

<p class="mb-4">
    <span class="font-black">4.1.3.</span> El Seller tendrá acceso a la plataforma Lyrium Biomarketplace mediante el correo corporativo o el correo de su preferencia registrado,
    así como la contraseña creada en el formulario de registro para Sellers de Lyrium. El Seller se obliga a utilizar dicho correo y contraseña
    únicamente para la comercialización de los Productos y/o Servicios, y a cumplir en todo momento con los lineamientos y directrices de uso de
    la plataforma, los cuales declara conocer y aceptar con la suscripción del Contrato. El correo corporativo, la contraseña y toda la información a
    la que el Seller tenga acceso en la plataforma con ocasión del Acuerdo y de la comercialización de los Productos y/o Servicios tendrán la
    condición de información confidencial, conforme a lo dispuesto en la Cláusula Décimo Cuarta de estos Términos y Condiciones Generales para
    Sellers.
</p>

<p class="mb-4">
    <span class="font-black">4.1.4.</span> Como condición para la activación completa de su cuenta comercial y la habilitación de su panel de vendedor, el Seller acepta participar
    en el programa de difusión inicial de Lyrium Biomarketplace, comprometiéndose a compartir el enlace de invitación proporcionado por Lyrium a
    través de sus redes sociales, aplicaciones de mensajería u otros medios digitales equivalentes, hasta alcanzar el nivel máximo de difusión
    establecido por Lyrium, equivalente a quince (15) difusiones.
</p>

<p class="mb-4">
    <span class="font-black">4.2.</span> Entrega de información
</p>

<p class="mb-4">
    <span class="font-black">4.2.1.</span> Quienes deseen incorporarse como Sellers en Lyrium Biomarketplace deberán completar el formulario de registro habilitado para tal
    efecto, proporcionando la información de su empresa o negocio, incluyendo RUC, nombre comercial, domicilio legal y demás datos requeridos,
    la cual será validada de forma automatizada por la plataforma al momento del registro. Adicionalmente, el solicitante deberá acreditar que su
    actividad comercial se encuentra vinculada a rubros de bienestar, salud, cuidado personal o afines, para lo cual podrá presentar la URL de su
    página web o red social, catálogo de productos o servicios, ficha técnica, factura o boleta reciente, u otro medio idóneo disponible en el
    formulario de registro.
</p>

<p class="mb-4">
    Una vez completado el formulario, el solicitante podrá revisar los presentes Términos y Condiciones, así como el Acuerdo Comercial de
    Prestación de Servicios de Lyrium Biomarketplace, el cual será generado con la información registrada y deberá ser suscrito tras la aceptación
    de ambos documentos. Según la información proporcionada, se aplicará uno de los siguientes resultados:
</p>

<p class="mb-4 pl-4">
    <strong>a)</strong> Si la información es correcta y todo está bien con ella, el solicitante será incorporado automáticamente como Seller de Lyrium
    Biomarketplace.<br><br>

    <strong>b)</strong> Si la información es parcialmente correcta, la solicitud quedará en estado de revisión manual, a la espera de comunicación por parte del área
    de administración de Lyrium.<br><br>

    <strong>c)</strong> Si la información es incorrecta, por ejemplo, si el RUC no existe, se encuentra inactivo, entre otros escenarios, la solicitud del Usuario para
    convertirse en Seller será rechazada de manera cordial por la plataforma.
</p>

<p class="mb-4">
    En los casos de revisión manual o rechazo, el solicitante podrá optar por recibir una notificación al correo electrónico registrado, en la que se
    indicará el motivo del estado asignado a su solicitud con mayor detalle.
</p>

<p class="mb-4">
    Con posterioridad al registro, cada vez que el Seller desee publicar o actualizar un Producto y/o Servicio, Lyrium llevará a cabo un proceso de
    verificación para determinar si dicho Producto y/o Servicio puede ser comercializado dentro de la plataforma.
</p>

<p class="mb-4">
    <span class="font-black">4.2.1 (bis).</span> Mantener actualizada la información de los Productos y/o Servicios publicados en su tienda es una responsabilidad exclusiva del Seller,
    quien deberá realizar las actualizaciones que correspondan de manera oportuna. Los cambios de precio y de stock entrarán en vigor
    únicamente una vez que Lyrium confirme que la modificación ha sido procesada satisfactoriamente. Cualquier otra modificación sobre la
    información de los Productos y/o Servicios requerirá aprobación previa por parte de Lyrium.
</p>

<p class="mb-4">
    El Seller declara conocer que ninguna actualización o corrección de información, incluyendo aquellas derivadas de errores propios, afectará las
    transacciones ya concretadas antes de la recepción del correo de confirmación emitido por Lyrium.
</p>

<p class="mb-4">
    <span class="font-black">4.2.2.</span> Todo el contenido que el Seller publique en su tienda dentro de Lyrium Biomarketplace deberá ajustarse a los lineamientos y directrices
    establecidos por Lyrium. A modo enunciativo y no limitativo, queda prohibido: realizar publicidad falsa o engañosa sobre los Productos y/o
    Servicios; publicar precios o descripciones incorrectas; ofrecer Productos y/o Servicios no disponibles; efectuar publicidad comparativa o
    peyorativa respecto de los Productos y/o Servicios de Lyrium o de otros Sellers dentro o fuera de la plataforma; o atentar de cualquier forma
    contra la imagen o identidad de otros Sellers o de Lyrium.
</p>

<p class="mb-4">
    <span class="font-black">4.2.3.</span> El Seller se abstiene de manipular su tienda o de incentivar, promover o inducir, por cualquier medio, la redirección de ventas iniciadas
    dentro de Lyrium Biomarketplace hacia plataformas o canales externos, entendiéndose por ello cualquier invitación, mensaje o llamado a la
    acción orientado a que el usuario concrete la compra fuera de la plataforma.
</p>

<p class="mb-4">
    <span class="font-black">4.2.4.</span> Dentro del espacio de su tienda en Lyrium Biomarketplace, el Seller podrá incorporar, con fines de identificación de marca, referencias a
    sus redes sociales, sitio web u otros canales propios, por ejemplo, a través de los banners publicados en su tienda virtual, siempre que dicha
    mención no constituya una invitación, incentivo o llamado a la acción orientado a que el usuario realice la compra fuera de Lyrium
    Biomarketplace. En consecuencia, queda prohibido publicar mensajes, medios de contacto alternativos o cualquier contenido que motive,
    sugiera o induzca directa o indirectamente al usuario a desviar la transacción fuera de la plataforma, así como cualquier contenido que no
    guarde relación directa con los Productos y/o Servicios registrados y autorizados para su comercialización en Lyrium Biomarketplace.
</p>

<p class="mb-4">
    <span class="font-black">4.2.5.</span> La veracidad y exactitud de la información publicada en la tienda es responsabilidad íntegra del Seller. Lyrium no asumirá
    responsabilidad alguna por datos incorrectos ingresados por el Seller, por lo que este deberá revisar de forma permanente todo lo relacionado
    con sus Productos y/o Servicios, órdenes de compra, stock, precios y demás elementos vinculados a su operación en la plataforma.
</p>

<p class="mb-4">
    <span class="font-black">4.2.6.</span> Durante toda la vigencia del Acuerdo, Lyrium podrá requerir al Seller, en cualquier momento y sin necesidad de justificación previa,
    información adicional que estime conveniente en relación con sus Productos y/o Servicios.
</p>

<p class="mb-4">
    <span class="font-black">4.3.</span> Precio de los Productos y eventos promocionales
</p>

<p class="mb-4">
    <span class="font-black">4.3.1.</span> El Seller tiene plena libertad para fijar el precio de venta de sus Productos y/o Servicios dentro de su tienda en Lyrium Biomarketplace,
    debiendo incluir en dicho precio el IGV y los demás impuestos que resulten aplicables.
</p>

<p class="mb-4">
    <span class="font-black">4.3.2.</span> Los precios de todos los Productos y/o Servicios ofrecidos en la tienda del Seller a través de Lyrium Biomarketplace deberán expresarse
    en moneda nacional de la República del Perú. Asimismo, el Seller podrá aplicar descuentos y promociones en el momento que considere
    oportuno, con total autonomía respecto de los Productos y/o Servicios disponibles en su tienda.
</p>

<p class="mb-4">
    <span class="font-black">4.3.3.</span> Al registrar o editar Productos y/o Servicios, el Seller podrá asignarles una de las siguientes etiquetas promocionales, sujetas a las
    condiciones que se detallan a continuación:
</p>

<p class="mb-4 pl-4">
    <strong>a)</strong> <strong>Descuento:</strong> Permite aplicar un porcentaje de reducción no menor al 10% ni mayor al 70% sobre el precio del Producto y/o Servicio. Su
    vigencia puede ser indefinida, por lo que es decisión asignar o no, una fecha fin.<br><br>

    <strong>b)</strong> <strong>Oferta:</strong> Admite un porcentaje de descuento de hasta el 90%, con una vigencia máxima de 3 (tres) meses. Requiere fecha de inicio y fecha de
    fin.<br><br>

    <strong>c)</strong> <strong>Promoción:</strong> Requiere la selección de un Producto adicional que será entregado sin costo al Cliente que adquiera la promoción. El Seller podrá
    fijar libremente el precio de la misma. Esta etiqueta aplica exclusivamente a Productos.
</p>

<p class="mb-4">
    Las etiquetas Descuento, Oferta y Promoción no pueden coexistir entre sí; un Producto y/o Servicio solo podrá tener asignada una de ellas.
    Adicionalmente, existen dos etiquetas complementarias:
</p>

<p class="mb-4 pl-4">
    <strong>a)</strong> <strong>Nuevo:</strong> Aplica a Productos y/o Servicios recién incorporados a la tienda, con una vigencia automática de siete (7) días para visualización del
    Cliente.<br><br>

    <strong>b)</strong> <strong>Ed. Limitada:</strong> Aplica a Productos y/o Servicios que el Seller designe como edición limitada, debiendo fijar fecha de inicio y fin conforme a su
    criterio.
</p>

<p class="mb-4">
    Estas dos etiquetas no pueden coexistir entre sí, pero sí pueden combinarse con cualquiera de las tres etiquetas promocionales anteriores.
    Para cualquiera de las cinco etiquetas, el Seller podrá incluir de manera opcional una descripción breve que informe al Cliente el motivo de su
    asignación.
</p>

<p class="mb-4">
    <span class="font-black">4.3.4.</span> Con el propósito de incentivar la recompra de los Clientes dentro de la plataforma y fortalecer la fidelidad hacia las tiendas de los Sellers,
    Lyrium ha implementado el programa de fidelización "Lyrios", mediante el cual los Clientes acumulan puntos por sus compras que podrán
    canjear como descuento en adquisiciones futuras dentro de Lyrium Biomarketplace. Se trata de un beneficio adicional, complementario a las
    herramientas promocionales previstas en la presente Cláusula, orientado a incrementar el volumen de ventas y la recurrencia de compra de los
    propios Sellers.
</p>

<p class="mb-4 pl-4">
    <strong>a)</strong> <strong>Generación de Lyrios:</strong> Por cada compra efectivamente concretada, el Cliente acumulará un Lyrio equivalentes al 1% del Precio Venta del
    Producto y/o Servicio adquirido, sin incluir el IGV. Dicho porcentaje se calculará de forma independiente por cada Producto y/o Servicio distinto
    dentro de un mismo pedido, pudiendo acumularse entre unidades de un mismo ítem, mas no entre ítems diferentes. La equivalencia aplicable
    será de 1 Lyrio = S/ 0.01 (un céntimo de sol).<br><br>

    <strong>b)</strong> <strong>Uso de Lyrios por el Cliente:</strong> El Cliente podrá utilizar sus Lyrios acumulados como descuento en compras futuras dentro de cualquier tienda
    de la plataforma, sujeto a un monto mínimo de canje equivalente a S/ 2.00 en Lyrios, y a un descuento máximo aplicable por compra
    equivalente al 3% del precio del Producto y/o Servicio sobre el cual se utilice el beneficio. Estos límites buscan asegurar un uso progresivo y
    sostenible del programa, sin comprometer de manera significativa el valor comercial de los Productos y/o Servicios ofrecidos por los Sellers.<br><br>

    <strong>c)</strong> <strong>Asunción del descuento:</strong> El descuento que el Cliente aplique mediante el uso de sus Lyrios en una compra será asumido por el Seller titular
    del Producto y/o Servicio correspondiente, y será deducido del monto que le corresponda percibir conforme al procedimiento de liquidación
    señalado en el literal j) de la Cláusula Primera. Dicho descuento no afecta en modo alguno la comisión que corresponde a Lyrium, la cual
    continuará calculándose sobre el Valor Venta original del Producto y/o Servicio, sin considerar el beneficio aplicado por este concepto,
    conforme a lo dispuesto en la Cláusula Quinta de los presentes Términos y Condiciones Generales para Sellers.
</p>

<p class="mb-4">
    El Seller declara conocer y aceptar las condiciones de generación, acumulación, visualización y uso de los Lyrios aquí descritas, las cuales
    podrán ser actualizadas por Lyrium conforme a lo dispuesto en la Cláusula Segunda de los presentes Términos y Condiciones.
</p>

<p class="mb-4">
    <span class="font-black">4.4.</span> Órdenes de compra y despacho de Productos
</p>

<p class="mb-4">
    <span class="font-black">4.4.1.</span> Cada vez que un Cliente realice una orden de compra sobre uno o más Productos y/o Servicios publicados en la tienda del Seller dentro de
    Lyrium Biomarketplace, la plataforma notificará al Seller los datos específicos de la operación, incluyendo tipo de envío, Producto, cantidad,
    precio pagado y datos del Cliente, para que este inicie el proceso de confirmación correspondiente. De forma simultánea, Lyrium
    Biomarketplace remitirá al correo electrónico del Cliente la confirmación de pago con el detalle de su orden, permitiéndole realizar el
    seguimiento respectivo y verificar el cumplimiento de las obligaciones del Seller.
</p>

<p class="mb-4">
    <span class="font-black">4.4.2.</span> Tras la recepción de una orden de compra, el Seller contará con un plazo máximo de 24 (veinticuatro) horas para:
</p>

<p class="mb-4 pl-4">
    <strong>a)</strong> Confirmar la aceptación de la orden e informar al consumidor en el menor tiempo posible.<br><br>

    <strong>b)</strong> Coordinar el despacho de los Productos y/o Servicios al consumidor, asumiendo el compromiso de cumplir con el plazo de entrega informado
    al momento de la aceptación. La coordinación, despacho y envío desde el punto de origen hasta el domicilio del consumidor es responsabilidad
    exclusiva del Seller. Lyrium Biomarketplace no asume responsabilidad alguna por estas etapas, sin perjuicio de poner a disposición los medios
    y herramientas que faciliten dicho proceso entre el Seller y el Cliente.
</p>

<p class="mb-4">
    Lyrium se reserva la facultad de supervisar que el despacho de Productos y la prestación de Servicios se realicen conforme a los estándares
    establecidos, sin que ello implique asumir responsabilidad sobre las etapas del proceso de entrega.
</p>

<p class="mb-4">
    <span class="font-black">4.4.3.</span> Para el despacho de sus Productos, el Seller deberá utilizar medios que garanticen su adecuada protección durante el transporte, tales
    como cajas, bolsas debidamente acondicionadas u otros elementos de seguridad acordes con la naturaleza del Producto. Con la finalidad de
    brindar orientación sobre las buenas prácticas de embalaje, Lyrium Biomarketplace pondrá a disposición de sus Sellers un Manual de
    Empaquetado, el cual contendrá lineamientos generales de empaquetado y tendrá carácter meramente referencial, sin constituir una
    obligación para el Seller ni sustituir su deber de adoptar las medidas de embalaje que resulten adecuadas para cada Producto. En consecuencia,
    cualquier reclamo, queja o contingencia relacionada con el estado del empaquetamiento o embalaje será de exclusiva responsabilidad del
    Seller, quien se obliga a entregar los Productos en condiciones óptimas y a prestar Servicios de calidad.
</p>

<p class="mb-4">
    <span class="font-black">4.4.4.</span> El Seller está obligado a realizar la entrega de los Productos y/o Servicios dentro del plazo establecido y comunicado a través de la
    plataforma Lyrium Biomarketplace, sin excepciones ni demoras injustificadas.
</p>

<p class="mb-4">
    <span class="font-black">4.4.5.</span> El Seller deberá monitorear de forma continua el estado del despacho de sus Productos hasta su entrega completa en el domicilio
    correspondiente, manteniendo informados a los consumidores que así lo soliciten, ya sea a través de la plataforma o de los canales
    habilitados, incluidos los módulos Chat con Clientes o en el caso del Cliente, Chat con Vendedores. La comunicación entre el Seller y el
    consumidor durante este proceso deberá limitarse estrictamente a informar sobre el estado del despacho, la entrega del Producto y/o la
    coordinación del Servicio.
</p>

<p class="mb-4">
    Sin perjuicio de ello, Lyrium podrá supervisar el proceso de coordinación y despacho a través de la plataforma, verificando que la información se
    mantenga actualizada para conocimiento de los consumidores. Los datos recabados durante este seguimiento serán utilizados por Lyrium
    para evaluar el cumplimiento del Seller respecto de las obligaciones establecidas en los presentes Términos y Condiciones y en el Acuerdo, y
    para determinar las penalidades que pudieran corresponder.
</p>

<p class="mb-4">
    <span class="font-black">4.4.6.</span> Para la entrega de Productos, la plataforma contempla tres modalidades de envío: Entrega a Domicilio, Recojo en Agencia (agencia del
    operador logístico) y Recojo en Tienda (sucursal escogida por el Cliente para poder asistir a ella). Cada modalidad sigue una secuencia de
    estados específica:
</p>

<p class="mb-4 pl-4">
    <strong>a)</strong> Entrega a Domicilio: Validado por el Seller → En Preparación → Despachado → En camino → Listo en Domicilio → Confirmado por el Cliente.<br><br>
    <strong>b)</strong> Recojo en Agencia: Validado por el Seller → En Preparación → Despachado → En camino → Listo para Recojo en Agencia → Confirmado por el Cliente.<br><br>
    <strong>c)</strong> Recojo en Tienda: Validado por el Seller → En Preparación → Despachado → Listo para Recojo en Tienda → Confirmado por el Cliente.
</p>

<p class="mb-4">
    Para la prestación de Servicios, la modalidad de atención disponible es solo Atención en Sede o Centro de Salud con el siguiente estado: Validado
    por el Centro de Salud → Confirmado por el Paciente. En todos los casos, el Cliente podrá elegir libremente la modalidad que mejor se adapte a
    sus necesidades, y el Seller queda obligado a ejecutar el proceso seleccionado, respetando en todo momento la secuencia de estados que le
    corresponda.
</p>

<p class="mb-4">
    <span class="font-black">4.4.7.</span> El Seller tiene la obligación de emitir oportunamente el comprobante de pago correspondiente por la venta de los Productos y/o la
    prestación de los Servicios, así como de remitirlo al Cliente final de manera oportuna, ya sea de forma presencial al momento de la entrega o
    mediante medios virtuales idóneos, tales como correo electrónico, WhatsApp u otros que permitan su recepción por el Cliente. El comprobante
    de pago deberá ser emitido bajo el nombre, razón o denominación social y número de RUC del Seller, junto con cualquier otro documento
    tributario exigible conforme a la normativa vigente. Asimismo, dicho comprobante deberá reflejar el monto total abonado por el Cliente,
    comprendiendo el precio del Producto y/o Servicio, el costo de despacho, los impuestos aplicables y la modalidad de envío o entrega
    seleccionada al momento de la orden de compra, así como todos los datos relativos a la adquisición y cualquier otra información de carácter
    obligatorio de conformidad con la legislación aplicable.
</p>

<p class="mb-4">
    <span class="font-black">4.4.8.</span> El Seller reconoce y acepta que, para cada Producto y/o Servicio publicado en su tienda dentro de Lyrium Biomarketplace, el Cliente
    tendrá la facultad de elegir libremente la modalidad de envío o atención que estime conveniente entre las opciones habilitadas por Lyrium,
    siendo dicha elección de cumplimiento obligatorio para el Seller. Para Productos, las modalidades disponibles son envío a domicilio, recojo en
    agencia y recojo en tienda; para Servicios, atención en sede o centro de salud. La correcta ejecución de cada modalidad —incluyendo la
    coordinación, actualización de estados, cumplimiento de plazos, generación de evidencias y comunicación al Cliente sobre el estado del pedido
    o la programación del Servicio— es responsabilidad exclusiva del Seller. Lyrium únicamente provee la herramienta tecnológica que permite el
    registro, visualización y seguimiento del flujo correspondiente, sin asumir responsabilidad alguna sobre la logística, transporte, atención,
    reprogramación, entrega, cancelación, reembolso ni cualquier otro acto de ejecución material o postventa, salvo que se disponga expresamente
    lo contrario en los presentes Términos y Condiciones.
</p>

<p class="mb-4">
    <span class="font-black">4.4.9.</span> Lyrium Biomarketplace pone a disposición de todos los Sellers, sin costo adicional y sin que ello forme parte de la comisión establecida
    en la Cláusula Quinta ni de los beneficios asociados a los planes de afiliación, una herramienta que calcula automáticamente el costo de envío
    de cada pedido al momento en que el Cliente realiza su compra. Dicho cálculo se determina en función del operador logístico seleccionado, el
    peso y las dimensiones del paquete, y demás variables propias de la operación de despacho, conforme a las reglas y tarifas establecidas por
    cada operador logístico. El monto resultante de este cálculo corresponde íntegramente al Seller, como parte del costo operativo de despacho
    de sus Productos, y será considerado dentro de la liquidación semanal señalada en el literal j) de la Cláusula Primera.
</p>

<p class="mb-4">
    El Seller reconoce que, por la naturaleza del cálculo, el cual se basa en las especificaciones técnicas registradas para cada Producto y en las
    tarifas del operador logístico correspondiente, el monto proyectado puede presentar un margen de variación razonable frente al costo real que
    finalmente aplique el operador logístico al momento del despacho efectivo. Sin perjuicio de ello, el monto reflejado al Cliente al momento de la
    compra será el que corresponda cobrar por dicha operación, resultando responsabilidad del Seller evaluar y gestionar cualquier diferencia que
    pudiera surgir frente al operador logístico que utilice. Cualquier situación relacionada con el costo de envío de un pedido en particular podrá
    ser canalizada entre el Seller y el Cliente a través de los módulos "Chat con Clientes" y "Chat con Vendedores" habilitados en la plataforma,
    conforme a lo previsto en la Cláusula Sexta de los presentes Términos y Condiciones.
</p>

<p class="mb-4">
    <span class="font-black">4.5.</span> Recaudación de pagos
</p>

<p class="mb-4">
    <span class="font-black">4.5.1.</span> Lyrium se encargará de recaudar los pagos realizados por los Clientes con ocasión de sus órdenes de compra, los cuales comprenden el
    precio de los Productos y/o Servicios adquiridos, el costo de despacho y los impuestos que resulten aplicables.
</p>

<p class="mb-4">
    <span class="font-black">4.5.2.</span> Todo impuesto, FEE, retención u otro gravamen que se genere como consecuencia de las operaciones comerciales del Seller será asumido
    íntegra y exclusivamente por este, sin que Lyrium tenga responsabilidad alguna al respecto.
</p>
    `
    },

    {
      id: 'vend-quinto',
      title: 'Quinto: Comisión',
      content: `
    <p class="mb-4">
        <span class="font-black">5.1.</span> Como retribución por los servicios que Lyrium presta al Seller dentro de la plataforma Lyrium Biomarketplace, este último abonará la
        comisión que corresponda según la tabla de FEE vigente, calculada sobre el Valor Venta de cada Producto y/o Servicio efectivamente vendido, sin considerar el IGV.
    </p>

    <p class="mb-4">
        <span class="font-black">5.2.</span> Para determinar la FEE de comisión aplicable a cada operación, se tomará como base el valor total de la transacción individual de cada
        Producto y/o Servicio comercializado, entendido como la suma del precio de todas las unidades de dicho ítem adquiridas en una misma compra, excluido el IGV.
        El cálculo se realizará de forma independiente para cada Producto y/o Servicio vendido por cada Seller, por lo que los montos correspondientes a ítems distintos
        o pertenecientes a otros Sellers dentro de una misma transacción no podrán acumularse ni tomarse en cuenta para definir la categoría de comisión aplicable.
    </p>

    <div class="font-bold text-[#333333] mb-2">Tabla de FEE de comisión vigente</div>
    <div class="overflow-x-auto mb-4">
      <table class="w-full text-sm border-collapse">
        <thead><tr class="bg-gray-100"><th class="p-2 border text-left font-bold">Tramo</th><th class="p-2 border text-left font-bold">Venta Mínima</th><th class="p-2 border text-left font-bold">Venta Máxima</th><th class="p-2 border text-left font-bold">FEE de comisión</th></tr></thead>
        <tbody>
          <tr class="border-b"><td class="p-2 border">1</td><td class="p-2 border">S/ 0.00</td><td class="p-2 border">S/ 400.00</td><td class="p-2 border">15%</td></tr>
          <tr class="border-b"><td class="p-2 border">2</td><td class="p-2 border">S/ 401.00</td><td class="p-2 border">S/ 800.00</td><td class="p-2 border">14%</td></tr>
          <tr class="border-b"><td class="p-2 border">3</td><td class="p-2 border">S/ 801.00</td><td class="p-2 border">S/ 1,200.00</td><td class="p-2 border">13%</td></tr>
          <tr class="border-b"><td class="p-2 border">4</td><td class="p-2 border">S/ 1,201.00</td><td class="p-2 border">A más</td><td class="p-2 border">12% (menor tasa)</td></tr>
        </tbody>
      </table>
    </div>

    <p class="mb-4">
        <span class="font-black">5.3.</span> Para los fines del presente Acuerdo, se entiende por Valor Venta el precio del Producto y/o Servicio antes de la aplicación del IGV
        o de cualquier otro tributo que pudiera corresponder.
    </p>

    <p class="mb-4">
        <span class="font-black">5.4.</span> Lyrium podrá revisar y actualizar la tabla de comisiones cuando lo estime pertinente. Toda modificación deberá ser comunicada al
        Seller a través de los canales oficiales habilitados en la plataforma Lyrium Biomarketplace, entre ellos, el número oficial de WhatsApp, el Asistente Virtual/ChatBot,
        el correo electrónico y el Módulo de Soporte Lyrium, y tendrá efecto únicamente sobre las ventas realizadas con posterioridad a dicha comunicación.
    </p>

    <p class="mb-4">
        <span class="font-black">5.5.</span> En caso de discrepancia entre lo dispuesto en los presentes Términos y Condiciones y la tabla de comisiones disponible a través
        del Asistente Virtual/ChatBot, prevalecerá esta última en su versión vigente y comunicada oficialmente por Lyrium.
    </p>

    <p class="mb-4">
        <span class="font-black">5.6.</span> Por cada venta efectiva realizada a través de la tienda del Seller en Lyrium Biomarketplace, Lyrium emitirá el comprobante de pago
        correspondiente, ya sea boleta o factura, en el que se detallará la comisión cobrada por concepto de uso de la plataforma. Dicho comprobante será remitido de forma
        automática al correo electrónico que el Seller tenga registrado en su cuenta.
    </p>
    `
    },

    {
      id: 'vend-sexto',
      title: 'Sexto: Cancelaciones, Devoluciones, Cambio, Garantía, Reembolsos y Reprogramaciones',
      content: `
    <p class="mb-4">
        <span class="font-black">6.1.</span> Cada Seller es responsable de establecer y gestionar sus propias políticas en materia de cancelaciones, devoluciones, cambios, garantías,
        reembolsos y reprogramaciones. Lyrium Biomarketplace no asume responsabilidad alguna frente al Cliente cuando este opte por ejercer
        cualquiera de estas opciones.
    </p>

    <p class="mb-4">
        <span class="font-black">6.2.</span> Dentro de su tienda en Lyrium Biomarketplace, el Seller deberá publicar de manera visible y comprensible las políticas aplicables a cada
        uno de los Productos y/o Servicios que ofrezca, incluyendo las condiciones de cancelación, devolución, cambio, garantía, reembolso y
        reprogramación correspondientes.
    </p>

    <p class="mb-4">
        <span class="font-black">6.3.</span> La definición, aplicación y cumplimiento de las políticas de cancelaciones, devoluciones, cambios, garantías, reembolsos y
        reprogramaciones recae de manera exclusiva sobre el Seller. Lyrium no interviene en dichos procesos ni asume responsabilidad por su
        ejecución o inobservancia respecto de los Productos y/o Servicios comercializados a través de la plataforma.
    </p>

    <p class="mb-4">
        <span class="font-black">6.4.</span> La prestación del servicio técnico asociado a los Productos y/o Servicios adquiridos por los Clientes es una obligación que corresponde
        única y exclusivamente al Seller, quien deberá atenderla siempre que el consumidor lo solicite y la naturaleza del Producto y/o Servicio lo
        justifique.
    </p>

    <p class="mb-4">
        <span class="font-black">6.5.</span> Toda solicitud de cancelación, devolución, cambio, reembolso o reprogramación deberá ser tramitada directamente entre el consumidor y
        el Seller. Lyrium no interviene ni es parte necesaria en dicha comunicación.
    </p>

    <p class="mb-4">
        <span class="font-black">6.6.</span> Cuando un consumidor manifieste su intención de ejercer cualquiera de los derechos contemplados en el presente apartado, el Seller
        deberá contactarlo a través de los canales oficiales disponibles en la plataforma, informándole sobre la procedencia de su solicitud, así como
        las condiciones, restricciones y plazos bajo los cuales operará el proceso correspondiente. Para facilitar esta gestión, Lyrium Biomarketplace
        pone a disposición del Cliente, dentro de su panel personal, el módulo "Chat con Vendedores", a través del cual podrá coordinar directamente
        con el Seller todo lo relacionado con los procesos descritos en este apartado.
    </p>
    `
    },

    {
      id: 'vend-septimo',
      title: 'Séptimo: Propiedad intelectual',
      content: `
    <p class="mb-4">
        <span class="font-black">7.1.</span> Al publicitar y/o comercializar Productos y/o Servicios a través de su tienda en Lyrium Biomarketplace, el Seller garantiza que estos han
        sido adquiridos mediante actividades lícitas y que su ingreso al territorio peruano y al mercado local se ha producido conforme a la legislación
        vigente. Del mismo modo, el Seller reconoce ser el único responsable de las imágenes, marcas, descripciones y demás elementos asociados a
        los Productos y/o Servicios que publique o comercialice dentro de la plataforma, y declara que estos fueron obtenidos tras su comercialización
        legítima, ya sea en el Perú o en cualquier otro país por parte de los titulares de las marcas correspondientes, o con su consentimiento
        expreso.
    </p>

    <p class="mb-4">
        El Seller tiene la obligación de contar con la totalidad de los derechos de propiedad intelectual e industrial sobre los signos bajo los cuales
        publicite y/o comercialice sus Productos y/o Servicios en la plataforma. En virtud de ello, se compromete a mantener a Lyrium completamente
        a salvo de cualquier responsabilidad civil, penal, administrativa o de otra índole que pudiera derivarse de reclamaciones, demandas o acciones
        vinculadas al uso de signos distintivos o de cualquier otro elemento protegido por la propiedad intelectual e industrial, ya sea que estas
        provengan de los titulares de dichos derechos o de terceros. Esta obligación de indemnidad se extiende a cualquier tipo de reclamación judicial
        o administrativa que terceros pudieran interponer en relación con los Productos y/o Servicios comercializados a través de la tienda del Seller
        en Lyrium Biomarketplace, incluso en los casos en que dichas reclamaciones sean acogidas parcial o totalmente. Su vigencia se mantendrá aun
        después de la terminación del Acuerdo, durante todos los plazos de prescripción que resulten aplicables.
    </p>

    <p class="mb-4">
        Cuando Lyrium lo requiera, el Seller deberá entregar de forma inmediata la documentación que acredite, a satisfacción de Lyrium, la legalidad
        de la mercancía, su procedencia, las condiciones de su importación o adquisición, su permanencia legal en el país, así como la titularidad plena
        de los derechos de propiedad intelectual e industrial sobre los signos distintivos bajo los cuales se publiciten y/o comercialicen los Productos.
        Dicha documentación podrá incluir, según el tipo de producto y la situación particular, facturas de compra, certificados de origen,
        declaraciones o pólizas de importación, registros sanitarios, certificados de marca o cualquier otro soporte que permita a Lyrium verificar el
        cumplimiento de lo aquí establecido.
    </p>

    <p class="mb-4">
        <span class="font-black">7.2.</span> Bajo ninguna circunstancia el Seller podrá publicar ni comercializar, a través de su tienda en Lyrium Biomarketplace, productos
        falsificados, replicados, copiados o adulterados de cualquier manera que pudiera inducir a error al consumidor o generar la apariencia de
        autenticidad u originalidad. Igualmente, queda prohibida la publicación o comercialización de productos cuyos signos distintivos, imágenes u
        otros elementos protegidos por la propiedad intelectual y/o industrial hayan sido falsificados, copiados o constituyan una reproducción
        exacta o sustancialmente similar a los de otro producto o proveedor del mercado, o que de cualquier forma imiten, reproduzcan o se
        aprovechen indebidamente de dichos elementos.
    </p>
    `
    },

    {
      id: 'vend-octavo',
      title: 'Octavo: Resolución del acuerdo y eliminación de cuenta del Seller',
      content: `
    <p class="mb-4">
        <span class="font-black">8.1.</span> Vencido el período de gracia único de 6 (seis) meses a que se refiere el literal l) de la Cláusula Primera, y de no haber alcanzado la venta
        mínima exigida por Lyrium, el Acuerdo quedará resuelto de pleno derecho, lo que conllevará la eliminación inmediata de su cuenta y tienda de
        la plataforma, salvo que el Seller haya renovado el Acuerdo dentro de los plazos y condiciones establecidos por Lyrium para tal efecto, en cuyo
        caso el Acuerdo continuará vigente conforme a las nuevas condiciones pactadas, sin que ello implique el otorgamiento de un nuevo período de
        gracia.
    </p>

    <p class="mb-4">
        <span class="font-black">8.2.</span> Brindar a los consumidores una experiencia de compra de calidad es un objetivo compartido por ambas partes. En virtud de ello, el Seller
        se compromete a mantener, durante toda la vigencia del Acuerdo, estándares óptimos en cada etapa de la relación comercial con sus clientes:
        desde la oferta y comercialización de sus Productos y/o Servicios a través de su tienda en Lyrium Biomarketplace, hasta el despacho y el
        servicio postventa, abarcando cuando corresponda los procesos de cancelación, devolución, cambio, garantía, reembolso y reprogramación.
    </p>

    <p class="mb-4">
        <span class="font-black">8.3.</span> Lyrium se reserva el derecho de resolver unilateralmente el Acuerdo, de pleno derecho, y de proceder a la eliminación definitiva de la
        cuenta y tienda del Seller dentro de la plataforma Lyrium Biomarketplace, cuando se verifique cualquiera de las siguientes situaciones:
        (i) Se constaten, en hasta 3 (tres), deficiencias significativas en el servicio prestado a los Clientes, acreditadas mediante calificaciones
        negativas, reclamos fundados u otros medios objetivos de verificación debidamente sustentadas por Lyrium ante el Seller. (ii) El Seller incurra
        en el incumplimiento de cualquier obligación contemplada en el presente Acuerdo o en los presentes Términos y Condiciones. (iii) El Seller no
        logre sostener la venta mínima mensual exigida por Lyrium una vez transcurrido el período de gracia único de 6 (seis) meses a que se refiere
        el literal l) de la Cláusula Primera, esto con el fin de la permanencia activa en la plataforma, equivalente a S/ 350.00 (trescientos cincuenta
        soles) mensuales en comercialización de Productos, y a S/ 450.00 (cuatrocientos cincuenta soles) mensuales en prestación de Servicios.
        Ambas partes reconocen expresamente que una suspensión previa de la cuenta del Seller no limita ni condiciona la facultad de Lyrium de
        resolver el Acuerdo en una instancia posterior.
    </p>

    <p class="mb-4">
        <span class="font-black">8.4.</span> Cuando el Seller acumule hasta 3 (tres) incumplimientos de las obligaciones contenidas en los presentes Términos y Condiciones y/o en el
        Acuerdo, Lyrium quedará facultada para dar por resuelto el vínculo contractual y proceder a la eliminación de la cuenta y tienda del Seller de la
        plataforma. Entre los supuestos que configuran dicho incumplimiento se encuentran, sin carácter limitativo: la oferta o comercialización de
        Productos y/o Servicios distintos a los acordados con Lyrium; la entrega incompleta, tardía o defectuosa de los Productos y/o Servicios
        adquiridos por los consumidores a través de su tienda en Lyrium Biomarketplace; y el incumplimiento de las políticas de cancelación,
        devolución, cambio, garantía, reembolso o reprogramación.
    </p>

    <p class="mb-4">
        <span class="font-black">8.5.</span> El incumplimiento de las responsabilidades asumidas por cualquiera de las partes constituye causal de resolución del presente Acuerdo, al
        amparo de lo dispuesto en el artículo 1430 del Código Civil. La resolución operará de pleno derecho desde el momento en que la parte que
        invoca esta cláusula notifique a la otra mediante comunicación dirigida a su dirección de correo electrónico registrada.
    </p>
    `
    },

    {
      id: 'vend-noveno',
      title: 'Noveno: Responsabilidad',
      content: `
    <p class="mb-4">
        <span class="font-black">9.1.</span> La oferta y comercialización de Productos y/o Servicios dentro de Lyrium Biomarketplace se desarrolla como una relación directa entre el
        Seller y los Clientes. La participación de Lyrium en dicho proceso se circunscribe exclusivamente a: <br><br>
          <strong>(i)</strong> facilitar la publicación y visibilidad de la información relativa a los Productos y/o Servicios del Seller dentro su tienda mediante Lyrium Biomarketplace;
          <strong>(ii)</strong> gestionar el cobro de los pagos generados con ocasión de dichas transacciones; y
          <strong>(iii)</strong> cumplir con las demás obligaciones que le han sido expresamente asignadas en los presentes Términos y Condiciones y en el Acuerdo.
    </p>

    <p class="mb-4">
        <span class="font-black">9.2.</span> A través de Lyrium Biomarketplace, Lyrium pone a disposición del Seller un entorno virtual materializado como su propia tienda dentro de
        la plataforma que le permite conectar con distintos Clientes para ofrecer y comercializar sus Productos y/o Servicios. No obstante, todo lo
        relacionado con las condiciones bajo las cuales se realiza dicha oferta y comercialización, así como cualquier aspecto vinculado a los Productos
        y/o Servicios mismos, es de entera y exclusiva responsabilidad del Seller.
    </p>

    <p class="mb-4">
        <span class="font-black">9.3.</span> Lyrium no ostenta titularidad, posesión ni poder de disposición sobre los Productos y/o Servicios que los Sellers comercializan a través de
        sus tiendas en la plataforma Lyrium Biomarketplace. Su rol se limita al de facilitador del entorno digital, sin intervenir en la naturaleza ni en las
        condiciones de lo que se ofrece.
    </p>

    <p class="mb-4">
        <span class="font-black">9.4.</span> Lyrium no toma parte en la concreción de las transacciones celebradas entre el Seller y los Clientes a través de las tiendas dentro de
        Lyrium Biomarketplace, ni en las condiciones bajo las cuales estas se perfeccionan y ejecutan. En tal sentido, constituyen aspectos propios del
        perfeccionamiento y ejecución del pedido, sin carácter limitativo, la aceptación, preparación, despacho, entrega, cancelación, reprogramación,
        devolución, cambio, reposición, reembolso, atención de garantías, servicio postventa y cualquier otra gestión relacionada con el cumplimiento
        de la compraventa de Productos o de la prestación de Servicios, incluyendo las decisiones vinculadas a las citas agendadas para dichos fines.
        Por tanto, el Seller asume de forma exclusiva la responsabilidad por la comercialización de sus Productos y/o Servicios a través de su tienda en
        la plataforma, así como por el cumplimiento íntegro de todas las obligaciones legales, regulatorias y contractuales que le correspondan como
        proveedor en la relación de consumo que se genere con el Cliente.
    </p>

    <p class="mb-4">
        Bajo este marco, Lyrium queda eximida de toda responsabilidad respecto de la existencia, disponibilidad, calidad, idoneidad, estado, cantidad,
        legitimidad o cualquier otra característica de los Productos y/o Servicios ofrecidos por el Seller. Del mismo modo, Lyrium no asumirá
        responsabilidad alguna por incidencias relacionadas con el perfeccionamiento o la ejecución del pedido, incluyendo, entre otras, demoras,
        errores, pérdidas, entregas en un lugar distinto al acordado, cancelaciones, devoluciones, cambios, reposiciones, reembolsos, atención de
        garantías, servicio postventa o cualquier incumplimiento atribuible al Seller.
    </p>

    <p class="mb-4">
        <span class="font-black">9.5.</span> Queda terminantemente prohibido que el Seller haga uso de las marcas "Lyrium" o "Lyrium Biomarketplace", así como de cualquier otro
        signo distintivo, elemento registrado o activo protegido por la propiedad industrial e intelectual de titularidad de Lyrium o de sus empresas
        vinculadas. De igual forma, el Seller deberá abstenerse de distribuir, por cualquier canal o medio, publicidad, cupones, documentos o cualquier
        tipo de contenido que pueda ser asociado o confundido con dichos signos, marcas o elementos.
    </p>
    `
    },

    {
      id: 'vend-decimo',
      title: 'Décimo: Vigencia',
      content: `
    <p class="mb-4">
        <span class="font-black">10.1.</span> La adhesión a los presentes Términos y Condiciones Generales para Sellers se producirá con la firma del Acuerdo, momento desde el cual
        resultarán plenamente aplicables y de obligatorio cumplimiento durante todo el tiempo de su vigencia. A partir de dicha suscripción, el Seller
        quedará sometido a lo dispuesto en este marco contractual. El plazo de duración del Acuerdo será el que corresponda al plan contratado o
        adquirido por el Seller, conforme a lo dispuesto en el literal l) de la Cláusula Primera.
    </p>

    <p class="mb-4">
        <span class="font-black">10.2.</span> Producida la terminación del Acuerdo, cualquiera sea su causa, Lyrium quedará facultada para desactivar al Seller dentro de la plataforma
        Lyrium Biomarketplace y retirar su tienda virtual junto con la totalidad de los Productos y/o Servicios que hubieren sido publicados por este.
        Asimismo, Lyrium efectuará la entrega de los importes que hubiera recaudado con ocasión de la prestación de los Servicios, siempre que el
        Seller no haya procedido a la renovación del Acuerdo.
    </p>

    <p class="mb-4">
        <span class="font-black">10.3.</span> La finalización del Acuerdo, sin importar el motivo que la origine, no extinguirá aquellas obligaciones que, por su naturaleza o por
        mandato legal, deban subsistir con posterioridad a su vencimiento. En particular, permanecerán exigibles durante el plazo de prescripción
        aplicable las obligaciones del Seller frente a Lyrium, así como las disposiciones de estos Términos y Condiciones Generales para Sellers y del
        Acuerdo vinculadas con el despacho, cambio, devolución, reposición, servicio técnico y garantía de los Productos adquiridos por los
        consumidores con anterioridad a la terminación del Acuerdo.
    </p>

    <p class="mb-4">
        <span class="font-black">10.4.</span> Con una antelación de 7 (siete) días calendario al vencimiento del Acuerdo y del plan contratado o adquirido por el Seller, Lyrium remitirá
        a este una comunicación vía correo electrónico informándole dicho vencimiento. La renovación del Acuerdo y, por ende, de los presentes
        Términos y Condiciones Generales para Sellers, podrá efectuarse de dos formas: (i) de manera manual, ingresando el Seller a su panel de
        vendedor dentro de la plataforma Lyrium Biomarketplace, módulo "Mi Plan", y haciendo uso de la función de renovación habilitada para tal
        efecto; o (ii) de manera automática, siempre que el Seller haya activado previamente la opción de renovación automática disponible en el
        mismo módulo. El Seller podrá activar o desactivar dicha opción de renovación automática en cualquier momento, a través de su panel de
        vendedor. En caso el Seller no cuente con la renovación automática activada y no ejecute la renovación de forma manual, el Acuerdo quedará
        resuelto de pleno derecho al vencimiento del plazo correspondiente, sin perjuicio de lo señalado en la Cláusula Octava.
    </p>
    `
    },

    {
      id: 'vend-undecimo',
      title: 'Undécimo: Comunicaciones',
      content: `
    <p class="mb-4">
        <span class="font-black">11.1.</span> Cada parte designará uno o más administradores del Contrato, quienes por su sola designación se entenderán debida y suficientemente
        facultados para representarlas en todo lo relacionado con la administración y ejecución de estos Términos y Condiciones Generales para Sellers
        y del correspondiente Acuerdo. Los administradores del Acuerdo serán definidos internamente por cada una de las partes, pudiendo
        modificarlos a su entero arbitrio, debiendo informar a la otra parte el nombre del nuevo administrador del Acuerdo, por cualquier medio
        escrito.
    </p>

    <p class="mb-4">
        <span class="font-black">11.2.</span> El nombre, número de teléfono, correo electrónico y demás datos de contacto de los administradores del Acuerdo de cada parte será
        definido en el mismo.
    </p>

    <p class="mb-4">
        <span class="font-black">11.3.</span> Todas las comunicaciones que las partes deban efectuarse con ocasión de estos Términos y Condiciones Generales para Sellers y/o del
        correspondiente Acuerdo serán dirigidas al administrador del Acuerdo de la parte correspondiente.
    </p>
    `
    },

    {
      id: 'vend-duodecimo',
      title: 'Duodécimo: Cesión del contrato y los términos',
      content: `
    <p class="mb-4">
        <span class="font-black">12.1.</span> Las partes no podrán ceder el Contrato, los presentes Términos y Condiciones Generales para Sellers, ni los derechos u obligaciones que
        emanen de los mismos, salvo autorización previa, expresa y escrita de la otra parte.
    </p>

    <p class="mb-4">
        <span class="font-black">12.2.</span> Sin perjuicio de lo anterior, Lyrium estará autorizado para ceder el Acuerdo, así como los presentes Términos y Condiciones Generales
        para Sellers, o cualquiera de los derechos u obligaciones que emanaren de los mismos, a cualquiera de los socios que formen parte de su
        empresa.
    </p>
    `
    },

    {
      id: 'vend-decimotercero',
      title: 'Décimo tercera: Protección y tratamiento de datos personales',
      content: `
    <p class="mb-4">
        <span class="font-black">13.1.</span> Las partes reconocen que la ejecución del Acuerdo y de los Términos y Condiciones Generales para Sellers comprenderá el acceso,
        intercambio, transferencia y, en general, tratamiento de los datos personales correspondientes a los Sellers y sus clientes y/o consumidores.
    </p>

    <p class="mb-4">
        <span class="font-black">13.2.</span> Por lo anteriormente señalado, las partes garantizan que el tratamiento de datos personales a ser desarrollado en el marco del Acuerdo y
        de los Términos y Condiciones Generales para Sellers, se realizará en estricta confidencialidad, observancia y cumplimiento de las
        disposiciones reguladas en el Acuerdo y en los Términos y Condiciones Generales para Sellers, así como en las disposiciones contenidas en la
        Ley N° 29733, Ley de Protección de Datos Personales (en adelante, la “LPDP”), el Decreto Supremo N° 003-2013-JUS, Reglamento de la Ley de
        Protección de Datos Personales (en adelante, el “RLPDP”), así como las normas concordantes, complementarias, modificatorias y/o
        sustitutorias emitidas, que se emitan y/o aprueben sobre la materia.
    </p>

    <p class="mb-4">
        <span class="font-black">13.3.</span> Consecuentemente, de manera especial y meramente enunciativa, las partes declaran que:
    </p>

    <p class="mb-4 pl-4">
        <strong>a.)</strong> Los titulares de los datos personales objeto de tratamiento han sido debidamente informados de manera previa, sencilla, expresa,
        detallada e inequívoca sobre la finalidad para la cual han sido recopilados sus datos personales, el tratamiento que tales datos personales
        recibirán, la forma en que dicho tratamiento de datos personales se efectuará, las partes encargadas del mencionado tratamiento y, en
        general, las medidas técnicas, organizativas y legales adoptadas a fin de garantizar la confidencialidad y seguridad en el tratamiento de sus
        datos personales.<br><br>

        <strong>b.)</strong> Las partes han obtenido el consentimiento y autorización libre, previo, informado, expreso e inequívoco de los titulares de tales datos
        personales.<br><br>

        <strong>c.)</strong> Los titulares de los datos personales objeto de tratamiento han sido debidamente informados de manera previa, sencilla, expresa,
        detallada e inequívoca sobre sus derechos de información, acceso, actualización, inclusión, rectificación, supresión, impedimento de
        suministro, oposición, tratamiento objetivo, tutela, indemnización, etc.<br><br>

        <strong>d.)</strong> Los titulares de los datos personales objeto de tratamiento han sido debidamente informados de manera previa, sencilla, expresa,
        detallada e inequívoca sobre los medios y/o canales a través de los cuales es posible el ejercicio de los derechos referidos en el literal
        anterior.
    </p>
    `
    },

    {
      id: 'vend-decimocuarto',
      title: 'Décimo cuarta: Confidencialidad',
      content: `
    <p class="mb-4">
        <span class="font-black">14.1.</span> El Seller acepta y reconoce por este acto el carácter esencial que tiene la obligación que aquí contrae y que guarda relación con la
        necesidad de mantener la más total y absoluta reserva y confidencialidad de todo cuanto pueda llegar a su conocimiento, o que pueda tener
        acceso en forma directa o indirecta y que tenga o pueda tener relación con los negocios o actividades particulares o generales de Lyrium, tanto
        durante la vigencia del Acuerdo y de los Términos y Condiciones Generales para Sellers, como luego de su terminación.
    </p>

    <p class="mb-4">
        En especial respecto de todo aquello relativo a términos y condiciones comerciales, asuntos de negocios, contratos, tecnología, proyectos,
        especificaciones de productos, plataformas, operativos, diseños, patentes, fórmulas, planes, secretos de manufacturas, know how, ideas
        comerciales, industriales e información técnica, y en general, sobre cualquier otra materia que guarde relación con el objeto del Acuerdo y de
        los Términos y Condiciones Generales para Sellers, o relacionada con los productos y/o servicios o el funcionamiento general de Lyrium y
        demás aspectos o información, sea cual fuere su naturaleza y que en definitiva, resulte ser de aquella información que es propia de Lyrium y
        que es de presumir que esta última no tiene interés alguno en que sea divulgada o aplicada por personas diferentes de aquellas a las cuales
        expresamente autorice para tal efecto.
    </p>

    <p class="mb-4">
        <span class="font-black">14.2.</span> En consecuencia, dicha información, de proceder, sólo podrá ser usada por el Seller durante la vigencia del Acuerdo y de los Términos y
        Condiciones Generales para Sellers, en la forma y condiciones necesarias para dar adecuado cumplimiento al mismo, y sujeto siempre a la
        obligación del Seller de informar de inmediato a Lyrium acerca de todo conflicto real o potencial de intereses que el Seller pueda tener o llegar
        a tener respecto de tal información en relación con actividades propias que él pueda actualmente o en el futuro prestar para otras entidades.
    </p>

    <p class="mb-4">
        <span class="font-black">14.3.</span> Asimismo, el Seller reconoce y acepta que la reserva y confidencialidad antes señalada subsistirá en forma permanente, indefinida e
        independiente de la vigencia o término del Acuerdo y de los Términos y Condiciones Generales para Sellers.
    </p>

    <p class="mb-4">
        <span class="font-black">14.4.</span> Asimismo, el Seller no podrá tener comunicación directa con el cliente, salvo en lo permitido de acuerdo con estos Términos y
        Condiciones Generales para Sellers, ni hacer propaganda o publicidad alguna, hacer ofertas u otras acciones no autorizadas por medio de los
        envíos de pedidos de Lyrium Biomarketplace.
    </p>

    <p class="mb-4">
        <span class="font-black">14.5.</span> Del mismo modo, una vez producido el término del Acuerdo y de los Términos y Condiciones Generales para Sellers, el Seller deberá
        restituir en un solo acto y en forma inmediata todos y cada uno de los documentos y demás información material que tenga y que sea de
        propiedad o guarde relación con actividades o asuntos propios de Lyrium.
    </p>

    <p class="mb-4">
        <span class="font-black">14.6.</span> Las partes entienden que lo precedentemente señalado es también aplicable a los trabajadores, empresas relacionadas, representantes
        y socios del Seller, y que éste debe tomar todas las medidas para que dichas personas estén permanentemente informadas y cumplan esta
        obligación de reserva y confidencialidad.
    </p>

    <p class="mb-4">
        En consecuencia, el Seller asumirá y responderá ante Lyrium por todo daño o perjuicio previsto o imprevisto que pueda afectar a este último y
        que directa o indirectamente emane como resultado de la falta de cumplimiento que él mismo y las personas ya nombradas puedan voluntaria
        o involuntariamente dar a la obligación de reserva y confidencialidad a que esta cláusula hace expresa referencia. Con tal finalidad, el Seller se
        obliga a firmar con las personas referidas los correspondientes convenios de tal manera de hacer extensivas a ellas las prohibiciones señaladas.
    </p>

    <p class="mb-4">
    <span class="font-black">14.7.</span> Con todo, no se considerará información confidencial aquella que:
</p>

<p class="mb-4 pl-4">
    <strong>a)</strong> sea de conocimiento del público o llegue a ser de conocimiento público por motivos no atribuibles a las partes;<br><br>

    <strong>b)</strong> haya estado con anterioridad en poder de la parte receptora de la información y esa parte posea registros tangibles de dicho conocimiento
    previo; o,<br><br>

    <strong>c)</strong> sea puesta de buena fe en conocimiento de la parte receptora por un tercero que tenga derecho a divulgar la misma.
</p>

<p class="mb-4">
    Si bien Lyrium podrá compartir información pública de los productos y servicios de los Sellers con terceros a fin de promocionar dichos
    productos y servicios y lograr el posicionamiento de su marca; deberá guardar estricta confidencialidad respecto a la información de los Sellers
    a la que tenga acceso que tenga carácter confidencial, ya sea de propiedad industrial, know how, data y cualquier otra información cuya
    entrega a terceros no autorizados podría causar daños a la empresa.
</p>

<p class="mb-4">
    En ese sentido, en caso improbable que Lyrium incurra en la transmisión de información sensible o privada del Seller o incurra en el
    incumplimiento debidamente acreditado de su deber de confidencialidad, el Acuerdo quedará resuelto de pleno derecho.
</p>
    `
    },

    {
      id: 'vend-decimoquinta',
      title: 'Décimo quinta: Relación entre las partes',
      content: `
    <p class="mb-4">
        <span class="font-black">15.1.</span> Las partes dejan constancia que la celebración del Acuerdo, así como la aplicación de los Términos y Condiciones Generales para Sellers,
        no corresponden a un Acuerdo de asociación entre Lyrium y el Seller, ni tampoco crea una asociación entre las partes.
    </p>

    <p class="mb-4">
        En ningún caso, el Acuerdo ni los presentes Términos y Condiciones Generales para Sellers podrán ser interpretados ni podrán conducir a la
        existencia de una relación de sociedad, joint venture, contrato de trabajo, ni ninguna otra relación de similar naturaleza. Los presentes
        Términos y Condiciones para Sellers, así como el correspondiente Acuerdo, no corresponden a un contrato de agencia comercial, corretaje ni
        comisión, y no podrán ser interpretados en forma tal que conduzca a la aplicación de dichas formas contractuales.
    </p>

    <p class="mb-4">
        A estos efectos, el Seller reconoce y acepta que tiene su propia infraestructura física, administrativa y financiera, siendo totalmente
        independiente de Lyrium.
    </p>

    <p class="mb-4">
        <span class="font-black">15.2.</span> Las partes dejan expresa constancia que estos Términos y Condiciones Generales para Sellers y el Acuerdo tienen únicamente como
        objeto lo indicado en la Cláusula Tercera del presente instrumento, que no originan vinculación alguna de subordinación o dependencia
        respecto de Lyrium, liberando el Seller a esta última, sus empresas matrices, subsidiarias y afiliadas, accionistas, directores, gerentes,
        funcionarios, representantes, empleados, asesores, subcontratistas y/o agentes, de toda responsabilidad al respecto y declarando a su vez,
        el Seller, que será el único responsable ante terceros por eventuales derechos que pudieren alegarse derivados de las leyes del trabajo,
        previsionales, de seguridad laboral, o de cualquier otra que tenga o pueda tener su origen en un contrato de trabajo, y que se alegue con
        motivo de los Términos y Condiciones Generales para Sellers o del Acuerdo que se celebre entre Lyrium y el Seller.
    </p>
    `
    },

    {
      id: 'vend-decimosexta',
      title: 'Décimo sexta: Publicidad de la plataforma',
      content: `
    <p class="mb-4">
        <span class="font-black">16.1.</span> Al formar parte de Lyrium Biomarketplace, el Seller concede a Lyrium una autorización expresa, amplia y no exclusiva para hacer uso de
        su marca con propósitos publicitarios, tanto dentro de la plataforma como en los canales digitales y redes sociales oficiales de Lyrium. Esta
        autorización tiene como objetivo potenciar la visibilidad de los productos del Seller y ampliar sus posibilidades de crecimiento comercial dentro
        del ecosistema Lyrium.
    </p>

    <p class="mb-4">
        <span class="font-black">16.2.</span> La integración de la marca del Seller dentro de la sección de marcas destacadas, ubicada en la página principal de la plataforma Lyrium
        Biomarketplace, donde se exhibe la marca de determinados Sellers, queda sujeta a la entera discreción de Lyrium, quien evaluará para tal
        efecto según su criterio. La inclusión en esta sección no implica costo adicional para el Seller ni genera derecho alguno a permanencia continua,
        pudiendo Lyrium modificar en cualquier momento los criterios de selección o las marcas exhibidas.
    </p>

    <p class="mb-4">
        <span class="font-black">16.3.</span> De forma independiente, la plataforma cuenta también con una sección de banners destacados dentro de su página principal. La
        integración de la marca del Seller en dicha sección sí requiere el pago de una tarifa publicitaria a favor de Lyrium, conforme a las condiciones
        comerciales que esta última establezca. Sin embargo, el Seller reconoce y acepta que dicho pago no garantiza la exhibición permanente ni
        exclusiva de su banner, ya que su presentación se sujeta a un sistema de horarios y cupos rotativos, mediante el cual los banners de los
        distintos Sellers participantes se muestran de forma alternada conforme a la disponibilidad y organización que Lyrium determine para dicha
        sección.
    </p>

    <p class="mb-4">
        <span class="font-black">16.4.</span> Adicionalmente, Lyrium pone a disposición del Seller la posibilidad de acceder a servicios de publicidad personalizados, independientes
        de las campañas generales de marketing de la plataforma. Estos servicios tienen un costo adicional y se rigen por las condiciones comerciales
        que Lyrium defina y comunique oportunamente para cada caso.
    </p>

    <p class="mb-4">
        <span class="font-black">16.5.</span> Para la creación del material visual necesario en el desarrollo de sus actividades publicitarias dentro de la plataforma, incluyendo
        imágenes de productos, banners, piezas promocionales y material para servicios, el Seller podrá optar por trabajar con el equipo de diseño
        gráfico y publicidad de Lyrium, o bien con su propio equipo creativo. En caso de elegir los servicios de diseño de Lyrium, estos estarán sujetos
        a las condiciones y tarifas que Lyrium establezca para tal efecto. Independientemente de la opción elegida, todo material producido deberá
        cumplir con los estándares y lineamientos gráficos definidos por Lyrium para su plataforma.
    </p>

    <p class="mb-4">
        <span class="font-black">16.6.</span> En cuanto al uso del material publicitario, Lyrium autoriza al Seller a difundir y compartir fuera de la plataforma el material publicitario
        dispuesto o alojado dentro de Lyrium Biomarketplace, incluyendo imágenes de productos, banners, piezas promocionales y material para
        servicios, ya sea que este haya sido elaborado por el equipo de diseño de Lyrium o por el propio equipo creativo del Seller, con el fin de
        promocionar su marca. Sin embargo, dicha autorización no faculta al Seller para modificar, editar, alterar o adaptar en ninguna forma el
        material que incorpore la marca LYRIUM, la cual deberá ser utilizada en todo momento tal y como fue originalmente dispuesta por Lyrium. Del
        mismo modo, el Seller podrá registrar en su tienda virtual, a través de Lyrium Biomarketplace, las direcciones de sitios web, redes sociales u
        otros canales propios con fines de identificación de marca. No obstante, queda expresamente prohibido que utilice la plataforma Lyrium
        Biomarketplace, su material publicitario o cualquier recurso derivado de esta como medio para incentivar, invitar o inducir a los usuarios a
        concretar compras en sitios web propios, tiendas externas u otras plataformas de comercio ajenas a Lyrium, ya sea de forma directa,
        mediante mensajes, códigos QR o cualquier otro mecanismo cuya finalidad sea desviar el tráfico o las transacciones fuera del entorno de
        Lyrium Biomarketplace.
    </p>
    `
    },

    {
      id: 'vend-decimoseptima',
      title: 'Décimo séptima: Ley aplicable y solución de controversias',
      content: `
    <p class="mb-4">
        En todo lo no previsto por las partes, ambas se someten por lo establecido por las normas relativas al contrato de comisión mercantil
        contenidas en el Código de Comercio, la Ley General de Sociedades y demás normas legales que resulten aplicables.
    </p>

    <p class="mb-4">
        La ley y el mecanismo de solución de controversias aplicable a estos Términos y Condiciones Generales para Sellers será aquel establecido en el
        Acuerdo. Las controversias que pudieran suscitarse en torno al presente Acuerdo, serán sometidas a los Tribunales y Jueces de Piura.
    </p>

    <p class="mb-4">
        Los presentes Términos y Condiciones para Sellers obligan a las partes en la totalidad de su contenido y se tendrán aceptados a la fecha de
        firma del Acuerdo por parte del Seller.
    </p>

    <p class="mb-4">
        En señal de conformidad con los términos y condiciones estipulados en este documento, ambas partes firman por duplicado este documento.
    </p>
    `
    }
  ]
};

export const termsConfigs: { [key: string]: TermsConfig } = {
  cliente: {
    subtitle: "TÉRMINOS Y CONDICIONES GENERALES APLICABLES A LOS CLIENTES",
    pdfLabel: "Descargar PDF Cliente",
    pdfHref: "/pdf/cliente.pdf",
    pdfName: "cliente.pdf"
  },
  vendedor: {
    subtitle: "TÉRMINOS Y CONDICIONES GENERALES APLICABLES A LOS VENDEDORES",
    pdfLabel: "Descargar PDF Vendedor",
    pdfHref: "/pdf/vendedor.pdf",
    pdfName: "vendedor.pdf"
  }
};
