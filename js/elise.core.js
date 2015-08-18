(function () {

    window.Elise = {
        /**
         * Version of Elise.
         */
        VERSION: '0.8.0-beta',

        /**
         * Private variables.
         */
        _fn: {
            /**
             * El momento en que se instanció Elise.
             * @type {Number}
             */
            instance: Date.now(),
            /**
             * Variables del tip.
             * @type {Object}
             */
            tip: {
                count: 0
            },
            /**
             * Variables del alert.
             * @type {Object}
             */
            alert: {
                count: 0
            },
            /**
             * Controlador de Hope.
             * @type {Object}
             */
            hope: null
        }
    };

    /**
     * Dispositivo móvil.
     * @return {Boolean}
     */
    Elise.isMobile = function () {
        var check = false;
        (function (a, b) {
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
                check = true
        })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    }();

    /**
     * Navegador obsoleto.
     * @type {Boolean}
     */
    Elise.isObsolete = !('querySelector' in document && 'localStorage' in window && 'addEventListener' in window);

    /**
     * Métodos relacionados con validaciones.
     */
    Elise.val = {

        /**
         * Validar <input>s con una función cada vez que se teclee un símbolo.
         * @param  {jQuery} $inputs - Elementos tipo campo de texto a observar.
         * @param  {Function} validator - Función a ejecutar por cada validación. Recibe
         * en primer parámetro el contenido del input y debe retornar un booleano de si
         * es válida la entrada o no.
         */
        onInput: function ($inputs, validator) {
            $inputs = $($inputs);

            // Validar entradas.
            if (!$inputs.length) {
                return console.error('Se requiere de elementos <input> para validar.');
            }
            if (typeof validator !== 'function') {
                return console.error('Se requiere de una función para validar.');
            }

            $inputs.each(function () {
                var $input = $(this);

                var valPer = function () {
                    var isValid = validator($input.val());
                    $input.removeClass('invalid valid').addClass(isValid ? 'valid' : 'invalid');
                };
                var valErr = function () {
                    var isValid = validator($input.val());

                    if (!isValid) {
                        $input.removeClass('valid').addClass('invalid');
                        $input.off('input', valPer).on('input', valPer);
                    }
                };
                var valFocus = function () {
                    var focused = $input.data('valFirstFocused');

                    if (focused === undefined) {
                        $input.data('valFirstFocused', 1);
                        $input.on('input', valErr);
                    }
                    else if (focused === 1) {
                        $input.data('valFirstFocused', 2);
                        $input.off('input', valErr);
                        $input.off('input', valPer).on('input', valPer);
                    }
                };

                $input.on('focus', valFocus).on('change', valPer);
                valErr();
            });
        },

        /**
         * @alias Elise.val.onInput
         */
        keyup: function () {
            return this.onInput.apply(this, arguments);
        },

        /**
         * Valida si un string es un número.
         * @param  {String} text - String a evaluar.
         * @return {Boolean} Si es válido número o no.
         */
        number: function (text) {
            if (String(text).indexOf('e') > -1) return false;
            return !jQuery.isArray(text) && (text - parseFloat(text) + 1) >= 0;
        },

        /**
         * Valida si un string es un número entero.
         * @param  {String} text String a evaluar.
         * @return {Boolean}     Si el string es un número entero.
         */
        integer: function (text) {
            if (!Elise.val.number(text)) return false;
            text = Number(text);
            return Math.floor(text) === text;
        },

        /**
         * Valida si un string es un número natural (entero mayor o igual a 0).
         * @param  {String} text String a evaluar.
         * @return {Boolean}     Si el string es un número natural.
         */
        natural: function (text) {
            if (!Elise.val.number(text)) return false;
            text = Number(text);
            return Math.floor(text) === text && text >= 0;
        },

        /**
         * Valida un string de cuenta o contraseña de usuario.
         * @param  {String} text - Contenido a validar.
         * @param  {Object} cg - Configuración de la validación.
         * @param  {Number} cg.starts - Mínima logitud del texto.
         * @param  {Number} cg.ends - Máxima longitud del texto.
         * @param  {Boolean} cg.pass - Si es una contraseña o nombre de cuenta.
         * El nombre de cuenta acepta carácteres alfanuméricos, mientras que la
         * contraseña puede aceptar varios carácteres especiales. Por defecto es nombre
         * de cuenta.
         * @return {Boolean} - Si es válido.
         */
        account: function (text, cg, te) {
            var re;
            var config = {};

            // Fallback de compatibilidad.
            if (typeof cg === 'number') config.starts = cg;
            if (typeof te === 'number') config.ends = te;
            config = $.extend(config, cg);

            // Validar parámetros.
            if (config.starts !== undefined && !Elise.val.integer(config.starts)) {
                return console.error('El segundo parametro debe ser un entero positivo.');
            }
            if (config.ends !== undefined && !Elise.val.integer(config.ends)) {
                return console.error('El tercer parametro debe ser un entero positivo.');
            }

            // Definir expresión.
            config.ends = config.ends ? config.ends : 32;

            // Es una contraseña.
            if (config.pass) {
                config.starts = config.starts ? config.starts : 8;
                re = new RegExp("^[a-zA-Z0-9#@$%&*-_]{"+ config.starts +","+ config.ends +"}$");
            }

            // Es un nombre de cuenta.
            else {
                config.starts = config.starts ? config.starts : 4;
                re = new RegExp("^[a-zA-Z0-9]{"+ config.starts +","+ config.ends +"}$");
            }

            return re.test(text);
        },

        /**
         * Valida si el string es un email válido.
         * @param  {String} text String a evaluar.
         * @return {Boolean}     Si el string es email válido.
         */
        email: function (text) {
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(text);
        },

        /**
         * Valida que un string sólo contenga palabras sin carácteres especiales.
         * Puede contener puntos, comas y espacios.
         * @param  {String} text   String a evaluar.
         * @return {Boolean}       Si el string es válido.
         */
        text: function (text) {
            text = String(text).toLowerCase();
            var textSecure = '-_:;., áéíóúabcdefghijklmnñopqrstuvwxyz0123456789';
            for (var i = 0; i < text.length; i += 1) {
                if (textSecure.indexOf(text.charAt(i)) === -1) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Valida que un string sólo tenga una palabra con sólo carácteres alfabéticos.
         * @param  {String} text String a evaluar.
         * @return {Boolean}     Si el string es válido.
         */
        word: function (text) {
            text = String(text).toLowerCase();
            var textSecure = 'áéíóúabcdefghijklmnñopqrstuvwxyz';
            for (var i = 0; i < text.length; i += 1) {
                if (textSecure.indexOf(text.charAt(i)) === -1) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Valida si un string contiene sólo palabras alfabéticas.
         * @param  {String} text   El string a evaluar.
         * @return {Boolean}       Si es válido.
         */
        words: function (text) {
            text = String(text).toLowerCase();
            var textSecure = ':;., áéíóúabcdefghijklmnñopqrstuvwxyz';
            for (var i = 0; i < text.length; i += 1) {
                if (textSecure.indexOf(text.charAt(i).toLowerCase()) === -1) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Valida si el string sólo contiene carácteres ASCII escribibles
         * (http://www.ascii-code.com/) y letras con tíldes del alfabeto español y la ñ.
         * @param  {String} text String a evaluar.
         * @return {Boolean}     Si el string es válido.
         */
        content: function (text) {
            var textSecure = 'áéíóúñ';

            // Remover los carácteres ASCII (los cuales son válidos).
            text = String(text).replace(/[\x20-\x7E]/g, '').toLowerCase();

            // Verificar que los carácteres restantes se encuentren entre los del español.
            for (var i = 0; i < text.length; i += 1) {
                if (textSecure.indexOf(text.charAt(i)) === -1) {
                    return false;
                }
            }

            return true;
        },

        /**
         * Convierte un string a un string válido como nombre de archivo.
         * Esto es usualmente utilizado con nombres de archivos. Para realmente convertir
         * un nombre de archivo para guardar en el servidor, se debe realizar este
         * procedimiento en el servidor.
         * @param  {String} text Nombre del archivo a parsear.
         * @return {String}      String convertido y validado.
         */
        toFileName: function (text) {
            var text = String(text).toLowerCase();

            // Convertir carácteres especiales del español.
            text = text.replace(new RegExp('á', 'g'), 'a');
            text = text.replace(new RegExp('é', 'g'), 'e');
            text = text.replace(new RegExp('í', 'g'), 'i');
            text = text.replace(new RegExp('ó', 'g'), 'o');
            text = text.replace(new RegExp('ú', 'g'), 'u');
            text = text.replace(new RegExp('ñ', 'g'), 'n');

            // Convertir espacios en dashes y remover carácteres especiales.
            text = text.replace(/\s/gi, '-');
            text = text.replace(/[^a-z0-9_-]/gi, '');

            return text;
        },

        /**
         * @alias Elise.val.toFileName
         */
        filename: function () {
            return this.toFileName.apply(this, arguments);
        }
    };

    /**
     * Métodos relacionados con la ventana.
     */
    Elise.win = {

        /**
         * Definir altura de <iframe> de acuerdo a la altura de su contenido.
         * @param  {String} iframe DOM node del iframe o identificador del mismo.
         * @param  {String} level  Nivel donde se encuentra contenido el iframe en
         * referencia a la actual window: top | top2 | self.
         * @param  {Number} min    Altura minima en pixeles.
         * @param  {Number} plus   Altura sumada/restada al total calculado a definir
         * en pixeles.
         * @return {Number}        Altura total aplicada en pixeles.
         */
        fitIframe: function (iframe, level, min, plus) {
            var win = {};
            win.scroll = $(window.top).scrollTop();

            // Definiendo nivel del contenedor del iframe.
            if (!level || level === 'self') {
                level = window;
            } else if (level === 'top') {
                level = window.parent;
            } else if (level === 'top2') {
                level = window.parent.parent;
            }

            // Conseguir iframe.
            if (typeof iframe === 'string') {
                iframe = level.document.getElementById(iframe);
            }
            else if (typeof iframe !== 'object') {
                return console.error('Se necesita el elemento del iframe o su identificador.');
            }

            // Consiguiendo elemento.
            if (iframe) {
                min = Elise.val.number(min) ? min : 300;
                plus = Elise.val.number(plus) ? plus : 0;

                // Calcular altura del contenido del iframe.
                $(iframe).height('auto');
                win.height = Elise.win.contentHeight(iframe);

                // Aplicar altura.
                win.res = win.height > min ? win.height : min;
                $(iframe).add($(iframe).parent('.centro')).height(win.res + plus);
                $(window.top).scrollTop(win.scroll);

                // TODO:
                // Repintar el iframe al cargarse correctamente.

                return win.res + plus;
            } else {
                return -1;
            }
        },
        
        /**
         * Conseguir la altura del contenido de un <iframe>.
         * @param  {DOMNode} obj Objeto del iframe a estudiar.
         * @return {Number}      Altura del contenido del iframe.
         */
        contentHeight: function (obj) {
            var height = 0;
            if (obj.Document && obj.Document.body.scrollWidth) {
                height = obj.contentWindow.document.body.scrollHeight;
            } else if (obj.contentDocument && obj.contentDocument.body.scrollWidth) {
                height = obj.contentDocument.body.scrollHeight;
            } else if (obj.contentDocument && obj.contentDocument.body.offsetWidth) {
                height = obj.contentDocument.body.offsetWidthHeight;
            }
            return height;
        },

        /**
         * Conseguir las dimensiones usables de una ventana de navegador.
         * @param  {Number} wMin Ancho mínimo.
         * @param  {Number} hMin Altura mínima.
         * @param  {Number} wMax Ancho máximo.
         * @param  {Number} hMax Altura máxima.
         * @return {Number}      Dimensiones calculadas de acuerdo a los rangos.
         */
        dims: function (wMin, hMin, wMax, hMax) {
            var dim = {
                width: 0,
                height: 0
            };

            if (typeof window.top.innerWidth !== "undefined") {
                dim.width = window.top.innerWidth;
                dim.height = window.top.innerHeight;
            }
            else if (typeof window.top.document.documentElement !== "undefined"
                    && typeof window.top.document.documentElement.clientWidth !== 'undefined'
                    && window.top.document.documentElement.clientWidth != 0) {
                dim.width = window.top.document.documentElement.clientWidth;
                dim.height = window.top.document.documentElement.clientHeight;
            }
            else {
                dim.width = window.top.document.getElementsByTagName("body")[0].clientWidth;
                dim.height = window.top.document.getElementsByTagName("body")[0].clientHeight;
            }

            dim.width = wMin ? (dim.width < wMin ? wMin : dim.width) : dim.width;
            dim.width = wMax ? (dim.width > wMax ? wMax : dim.width) : dim.width;
            dim.height = hMin ? (dim.height < hMin ? hMin : dim.height) : dim.height;
            dim.height = hMax ? (dim.height > hMax ? hMax : dim.height) : dim.height;

            return dim;
        },

        /**
         * Conseguir altura del contenido de una página.
         * @param  {DOMNode} win Ventana a estudiar.
         * @return {Number}      Altura total.
         */
        height: function (win) {
            win = win ? win.document : window.document;
            return Math.max(
                Math.max(win.body.scrollHeight, win.documentElement.scrollHeight),
                Math.max(win.body.offsetHeight, win.documentElement.offsetHeight),
                Math.max(win.body.clientHeight, win.documentElement.clientHeight)
            );
        },

        /**
         * Llevar el scroll de la página en donde un elemento se encuentre en el medio.
         * Se hace una animación ara ello. El elemento debe ser visible.
         * @param  {jQuery} $el - El elemento a animar.
         * @param  {Number} time - El tiempo de animación. 500 es por defecto.
         * @return {jQuery} - El elemento animado.
         */
        scrollTo: function ($el, time) {
            $el = $($el).first();

            var y = $el.offset().top;
            var h2 = Elise.win.dims().height / 2;
            y = y - h2 < 0 ? 0 : y - h2;

            $('html, body').stop().animate({
                scrollTop: y
            }, time || 500);

            return $el;
        }
    };

    /**
     * Creador de ventana popup.
     * @param  {Object} config Configuración {url, name, position, width, height, left, top}
     * donde config.position puede tomar 'normal' | 'top' | 'full' | 'center'.
     * @return {Object} Ventana del popup.
     */
    Elise.popup = function (config) {
        var props = '';
        config = config ? config : {};

        // Target de la ventana.
        config.name = config.name ? config.name : '_blank';

        // Dimensiones por defecto.
        config.width = config.width ? config.width : 900;
        config.height = config.height ? config.height : 500;

        // Posición de la ventana.
        if (config.position === 'normal') {
            config.left = config.top = 0;
        }
        else if (config.position === 'top') {
            config.left = screen.availWidth / 2 - config.width / 2;
            config.top = 0;
        }
        else if (config.position === 'full') {
            config.left = config.top = 0;
            config.width = screen.availWidth;
            config.height = screen.availHeight;
        } else {
            config.left = screen.availWidth / 2 - config.width / 2;
            config.top = screen.availHeight / 2 - config.height / 2;
        }

        // Procesando propiedades.
        props += 'width=' + config.width;
        props += ',height=' + config.height;
        props += ',left=' + config.left;
        props += ',top=' + config.top;
        props += ',scrollbars=yes';

        // Creando y retornando objeto ventana.
        return window.open(config.url, config.name, props);
    };

})();
