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
        <div class="font-bold text-[#333333] mb-2">1.1 Información que recopilamos</div>
        <p class="mb-4">Los datos personales requeridos por el Marketplace, tales como nombres, apellidos, RUC (opcional), tipo de documento de identidad, número de documento de identidad, domicilio, departamento, provincia, número de contacto y correo electrónico serán de uso exclusivo del sitio para concretar las operaciones de compra y venta que el usuario desee realizar.</p>
        <p class="mb-4">La información que indirectamente nos proporcione, tales como cookies (preferencias del usuario cuando visite nuestra página web o redes sociales), direcciones IP, conexiones y sistemas de información; podrán ser usadas con el único fin de brindar una mejor experiencia al usuario y gestionar mejoras de productos/servicios.</p>
        <div class="font-bold text-[#333333] mb-2">1.2 Guardamos su información de manera segura</div>
        <p class="mb-4">El sitio guarda toda su información personal de forma segura y confidencial. Sólo personal autorizado podrá acceder a su información personal en cumplimiento de los términos y condiciones.</p>
        <div class="font-bold text-[#333333] mb-2">1.3 Finalidades del tratamiento</div>
        <p class="mb-4">Los datos personales que usted libremente proporciona serán tratados para: atender consultas, quejas, reclamos y hacer seguimiento; enviar información o publicidad sobre productos/servicios; invitar a participar en concursos/actividades; encuestas de satisfacción; administración interna; estudios de mercado; comercio electrónico; entrega de pedidos, entre otros.</p>
        <div class="font-bold text-[#333333] mb-2">1.4 Acceso y Transferencia</div>
        <p class="mb-4">El sitio podrá compartir con terceros sus datos personales bajo circunstancias limitadas (socios, proveedores de internet, administradores web, managers de redes sociales, call centers, mensajería, transportes, etc.) para cumplir finalidades antes descritas. También podrá facilitar información a organismos públicos o autoridades competentes si es requerido por ley.</p>
      `
    },
    {
      id: 'segundo-modificacion',
      title: 'Segundo: Modificación de los T&C',
      content: `
        <p class="mb-4">El sitio se reserva el derecho de actualizar y/o modificar los Términos y Condiciones del uso del Marketplace, poniéndolos a disposición de los usuarios para su conocimiento con el objetivo final de mejorar el servicio de nuestra comunidad.</p>
      `
    },
    {
      id: 'tercero-creacion-cuenta',
      title: 'Tercero: Creación de Cuenta',
      content: `
        <p class="mb-4">Para comprar productos y/o servicios en el sitio no es necesario estar registrado; sin embargo, aquel usuario que esté registrado o cree una cuenta podrá recibir beneficios adicionales.</p>
        <p class="mb-4">Un usuario podrá crear una cuenta completando el formulario que aparece en el sitio web. Al registrarse acepta que:</p>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li>Proveerá información básica y real sobre su persona/empresa.</li>
          <li>Actualizará esta información si cambia.</li>
          <li>Será responsable por la veracidad de la información y por mantener la confidencialidad de sus credenciales.</li>
        </ul>
      `
    },

        {
      id: 'cuarto-precios-promociones',
      title: 'Cuarto: Precios y Promociones',
      content: `
        <p class="mb-4">Las ofertas de productos y servicios estarán sujetas al stock de unidades disponibles, así como al período de vigencia detallado en el mismo
        sitio web. Cuando en una promoción no se indique una fecha determinación se en tenderá que la oferta se extenderá hasta el agotamiento de
        los inventarios correspondientes. </p>

        <p class="mb-4">Los precios de los productos y servicios disponibles en lyriumbiomarketplace.com sólo tendrán vigencia y aplicación en este sitio weby y sus
        redes sociales y no necesariamente serán aplicables a otros canales de venta utilizados por las empresas vendedoras, tales como tiendas
        físicas, venta telefónica, otros sitios de venta por vía electrónica, catálogos u otros. Los precios de los productos y servicios ofrecidos en
        lyriumbiomarketplace.com están expresados en soles peruanos salvo que se manifieste lo contrario, en cuyo caso se utilizará el tipo de
        cambio de SUNAT. Los precios ofrecidos corresponden exclusivamente al valor del bien y servicio ofrecido y no incluyengastos de transporte,
        manejo, envío, accesorios u otro ítem adicional.
        </p>

        <p class="mb-4">Las empresas vendedoras podrán modificar cualquier información contenida en lyriumbiomarketplace.com incluyendo las relacionadas con sus
        mercaderías, servicios, precios, existencias y condiciones, en cualquier momento y sin previo aviso, hasta el momento de recibir una
        aceptación de compra.
        </p>
      `
    },
    {
      id: 'quinto-metodo-pago',
      title: 'Quinto: Método de Pago',
      content: `
        <p class="mb-4">Los productos y servicios ofrecidos sólo podrán ser pagados bajo la modalidad de pago en línea. Los pagos en línea son procesados por una pasarela de pagos; el uso de tarjetas se sujetará a lo establecido por su banco emisor y al marco contractual correspondiente.</p>
        <p class="mb-4">Los reembolsos por devoluciones se realizarán a través del mismo medio de pago utilizado, sujeto a las políticas del banco emisor.</p>
      `
    },
    {
      id: 'sexto-consentimiento',
      title: 'Sexto: Formación del Consentimiento',
      content: `
        <p class="mb-4">Las empresas vendedoras realizan ofertas de bienes y servicios que pueden concretarse mediante la aceptación del usuario (en línea) y usando los mecanismos del sitio. Toda aceptación quedará sujeta a la condición suspensiva de validación de la transacción por parte del sitio.</p>
      `
    },
    {
      id: 'septimo-envios',
      title: 'Séptimo:  Envíos',
      content: `
        <p class="mb-4">El sitio permite despachos a nivel nacional de productos. Estos estarán sujetos a las políticas de despacho de cada empresa vendedora. La accesibilidad de destinos será identificada por el usuario al momento de comprar.</p>
      `
    },
    {
      id: 'octavo-devoluciones',
      title: 'Octavo: Devoluciones',
      content: `
        <p class="mb-4">Los procedimientos de devoluciones de cada artículo o producto están sujetos a las decisiones de cada empresa vendedora del Marketplace LYRIUM.</p>
      `
    },
    {
      id: 'noveno-reembolsos',
      title: 'Noveno: Reembolsos',
      content: `
        <p class="mb-4">Los procedimientos de reembolso de cada producto y/o servicio están sujetos a las decisiones de cada empresa vendedora del Marketplace LYRIUM.</p>
      `
    },
    {
      id: 'decimo-exoneracion',
      title: 'Décimo: Exoneración de Responsabilidad',
      content: `
        <p class="mb-4">LYRIUM se constituye como un Marketplace que reúne a vendedores y compradores; por tanto, no será responsable de las características del producto adquirido, su envío y/o despacho, los cuales corresponden a la empresa vendedora.</p>
      `
    }
  ],
  vendedor: [
    {
      id: 'vend-primero',
      title: 'Primero: Antecedentes Generales',
      content: `
        <p class="mb-4"><span class="font-black">1.1.</span> LYRIUM E.I.R.L (en adelante, “Lyrium”) es una sociedad constituida conforme a las leyes de la República del Perú, dentro de cuyo objeto
           social se encuentra la comercialización de productos y servicios de terceros en el rubro de bienestar y salud. Para estos efectos, Lyrium ha
           desarrollado una plataforma denominada “Lyrium Biomarketplace” (en adelante, “Lyrium Biomarketplace”), alojada en el sitio web de
           titularidad exclusiva de Lyrium, www.lyriumbiomarketplace.com (enadelante, el “SitioWeb”). La plataforma Lyrium Biomarketplace es puesta
           a disposición de aquellos proveedores (en adelante, cada uno de ellos un “Seller”, y conjuntamente, los “Sellers”), dedicados a la
           comercialización de productos y servicios del rubro de bienestar y salud dentro del territorio nacional, que son autorizados por Lyrium para
           que, por medio de su utilización y usufructo, y por cuenta propia y riesgo exclusivo, realicen la comercialización directa en el Perú de productos
           y servicios de su propiedad a los consumidores que visiten el Sitio Web.
        </p>
        <p class="mb-4">
        <span class="font-black">1.2.</span> En este sentido, una vez que el Seller sea autorizado por Lyrium a ser registrado como proveedor facultado a comercializar productos y
           servicios de su propiedad en el Sitio Web, Lyrium pondrá a su disposición la plataforma Lyrium Biomarketplace, la cual le permitirá: </p>
        <p class="mb-4 pl-4">
        <strong>(i)</strong> vender productos y servicios de su propiedad a favor de terceros (consumidores);<br>
        <strong>(ii)</strong> tramitar órdenes de compra realizadas por los consumidores respecto de uno o más productos y servicios en particular; y<br>
        <strong>(iii)</strong> revisar y monitorear las órdenes de compra que reciba de los consumidores, de manera que puedan identificar qué productos y servicios fueron requeridos y acceder a información de los clientes.
        </p>
        <p class="mb-4">
    <span class="font-black">1.3.</span> Los servicios que prestará Lyrium a favor de los Sellers en relación con la utilización de Lyrium Biomarketplace son los siguientes, los
    mismos que resultan necesarios para gestionar una adecuada comercialización de los productos en el Sitio Web, a través de Lyrium
    Biomarketplace, bajo los estándares establecidos por Lyrium (todos ellos en adelante denominados, los “Servicios”):
