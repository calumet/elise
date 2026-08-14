/**
 * La sonda de la auditoría visual.
 *
 * Este archivo corre dentro de la página y no en Node: se inyecta con
 * `addScriptTag` y deja `window.__sondaVisual`, que devuelve la lista de
 * fallos. Vive aparte de `audit-visual.mjs` porque son dos programas en dos
 * runtimes distintos, y tenerlos juntos hacía una sola función de trescientas
 * líneas que ya no se podía leer de corrido.
 *
 * Las escalas llegan en `window.__RADIOS`, `__ICONOS` y `__TIPOGRAFIA`, que las
 * pone el conductor antes de llamar.
 */

/* eslint-env browser */

(() => {
  /* --- utilidades compartidas --- */

  const ruta = (el) => {
    const partes = [];
    for (let n = el; n && n !== document.body && partes.length < 4; n = n.parentElement) {
      const slot = n.dataset?.slot;
      partes.unshift(slot ? `[${slot}]` : n.tagName.toLowerCase());
    }
    return partes.join(" > ");
  };

  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== "hidden" && cs.display !== "none" && cs.opacity !== "0";
  };

  const textoPropio = (el) =>
    [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());

  /* Solaparse a propósito se declara de dos maneras, y las dos se respetan: un
     margen negativo (los avatares de un grupo, un `Bleed`) o salirse del flujo
     con `absolute`. Lo que no está declarado es lo que se anota. */
  const declaraSolape = (el) => {
    const cs = getComputedStyle(el);
    if (cs.position === "absolute" || cs.position === "fixed") return true;
    for (const lado of [cs.marginLeft, cs.marginRight, cs.marginTop, cs.marginBottom]) {
      if (parseFloat(lado) < 0) return true;
    }
    return false;
  };

  /* --- radios --- */

  const chequearRadios = (todos, anota) => {
    const RADIOS = window.__RADIOS;
    for (const el of todos) {
      const cs = getComputedStyle(el);
      for (const bruto of [cs.borderTopLeftRadius, cs.borderBottomRightRadius]) {
        if (!bruto || bruto.includes("%")) continue;
        const px = parseFloat(bruto);
        if (!Number.isFinite(px) || px === 0) continue;
        if (px >= 100) continue; // rounded-full
        if (!RADIOS.includes(Math.round(px * 100) / 100)) {
          anota("radios", el, `${bruto} no esta en la escala`);
          break;
        }
      }
    }
  };

  /* --- iconos --- */

  const chequearIconos = (anota) => {
    const ICONOS = window.__ICONOS;
    for (const svg of document.querySelectorAll("svg")) {
      if (!visible(svg)) continue;
      const r = svg.getBoundingClientRect();
      const w = Math.round(r.width * 100) / 100;
      const h = Math.round(r.height * 100) / 100;
      /* Los iconos decorativos que escalan con su caja (logos, ilustraciones)
         quedan fuera, ya que solo se auditan los que declaran un tamano fijo. */
      if (Math.abs(w - h) > 1) continue;
      if (w > 48) continue;
      if (!ICONOS.includes(Math.round(w))) anota("iconos", svg, `${w}x${h}px`);
      else if (!Number.isInteger(w)) anota("iconos", svg, `${w}px, no entero`);
    }
  };

  /* --- tipografía --- */

  const chequearTipografia = (todos, anota) => {
    const TIPOGRAFIA = window.__TIPOGRAFIA;
    for (const el of todos) {
      if (!el.childNodes.length || !textoPropio(el)) continue;
      const px = Math.round(parseFloat(getComputedStyle(el).fontSize) * 100) / 100;
      if (!TIPOGRAFIA.includes(Math.round(px))) anota("tipografia", el, `${px}px`);
    }
  };

  /* --- píxeles fraccionarios en controles --- */

  const chequearFraccionarios = (anota) => {
    const CONTROLES = 'button, input, select, textarea, [role="combobox"], [data-slot$="trigger"]';
    for (const el of document.querySelectorAll(CONTROLES)) {
      if (!visible(el)) continue;
      const { height } = el.getBoundingClientRect();
      if (Math.abs(height - Math.round(height)) > 0.02) {
        anota("fraccionarios", el, `alto ${height.toFixed(2)}px`);
      }
    }
  };

  /* --- anidamiento inválido --- */

  const chequearAnidamiento = (anota) => {
    const INTERACTIVOS = "button, a[href], input, select, textarea";
    for (const el of document.querySelectorAll(INTERACTIVOS)) {
      const padre = el.parentElement?.closest(INTERACTIVOS);
      if (padre) {
        anota(
          "anidamiento",
          el,
          `${el.tagName.toLowerCase()} dentro de ${padre.tagName.toLowerCase()}`,
        );
      }
    }
  };

  /* --- solapamiento entre hermanos interactivos --- */

  const chequearSolapamiento = (anota) => {
    const seSolapan = (a, b) =>
      a.left < b.right - 0.5 &&
      b.left < a.right - 0.5 &&
      a.top < b.bottom - 0.5 &&
      b.top < a.bottom - 0.5;
    /* Solo se busca solapamiento accidental, el que sale del flujo normal. Un
       control posicionado en absoluto encima de otro suele ser deliberado (una
       X de limpiar sobre su campo) y no es asunto de este chequeo. */
    const enFlujo = (el) => {
      const pos = getComputedStyle(el).position;
      return pos !== "absolute" && pos !== "fixed";
    };
    const controles = [...document.querySelectorAll("button, [role='button']")]
      .filter(visible)
      .filter(enFlujo);
    for (let i = 0; i < controles.length; i++) {
      for (let j = i + 1; j < controles.length; j++) {
        const a = controles[i];
        const b = controles[j];
        if (a.contains(b) || b.contains(a)) continue;
        if (seSolapan(a.getBoundingClientRect(), b.getBoundingClientRect())) {
          anota("solapamiento", b, `se pisa con ${ruta(a)}`);
        }
      }
    }
  };

  /* --- hermanos de una fila que se pisan --- */

  const chequearHermanos = (todos, anota) => {
    const filas = todos.filter((el) => {
      const cs = getComputedStyle(el);
      if (cs.display !== "flex" && cs.display !== "grid") return false;
      if (cs.display === "flex" && !cs.flexDirection.startsWith("row")) return false;
      /* Una fila que envuelve reparte sus hijos en varios renglones, así que
         dos de ellos compartiendo x es lo normal y no un defecto. */
      if (cs.flexWrap === "wrap" || cs.flexWrap === "wrap-reverse") return false;
      return el.children.length > 1;
    });

    for (const fila of filas) {
      const hijos = [...fila.children].filter((h) => visible(h) && !declaraSolape(h));
      for (let i = 0; i < hijos.length; i++) {
        for (let j = i + 1; j < hijos.length; j++) {
          const a = hijos[i].getBoundingClientRect();
          const b = hijos[j].getBoundingClientRect();
          const cruceX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          /* Los dos ejes: una rejilla apilada a una columna comparte la x de
             sus hijos, y eso es lo que tiene que hacer. */
          const cruceY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (cruceX > 1 && cruceY > 1) {
            anota("hermanos", hijos[j], `${cruceX.toFixed(1)}px sobre ${ruta(hijos[i])}`);
          }
        }
      }
    }
  };

  /* --- contenido que se sale de su contenedor --- */

  const chequearDesborde = (todos, anota) => {
    /* Salirse de un contenedor que recorta es lo normal y muchas veces el
       punto: el carril de un carrusel mide más que su ventana a propósito. */
    const alguienRecorta = (el) => {
      for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
        if (getComputedStyle(n).overflow !== "visible") return true;
      }
      return false;
    };

    for (const el of todos) {
      if (getComputedStyle(el).overflow !== "visible") continue;
      const caja = el.getBoundingClientRect();
      if (caja.width === 0) continue;
      if (alguienRecorta(el)) continue;
      for (const hijo of el.children) {
        if (!visible(hijo) || declaraSolape(hijo)) continue;
        const h = hijo.getBoundingClientRect();
        const fuera = Math.max(h.right - caja.right, caja.left - h.left);
        /* Un umbral de 1px deja pasar el redondeo del subpíxel. */
        if (fuera > 1) anota("desborde", hijo, `${fuera.toFixed(1)}px fuera de ${ruta(el)}`);
      }
    }
  };

  /* --- fondos que desbordan una esquina redondeada --- */

  const chequearRecorte = (todos, anota) => {
    for (const el of todos) {
      const cs = getComputedStyle(el);
      const radio = parseFloat(cs.borderTopLeftRadius);
      if (!Number.isFinite(radio) || radio < 4) continue;
      if (cs.overflow !== "visible") continue;
      const caja = el.getBoundingClientRect();
      for (const hijo of el.children) {
        if (!visible(hijo)) continue;
        const hcs = getComputedStyle(hijo);
        const fondo = hcs.backgroundColor;
        if (!fondo || fondo === "transparent" || fondo.endsWith(", 0)")) continue;
        const hijoRadio = parseFloat(hcs.borderTopLeftRadius) || 0;
        const h = hijo.getBoundingClientRect();
        /* Si el hijo llega a la esquina del padre y no la redondea, la tapa. */
        if (h.top - caja.top < 1 && h.left - caja.left < 1 && hijoRadio < radio - 0.5) {
          anota(
            "recorte",
            hijo,
            `fondo opaco con radio ${hijoRadio}px dentro de uno de ${radio}px`,
          );
        }
      }
    }
  };

  /* --- alineación de filas dentro de una lista --- */

  const chequearAlineacion = (anota) => {
    const LISTAS = '[data-slot$="-list"], [role="listbox"], [role="menu"]';
    /* La x del texto y no la de la fila: lo que se nota es que un rótulo
       arranque corrido respecto de sus hermanos, no dónde empiece la caja. */
    const xDelTexto = (fila) => {
      const w = document.createTreeWalker(fila, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) if (n.textContent.trim()) break;
      if (!n) return null;
      const rango = document.createRange();
      rango.selectNodeContents(n);
      return { fila, x: Math.round(rango.getBoundingClientRect().left * 10) / 10 };
    };

    for (const lista of document.querySelectorAll(LISTAS)) {
      if (!visible(lista)) continue;
      const filas = [...lista.querySelectorAll('[data-slot$="-item"], [role="option"]')].filter(
        visible,
      );
      if (filas.length < 2) continue;
      const validos = filas.map(xDelTexto).filter(Boolean);
      if (validos.length < 2) continue;
      /* Una lista que aplana un árbol sangra a propósito, y lo declara en
         `data-level`. Se compara dentro de cada profundidad: sin el atributo
         todas caen en la misma y el chequeo mide lo de siempre. */
      const porNivel = new Map();
      for (const v of validos) {
        const nivel = v.fila.dataset.level ?? "0";
        if (!porNivel.has(nivel)) porNivel.set(nivel, []);
        porNivel.get(nivel).push(v);
      }
      for (const grupo of porNivel.values()) {
        if (grupo.length < 2) continue;
        const min = Math.min(...grupo.map((v) => v.x));
        for (const v of grupo) {
          if (v.x - min > 1) {
            anota("alineacion", v.fila, `texto ${(v.x - min).toFixed(1)}px a la derecha del resto`);
          }
        }
      }
    }
  };

  /* --- contraste --- */

  const chequearContraste = (todos, anota) => {
    const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    /* Devuelve [r,g,b,a] de cualquier formato CSS, oklch incluido, dejando que
       el canvas haga la conversión. */
    const aRgba = (css) => {
      cv.clearRect(0, 0, 1, 1);
      cv.fillStyle = css;
      cv.fillRect(0, 0, 1, 1);
      const d = cv.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const componer = (frente, fondo) =>
      [0, 1, 2].map((i) => frente[i] * frente[3] + fondo[i] * (1 - frente[3]));
    const lum = (c) => {
      const s = c.map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
    };
    /* Un fondo semitransparente se compone contra lo que tiene detras, subiendo
       hasta encontrar algo opaco. Tratarlo como si fuera sólido daba lecturas
       absurdas, 1.09:1 en texto perfectamente legible. */
    const fondoEfectivo = (el) => {
      const capas = [];
      for (let n = el; n; n = n.parentElement) {
        const c = aRgba(getComputedStyle(n).backgroundColor);
        if (c[3] === 0) continue;
        capas.push(c);
        if (c[3] === 1) break;
      }
      let resultado = [255, 255, 255];
      for (let i = capas.length - 1; i >= 0; i--) resultado = componer(capas[i], resultado);
      return resultado;
    };

    for (const el of todos) {
      if (!textoPropio(el)) continue;
      /* El texto solo para lectores de pantalla se recorta a 1px y nunca se ve,
         de modo que medirle contraste no dice nada. */
      const caja = el.getBoundingClientRect();
      if (caja.width <= 1 || caja.height <= 1) continue;
      const cs = getComputedStyle(el);
      if (parseFloat(cs.opacity) < 1) continue; // deshabilitado a propósito
      const px = parseFloat(cs.fontSize);
      const negrita = parseInt(cs.fontWeight, 10) >= 700;
      const grande = px >= 24 || (px >= 18.66 && negrita);
      const minimo = grande ? 3 : 4.5;
      const fondo = fondoEfectivo(el);
      const texto = componer(aRgba(cs.color), fondo);
      const [l1, l2] = [lum(texto), lum(fondo)].sort((a, b) => b - a);
      const ratio = (l1 + 0.05) / (l2 + 0.05);
      if (ratio < minimo) {
        /* El detalle lleva los colores crudos, porque un número sin evidencia
           no se puede refutar y un fallo de la sonda se confunde con uno del
           tema. */
        anota(
          "contraste",
          el,
          `${ratio.toFixed(2)}:1 (min ${minimo}) en "${el.textContent.trim().slice(0, 20)}", ` +
            `texto ${cs.color} sobre rgb(${fondo.map(Math.round).join(",")})`,
        );
      }
    }
  };

  window.__sondaVisual = () => {
    const fallos = [];
    const anota = (chequeo, el, detalle) => fallos.push({ chequeo, ruta: ruta(el), detalle });
    const todos = [...document.querySelectorAll("*")].filter(visible);

    chequearRadios(todos, anota);
    chequearIconos(anota);
    chequearTipografia(todos, anota);
    chequearFraccionarios(anota);
    chequearAnidamiento(anota);
    chequearSolapamiento(anota);
    chequearHermanos(todos, anota);
    chequearDesborde(todos, anota);
    chequearRecorte(todos, anota);
    chequearAlineacion(anota);
    chequearContraste(todos, anota);

    return fallos;
  };
})();
