/*! elise
 * @version 0.7.0-beta
 * @release 2015-07-30
 * @url https://github.com/calumet/elise
 */

(function () {

    window.Elise = {
        /**
         * Version of Elise.
         */
        VERSION: '0.7.0-beta',

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

    // Dispositivo móvil.
    Elise.isMobile = function () {
        var check = false;
        (function (a, b) {
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
                check = true
        })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    }();

    // Navegador obsoleto.
    Elise.isObsolete = !('querySelector' in document && 'localStorage' in window && 'addEventListener' in window);

    /**
     * Métodos relacionados con validaciones.
     */
    Elise.val = {

        /**
         * Validar un <input> con una función, cada vez que se teclee un símbolo.
         * @param  {jQueryObject} $inputs - Elementos tipo campo de texto a observar.
         * @param  {Function} validator - Función a ejecutar por cada validación. Recibe
         * en primer parámetro el contenido del input y debe retornar un booleano de si
         * es válida la entrada o no.
         */
        keyup: function ($inputs, validator) {
            $inputs = $($inputs);

            // Validar entradas.
            if ($inputs.length === 0) {
                return console.error('Se requiere de elementos <input> para validar.');
            }
            if (typeof validator !== 'function') {
                return console.error('Se requiere de una funcion para validar.');
            }

            $inputs.each(function () {
                var $input = $(this);
                var kuval = function () {
                    if (validator($input.val())) {
                        $input.removeClass('invalid').addClass('valid');
                    } else {
                        $input.removeClass('valid').addClass('invalid');
                    }
                };
                $input.on('focus', function () {
                    var focused = $input.data('valFirstFocused');
                    if (focused === undefined) {
                        $input.data('valFirstFocused', 1);
                    } else if (focused === 1) {
                        $input.on('keyup', kuval);
                        $input.data('valFirstFocused', 2);
                    }
                }).on('blur', kuval);
            });
        },

        /**
         * Valida si un string es un número.
         * @param  {String} text - String a evaluar.
         * @return {Boolean} Si es válido número o no.
         */
        number: function (text) {
            return $.isNumeric(text);
        },

        /**
         * Valida si un string es un número entero.
         * @param  {String} text String a evaluar.
         * @return {Boolean}     Si el string es un número entero.
         */
        integer: function (text) {
            if (!$.isNumeric(text)) return false;
            text = Number(text);
            return Math.floor(text) === text;
        },

        /**
         * Valida si un string es un número natural (entero mayor o igual a 0).
         * @param  {String} text String a evaluar.
         * @return {Boolean}     Si el string es un número natural.
         */
        natural: function (text) {
            if (!$.isNumeric(text)) return false;
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
                re = new RegExp("^[a-zA-Z0-9#@?$%&*-_]{"+ config.starts +","+ config.ends +"}$");
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
            if (Elise._ISO88591) {
                textSecure = utf8_decode(textSecure);
            }
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
            if (Elise._ISO88591) {
                textSecure = utf8_decode(textSecure);
            }
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
            if (Elise._ISO88591) {
                textSecure = utf8_decode(textSecure);
            }
            for (var i = 0; i < text.length; i += 1) {
                if (textSecure.indexOf(text.charAt(i).toLowerCase()) == -1) {
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
        filename: function (text) {
            var ct = Elise._ISO88591 ? utf8_decode : function (t) {return t};
            var text = String(text).toLowerCase();

            // Convertir carácteres especiales del español.
            text = text.replace(new RegExp(ct('á'), 'g'), 'a');
            text = text.replace(new RegExp(ct('é'), 'g'), 'e');
            text = text.replace(new RegExp(ct('í'), 'g'), 'i');
            text = text.replace(new RegExp(ct('ó'), 'g'), 'o');
            text = text.replace(new RegExp(ct('ú'), 'g'), 'u');
            text = text.replace(new RegExp(ct('ñ'), 'g'), 'n');

            // Convertir espacios en dashes y remover carácteres especiales.
            text = text.replace(/\s/gi, '-');
            text = text.replace(/[^a-z0-9_-]/gi, '');

            // Retornar resultado.
            return text;
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


/**
 * Elise Tip
 * Extendido de code.drewwilson.com/entry/tiptip-jquery-plugin
 * Copyright 2010 Drew Wilson
 */

(function () {

    var defaultOptions = {
        content: null,
        attribute: 'title',
        maxWidth: 300,
        edgeOffset: 3,
        activation: 'hover',
        keepAlive: null,
        defaultPosition: 'bottom',
        delay: 200,
        onCreate: null,
        onShow: null,
        onHide: null
    };

    var Tip = function (data) {
        var $content;

        this.$el = data.$el;
        this.opts = $.extend({}, defaultOptions, data.config);

        if (!this.opts.content) {
            if (this.$el.attr(this.opts.attribute)) {
                this.opts.content = this.$el.attr(this.opts.attribute);
                this.$el.removeAttr(this.opts.attribute);
            }
            else if (this.$el.data('tip-content')) {
                $content = $('#'+ this.$el.data('tip-content'));
                $content.attr('hidden', '');
                this.opts.content = $content.html();
                this.opts.keepAlive = this.opts.keepAlive === null ? true : this.opts.keepAlive;
            }
        }

        // Sólo si se encontró contenido válido para el tip, crearlo.
        if (this.opts.content) this._build();
    };

    Tip.prototype._build = function () {
        var _this = this;

        // Se utiliza un timeout para evitar colisiones de ocultados y mostrados
        // simultáneos del tip.
        this._timeout = null;

        // Si se está pasando el mouse por encima del elemento o del tip. Se
        // pondrá negativo si se cierra el tip.
        this._over = false;

        this._id = 'etip-'+ (++Elise._fn.tip.count);
        this._shown = false;

        this.$tip_holder = $('<div id="'+ this._id +'" class="tip_holder hidden">');
        this.$tip_content = $('<div class="tip_content">');
        this.$tip_arrow = $('<div class="tip_arrow"><div class="tip_arrow_inner">');

        this.$tip_holder.css('max-width', this.opts.maxWidth);

        $('body').append(this.$tip_holder.html(this.$tip_content).prepend(this.$tip_arrow));

        // Determinar cómo mostrar el tip. Por defecto el 'hover'.
        if (this.opts.activation === 'focus') {
            this.$el.on('focus', this.show.bind(this)).on('blur', this.hide.bind(this));
        }
        else if (this.opts.activation === 'click') {
            this.$el.on('click', function (e) {
                e.preventDefault();
                if (_this._over) {
                    _this._over = false;
                    _this.hide();
                } else {
                    _this._over = true;
                    _this.show();
                }
            });
            this.$tip_holder.on('mouseleave', this.hide.bind(this));
        } else {
            this.$el.on('mouseenter', function () {
                _this._over = true;
                _this.show();
            });
            this.$tip_holder.on('mouseenter', function (e) {
                _this._over = true;
            });
            this.$el.on('mouseleave', function (e) {
                _this._over = false;
                if (_this.opts.keepAlive) {
                    setTimeout(function () {
                        if (!_this._over) _this.hide();
                    }, 250);
                } else {
                    _this.hide();
                }
            });
            this.$tip_holder.on('mouseleave', function (e) {
                _this._over = false;
                if (_this.opts.keepAlive) {
                    setTimeout(function () {
                        if (!_this._over) _this.hide();
                    }, 250);
                } else {
                    _this.hide();
                }
            });
        }

        this.opts.onCreate && this.opts.onCreate.call(this);

        return this;
    };

    Tip.prototype.show = function () {
        if (this._shown) return;
        this._shown = true;

        var _this = this;

        this.$tip_content.html(this.opts.content);
        this.$tip_holder.css('margin', 0);
        this.$tip_arrow.removeAttr('style');

        var t_class, arrow_top;
        var top = parseInt(this.$el.offset()["top"]);
        var left = parseInt(this.$el.offset()["left"]);
        var org_width = parseInt(this.$el.outerWidth());
        var org_height = parseInt(this.$el.outerHeight());
        var tip_w = this.$tip_holder.outerWidth();
        var tip_h = this.$tip_holder.outerHeight();
        var w_compare = Math.round((org_width - tip_w) / 2);
        var h_compare = Math.round((org_height - tip_h) / 2);
        var marg_left = Math.round(left + w_compare);
        var marg_top = Math.round(top + org_height + this.opts.edgeOffset);
        var arrow_left = Math.round(tip_w - 12) / 2;

        switch (this.opts.defaultPosition) {
            case 'top':   t_class = "_top"; break;
            case 'left':  t_class = "_left"; break;
            case 'right': t_class = "_right"; break;
            default:      t_class = "_bottom"; break;
        }

        var right_compare = (w_compare + left) < parseInt($(window).scrollLeft());
        var left_compare = (tip_w + left) > parseInt($(window).width());

        if ((right_compare && w_compare < 0) || (t_class == "_right" && !left_compare)
        || (t_class == "_left" && left < (tip_w + this.opts.edgeOffset + 5))) {
            t_class = "_right";
            arrow_top = Math.round(tip_h - 13) / 2;
            arrow_left = -6;
            marg_left = Math.round(left + org_width + this.opts.edgeOffset);
            marg_top = Math.round(top + h_compare)
        } else if ((left_compare && w_compare < 0) || (t_class == "_left" && !right_compare)) {
            t_class = "_left";
            arrow_top = Math.round(tip_h - 13) / 2;
            arrow_left = Math.round(tip_w);
            marg_left = Math.round(left - (tip_w + this.opts.edgeOffset + 5));
            marg_top = Math.round(top + h_compare)
        }

        var top_compare = (top + org_height + this.opts.edgeOffset + tip_h + 8)
          > parseInt($(window).height() + $(window).scrollTop());
        var bottom_compare = ((top + org_height) - (this.opts.edgeOffset + tip_h + 8)) < 0;

        if (top_compare || (t_class == "_bottom" && top_compare) || (t_class == "_top" && !bottom_compare)) {
            if (t_class == "_top" || t_class == "_bottom") {
                t_class = "_top"
            } else {
                t_class = t_class + "_top"
            }
            arrow_top = tip_h;
            marg_top = Math.round(top - (tip_h + 5 + this.opts.edgeOffset))
        }
        else if (bottom_compare | (t_class == "_top" && bottom_compare) || (t_class == "_bottom" && !top_compare)) {
            if (t_class == "_top" || t_class == "_bottom") {
                t_class = "_bottom"
            } else {
                t_class = t_class + "_bottom"
            }
            arrow_top = -6;
            marg_top = Math.round(top + org_height + this.opts.edgeOffset)
        }

        if (t_class == "_right_top" || t_class == "_left_top") {
            marg_top = marg_top + 5
        }
        else if (t_class == "_right_bottom" || t_class == "_left_bottom") {
            marg_top = marg_top - 5
        }

        if (t_class == "_left_top" || t_class == "_left_bottom") {
            marg_left = marg_left + 5
        }

        this.$tip_arrow.css({
            "margin-left": arrow_left + "px",
            "margin-top": arrow_top + "px"
        });
        this.$tip_holder.css({
            "margin-left": marg_left + "px",
            "margin-top": marg_top + "px"
        }).attr("class", "tip_holder hidden tip" + t_class);

        if (this._timeout) clearTimeout(this._timeout);
        this._timeout = setTimeout(function () {
            _this.$tip_holder.removeClass('hidden');
        }, this.opts.delay);

        this.opts.onShow && this.opts.onShow.call(this);
        return this;
    };

    Tip.prototype.hide = function () {
        if (!this._shown) return;
        this._shown = this._over = false;

        if (this._timeout) clearTimeout(this._timeout);
        this.$tip_holder.addClass('hidden');

        this.opts.onHide && this.opts.onHide.call(this);
        return this;
    };

    jQuery.fn.tip = function (conf) {
        return this.each(function () {
            new Tip({
                $el: $(this),
                config: conf
            });
        });
    };

})();


/**
 * Elise Alert
 * Extendido de https://github.com/dotCtor/jQuery.msgBox
 * 2011-2013 Halil İbrahim Kalyoncu and Oliver Kopp
 * License: BSD
 */

(function () {

    /**
     * Constructor.
     * @param {Object} data - Configuración del mensaje.
     * @param {String} data - Mensaje a mostrar.
     * @param {Object} optional - Si data fue un string, entonces éste es la configuración.
     */
    Elise.alert = function (data, optional) {
        if (typeof data === 'string') data = $.extend({content: data}, optional);

        /*
         * Las variables que se crean en cada instancia de mensajes, tendrá un tiempo
         * de vida útil hasta que se cierra el mensaje, ya que se remueve del DOM.
         * El mensaje se muestra apenas se crea.
         */

        var $background,
            $holder,
            $container,
            $buttons,
            $button,
            imgSrc;

        // El controlador es un fallback, el mensaje no tiene largo tiempo de vida.
        var handler = {};

        var id = 'eAlert-'+ (++Elise._fn.alert.count);
        var _isShown = false;

        // Ruta de imágenes. Recomendado colocarlo en ruta absoluta.
        var imgFolder = '../img/elise/alert/';

        var config = $.extend({
            _win: window,
            content: '',
            title: null,
            type: 'alert',
            btype: null,
            showButtons: true,
            buttons: [{
                state: 1,
                value: 'Aceptar',
                type: null,
                icon: null,
                onClick: null
            }],
            autoClose: false,
            timeOut: 7000,
            onBeforeShow: null,
            onShow: null,
            onBeforeHide: null,
            onHide: null
        }, data);
        var _win = config._win;

        // Guardar el objeto actual que tiene el foco del usuario para devolverlo luego.
        var $eleFocus = _win.$('*:focus');

        // Determinar tipo de mensaje.
        switch (config.type) {
            case "alert":
                imgSrc = "alert.png";
                config.title = config.title ? config.title : "Alerta";
                config.btype = config.btype ? config.btype : "orange";
                break;
            case "info":
                imgSrc = "info.png";
                config.title = config.title ? config.title : "Informaci&oacute;n";
                config.btype = config.btype ? config.btype : "sky-blue";
                break;
            case "error":
                imgSrc = "error.png";
                config.title = config.title ? config.title : "Error";
                config.btype = config.btype ? config.btype : "red";
                break;
            case "confirm":
                imgSrc = "confirm.png";
                config.title = config.title ? config.title : "Confirmaci&oacute;n";
                config.btype = config.btype ? config.btype : "green";
                
                // Tener en cuenta que se verifica al objeto 'data' en vez de a 'config'
                // para saber si hubieron botones enviados.
                config.buttons = data.buttons ? config.buttons : [
                    {state: 1, value: "Aceptar",  type: "green"},
                    {state: 0, value: "Cancelar", type: ""}
                ];
                break;
        }

        $background = $('<div id="'+ id +'" class="eAlert-BackGround">');

        $container = $('<div class="eAlert-Container">');
        $container.html(
            $('<div class="eAlert-Image"><img src="'+ imgFolder + imgSrc +'">')
        );
        $container.append(
            $('<div class="eAlert-Content">').html(
                $('<div>').html(
                    $('<div>').html(config.content)
                )
            )
        );

        if (config.showButtons) {
            $buttons = $('<div class="eAlert-Buttons">');
            $.each(config.buttons, function (i, v) {
                $button = $("<button>", {
                    'class': 'eAlert-button ebutton '
                      + (typeof v.type === 'string' ? v.type : config.btype),
                    'html': $(v.icon ? '<span class="icon '+ v.icon +'">' : null)
                            .add($('<span class="label">').html(v.value)),
                    'click': v.onClick ? v.onClick.bind($background) : null
                })
                .data('eAlert-button-state', v.state);
                $buttons.append($button);
            });
        }

        $holder = $('<div>', {
            'class': 'eAlert',
            'html': $('<div class="eAlert-Title">').html(config.title)
                .add($container)
                .add(config.showButtons ? $buttons : null)
        });

        _win.$('body').append($background.append($holder));

        var autoPosition = function () {
            if (!_isShown) return;
            var width = $holder.outerWidth();
            var height = $holder.outerHeight();
            $holder.css({
                'margin-left': - (width / 2),
                'margin-top': - (height / 2)
            });
            return handler;
        };

        var show = function () {
            if (_isShown) return;

            var width = $holder.outerWidth();
            var height = $holder.outerHeight();

            $holder.css({
                'margin-left': - (width / 2),
                'margin-top': - (height / 2) - 50
            });
            $background.css({
                opacity: 0
            }).animate({
                opacity: 1
            }, 200);
            $holder.animate({
                'margin-top': - (height / 2)
            }, 200, function () {

                // Agregar foco al primer botón que encuentre en lista.
                $holder.find('button').trigger('focus');

                config.onShow && config.onShow.call(handler);
            });

            _isShown = true;
            config.onBeforeShow && config.onBeforeShow.call(handler);

            return handler;
        };

        var hide = function () {
            if (!_isShown) return;

            var state = $background.data('eAlert-button-state');
            var height = $holder.outerHeight();

            $holder.animate({
                opacity: 0,
                'margin-top': - (height / 2) - 50
            }, 200, function () {
                _isShown = false;
                $background.remove();
                $(_win).off('resize', autoPosition);
                $eleFocus.trigger('focus');

                config.onHide && config.onHide.call(handler, state);
            });

            config.onBeforeHide && config.onBeforeHide.call(handler, state);
            $(_win).off('resize', autoPosition);

            return handler;
        };

        $(_win).on('resize', autoPosition);

        $holder.find('.eAlert-button').on('click', function (e) {
            e.preventDefault();

            // Resultado del usuario.
            var state = $(this).data('eAlert-button-state');
            $background.data('eAlert-button-state', state);

            // Ocultar mensaje.
            hide();
        });

        // Cliquear el background del mensaje.
        $background.on('click', function (e) {
            !config.showButtons || config.autoClose
              ? hide()
              : $holder.fadeOut(200).fadeIn(200);
        });
        $holder.on('click', function (e) {
            e.stopPropagation();
        });

        // Determinar si se va a cerrar automáticamente después.
        if (config.autoClose) {
            config.timeOut = config.timeOut
              ? config.timeOut
              : (config.content ? config.content.length * 70 : 500);
            setTimeout(hide, config.timeOut);
        }

        handler.$background = $background;
        handler.config = config;

        show();

        return handler;
    };

    // Sobreescribir window.alert con Elise.alert.
    window.alert = function () {
        Elise.alert.apply(Elise.alert, arguments);
        return this;
    };

})();


/**
 * Elise Modal
 */

(function () {

    // Botones preconstruidos.
    var buttons = {
        cancel: {
            value: 'Cancelar',
            'class': 'emodal_hide' // emodal_hide, clase que se utiliza para cerrar.
            //pósition: 'right', // right | left | center
            //id: 'emodal_button_hide',
            //color: 'orange',
            //onClick: function () {}
        },
        close: {
            value: 'Cerrar',
            'class': 'emodal_hide'
        }
    };


    /**
     * Elise modal handler constructor.
     * @api private
     * @param {Object} data Configuración de instancia.
     */
    var Handler = function (data) {
        this._elise = Elise._fn.instance;  // Con cuál instancia de Elise se ha creado.
        this._shown = false;  // Si está mostrado/mostrándose o no.
        this._reInstance = false;  // Si ya se había creado y se está reinstanciando en el mismo window.
        this._reOutInstance = false;  // Si ya se había creado y se está reinstanciando por fuera del mismo window.
        this._reOutDeref = false;  // _reOutInstance es true y es instancia de un window recargado.

        this.id = null;  // Identificador del modal.
        this.emodal = null;  // El elemento completo del modal.
        this.url = false;  // Si es tipo URL, sino, entonces es contenedor.

        // El elemento que tiene el contenido a mostrar en el modal. Cuando se
        // mueve dentro del contenedor this.emodal, éste sigue referenciando a él
        // mismo. Adentro tendrá la clase .emodal_content.
        this.container = null;

        // El contenido HTML inicial que tiene el this.container. Se hace así
        // en caso de reiniciar el contenido en perdidas de referencia entre páginas.
        this.htmlBase = '';

        // Configuración.
        this.config = $.extend({
            _win: window,  // Ventana en la trabajará el modal. Útil en iframes.
            container: null,  // String ID, HTML node, jQuery.
            url: null,  // String URL.
            onEscKeyClose: true,  // Cerrar con la tecla ESC.
            show: true,  // Mostrar al instanciarlo.
            title: '',
            emodalWidth: 600,
            emodalContentHeight: 300,
            buttons: ['cancel'],  // Colección de botones por defecto vacía.
            background: true,  // Si se muestra con background.
            delay: 100,
            fadeIn: 500,
            fadeOut: 500,
            onCreate: null,
            onBeforeShow: null,
            onShow: null,
            onBeforeHide: null,
            onHide: null
        }, data);

        // Modal tipo URL o contenedor.
        var handler;
        if (this.config.url) {
            this.url = true;
        } else {

            // Sólo guardar el string identificador.
            if (typeof this.config.container === 'string' && this.config.container.charAt(0) === '#') {
                this.config.container = this.config.container.substring(1);
            } else if (typeof this.config.container !== 'string') {
                this.config.container = $(this.config.container).attr('id');
            }

            // Conseguir contenedor si está renderizado en otro window.
            this.container = this.config._win.$('#'+ this.config.container);
            if (this.config._win !== window && !!this.container.length) {
                handler = this.container.data('emodal');

                // El container es instanciado.
                if (handler) {
                    this._reOutInstance = true;
                    this.htmlBase = handler.htmlBase;

                    // El container ha perdido referencia de la página instanciadora.
                    if (handler._elise !== Elise._fn.instance) {
                        this._reOutDeref = true;
                    }

                    return this;
                }

                // Error, hay un mismo elemento (contenedor) con el mismo ID en
                // una página distinta a window y no es porque se haya movido desde
                // éste window, sino porque está duplicado.
                else {
                    return console.error('Hay colision de IDs en el window %o en el id "%s".',
                      this.config._win, this.config.container);
                }
            }

            // Conseguir contenedor si está en el mismo window.
            this.container = $('#'+ this.config.container);
            if (!!this.container.length) {
                handler = this.container.data('emodal');

                // Reinstanciando.
                if (handler) {
                    this._reInstance = true;
                    this.htmlBase = handler.htmlBase;
                }

                // Creando por primera vez.
                else {
                    this.htmlBase = this.container.html().trim();
                }
            } else {
                return console.error('El contenedor "%s" no se encuentra.', this.config.container);
            }
        }
    };

    /**
     * Construir modal. Propiedades y referencias.
     * @api private
     * @return {Object} Controlador.
     */
    Handler.prototype._build = function () {
        var _this = this;

        // Definir id.
        this.id = 'emodal_'+ Date.now();

        // Crear estructura del modal: wrapper, modal, header, contenedor y footer.
        var emodal_hold = $('<div id="'+ this.id +'" class="emodal_hold" style="display:none">');
        var emodal = $('<div class="emodal">');
        var emodal_header = $('<div class="emodal_header">');
        emodal_header.html(
            $('<button>', {
                'class': 'emodal_close emodal_hide',
                'type': 'button',
                'html': '&times;'
            }).add('<h3 class="emodal_title">')
        );
        var emodal_content = this.url
          ? $('<iframe class="emodal_content emodal_content_url">')
          : $('<div class="emodal_content">');
        emodal_content.attr('id', this.config.container);
        var emodal_footer = '<div class="emodal_footer">';

        // Agregar/mover al DOM del window donde se renderizará.
        emodal_hold.html(emodal);
        emodal.append(emodal_header).append(emodal_content).append(emodal_footer);
        this.config._win.$('body').append(emodal_hold);
        
        // Referencia del DOM al controlador.
        this.emodal = this.$modal = this.config._win.$('#'+ this.id);
        this.$ = this.emodal.find.bind(this.$modal);

        // Tipo contenedor.
        if (this.container) {

            // Reemplazar contenedor.
            this.container.remove();
            this.container = null;
            this.container = this.emodal.find('#'+ this.config.container);

            // Referencia del controlador en el DOM.
            this.container.data('emodal', this);
        }

        // Re/Configurar modal.
        this._configure();

        // Redimensionando la ventana.
        $(this.config._win).on('resize', function (e) {
            if (_this._shown) _this.autoPosition(e);
        });

        // Al presionar la tecla ESC.
        $(this.config._win.document).on('keydown', function (e) {
            if (_this._shown && _this.config.onEscKeyClose && e.which === 27) {
                _this.hide();
            }
        });

        // Mostrar inicialmente.
        if (this.config.show) this.show();

        // Esperar que retorne y luego si utilizar el cacheado por fuera con .onCreate().
        setTimeout(function () {
            if (_this.config.onCreate) _this.config.onCreate.call(_this);
        }, 1);

        return this;
    };

    /**
     * Re/Aplicar configuraciones a estructura. Dimensiones, fondo, título,
     * contenido y botones.
     * @api private
     * @return {Object} Controlador.
     */
    Handler.prototype._configure = function () {
        var _this = this;

        // Dimensiones.
        this.emodal.find('.emodal').css('width', this.config.emodalWidth);
        this.emodal.find('.emodal_content').css('height', this.config.emodalContentHeight);

        // Fondo.
        this.emodal.css('background', this.config.background ? '' : 'none');

        // Título y contenido.
        this.emodal.find('.emodal_header').find('.emodal_title').html(this.config.title);
        if (this.url) {
            this.emodal.find('.emodal_content').attr('src', this.config.url);
        } else {
            this.emodal.find('.emodal_content').html(this.htmlBase);
        }

        // Vaciar contenedor de botones. Crear botones si los hay y mostrarlos.
        var emodal_footer = this.emodal.find('.emodal_footer');
        emodal_footer.addClass('hidden').empty();
        if (!!this.config.buttons.length) {

            // Por cada botón.
            $.each(this.config.buttons, function (i, button) {

                // Botones preestablecidos.
                if (typeof button === 'string') {
                    switch (button.toLowerCase()) {
                        case 'cancel': button = buttons.cancel; break;
                        case 'close': button = buttons.close; break;
                    }
                }

                // Insertar botón.
                button.position = button.position === 'center' ? 'none' : button.position;
                emodal_footer.append(
                    $('<button>', {
                        'id': button.id,
                        'class': 'ebutton '+ (button['class'] ? button['class'] : '')
                            +' '+ (button.color ? button.color : ''),
                        'html': button.value,
                        'css': {
                            'float': button.position ? button.position : 'right'
                        },
                        'click': button.onClick ? button.onClick.bind(_this) : null
                    })
                );
            });

            // Mostrar.
            emodal_footer.removeClass('hidden');
        }

        // Permitir cerrar cuando se cliqueen objetos con la clase .emodal_hide.
        this.emodal.find('.emodal_hide').on('click', function (e) {
            _this.hide.call(_this, e);
        });

        return this;
    };

    /**
     * Destruir el modal.
     * @api public
     * @param  {Function} callback
     * @return {Object} Controlador.
     */
    Handler.prototype.destroy = function (callback) {
        var _this = this;
        this.hide(function () {
            this.emodal.remove();
            callback && typeof callback === 'function' && callback.call(_this);
        });
        return this;
    };

    /**
     * Actualizar configuración.
     * @api public
     * @param  {Object} config Configuración a actualizar.
     * @return {Object} Controlador.
     */
    Handler.prototype.update = function (config) {
        this.config = config;
        this._configure();
        return this;
    };

    /**
     * Re/posicionar el modal en la ventana designada.
     * @api public
     * @return {Object} Controlador.
     */
    Handler.prototype.autoPosition = function () {
        var emodal = this.emodal.find('.emodal');
        var dim = Elise.win.dims();

        // Calcular dimensiones.
        var width = emodal.outerWidth() / 2;
        width = width > (dim.width / 2) ? -(dim.width / 2) + 20 : -width;
        var height = dim.height / 2 - emodal.outerHeight() / 2;
        height = height < 10 ? 10 : height;

        // Dimensionar.
        emodal.css({
            'margin-left': width,
            'margin-top': height
        });
        return this;
    };

    /**
     * Mostrar el modal.
     * @api public
     * @param  {Function} callback
     * @return {Object} Controlador.
     */
    Handler.prototype.show = function (callback) {
        var _this = this;
        if (!this._shown) {
            setTimeout(function () {

                // Antes de mostrarse.
                if (_this.config.onBeforeShow) _this.config.onBeforeShow.call(_this);

                // Animación de mostrado y posicionamiento.
                _this.emodal.css('opacity', 0);
                _this.emodal.css('display', 'block');
                _this.autoPosition();
                _this.emodal.animate({
                    'opacity': 1
                }, _this.config.fadeIn, function () {
                    _this._shown = true;
                    _this.emodal.trigger('focus');

                    // Después de mostrarse.
                    _this.config.onShow && _this.config.onShow.call(_this);
                    callback && typeof callback === 'function' && callback.call(_this);
                });

            }, this.config.delay);
        }
        return this;
    };

    /**
     * Esconder el modal.
     * @api public
     * @param  {Function} callback
     * @return {Object} Controlador.
     */
    Handler.prototype.hide = function (callback) {
        var _this = this;
        if (this._shown) {
            setTimeout(function () {

                // Antes de ocultarse.
                if (_this.config.onBeforeHide) _this.config.onBeforeHide.call(_this);

                // Animar para ocultar.
                _this.emodal.animate({
                    'opacity': 0
                }, _this.config.fadeOut, function () {
                    _this.emodal.css('display', 'none');
                    _this._shown = false;
                    
                    // Después de ocultarse.
                    _this.config.onHide && _this.config.onHide.call(_this);
                    callback && typeof callback === 'function' && callback.call(_this);
                });
            }, this.config.delay);
        }
        return this;
    };

    /**
     * Averiguar si el modal está siendo mostrado o no.
     * @return {Boolean} Si está mostrado.
     */
    Handler.prototype.isShown = function () {
        return this._shown;
    };

    /**
     * Interfaz del modal.
     * @param {Object} data Configuración.
     * @api public
     * @return {Object} Controlador.
     */
    Elise.modal = window.eModal = function (data) {

        // Instanciar controlador del modal.
        var hl = new Handler(data);

        // Modal tipo container siendo reinstanciado.
        var hlTemp;
        if (!hl.url) {
            hlTemp = hl.container.data('emodal');

            // NOTE: algunas configuraciones son necesarias al crear el modal.
            // Si se reinstancia con .update(config) tales configuraciones no
            // generarán ningún efecto. onEscKeyClose no es modifcable.

            // Desde el mismo window.
            if (hl._reInstance) {
                hlTemp.update(hl.config);
                return hlTemp.config.show ? hlTemp.show() : hlTemp;
            }

            // Desde otro window.
            else if (hl._reOutInstance) {

                // Referencias NO perdidas.
                if (!hl._reOutDeref) {
                    hlTemp.update(hl.config);
                    return hlTemp.config.show ? hlTemp.show() : hlTemp;
                } else {

                    // Eliminar previo y crearlo.
                    hlTemp.emodal.remove();
                    var hl = new Handler(data);
                }
            }
        }

        // Construir el modal.
        return hl._build();
    };

})();


/**
 * Elise Loader
 */

(function () {

    Elise.loader = function (data) {
        var $animation, $texto;
        var handler = {};

        // Definir configuración.
        handler.config = $.extend({
            selector: null, // En que elemento se incluira
            type: 'spin', // spin | bar
            text: 'Cargando, por favor espere...', // false para desactivar
            textPosition: 'bottom', // 'bottom' | 'top' Posicion del texto respecto a la animacion
            determinate: false, // Si se conoce un proceso dividido
            percentage: 0, // Si determinate es true, el estado
            show: true, // Mostrar inicialmente
            width: '100%', // Ancho respecto a su contenedor
            fadeTime: 250, // show/hide time en milésimas de segundo
            updateTime: 200, // Tiempo de actualiacion de estados

            // Loader Styles
            size: 'normal', // spin: tamano del loader
            border: true  // bar: mostrar borde
        }, data);
        handler.config.type = handler.config.type === 'spinner' ? 'spin' : handler.config.type;

        // Crear elementos.
        handler.loader = $('<div class="eloader" style="display:none">').css('width', handler.config.width);
        $animation = $('<div>');
        handler.loader.append($animation);
        handler.$loader = handler.loader;

        // Tipo SPIN.
        if (handler.config.type === 'spin') {
            $animation.addClass('spin');
            if (handler.config.determinate) {
                $animation.append([
                    '<svg>',
                      '<circle class="progress" transform="translate(30,30) rotate(-90)" r="25" cy="0" cx="0">',
                      '</circle>',
                      '<circle transform="translate(30,30)" r="25" cy="0" cx="0">',
                      '</circle>',
                    '</svg>',
                    '<div class="progress-count">0%</div>'
                ].join(''));
            } else {
                $animation.addClass('undeterminate').html('<div class="spin-ball1"></div><div class="spin-ball2"></div>');
                if (handler.config.size === 'mini') {
                    $animation.addClass('spin-mini');
                }
            }
        }

        // Tipo BAR.
        else {
            $animation.addClass('bar');
            if (!handler.config.border) {
                $animation.css('border-width', 0);
            }
            if (handler.config.determinate) {
                $animation.append($('<div class="progress" style="width: 0%">').html('0%'));
            } else {
                $animation.addClass('undeterminate')
                .append(['<div class="bar-ball bar-ball1"></div>',
                         '<div class="bar-ball bar-ball2"></div>',
                         '<div class="bar-ball bar-ball3"></div>',
                         '<div class="bar-ball bar-ball4"></div>'].join(''));
            }
        }

        // Agregar texto.
        if (handler.config.text) {
            $texto = $('<div class="state">').html(handler.config.text);
            if (handler.config.textPosition === 'bottom') {
                handler.loader.append($texto);
            } else {
                handler.loader.prepend($texto);
            }
        }

        /**
         * Método de actualizar el estado.
         * @param {Object} config - Configuración a actualizar.
         * @param {String} config.text - El texto.
         * @param {Number} config.percentage - El porcentaje de actualización.
         * @param {Number} config.width - El ancho del hope.
         * @return {Object} El controlador.
         */
        handler.update = function (config) {
            var $state, width, rotated;

            if (config) {

                // Actualizar texto si esta disponible.
                if (config.text && handler.config.text) {
                    $state = handler.loader.find('.state');
                    width = $state.outerWidth();
                    $state.animate({
                        'margin-left': '-' + width + 'px',
                        'opacity': 0
                    }, handler.config.updateTime / 2, function () {
                        $state
                        .css({
                            'width': width,
                            'margin-left': width
                        })
                        .html(config.text).stop().animate({
                            'margin-left': 0,
                            'opacity': 1
                        }, handler.config.updateTime / 2, function () {
                            $state.removeAttr('style');
                        });
                    });
                }

                // Actualizar porcentaje del proceso completado.
                if (config.percentage && handler.config.determinate) {

                    // SPIN.
                    if (handler.config.type === 'spin') {
                        rotated = 157 * (config.percentage / 100);  // El 157 es de la propiedad stroke-dasharray del .progress
                        $animation.find('.progress').animate({'stroke-dashoffset': 157 - rotated}, handler.config.updateTime);
                        handler.loader.find('.progress-count').html(config.percentage + '%');
                    }
                    // BAR.
                    else {
                        handler.loader.find('.progress')
                        .animate({'width': config.percentage + '%'}, handler.config.updateTime)
                        .html(config.percentage + '%');
                    }
                }

                // Actualizar ancho del loader.
                config.width ? handler.loader.animate({width: config.width}, handler.config.updateTime) : undefined;
            }

            return handler;
        };

        /**
         * Finalizar la animación.
         * @param  {Number} time - Tiempo hasta destruirlo.
         * @param  {Function} callback - Callback.
         * @return {Object} - Controlador.
         */
        handler.destroy = function (time, callback) {
            handler.hide(time ? time : handler.config.fadeTime, function () {
                handler.loader.remove();
                callback && callback.call(handler);
            });
            return handler;
        };

        /**
         * Mostrar el loader.
         * @param  {Number}  time - Tiempo para mostrarse.
         * @param  {Function} callback
         * @return {Object} - Controlador.
         */
        handler.show = function (time, callback) {
            handler.loader.show(time ? time : handler.config.fadeTime, callback);
            return handler;
        };

        /**
         * Ocultar el loader.
         * @param  {Number}   time - Tiempo para ocultarse.
         * @param  {Function} callback
         * @return {Object} - Controlador.
         */
        handler.hide = function (time, callback) {
            handler.update({percentage: 100})
              .loader.hide(time ? time : handler.config.fadeTime, callback);
            return handler;
        };

        /**
         * Remover loader instantaneamente.
         * @return {Object} - Controlador.
         */
        handler.remove = function () {
            handler.destroy(0);
        };

        $(handler.config.selector).append(handler.loader);
        if (handler.config.show) {
            handler.loader.fadeIn(handler.config.fadeTime);
        }
        handler.update({percentage: handler.config.percentage});

        return handler;
    };

    // Shortcut como método jQuery.
    jQuery.fn.loader = function (data) {
        data = $.extend({
            selector: this.first()
        }, data);
        return Elise.loader(data);
    };

})();


/**
 * Elise Hope
 */

(function () {

    /**
     * Constructor.
     * @param {Object} config Configuración de instancia.
     */
    var Hope = function (config) {
        this._elise = Elise._fn.instance;
        this._shown = false;
        this.config = config;
    };

    /**
     * Actualizar loader de la instancia.
     * @param {Object} config Configuración del loader.
     * @return {Object} Controlador.
     */
    Hope.prototype.update = function (config) {
        this.loader.update(config);
        this.hope.trigger('focus');
        return this;
    };

    /**
     * Actualizar posición del contenedor.
     * @return {Object} Controlador.
     */
    Hope.prototype.position = function (type) {
        if (!this._shown) return this;

        var hope_content = this.hope.find('.ehope');
        var width = hope_content.outerWidth();
        var height = hope_content.outerHeight();
        hope_content.css({
            'left': '50%',
            'top': 0,
            'margin-left': '-'+ (width / 2) +'px',
            'margin-top': '-'+ (height / 2) +'px'
        });
        if (!type && this.config.animation === 'slide') {
            hope_content.stop().animate({
                top: '50%'
            }, this.config.animationIn);
        } else {
            hope_content.css('top', '50%');
        }

        return this;
    };

    /**
     * Destruir instancia.
     * @return {Object} Controlador.
     */
    Hope.prototype.destroy = function (callback) {
        if (!this._shown) return this;
        var _this = this;

        this.update({
            percentage: 100
        });
        this.hope.fadeOut(this.config.animationOut, function () {
            _this._shown = false;
            _this.config.onClose && _this.config.onClose.call(_this);
            _this.config.onHide && _this.config.onHide.call(_this);
            callback && callback.call(_this);
        });
        if (this.config.animation === 'slide') {
            this.hope.animate({
                top: 0
            }, this.config.animationOut);
        }

        return this;
    };

    /**
     * Instanciar Elise Hope.
     * @param  {Object} data Configuración de instancia.
     * @return {Object}      Controlador del hope.
     */
    Elise.hope = function (data) {
        var handler, hope_hold, hope;

        // Parseando configuración.
        if (data && data.animation) {
            data.animation = data.animation.toLowerCase();
            data.animation = data.animation === 'slidedown'
              ? 'slide'
              : data.animation === 'fadein'
                ? 'fade'
                : data.animation;
        }
        var config = $.extend({
            _win: window.top,
            reset: false,
            width: 300,
            background: 'rgba(255,255,255,0.75)',
            animation: 'slide', // slide | fade
            animationIn: 250,
            animationOut: 250,
            //onShow: null,
            //onHide: null,
            loader: {
                fadeTime: 0
            }

            // Por compatibilidad.
            //onOpen: null,
            //onClose: null,
        }, data);
        var win = config._win;

        // Si ya había sido instanciado antes.
        if (win.Elise._fn.hope) {

            // Si el ehope perdió referencias o son de otra instancia de elise,
            // remover instancia de ventana.
            if (win !== window && win.Elise._fn.hope._elise !== Elise._fn.instance) {
                win.Elise._fn.hope.$hope.remove();
                win.Elise._fn.hope.$hope = null;
            }

            // Sino, actualizar si está siendo utilizado en este momento y sino se ha
            // enviado el parámetro resetear.
            else if (win.Elise._fn.hope._shown && !config.reset) {
                return win.Elise._fn.hope.update(data);
            }

            // Actualizar.
            handler = win.Elise._fn.hope;
            handler.config = config;
        }

        // Instanciarlo por primera vez.
        else {
            handler = win.Elise._fn.hope = new Hope(config);
            $(win).on('resize', function (e) {
                handler.position('fade');
            });
        }

        // Referenciar objetos o crearlos.
        if (handler.$hope) {
            hope_hold = handler.$hope;
            hope_content = hope_hold.find('.ehope').html('');
        } else {
            hope_hold = $('<div id="ehope" class="ehope-hold" style="display: none;">');
            hope_content = $('<div class="ehope">');
            handler.$hope = handler.hope = hope_hold;
            handler.$ = hope_hold.find.bind(hope_hold);
            win.$('body').append(hope_hold.html(hope_content));
        }

        // Instanciar Loader.
        handler.config.loader.selector = hope_content;
        handler.loader = Elise.loader(handler.config.loader);

        // Aplicar caracteristicas iniciales.
        hope_hold.css('background-color', handler.config.background);
        hope_content.css('width', handler.config.width);

        // Mostrar contenedor.
        hope_hold.stop().fadeIn(handler.config.animationIn);

        // Mostrar contenido.
        handler._shown = true;
        handler.config.animation === 'slide' ? handler.position() : handler.position('fade');
        handler.config.onOpen && handler.config.onOpen.call(handler);
        handler.config.onShow && handler.config.onShow.call(handler);

        return handler;
    };
})();