</p>

<p class="mb-4 pl-4">
    <strong>a.)</strong> Brindar al Seller un espacio virtual de modo que pueda promocionar y facilitar el aumento de sus ventas de una manera ágil.<br><br>

    <strong>b.)</strong> Brindar al Seller la capacidad de administrar y gestionar la venta de sus productos y/o servicios a través de la plataforma Lyrium
    Biomarketplace mediante un panel de control del Seller.<br><br>

    <strong>c.)</strong> Coordinar el servicio de post-venta (devolución, cambio o garantía de los productos) requerido por un consumidor al Seller, en relación con
    uno o más productos que hubieran sido adquiridos en el Sitio Web, a través de la modalidad Lyrium Biomarketplace. Sin perjuicio de lo
    señalado, el Seller reconoce que la responsabilidad por la adecuada y oportuna ejecución del servicio de post-venta es de su exclusiva
    responsabilidad. Lyrium no se responsabilizará por gestiones ni actos de devolución, reembolso, cambio o reposición de productos,
    realizando únicamente funciones de coordinación post-venta.<br><br>

    <strong>d.)</strong> Sugerir políticas o lineamientos de calidad, innovación y post-venta con la finalidad de mejorar el desempeño de los Sellers.<br><br>

    <strong>e.)</strong> Garantizar la seguridad de su plataforma Lyrium Biomarketplace para las ventas de los productos y servicios del Seller (mediante el
    soporte de las empresas HOSTINGER e IZIPAY). Dicha seguridad se circunscribe únicamente al uso dentro de la plataforma, por lo que
    cualquier direccionamiento que realice el Seller a otras plataformas o medios de pago exime de responsabilidad a Lyrium, además de
    constituir causal automática de resolución.<br><br>

    <strong>f.)</strong> Realizar campañas globales de marketing para promocionar la plataforma Lyrium Biomarketplace, pudiendo acordarse la realización de
    planes de promoción específicos respecto de un determinado Seller, en cuyo caso Lyrium determinará el monto que el respectivo Seller
    deba pagar por este concepto.<br><br>

    <strong>g.)</strong> Realizar una capacitación básica al Seller en el uso de su plataforma Lyrium Biomarketplace.

    <strong>h.)</strong> Brindar el servicio de recaudación de pagos a través de su plataforma Lyrium Biomarketplace.<br><br>

    <strong>i.)</strong> Lyrium se obliga a emitir un comprobante de pago (boleta o factura) por cada compra efectiva realizada por el consumidor sobre algún
    producto y/o servicio del Seller, en el cual se indica la comisión cobrada por Lyrium por concepto de uso de la plataforma Lyrium
    Biomarketplace. Este comprobante será enviado al correo electrónico que el Seller hubiera registrado en la plataforma.<br><br>

    <strong>j.)</strong> Cumplir con el pago del precio de los productos y servicios del Seller vendidos cada semana de la siguiente manera: cada lunes, durante la
    vigencia del contrato, se revisarán las ventas realizadas por el Seller durante la semana anterior y el total de ingresos de dichas ventas, menos
    la comisión respectiva, será pagado a la cuenta bancaria registrada por el Seller en un plazo máximo de tres (03) días hábiles (miércoles de cada
    semana), mediante transferencia bancaria o a través de los aplicativos Yape empresarial y/o Plin empresarial.<br><br>

    <strong>k.)</strong> Una vez realizado el registro del Seller en la plataforma Lyrium Biomarketplace, Lyrium brindará automáticamente un correo con el dominio
    nombre de la marca del seller@lyriumbiomarketplace.com, con el cual el Seller podrá iniciar sesión y al cual se remitirán los detalles y
    comprobantes de pago de las ventas realizadas en la plataforma.<br><br>

    <strong>l.)</strong> Lyrium también ofrece múltiples beneficios adicionales a los anteriormente mencionados al Seller, de acuerdo al plan suscrito (Plan Crece,
    Plan Especial). </p>
      `
    },

    {
      id: 'vend-segundo',
      title: 'Segundo: Alcance de los términos y condiciones generales',
      content: `
    <p class="mb-4">
        <span class="font-black">2.1.</span> Los presentes Términos y Condiciones Generales aplicables a los Sellers - lyriumbiomarketplace.com (en adelante, los “Términos y
        Condiciones Generales para Sellers”), se aplicarán a todos aquellos acuerdos específicos celebrados para la utilización de la plataforma virtual
        y la prestación de servicios, suscritos entre Lyrium y cada uno de los Sellers, y constituirán parte integrante de dichos acuerdos para todos los
        efectos aplicables. En adelante, cada uno de dichos acuerdos suscritos entre Lyrium y cada uno de los Sellers será referido como el “Acuerdo”.
    </p>

    <p class="mb-4">
        <span class="font-black">2.2.</span> El Seller declara que ha leído, entiende y acepta todas las condiciones establecidas en este documento, por lo que la suscripción del
        Acuerdo implicará su aceptación a estos Términos y Condiciones Generales para Sellers, requisito indispensable para el inicio de la relación
        contractual entre Lyrium y el Seller, la ejecución del Acuerdo y la comercialización de los productos y servicios del Seller en el Sitio Web, a
        través de Lyrium Biomarketplace.
    </p>

    <p class="mb-4">
        Para estos efectos, el Seller acepta de forma anticipada que cualquier modificación que Lyrium realice a los Términos y Condiciones Generales
        para Sellers le resultará aplicable, y se entenderá incorporada al Acuerdo al día siguiente de ser comunicada al Seller por parte de Lyrium, a
        través de la plataforma Lyrium Biomarketplace o mediante correo electrónico a su Administrador del Acuerdo.
    </p>

    <p class="mb-4">
        En caso que el Seller no esté de acuerdo con las modificaciones incorporadas, tendrá derecho a resolver el Acuerdo, procediéndose luego al
        cierre de su cuenta como Seller en Lyrium Biomarketplace.
    </p>

    <p class="mb-4">
        <span class="font-black">2.3.</span> El Seller reconoce y acepta que las disposiciones de estos Términos y Condiciones Generales para Sellers, así como las disposiciones del
        Acuerdo, son aplicables única y exclusivamente para la utilización de la plataforma Lyrium Biomarketplace para la comercialización de
        productos y servicios en el territorio nacional o República del Perú.
    </p>
    `
    },

    {
      id: 'vend-tercero',
      title: 'Tercero: Utilización de la plataforma virtual y prestación de los servicios',
      content: `
    <p class="mb-4">
        <span class="font-black">3.1.</span> Sujeto a la celebración del Acuerdo: (i) Lyrium autorizará al Seller a que éste quede registrado como proveedor facultado a comercializar
        en el Sitio Web, a través de Lyrium Biomarketplace, bajo los términos y condiciones establecidos en el Acuerdo y en estos Términos y
        Condiciones Generales para Sellers, únicamente los productos y/o servicios de su propiedad aprobados por Lyrium y detallados en el Acuerdo
        (en adelante, los “Productos y Servicios”); (ii) Lyrium prestará a favor del Seller los Servicios; y (iii) el Seller se obligará a comercializar los
        Productos y/o Servicios de su propiedad en el Sitio Web, por medio de la utilización de la plataforma Lyrium Biomarketplace.
    </p>

    <p class="mb-4">
        <span class="font-black">3.2.</span> El Seller deberá cumplir con todas y cada una de las obligaciones derivadas de los Términos y Condiciones Generales para Sellers y del
        Acuerdo, así como aquellas que se deriven de toda norma de carácter legal o reglamentaria aplicable a la comercialización de los Productos,
        empleando la máxima diligencia en su calidad de proveedor profesional.
    </p>

    <p class="mb-4">
        <span class="font-black">3.3.</span> El Seller declara y garantiza a Lyrium que cuenta con la organización propia, experiencia, calificación, condiciones y capacidades, así como
        con la infraestructura, recursos financieros, técnicos y materiales, el personal calificado y, en general, con todos los recursos necesarios para
        comercializar sus Productos y/o Servicios en el Sitio Web, a través de Lyrium Biomarketplace, de manera integral, autónoma e independiente,
        bajo su cuenta, costo y riesgo, cumpliendo en tiempo y forma con todas sus obligaciones, y en especial, pero sin limitarse a, las órdenes de
        compra que reciba.
    </p>

    <p class="mb-4">
        Se deja expresa constancia que esta circunstancia y declaración ha sido determinante para Lyrium para celebrar el Acuerdo.
    </p>
    `
    },

    {
      id: 'vend-cuarto',
      title: 'Cuarto: Generalidades',
      content: `
    <p class="mb-4">
        <span class="font-black">4.1.</span> Generalidades
    </p>

    <p class="mb-4">
        <span class="font-black">4.1.1.</span> La comercialización de Productos a través del Sitio Web por medio de la plataforma Lyrium Biomarketplace, así como la relación de
        consumo generada a partir de dicha comercialización, será realizada directamente entre el Seller y el consumidor, y corresponderá únicamente
        al Seller y al respectivo consumidor interesado en la adquisición de uno o más Productos y/o Servicios ofrecidos por el Seller. En consecuencia,
        el contrato de compraventa que surja como consecuencia de la comercialización de los Productos vinculará únicamente al Seller y dicho
        consumidor.
    </p>

    <p class="mb-4">
        En consecuencia, será obligación única y exclusiva del Seller cumplir debida y oportunamente con las obligaciones contenidas en la Ley N° 29571,
        Código de Protección y Defensa del Consumidor, o cualquier norma concordante, complementaria, modificatoria y/o sustitutoria (en adelante, el
        “CPC”), dentro de las cuales se señalan las siguientes, a modo enunciativo y no limitativo:
    </p>

    <p class="mb-4 pl-4">
        <strong>a.)</strong> Cumplir con el mínimo de ventas indicado por Lyrium después de un (01) mes de ser reconocido como vendedor registrado en la plataforma
        Lyrium Biomarketplace.<br><br>

        <strong>b.)</strong> Responder por la idoneidad y calidad de los Productos y/o Servicios ofrecidos en el Sitio Web, a través de Lyrium Biomarketplace; por la autenticidad de las marcas y leyendas que exhiben sus Productos y/o Servicios; por la falta de conformidad 
        entre la publicidad comercial de los Productos y/o Servicios y estos; así como por el contenido y la vida útil del Producto indicado en el envase, en lo que corresponda..<br><br>

        <strong>c.)</strong> Brindar a sus clientes, a través del Sitio Web, información en idioma castellano veraz, oportuna, suficiente, fácilmente accesible, comprensible, visible, 
        diferenciable y relevante para tomar una decisión o realizar una elección de consumo o efectuar un uso o consumo adecuado de los Productos y/o Servicios.<br><br>

        <strong>d.)</strong> Excluir de la información que traslade a los consumidores, a través del Sitio Web mediante la plataforma Lyrium Biomarketplace u otros medios, aquella que induzca al consumidor al error respecto a la naturaleza, origen, modo de fabricación, componentes, 
        usos, volumen, peso, medidas, precio, forma de empleo, características, propiedades, idoneidad, cantidad, calidad o cualquier otro dato o característica de los Productos.<br><br>

        <strong>e.)</strong> Indicar, a través del Sitio Web mediante la plataforma Lyrium Biomarketplace, en forma destacada, el precio total de los Productos y/o Servicios, en moneda nacional, el cual debe incluir tributos, comisiones y cargos aplicables. Los consumidores no podrán ser obligados al pago de sumas o recargos adicionales al precio fijado, 
        salvo que se trate de servicios distintos o adicionales tales como transporte, instalación o similares, cuya retribución no se encuentre en el precio.<br><br>

        <strong>f.)</strong> Trasladar a los consumidores la información relacionada con los ingredientes, los componentes, las condiciones de las garantías, 
        los manuales de uso, las advertencias y los riesgos previsibles de los Productos, así como los cuidados a seguir en caso de que se produzca un daño.<br><br>

        <strong>g.)</strong> En el caso de la producción, fabricación, ensamble, importación, distribución o comercialización de Productos respecto de los que no se brinde el suministro oportuno de partes y accesorios o servicios de reparación y mantenimiento, 
        o en los que dichos suministros o servicios se brinden con limitaciones, el Seller deberá informar de tales circunstancias de manera clara e inequívoca al consumidor.<br><br>

        <strong>h.)</strong> Cuando existan condiciones y restricciones de acceso a los Productos y/o Servicios comercializados en el Sitio Web a través de la plataforma Lyrium Biomarketplace, estas deberán ser claras y suficientemente informadas a los consumidores.<br><br>

        <strong>i.)</strong> No emplear métodoso mecanismos contractuales y/o comerciales abusivos o coercitivos ni, en general, ninguna práctica análoga.<br><br>

        <strong>j.)</strong> Comercializar los Productos y/o Servicios garantizando un trato justo, honesto, humano, empático y asertivo, transparente y equitativo en toda transacción comercial, 
        sin mediar acto o medida que importe discriminación de ningún tipo.<br><br>

        <strong>k.)</strong> Reponer, reparar y/o devolver los Productos adquiridos conforme al CPC, brindando un servicio diligente y utilizando componentes o
        repuestos nuevos y apropiados para el Producto o servicio del que se trate. <br><br>

        <strong>l.)</strong> Atender los reclamos presentados por sus consumidores y dar respuesta a los mismos en el plazo legal. Para dicho fin, como parte del Sitio
        Web, Lyrium pondrá a disposición de los consumidores un libro de reclamaciones del Seller, de conformidad con lo establecido en el Reglamento
        del Libro de Reclamaciones del Código de Protección al Consumidor, aprobado mediante Decreto Supremo No. 011-2011-PCM, o de cualquier
        norma que lo modifique. La responsabilidad de atender los reclamos presentados por los consumidores de forma adecuada y oportuna es
        exclusiva de los Sellers, en tanto la relación de consumo desarrollada a través del Sitio Web involucra a los Sellers y sus consumidores como
        partes, siendo que Lyrium no forma parte de dicha relación. Lyrium no tiene responsabilidad alguna respecto de la atención del reclamo del
        cliente, ni respecto del funcionamiento del libro de reclamaciones del Seller, ni la procedencia de estos.<br><br>

        <strong>m.)</strong> En el caso específico de empresas de servicios, el Seller queda obligado a brindar el servicio contratado en la fecha y hora programadas,
        debiendo coordinar con el cliente final cualquier reprogramación en la cita a fin de garantizar su completa satisfacción respecto a la marca
        Lyrium mediante el uso de la plataforma Lyrium Biomarketplace.
    </p>

    <p class="mb-4">
    <span class="font-black">4.1.2.</span> Todos los Productos y/o Servicios que sean ofrecidos por el Seller a través del Sitio Web utilizando la plataforma Lyrium Biomarketplace,
    deberán ser productos nuevos y servicios con implementos nuevos, cuya comercialización esté permitida por las leyes de la República de Perú,
    y deberán cumplir con todas las disposiciones legales aplicables vigentes para ser debidamente comercializados.
