/**
 * La sonda de la auditoría visual.
 *
 * Este archivo corre dentro de la página y no en Node: se inyecta con
 * `addScriptTag` y deja `window.__visualProbe`, que devuelve la lista de
 * fallos. Vive aparte de `visual-audit.mjs` porque son dos programas en dos
 * runtimes distintos, y tenerlos juntos hacía una sola función de trescientas
 * líneas que ya no se podía leer de corrido.
 *
 * Las escalas llegan en `window.__RADII`, `__ICONS` y `__TYPOGRAPHY`, que las
 * pone el conductor antes de llamar.
 */

(() => {
  /* --- utilidades compartidas --- */

  const path = (el) => {
    const parts = [];
    for (let n = el; n && n !== document.body && parts.length < 4; n = n.parentElement) {
      const slot = n.dataset?.slot;
      parts.unshift(slot ? `[${slot}]` : n.tagName.toLowerCase());
    }
    return parts.join(" > ");
  };

  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== "hidden" && cs.display !== "none" && cs.opacity !== "0";
  };

  const ownText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());

  /* Solaparse a propósito se declara de dos maneras, y las dos se respetan: un
     margen negativo (los avatares de un grupo, un `Bleed`) o salirse del flujo
     con `absolute`. Lo que no está declarado es lo que se anota. */
  const declaresOverlap = (el) => {
    const cs = getComputedStyle(el);
    if (cs.position === "absolute" || cs.position === "fixed") return true;
    for (const side of [cs.marginLeft, cs.marginRight, cs.marginTop, cs.marginBottom]) {
      if (parseFloat(side) < 0) return true;
    }
    return false;
  };

  /* --- radios --- */

  const checkRadii = (all, annotate) => {
    const RADII = window.__RADII;
    for (const el of all) {
      const cs = getComputedStyle(el);
      for (const raw of [cs.borderTopLeftRadius, cs.borderBottomRightRadius]) {
        if (!raw || raw.includes("%")) continue;
        const px = parseFloat(raw);
        if (!Number.isFinite(px) || px === 0) continue;
        if (px >= 100) continue; // rounded-full
        if (!RADII.includes(Math.round(px * 100) / 100)) {
          annotate("radii", el, `${raw} no esta en la escala`);
          break;
        }
      }
    }
  };

  /* --- iconos --- */

  const checkIcons = (annotate) => {
    const ICONS = window.__ICONS;
    for (const svg of document.querySelectorAll("svg")) {
      if (!visible(svg)) continue;
      const r = svg.getBoundingClientRect();
      const w = Math.round(r.width * 100) / 100;
      const h = Math.round(r.height * 100) / 100;
      /* Los iconos decorativos que escalan con su caja (logos, ilustraciones)
         quedan fuera, ya que solo se auditan los que declaran un tamano fijo. */
      if (Math.abs(w - h) > 1) continue;
      if (w > 48) continue;
      if (!ICONS.includes(Math.round(w))) annotate("icons", svg, `${w}x${h}px`);
      else if (!Number.isInteger(w)) annotate("icons", svg, `${w}px, no entero`);
    }
  };

  /* --- tipografía --- */

  const checkTypography = (all, annotate) => {
    const TYPOGRAPHY = window.__TYPOGRAPHY;
    for (const el of all) {
      if (!el.childNodes.length || !ownText(el)) continue;
      const px = Math.round(parseFloat(getComputedStyle(el).fontSize) * 100) / 100;
      if (!TYPOGRAPHY.includes(Math.round(px))) annotate("typography", el, `${px}px`);
    }
  };

  /* --- píxeles fraccionarios en controles --- */

  const checkFractional = (annotate) => {
    const CONTROLS = 'button, input, select, textarea, [role="combobox"], [data-slot$="trigger"]';
    for (const el of document.querySelectorAll(CONTROLS)) {
      if (!visible(el)) continue;
      const { height } = el.getBoundingClientRect();
      if (Math.abs(height - Math.round(height)) > 0.02) {
        annotate("fractional", el, `alto ${height.toFixed(2)}px`);
      }
    }
  };

  /* --- anidamiento inválido --- */

  const checkNesting = (annotate) => {
    const INTERACTIVE = "button, a[href], input, select, textarea";
    for (const el of document.querySelectorAll(INTERACTIVE)) {
      const parent = el.parentElement?.closest(INTERACTIVE);
      if (parent) {
        annotate(
          "nesting",
          el,
          `${el.tagName.toLowerCase()} dentro de ${parent.tagName.toLowerCase()}`,
        );
      }
    }
  };

  /* --- solapamiento entre hermanos interactivos --- */

  const checkOverlap = (annotate) => {
    const overlap = (a, b) =>
      a.left < b.right - 0.5 &&
      b.left < a.right - 0.5 &&
      a.top < b.bottom - 0.5 &&
      b.top < a.bottom - 0.5;
    /* Solo se busca solapamiento accidental, el que sale del flujo normal. Un
       control posicionado en absoluto encima de otro suele ser deliberado (una
       X de limpiar sobre su campo) y no es asunto de este chequeo. */
    const inFlow = (el) => {
      const pos = getComputedStyle(el).position;
      return pos !== "absolute" && pos !== "fixed";
    };
    /* Un panel flotante se apoya encima de la página a propósito, así que sus
       botones pisan lo que haya debajo sin que eso sea un defecto. Se comparan
       solo los controles que cuelgan del mismo antecesor posicionado, de modo
       que dentro del panel el chequeo sigue midiendo lo de siempre. */
    const layer = (el) => {
      for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
        const pos = getComputedStyle(n).position;
        if (pos === "absolute" || pos === "fixed") return n;
      }
      return null;
    };
    const byLayer = new Map();
    for (const el of [...document.querySelectorAll("button, [role='button']")]
      .filter(visible)
      .filter(inFlow)) {
      const key = layer(el);
      if (!byLayer.has(key)) byLayer.set(key, []);
      byLayer.get(key).push(el);
    }
    for (const controls of byLayer.values()) {
      for (let i = 0; i < controls.length; i++) {
        for (let j = i + 1; j < controls.length; j++) {
          const a = controls[i];
          const b = controls[j];
          if (a.contains(b) || b.contains(a)) continue;
          if (overlap(a.getBoundingClientRect(), b.getBoundingClientRect())) {
            annotate("overlap", b, `se pisa con ${path(a)}`);
          }
        }
      }
    }
  };

  /* --- hermanos de una fila que se pisan --- */

  const checkSiblings = (all, annotate) => {
    const rows = all.filter((el) => {
      const cs = getComputedStyle(el);
      if (cs.display !== "flex" && cs.display !== "grid") return false;
      if (cs.display === "flex" && !cs.flexDirection.startsWith("row")) return false;
      /* Una fila que envuelve reparte sus hijos en varios renglones, así que
         dos de ellos compartiendo x es lo normal y no un defecto. */
      if (cs.flexWrap === "wrap" || cs.flexWrap === "wrap-reverse") return false;
      return el.children.length > 1;
    });

    for (const row of rows) {
      const children = [...row.children].filter((h) => visible(h) && !declaresOverlap(h));
      for (let i = 0; i < children.length; i++) {
        for (let j = i + 1; j < children.length; j++) {
          const a = children[i].getBoundingClientRect();
          const b = children[j].getBoundingClientRect();
          const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          /* Los dos ejes: una rejilla apilada a una columna comparte la x de
             sus hijos, y eso es lo que tiene que hacer. */
          const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (overlapX > 1 && overlapY > 1) {
            annotate(
              "siblings",
              children[j],
              `${overlapX.toFixed(1)}px sobre ${path(children[i])}`,
            );
          }
        }
      }
    }
  };

  /* --- contenido que se sale de su contenedor --- */

  const checkOverflow = (all, annotate) => {
    /* Salirse de un contenedor que recorta es lo normal y muchas veces el
       punto: el carril de un carrusel mide más que su ventana a propósito. */
    const someoneClips = (el) => {
      for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
        if (getComputedStyle(n).overflow !== "visible") return true;
      }
      return false;
    };

    for (const el of all) {
      if (getComputedStyle(el).overflow !== "visible") continue;
      const box = el.getBoundingClientRect();
      if (box.width === 0) continue;
      if (someoneClips(el)) continue;
      for (const child of el.children) {
        if (!visible(child) || declaresOverlap(child)) continue;
        const h = child.getBoundingClientRect();
        const outside = Math.max(h.right - box.right, box.left - h.left);
        /* Un umbral de 1px deja pasar el redondeo del subpíxel. */
        if (outside > 1)
          annotate("overflow", child, `${outside.toFixed(1)}px fuera de ${path(el)}`);
      }
    }
  };

  /* --- fondos que desbordan una esquina redondeada --- */

  const checkClip = (all, annotate) => {
    for (const el of all) {
      const cs = getComputedStyle(el);
      const radius = parseFloat(cs.borderTopLeftRadius);
      if (!Number.isFinite(radius) || radius < 4) continue;
      if (cs.overflow !== "visible") continue;
      const box = el.getBoundingClientRect();
      for (const child of el.children) {
        if (!visible(child)) continue;
        const hcs = getComputedStyle(child);
        const background = hcs.backgroundColor;
        if (!background || background === "transparent" || background.endsWith(", 0)")) continue;
        const childRadius = parseFloat(hcs.borderTopLeftRadius) || 0;
        const h = child.getBoundingClientRect();
        /* Si el hijo llega a la esquina del padre y no la redondea, la tapa. */
        if (h.top - box.top < 1 && h.left - box.left < 1 && childRadius < radius - 0.5) {
          annotate(
            "clip",
            child,
            `fondo opaco con radio ${childRadius}px dentro de uno de ${radius}px`,
          );
        }
      }
    }
  };

  /* --- alineación de filas dentro de una lista --- */

  const checkAlignment = (annotate) => {
    const LISTS = '[data-slot$="-list"], [role="listbox"], [role="menu"]';
    /* La x del texto y no la de la fila: lo que se nota es que un rótulo
       arranque corrido respecto de sus hermanos, no dónde empiece la caja. */
    const textX = (row) => {
      const w = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) if (n.textContent.trim()) break;
      if (!n) return null;
      const range = document.createRange();
      range.selectNodeContents(n);
      return { row, x: Math.round(range.getBoundingClientRect().left * 10) / 10 };
    };

    for (const list of document.querySelectorAll(LISTS)) {
      if (!visible(list)) continue;
      const rows = [...list.querySelectorAll('[data-slot$="-item"], [role="option"]')].filter(
        visible,
      );
      if (rows.length < 2) continue;
      /* En una lista horizontal cada rotulo arranca en otra x a proposito. */
      const boxes = rows.map((f) => f.getBoundingClientRect());
      if (boxes.some((c, i) => i > 0 && Math.abs(c.top - boxes[i - 1].top) < 2)) continue;
      const valid = rows.map(textX).filter(Boolean);
      if (valid.length < 2) continue;
      /* Una lista que aplana un árbol sangra a propósito, y lo declara en
         `data-level`. Se compara dentro de cada profundidad: sin el atributo
         todas caen en la misma y el chequeo mide lo de siempre. */
      const byLevel = new Map();
      for (const v of valid) {
        const level = v.row.dataset.level ?? "0";
        if (!byLevel.has(level)) byLevel.set(level, []);
        byLevel.get(level).push(v);
      }
      for (const group of byLevel.values()) {
        if (group.length < 2) continue;
        const min = Math.min(...group.map((v) => v.x));
        for (const v of group) {
          if (v.x - min > 1) {
            annotate(
              "alignment",
              v.row,
              `texto ${(v.x - min).toFixed(1)}px a la derecha del resto`,
            );
          }
        }
      }
    }
  };

  /* --- contraste --- */

  const checkContrast = (all, annotate) => {
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
    const compose = (front, background) =>
      [0, 1, 2].map((i) => front[i] * front[3] + background[i] * (1 - front[3]));
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
    const effectiveBackground = (el) => {
      const layers = [];
      for (let n = el; n; n = n.parentElement) {
        const c = aRgba(getComputedStyle(n).backgroundColor);
        if (c[3] === 0) continue;
        layers.push(c);
        if (c[3] === 1) break;
      }
      let result = [255, 255, 255];
      for (let i = layers.length - 1; i >= 0; i--) result = compose(layers[i], result);
      return result;
    };

    for (const el of all) {
      if (!ownText(el)) continue;
      /* El texto solo para lectores de pantalla se recorta a 1px y nunca se ve,
         de modo que medirle contraste no dice nada. */
      const box = el.getBoundingClientRect();
      if (box.width <= 1 || box.height <= 1) continue;
      const cs = getComputedStyle(el);
      if (parseFloat(cs.opacity) < 1) continue; // deshabilitado a propósito
      const px = parseFloat(cs.fontSize);
      const bold = parseInt(cs.fontWeight, 10) >= 700;
      const large = px >= 24 || (px >= 18.66 && bold);
      const min = large ? 3 : 4.5;
      const background = effectiveBackground(el);
      const text = compose(aRgba(cs.color), background);
      const [l1, l2] = [lum(text), lum(background)].sort((a, b) => b - a);
      const ratio = (l1 + 0.05) / (l2 + 0.05);
      if (ratio < min) {
        /* El detalle lleva los colores crudos, porque un número sin evidencia
           no se puede refutar y un fallo de la sonda se confunde con uno del
           tema. */
        annotate(
          "contrast",
          el,
          `${ratio.toFixed(2)}:1 (min ${min}) en "${el.textContent.trim().slice(0, 20)}", ` +
            `texto ${cs.color} sobre rgb(${background.map(Math.round).join(",")})`,
        );
      }
    }
  };

  window.__visualProbe = () => {
    const failures = [];
    const annotate = (check, el, detail) => failures.push({ check, path: path(el), detail });
    const all = [...document.querySelectorAll("*")].filter(visible);

    checkRadii(all, annotate);
    checkIcons(annotate);
    checkTypography(all, annotate);
    checkFractional(annotate);
    checkNesting(annotate);
    checkOverlap(annotate);
    checkSiblings(all, annotate);
    checkOverflow(all, annotate);
    checkClip(all, annotate);
    checkAlignment(annotate);
    checkContrast(all, annotate);

    return failures;
  };
})();