</p>

<p class="mb-4">
    <span class="font-black">4.1.3.</span> El Seller tendrá acceso a la plataforma Lyrium Biomarketplace a través de un correo corporativo y contraseña a ser asignados por Lyrium.
    El Seller se obliga a hacer uso de dicho correo corporativo y contraseña únicamente para la comercialización de los Productos y/o Servicios,
    siguiendo en todo momento los lineamientos y directrices para el uso de la plataforma Lyrium Biomarketplace, los mismos que el Seller declara
    conocer y aceptar mediante la suscripción del Contrato. El correo corporativo, la contraseña y toda la información contenida dentro de la
    plataforma Lyrium Biomarketplace a la que el Seller tendrá acceso con ocasión del Contrato y la comercialización de los Productos y/o Servicios,
    será considerada información confidencial protegida de acuerdo con las disposiciones de la Cláusula Décimo Cuarta de estos Términos y
    Condiciones Generales para Sellers.
</p>

<p class="mb-4">
    <span class="font-black">4.2.</span> Entrega de información
</p>

<p class="mb-4">
    <span class="font-black">4.2.1.</span> El Seller cargará al correo corporativo de Lyrium un catálogo con los Productos y/o Servicios que desee comercializar en la misma.
    Este catálogo deberá incluir la siguiente información respecto de los Productos y/o Servicios, de acuerdo con las características y especificaciones
    requeridas por la plataforma Lyrium Biomarketplace: nombre y tipo de Producto y/o Servicio a ofrecer, una o más fotografías o imágenes del
    mismo, precio en Soles (S/) incluidos los impuestos correspondientes, descripción del Producto, condiciones o manuales de uso,
    especificaciones técnicas, número de unidades disponibles, costo de despacho en caso lo amerite, política de cambio, devolución o reposición y
    garantía (la cual deberá tomar en cuenta los lineamientos de Lyrium para la comercialización de sus productos en su página web, y que el Seller
    declara conocer y aceptar mediante la suscripción del Contrato), así como cualquier otra información necesaria para una adecuada comprensión
    del Producto por parte de los consumidores.
</p>

<p class="mb-4">
    Luego de ello, Lyrium iniciará un proceso de verificación con la finalidad de determinar si el Producto podrá ser comercializado o no en la
    plataforma Lyrium Biomarketplace, y si la información proporcionada por el Seller cumple con los requerimientos de la plataforma. En dicho
    caso, a solo criterio de Lyrium:
</p>

<p class="mb-4 pl-4">
    <strong>a.)</strong> Si la información relativa a un Producto y/o Servicio cumple con los estándares mínimos establecidos por Lyrium, éste podrá aprobar que el
    Producto y/o Servicio sea puesto a disposición de los consumidores en el Sitio Web, a través de la plataforma Lyrium Biomarketplace; o,<br><br>

    <strong>b.)</strong> Si la información relativa a un Producto y/o Servicio está incompleta o no cumple con los estándares mínimos establecidos por Lyrium, éste
    podrá rechazar la información proporcionada por el Seller o solicitar información adicional respecto de este optando por rechazar la publicación
    y comercialización de dicho Producto y/o Servicio en el Sitio Web. En tal caso, el Seller deberá complementar la información de acuerdo con los
    requerimientos que le sean indicados por Lyrium.<br><br>

    <strong>c.)</strong> Una vez verificados y aceptados los productos y/o servicios del Seller, éste se obliga a cumplir con las especificaciones técnicas de carga,
    establecidas por Lyrium, de las imágenes, banners, logotipos, etc. de los productos y/o servicios que ofrecerá en Lyrium mediante la
    plataforma Lyrium Biomarketplace.<br><br>

    <strong>d.)</strong> Sin perjuicio de lo señalado, en todos los casos Lyrium siempre podrá, sobre la base de sus decisiones comerciales, rechazar la publicación y
    comercialización en el Sitio Web, de uno o más Productos y/o Servicios a ser ofrecidos por el Seller, lo que no generará responsabilidad ni pago
    alguno por parte de Lyrium a favor del Seller o de cualquier tercero.
</p>
<p class="mb-4">
    <span class="font-black">4.2.2.</span> Cada vez que el Seller requiera incluir un nuevo Producto y/o Servicio en la plataforma Lyrium Biomarketplace para su comercialización a
    terceros, deberá seguir el procedimiento detallado en el numeral 4.2.1 anterior.
</p>

<p class="mb-4">
    <span class="font-black">4.2.3.</span> Será responsabilidad única y exclusiva del Seller mantener actualizada la información relativa a los Productos y/o Servicios que éste
    ofrezca en el Sitio Web a través de Lyrium Biomarketplace. Por consiguiente, el Seller deberá actualizar la información relativa a los Productos
    y/o Servicios publicitados en el Sitio Web.
</p>

<p class="mb-4">
    Cuando el Seller modifique la información de los Productos y/o Servicios en la plataforma Lyrium Biomarketplace, los cambios de precio y
    número de unidades disponibles (stock) de los Productos y/o Servicios éstos serán actualizados una vez que Lyrium informe al Seller que el
    cambio procedió de manera satisfactoria. Cualquier otro cambio respecto de la información de los Productos y/o Servicios deberá ser
    previamente aprobado por Lyrium.
</p>

<p class="mb-4">
    El Seller declara conocer que en caso de modificación, ya sea resultante de una actualización en el Producto y/o Servicio o de un error atribuible
    al Seller en la información relativa a los Productos y/o Servicios, no podrán afectar a los Productos y/o Servicios que ya hayan sido vendidos,
    de manera previa a la recepción del correo de confirmación de cambio enviado por Lyrium.
</p>

<p class="mb-4">
    <span class="font-black">4.2.4.</span> Toda información dada a conocer por el Seller en el Sitio Web mediante la plataforma Lyrium Biomarketplace deberá respetar las
    directrices y lineamientos que sean informados por Lyrium, no pudiendo, a modo meramente ejemplar y no limitativo, realizar publicidad falsa
    o engañosa respecto de los Productos y/o Servicios ofrecidos en el Sitio Web, publicar precios o descripciones incorrectas de los Productos y/o
    Servicios, ofrecer Productos y/o Servicios que no estén actualmente disponibles, efectuar publicidad comparativa o peyorativa de la idoneidad
    de los Productos y/o Servicios ofrecidos por Lyrium o por otros Sellers en la plataforma Lyrium Biomarketplace y/o en el Sitio Web o en otros
    portales de Internet, ni tampoco de la identidad de dichos Sellers o de Lyrium, entre otros.
</p>

<p class="mb-4">
    <span class="font-black">4.2.5.</span> A no manipular el sitio web y/o direccionar las ventas iniciadas en la plataforma Lyrium Biomarketplace a otra plataforma.
</p>

<p class="mb-4">
    <span class="font-black">4.2.6.</span> A no colocar en su espacio de tienda dentro de la plataforma Lyrium Biomarketplace ningún tipo de publicidad de otras plataformas y/o
    formas de contactar con el Seller y cualquier información que no guarde relación con la venta de productos y/o servicios registrados en la
    plataforma Lyrium Biomarketplace.
</p>

<p class="mb-4">
    <span class="font-black">4.2.7.</span> Lyrium no asumirá responsabilidad por la información incorrecta recibida e incluida en el Sitio Web a través de la plataforma Lyrium
    Biomarketplace, por lo que es entera responsabilidad del Seller revisar constantemente todo lo referente a sus Productos y/o Servicios,
    órdenes de compra, stock, precios, entre otros, liberando de responsabilidad a Lyrium.
</p>

<p class="mb-4">
    <span class="font-black">4.2.8.</span> Lyrium podrá solicitar al Seller, en cualquier momento durante la vigencia del Contrato, cualquier tipo de información que considere
    conveniente respecto a los Productos y/o Servicios.
</p>

<p class="mb-4">
    <span class="font-black">4.3.</span> Precio de los Productos y eventos promocionales
</p>

<p class="mb-4">
    <span class="font-black">4.3.1.</span> El precio de venta de los Productos y/o Servicios en el Sitio Web, a través de Lyrium Biomarketplace, será determinado libremente por el
    Seller y deberá incluir IGV y demás impuestos aplicables.
</p>

<p class="mb-4">
    <span class="font-black">4.3.2.</span> Los precios de venta de los productos y/o servicios ofertados por el Seller en Lyrium a través de la plataforma Lyrium Biomarketplace
    deberán ser expresados en moneda nacional perteneciente a la República del Perú.
</p>

<p class="mb-4">
    <span class="font-black">4.3.3.</span> El Seller podrá participar en los eventos promocionales que realice Lyrium en el Sitio Web, tales como Día de la Madre, Black Friday, 
    Navidad, etc. En este caso, Lyrium y el respectivo Seller definirán de común acuerdo los descuentos que se aplicarán a los Productos y/o Servicios comercializados por el Seller durante los eventos promocionales y qué Productos y/o Servicios participarán de los eventos antes referidos.<br><br>
    El Seller podrá también realizar los descuentos y promociones que considere convenientes en cualquier momento, respecto de los Productos
    y/o Servicios ofrecidos en el SitioWeb, através de Lyrium Biomarketplace.
</p>

<p class="mb-4">
    <span class="font-black">4.3.4.</span> En cualquier caso, la información referida a los descuentos y promociones de los Productos a los que se refiere el presente numeral, 
    así como las condiciones, términos, vigencia y restricciones de acceso, serán debida y oportunamente trasladadas a los consumidores, siendo obligación del Seller informar oportunamente respecto de dichos descuentos y promociones a Lyrium e incluir dicha información en la plataforma Lyrium Biomarketplace de acuerdo a los procedimientos indicados en el numeral 4.2 anterior.
</p>

<p class="mb-4">
    <span class="font-black">4.4.</span> Órdenes de compra y despacho de Productos
</p>

<p class="mb-4">
    <span class="font-black">4.4.1.</span> Toda orden de compra realizada por los consumidores respecto de uno o más Productos y/o Servicios publicados en el Sitio Web a través
    de Lyrium Biomarketplace será puesta en conocimiento del Seller para su procesamiento a través de la plataforma Lyrium Biomarketplace.
    Dicha comunicación es realizada a través de pasarelas contratadas por Lyrium, por lo que en el supuesto en el que exista una falla en dicha
    comunicación, no existirá responsabilidad para Lyrium. Para estos efectos, la plataforma Lyrium Biomarketplace recibirá la orden de compra
    realizada por el consumidor y enviará una notificación al Seller, indicándole los datos específicos de la orden de compra (tales como el tipo de
    Producto, cantidad, precio pagado y datos del cliente) para que éste inicie el proceso de confirmación de dicha orden.
</p>

<p class="mb-4">
    Paralelamente, la plataforma Lyrium Biomarketplace enviará también una notificación a Lyrium con el detalle de la orden de compra a efectos
    de que Lyrium pueda hacer el seguimiento de esta y evaluar el cumplimiento de las distintas obligaciones que correspondan por parte del
    Seller.
</p>

<p class="mb-4">
    <span class="font-black">4.4.2.</span> Remitida una orden de compra al Seller, éste dispondrá de un plazo máximo de 24 horas para cumplir con lo siguiente:
</p>

<p class="mb-4 pl-4">
    <strong>a)</strong> Aceptar la orden de compra, informando al consumidor sobre el particular en el más breve plazo posible.<br><br>

    <strong>b)</strong> Coordinar el despacho, mas no la entrega, de los Productos y/o Servicios a los consumidores, obligándose a cumplir con el plazo de entrega
    que hubiere sido informado al consumidor al momento del envío de la aceptación de la orden de compra. En este sentido, el Seller será el único
    responsable por la coordinación y envío de los mismos desde su lugar de origen al domicilio de los consumidores, no existiendo para Lyrium
    responsabilidad alguna en el proceso de coordinación, despacho y entrega de los Productos.
</p>

<p class="mb-4">
    Lyrium estará facultado a supervisar que el envío de los Productos y realización de los Servicios sea realizado de acuerdo con los estándares
    establecidos, no siendo responsable en relación con ningún aspecto del despacho y entrega del Producto.
</p>

<p class="mb-4">
    <span class="font-black">4.4.3.</span> El Seller deberá utilizar en el despacho de los Productos los medios que aseguren una adecuada protección de los bienes a ser
    transportados, tales como cajas o bolsas debidamente acondicionadas para el traslado de los bienes y otros elementos de seguridad según el
    tipo de Producto de que se trate. El Seller se obliga a entregar los Productos en perfectas condiciones, dando cumplimiento a las condiciones
    técnicas ofrecidas y en perfecto funcionamiento.
</p>

<p class="mb-4">
    <span class="font-black">4.4.4.</span> Será obligación del Seller realizar la entrega de los productos y/o servicios, en el plazo consignado en la plataforma Lyrium
    Biomarketplace.
</p>

<p class="mb-4">
    <span class="font-black">4.4.5.</span> Será obligación del Seller monitorear en todo momento el estado de despacho de los Productos a los consumidores hasta su completa
    entrega en los domicilios correspondientes, e informar al respecto a los consumidores que así lo solicitaren, ya sea a través de la plataforma
    Lyrium Biomarketplace o a través del contacto directo entre el Seller y los consumidores. La comunicación que exista entre el Seller y el
    consumidor solo tendrá como objetivo dar a conocer el estado del despacho o información sobre la entrega del Producto y/o programación del
    Servicio.
</p>

<p class="mb-4">
    Sin perjuicio de lo anterior, Lyrium, a través de la plataforma Lyrium Biomarketplace, podrá supervisar el proceso de coordinación de despacho
    de los Productos y/o Servicios hasta su entrega efectiva en el domicilio del consumidor, revisando que la información acerca del proceso de
    despacho y entrega del Producto y/o Servicio se mantenga actualizada en la plataforma Lyrium Biomarketplace, a efectos de que los
    consumidores puedan contar con dicha información si así lo requirieren.
</p>

<p class="mb-4">
    Esta información será utilizada por Lyrium para medir el cumplimiento del Seller de las obligaciones previstas en estos Términos y Condiciones
    Generales para Sellers y en el Acuerdo, y determinar las eventuales penalidades que correspondan.
</p>

<p class="mb-4">
    <span class="font-black">4.4.6.</span> Junto con la entrega de los Productos, se deberá enviar a los consumidores una copia del comprobante de pago debidamente emitido
    con los datos de identificación del Seller que acredite su compra, así como cualquier otro documento tributario que deba emitirse de acuerdo
    con la legislación aplicable. El comprobante de pago será emitido directamente por el Seller, bajo su nombre, razón o denominación sociales,
    según sea aplicable, y número de Registro Único de Contribuyentes, y contendrá todos los datos relativos a la adquisición del Producto y/o
    Servicio de que se trate y demás información procedente de acuerdo con la legislación aplicable. El comprobante de pago será emitido por el
    monto total del precio pagado por el Producto y/o Servicio y más el costo del despacho de este, consignando los impuestos aplicables según
    corresponda.
</p>

<p class="mb-4">
    <span class="font-black">4.5.</span> Recaudación de pagos
</p>

<p class="mb-4">
    <span class="font-black">4.5.1.</span> Lyrium recaudará el valor de los pagos hechos por los consumidores asociados a las órdenes de compra que éstos hubieren cursado
    (precio de los Productos y/o Servicios más costo de despacho, lo que incluye los impuestos que resultan aplicables).
</p>

<p class="mb-4">
    <span class="font-black">4.5.2.</span> Todo impuesto, tasa, retención y cualquier otro gravamen será de costo y cargo único y exclusivo del Seller.
</p>
    `
    },

    {
      id: 'vend-quinto',
      title: 'Quinto: Comisión',
      content: `
    <p class="mb-4">
        <span class="font-black">5.1.</span> Como contraprestación por los Servicios, el Seller pagará a Lyrium el 15 % sobre el valor de venta del Producto y/o Servicio vendido sin
        incluir IGV.
    </p>

    <p class="mb-4">
        <span class="font-black">5.2.</span> Lyrium se obliga a emitir un comprobante de pago (boleta o factura) por cada compra efectiva realizada por el consumidor sobre algún
        producto y/o servicio del Seller en el cual se indica la comisión cobrada por la plataforma Lyrium por concepto de uso de la plataforma Lyrium
        Biomarketplace. Este comprobante se envía de forma automática al correo electrónico que el Seller hubiere registrado en la plataforma.
    </p>
    `
    },

    {
      id: 'vend-sexto',
      title: 'Sexto: Política de cambio, devolución o reposición y garantía',
      content: `
    <p class="mb-4">
        <span class="font-black">6.1.</span> El Seller deberá tener sus propias políticas de cambio, reposición, devolución y garantía, sin embargo, podrá alinearse de forma voluntaria
        a los lineamientos de cambio, devolución, reposición y garantía sugeridos y ofrecidos por Lyrium Biomarketplace.
    </p>

    <p class="mb-4">
        <span class="font-black">6.2.</span> El Seller deberá informar de forma clara a los consumidores, a través del Sitio Web, la política de cambio, devolución o reposición y garantía
        aplicable a cada uno de los Productos y/o Servicios que ofrezca y comercialice en el Sitio Web a través Lyrium Biomarketplace.
    </p>

    <p class="mb-4">
        <span class="font-black">6.3.</span> Lyrium no tendrá responsabilidad alguna en relación con las políticas y derechos a los que se refiere la presente cláusula, respecto de los
        Productos y/o Servicios que el Seller ofrezca y comercialice por medio de Lyrium Biomarketplace. En ese sentido, el Seller será el único
        responsable del cumplimiento y observancia de tales políticas y derechos.
    </p>

    <p class="mb-4">
        <span class="font-black">6.4.</span> Será obligación única y exclusiva del Seller otorgar a los consumidores el servicio técnico a los Productos y/o Servicios que éstos hubieren
        adquirido y respecto de los cuales los consumidores hubieren solicitado su procedencia.
    </p>

    <p class="mb-4">
        <span class="font-black">6.5.</span> Cualquier solicitud de cambio, devolución, reposición o garantía deberá ser realizada por el consumidor directamente al Seller siempre y
        cuando Lyrium lo indique así previa coordinación con el Seller, no siendo necesario que Lyrium intervenga en dicha comunicación.
    </p>

    <p class="mb-4">
        <span class="font-black">6.6.</span> Manifestada la intención de un consumidor de proceder a la devolución, cambio o servicio técnico de un Producto (no servicio), el Seller
        deberá contactar con el consumidor informándole sobre la procedencia del derecho a devolución, reemplazo o reposición respecto del Producto
        adquirido, así como sobre las condiciones, restricciones y plazos en que operará. Asimismo, el Seller procederá a coordinar con el consumidor el
        envío del Producto al local del Seller o a una agencia del Operador Logístico designado, o el recojo del Producto del domicilio del cliente.
    </p>
    `
    },

    {
      id: 'vend-septimo',
      title: 'Séptimo: Propiedad intelectual',
      content: `
    <p class="mb-4">
        <span class="font-black">7.1.</span> El Seller declara y garantiza que los Productos y/o Servicios que publicite y/o comercialice a través del Sitio Web en la modalidad Lyrium
        Biomarketplace sean adquiridos con recursos provenientes de actividades lícitas, siendo introducidos al territorio peruano y al mercado local
        de manera legal. El Seller reconoce ser el único responsable por las imágenes, marcas, descripción y Productos y/o Servicios que anuncie,
        publique y/o venda a través de Lyrium Biomarketplace. El Seller declara y garantiza que los Productos y/o Servicios son adquiridos por éste
        luego de su comercialización legítima en cualquier país por los titulares de las marcas correspondientes o con su consentimiento expreso, en
        observancia de las disposiciones legales aplicables.
    </p>

    <p class="mb-4">
        Será obligación del Seller contar con todos los derechos de propiedad intelectual e industrial sobre los signos bajo los cuales se publiciten y/o
        comercialicen los Productos y/o Servicios en los términos de estos Términos y Condiciones Generales para Sellers, obligándose el Seller a
        liberar a Lyrium de toda responsabilidad civil, penal, administrativa y/o de cualquier otra naturaleza en relación con cualquier alegación relativa
        al uso de signos distintivos y, en general, elementos protegidos por la propiedad intelectual e industrial, de parte de los titulares de éstos, y
        obligándose el Seller a mantener indemne a Lyrium respecto de toda y cualquier reclamación, demanda judicial, administrativa y/o de cualquier
        naturaleza que terceros pudieren efectuar respecto al uso de tales elementos bajo las cuales se comercializan los Productos y/o Servicios en el
        Sitio Web bajo la modalidad Lyrium Biomarketplace, así como de cualquier otro derecho de propiedad industrial o intelectual que sobre dichos
        elementos se alegue, manteniendo completamente indemne a Lyrium respecto de tales reclamaciones en el evento que fuesen acogidas aún
        en parte. Esta obligación subsistirá aún después de terminado el Contrato por todos los períodos aplicables conforme a la respectiva
        prescripción legal.
    </p>

    <p class="mb-4">
        El Seller se obliga a entregar a Lyrium, cuando este se lo requiera y de manera inmediata, toda aquella documentación que acredite -a
        satisfacción de Lyrium- la legalidad de la mercancía, su procedencia y su legal importación o adquisición y estancia en el país, así como aquella
        que acredite -a satisfacción de Lyrium- que cuenta con todos los derechos de propiedad intelectual e industrial sobre los signos distintivos
        bajo los cuales se publiciten y/o comercialicen los Productos.
    </p>

    <p class="mb-4">
        <span class="font-black">7.2.</span> Queda prohibido al Seller, de forma absoluta y sin excepciones, publicar y/o comercializar en el Sitio Web, bajo la modalidad Lyrium
        Biomarketplace, productos falsificados, replicados, copiados o que de cualquier manera hayan sido adulterados dando una impresión de ser
        productos originales o auténticos. El Seller deberá abstenerse de publicar y/o comercializar en el Sitio Web, bajo la modalidad Lyrium
        Biomarketplace, productos cuyos signos distintivos (o cualquier elemento protegido por la propiedad intelectual y/o industrial) hayan sido
        falsificados o copiados, o sean una reproducción exacta o similar de signos distintivos, imágenes o características distintivas de un producto o
        proveedor en el mercado, o que de cualquier forma se aprovechen o imiten los mismos.
    </p>
    `
    },

    {
      id: 'vend-octavo',
      title: 'Octavo: Resolución del acuerdo y eliminación de cuenta del Seller',
      content: `
    <p class="mb-4">
        <span class="font-black">8.1.</span> Pasado el mes de haber sido reconocido el Seller como vendedor registrado en la plataforma Lyrium Biomarketplace, y éste no alcanzó las
        ventas mínimas requeridas por Lyrium, se resolverá el Acuerdo y, por tanto, se eliminará su cuenta de la plataforma del sitio web.
    </p>

    <p class="mb-4">
        <span class="font-black">8.2.</span> Las partes declaran que uno de sus objetivos principales es entregar a los consumidores un servicio de calidad en relación con la
        comercialización de los Productos y/o Servicios que éstos adquieran a través del Sitio Web bajo la modalidad Lyrium Biomarketplace. En
        consecuencia, será obligación del Seller mantener durante toda la vigencia del Acuerdo estándares de servicio óptimos en relación con la
        comercialización de Productos y/o Servicios, el despacho de los Productos y el servicio de post-venta asociado a éstos (devolución, cambio,
        reposición o garantía de los Productos) por medio de la modalidad Lyrium Biomarketplace.
    </p>

    <p class="mb-4">
        <span class="font-black">8.3.</span> Lyrium podrá resolver el Acuerdo unilateralmente de pleno derecho y, por tanto, eliminar definitivamente, la cuenta del Seller de la
        plataforma Lyrium Biomarketplace si (i) comprueba (en un máximo de 3 ocasiones o eventos) que el Seller no ofreciera un servicio
        satisfactorio para los consumidores, evidenciándose calificaciones negativas por parte de los consumidores sobre dicho servicio, (ii) el Seller
        incumple cualquier otra de las obligaciones señaladas en este Acuerdo y en los Términos y Condiciones Generales para Sellers, sin que ello
        genere indemnización alguna a favor del Seller. Las Partes declaran que el hecho de que Lyrium proceda primero con la suspensión de la cuenta
        del Seller, no es impedimento para que luego Lyrium opte por resolver el presente Acuerdo.
    </p>

    <p class="mb-4">
        <span class="font-black">8.4.</span> El incumplimiento del Seller (en un máximo de tres ocasiones o eventos) de cualquiera de las obligaciones establecidas en estos Términos
        y Condiciones Generales para Sellers y/o en el Acuerdo (como por ejemplo, la oferta y/o comercialización de Productos y/o Servicios distintos a
        los acordados con Lyrium, la falta de entrega completa y oportuna de los Productos y/o Servicios adquiridos por los consumidores en los
        términos ofrecidos en el Sitio Web bajo la plataforma Lyrium Biomarketplace, la entrega de Productos defectuosos, el incumplimiento de las
        políticas de cambio, devolución, reposición o garantía, entre otras) dará derecho a Lyrium a resolver el Acuerdo con el Seller y, por tanto,
        eliminar su cuenta de la plataforma Lyrium Biomarketplace.
    </p>

    <p class="mb-4">
        <span class="font-black">8.5.</span> El incumplimiento de las obligaciones asumidas por Lyrium y/o el Seller en el presente contrato constituirán causal de resolución del
        presente Acuerdo, al amparo del artículo 1430 del Código Civil. En consecuencia, la resolución se producirá de pleno derecho cuando la parte
        que desee valerse de esta cláusula comunique a la otra a través de su dirección electrónica.
    </p>
    `
    },

    {
      id: 'vend-noveno',
      title: 'Noveno: Responsabilidad',
      content: `
    <p class="mb-4">
        <span class="font-black">9.1.</span> La oferta y comercialización de productos a través del Sitio Web bajo la plataforma Lyrium Biomarketplace será realizada directamente
        entre el Seller y los consumidores, limitándose la labor de Lyrium a: <br><br>
          <strong>(i)</strong> la ejecución de aquellas actividades tendientes a poner a disposición de los consumidores la información respecto de los Productos y/o Servicios a ser ofrecidos y comercializados por el Seller en el Sitio Web vía Lyrium Biomarketplace; 
          <strong>(ii)</strong> la recaudación de los pagos realizados con motivo de la comercialización de Productos y/o Servicios en el mismo; y,
          <strong>(iii)</strong> la ejecución de las demás obligaciones expresamente establecidas para Lyrium en estos Términos y Condiciones Generales para Sellers y en el Acuerdo.
    </p>

    <p class="mb-4">
        <span class="font-black">9.2.</span> Lyrium sólo pondrá a disposición del Seller un espacio virtual que le permitirá ponerse en contacto a través de Internet y su plataforma
        Lyrium Biomarketplace con distintos consumidores a efectos de que el Seller pueda ofrecer y comercializar sus Productos y/o Servicios. Ello sin
        perjuicio de que el cumplimiento de las condiciones de la oferta y comercialización de tales Productos y/o Servicios, así como de todos los
        aspectos asociados a éstos, sea de entera y exclusiva responsabilidad del Seller.
    </p>

    <p class="mb-4">
        <span class="font-black">9.3.</span> Lyrium no es el propietario de los Productos y/o Servicios que serán comercializados por medio del Sitio Web bajo la plataforma Lyrium
        Biomarketplace, no está en posesión de los mismos, ni los ofrecerá en venta a los consumidores.
    </p>

    <p class="mb-4">
        <span class="font-black">9.4.</span> Lyrium no intervendrá en el perfeccionamiento (devolución, reembolso, entrega, cambio, servicio post-venta, reposición, etc.) de las
        transacciones realizadas entre el Seller y los consumidores a través del Sitio Web bajo la plataforma Lyrium Biomarketplace, ni en las
        condiciones en que dichas transacciones sean acordadas. En consecuencia, el Seller es el único responsable de la comercialización de sus
        Productos y/o Servicios en el Sitio Web a través de la plataforma Lyrium Biomarketplace, así como del cumplimiento de todas y cada una de las
        obligaciones que le son exigibles legal y contractualmente en su calidad de proveedor en la relación de consumo generadas con el consumidor
        a partir de dicha comercialización.
    </p>

    <p class="mb-4">
        En este sentido, Lyrium no será responsable de la existencia, calidad, estado, cantidad, legitimidad, integridad o cualquier otra característica de
        los Productos y/o Servicios que sean ofrecidos y/o comercializados por el Seller a los consumidores a través del Sitio Web mediante la
        plataforma Lyrium Biomarketplace. Lyrium tampoco será responsable de cualquier incumplimiento en la entrega (incluyendo, pero no
        limitando a, la entrega no oportuna, la entrega equivocada, el extravío del Producto o entrega en un lugar distinto al pactado), devolución,
        cambio, reposición o garantía del Producto.
    </p>

    <p class="mb-4">
        <span class="font-black">9.5.</span> El Seller se obliga a no usar la marca “Lyrium” o “Lyrium Biomarketplace”, o cualquier otro signo distintivo o elemento registrado y
        protegido por la propiedad industrial e intelectual de titularidad de Lyrium o sus empresas relacionadas, debiendo abstenerse de enviar por
        cualquier medio publicidad, cupones, documentos o información de cualquier índole que pueda ser asociada a la marca, signos distintivos o
        elementos antes referidos.
    </p>
    `
    },

    {
      id: 'vend-decimo',
      title: 'Décimo: Vigencia',
      content: `
    <p class="mb-4">
        <span class="font-black">10.1.</span> Los presentes Términos y Condiciones Generales para Sellers comenzarán a regir a partir de la suscripción del Acuerdo, y se mantendrán
        durante toda la vigencia del mismo. Los Términos y Condiciones Generales para Sellers se entenderán aceptados por los Sellers desde el
        momento en que éstos suscriban el Acuerdo.
    </p>

    <p class="mb-4">
        <span class="font-black">10.2.</span> Terminado el Acuerdo por cualquier causa, Lyrium procederá a dar de baja al Seller de su plataforma Lyrium Biomarketplace, eliminando
        todos los Productos y/o Servicios que hubieren sido publicados por éste en el Sitio Web, y procediendo a la entrega de los montos recaudados
        por Lyrium como consecuencia de la prestación de los Servicios.
    </p>

    <p class="mb-4">
        <span class="font-black">10.3.</span> Sin perjuicio del término del Acuerdo, y cualquiera fuera su causa, las obligaciones del Seller para con Lyrium se mantendrán vigentes
        durante todo el período de prescripción legal que corresponda, así como aquellas disposiciones de estos Términos y Condiciones Generales
        para Sellers y del Acuerdo, que guarden relación con el despacho, cambio, devolución, reposición, servicio técnico y garantía de los Productos
        que hubieren sido adquiridos por los consumidores antes de la terminación del Acuerdo.
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
        El Seller brinda autorización total a Lyrium para que este último pueda utilizar su marca para fines publicitarios de la misma en la plataforma
        Lyrium Biomarketplace y en las redes sociales de Lyrium con la finalidad de aumentar las posibilidades de ventas del Seller.
    </p>

    <p class="mb-4">
        Lyrium se reserva el derecho de elegir las marcas de los Sellers para colocarlas en su página principal de acuerdo con su nivel de ventas y con el
        plan contratado.
    </p>

    <p class="mb-4">
        Lyrium se reserva el derecho de publicitar en sus redes sociales las marcas de los Sellers a su elección de acuerdo con su nivel de ventas.
    </p>

    <p class="mb-4">
        Lyrium puede ofrecer publicidad a una marca de forma individual, independientemente de sus campañas globales de marketing, sin embargo,
        esta publicidad individual se realizará de forma pagada.
    </p>

    <p class="mb-4">
        Lyrium autoriza al Seller a compartir la publicidad de sus productos generada en la plataforma. Sin embargo, en ningún caso podrá realizar
        modificaciones en la marca ni editar su propio material publicitario haciendo uso de la marca LYRIUM para ello.
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
