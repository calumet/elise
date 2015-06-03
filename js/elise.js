/*!
 * Elise Library
 * Version 0.6.1
 * Updated 2014-05-16
 * Duvan Jamid @DuvanJamid
 * Romel Perez prhone.blogspot.com
 * Licence http://www.opensource.org/licenses/mit-license.php
 * Repository http://github.com/calumet/elise
 **/

window.Elise = window.$e = {
    /**
     * Version of Elise.
     */
    VERSION: '0.6.1',

    /**
     * Private variables.
     */
    _fn: {
        /**
         * Instance of script.
         * @type {Number}
         */
        instance: Date.now()
    }
};


// String Validations
Elise.val = {

    // input validator while use is typing
    // @$input is the jquery input object to observe
    // @validator is the function to validate
    _keyup: function ($input, validator) {
        var kuval = function (e) {
            if (validator($input.val())) {
                $input.removeClass('invalid').addClass('valid');
            } else {
                $input.removeClass('valid').addClass('invalid');
            }
        };
        $input.on('focus', function () {
            var focused = $input.data('valFirstFocused');
            if (focused) {
                if (focused === 1) {
                    $input.on('keyup', kuval);
                    $input.data('valFirstFocused', 2);
                }
            } else {
                $input.data('valFirstFocused', 1);
            }
        }).on('blur', kuval);
    },

    // dot, comma, whitespace, letters, numbers
    _textSecure: "., áéíóúabcdefghijklmnñopqrstuvwxyz0123456789",
    _wordsSecure: "., áéíóúabcdefghijklmnñopqrstuvwxyz",

    // Account validator limits
    _accountInit: 6,
    _accountEnds: 15,

    email: function(text){
        if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(text)) {
            return true;
        }
        return false;
    },

    number: function(text){
        return $.isNumeric(text);
    },

    account: function(text, starts, ends){
        starts = starts ? starts : Elise.val._accountInit;
        ends = ends ? ends : Elise.val._accountEnds;
        var re = new RegExp("^[0-9a-zA-Z\*]{"+ starts +","+ ends +"}$");
        if(re.test(text)) return true;
        return false;
    },

    text: function(text){
        for(var i=0; i<text.length; i++)
            if(utf8_decode(Elise.val._textSecure).indexOf(text.charAt(i).toLowerCase()) == -1)
                return false;
        return true;
    },

    words: function(text){
        for(var i=0; i<text.length; i++)
            if(utf8_decode(Elise.val._wordsSecure).indexOf(text.charAt(i).toLowerCase()) == -1)
                return false;
        return true;
    },

    filename: function(text){
        var text = text.toLowerCase();
        text = replaceAll(text,utf8_decode("á"),"a");
        text = replaceAll(text,utf8_decode("é"),"e");
        text = replaceAll(text,utf8_decode("í"),"i");
        text = replaceAll(text,utf8_decode("ó"),"o");
        text = replaceAll(text,utf8_decode("ú"),"u");
        text = replaceAll(text,utf8_decode("á"),"a");
        text = replaceAll(text,utf8_decode("ñ"),"n");
        text = replaceAll(text," ", "_");
        text = replaceAll(text,"'", "");
        text = replaceAll(text,utf8_decode("´"), "");
        text = replaceAll(text,",", "");
        text = replaceAll(text,utf8_decode("¨"), "");
        text = replaceAll(text,":", "");
        text = replaceAll(text,";", "");
        return text;
    }

};



// Window functionalities
Elise.win = {

    // Reset the height of the iframe by its content height
    // @level = { top | top2 | self }
    fitIframe: function(iframe, level, min, plus){
        if (level === undefined  ||  level === 'self') {
            level = window;
        } else if (level === 'top') {
            level = window.parent;
        } else if (level === 'top2') {
            level = window.parent.parent;
        }

        if (typeof(iframe) === "string") {
            iframe = level.document.getElementById(iframe);
        }

        min = Elise.val.number(min) ? min : 300;
        plus = Elise.val.number(plus) ? plus : 0;
        $(iframe).height('auto');

        var win = {
            scroll: $(window.top).scrollTop(),  // Actual window scroll
            height: Elise.win.contentHeight(iframe),  // Content height in the iframe
            res: 0  // Total height
        };
        
        win.res = win.height > min ? win.height : min;
        $(iframe).add($(iframe).parent('.centro')).height(win.res + plus);
        $(window.top).scrollTop(win.scroll);

        return win.res + plus;  // Retonar altura aplicada
    },

    // Get the content height of an element, like a iframe
    contentHeight: function(obj){
        var height = 0;
        if(obj.Document && obj.Document.body.scrollWidth){
            height = obj.contentWindow.document.body.scrollHeight;
        }else if(obj.contentDocument && obj.contentDocument.body.scrollWidth){
            height = obj.contentDocument.body.scrollHeight;
        }else if(obj.contentDocument && obj.contentDocument.body.offsetWidth){
            height = obj.contentDocument.body.offsetWidthHeight;
        }
        return height;
    },

    // Get the useable window size like a JSON object
    dims: function(){
        var dim = {
            width: 0,
            height: 0
        };
        if(typeof window.top.innerWidth != "undefined"){
            dim.width = window.top.innerWidth;
            dim.height = window.top.innerHeight;
        }
        else if(typeof window.top.document.documentElement != "undefined" && typeof window.top.document.documentElement.clientWidth != 'undefined' && window.top.document.documentElement.clientWidth != 0){
            dim.width = window.top.document.documentElement.clientWidth;
            dim.height = window.top.document.documentElement.clientHeight;
        }
        else{
            dim.width = window.top.document.getElementsByTagName("body")[0].clientWidth;
            dim.height = window.top.document.getElementsByTagName("body")[0].clientHeight;
        }
        return dim;
    },

    // Get the content height of a page
    height: function (win) {
        win = win ? win.document : window.document;
        return Math.max(
            Math.max(win.body.scrollHeight, win.documentElement.scrollHeight),
            Math.max(win.body.offsetHeight, win.documentElement.offsetHeight),
            Math.max(win.body.clientHeight, win.documentElement.clientHeight)
        );
    }

};



// Popup utility
Elise.popup = function (config) {
    var props = '';

    // Name
    config.name = config.name ? config.name : '_blank';

    // Dimensions
    config.width = config.width ? config.width : 900;
    config.height = config.height ? config.height : 500;

    // Position
    if (config.position === 'normal') {
        config.left = config.top = 0;
    } else if (config.position === 'top') {
        config.left = screen.availWidth / 2 - config.width / 2;
        config.top = 0;
    } else if (config.position === 'full') {
        config.left = config.top = 0;
        config.width = screen.availWidth;
        config.height = screen.availHeight;
    } else {
        config.left = screen.availWidth / 2 - config.width / 2;
        config.top = screen.availHeight / 2 - config.height / 2;
    }

    // Parse data
    props += 'width=' + config.width;
    props += ',height=' + config.height;
    props += ',left=' + config.left;
    props += ',top=' + config.top;
    props += ',scrollbars=yes';

    // Return the new window object
    return window.open(config.url, config.name, props);
};


/**
 * Elise Modal.
 */
(function (window, $) {

    // Botones preconstruidos.
    var buttons = {
        cancel: {
            btnText: 'Cancel',
            btnClass: 'emodal_hide', // emodal_hide, clase que se utiliza para cerrar.
            btnPosition: 'right' // right | left | center
            //btnId: 'emodal_button_hide',
            //btnColor: 'rojo', // red | green | blue | dark-blue | orange | sky-blue | black | ...
            //btnClick: function () {}
        },
        close: {
            btnText: 'Close',
            btnClass: 'emodal_hide',
            btnPosition: 'right'
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
            url: false,  // String URL.
            container: false,  // String ID, HTML node, jQuery.
            onEscKeyClose: true,  // Cerrar con la tecla ESC.
            show: true,  // Mostrar al instanciarlo.
            win: window.top,  // Ventana en la trabajará el modal. Útil en iframes.
            title: '',
            emodalWidth: 600,
            emodalContentHeight: 300,
            buttons: ['cancel'],  // Colección de botones por defecto vacía.
            background: true,  // Si se muestra con background.
            delay: 100,
            fadeIn: 500,
            fadeOut: 500,
            onCreate: null,
            onBeforeOpen: null,
            onOpen: null,
            onBeforeClose: null,
            onClose: null
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
            this.container = this.config.win.$('#'+ this.config.container);
            if (this.config.win !== window && !!this.container.length) {
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
                      this.config.win, this.config.container);
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
        this.config.win.$('body').append(emodal_hold);
        
        // Referencia del DOM al controlador.
        this.emodal = this.config.win.$('#'+ this.id);

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
        $(this.config.win).on('resize', function (e) {
            if (_this._shown) _this.autoPosition(e);
        });

        // Al presionar la tecla ESC.
        $(this.config.win.document).on('keydown', function (e) {
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
            $.each(this.config.buttons, function (i, item) {

                // Botones preestablecidos.
                if (typeof item === 'string') {
                    switch (item.toLowerCase()) {
                        case 'cancel': item = buttons.cancel; break;
                        case 'close': item = buttons.close; break;
                    }
                }

                // Insertar botón.
                item.btnPosition = item.btnPosition === 'center' ? 'none' : item.btnPosition;
                emodal_footer.append(
                    $('<button>', {
                        'id': item.btnId,
                        'class': 'ebutton '+ (item.btnClass ? item.btnClass : '')
                            +' '+ (item.btnColor ? item.btnColor : ''),
                        'html': item.btnText,
                        'css': {
                            'float': item.btnPosition ? item.btnPosition : 'right'
                        },
                        'click': item.btnClick ? item.btnClick.bind(_this) : null
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
                if (_this.config.onBeforeOpen) _this.config.onBeforeOpen.call(_this);
                
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
                    _this.config.onOpen && _this.config.onOpen.call(_this);
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
                if (_this.config.onBeforeClose) _this.config.onBeforeClose.call(_this);

                // Animar para ocultar.
                _this.emodal.animate({
                    'opacity': 0
                }, _this.config.fadeOut, function () {
                    _this.emodal.css('display', 'none');
                    _this._shown = false;
                    
                    // Después de ocultarse.
                    _this.config.onClose && _this.config.onClose.call(_this);
                    callback && typeof callback === 'function' && callback.call(_this);
                });
            }, this.config.delay);
        }
        return this;
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

})(window, jQuery);


// Alert Extended
// Copyright 2011, Halil Ä°brahim Kalyoncu
// License: BSD
// Modified by Oliver Kopp, 2012
Elise.alert = function (data) {

    var background, holder, container, alertType, buttons;
    var dim, top, left;

    // Configuration
    var win = window.top;
    var isShown = false;
    var eleFocus = $('*:focus');
    var id = 'alert_' + (new Date().getTime());
    var options = $.extend({
        content: data.content ? data.content : '',
        title: '',
        type: 'alert',
        autoClose: false,
        timeOut: 0,
        showButtons: true,
        buttons: [{
            value: "Okay",
            click: function () {}
        }],
        success: function () {},
        beforeShow: function () {},
        afterShow: function () {},
        beforeClose: function () {},
        afterClose: function () {},
        btype: 'orange'
    }, data);


    // Message type
    switch (options.type) {
        case "alert":
            alertType = "ealert-alert";
            options.title = options.title ? options.title : "Alert";
            options.btype = "orange";
            break;
        case "info":
            alertType = "ealert-info";
            options.title = options.title ? options.title : "Information";
            options.btype = "sky-blue";
            break;
        case "error":
            alertType = "ealert-error";
            options.title = options.title ? options.title : "Error";
            options.btype = "red";
            break;
        case "confirm":
            alertType = "ealert-confirm";
            options.title = options.title ? options.title : "Confirm";
            options.btype = "green";
            options.buttons = data.buttons ? options.buttons : [
                {value: "Okay", type: 'green', click: function () {}},
                {value: "Cancel", type: ' ',  click: function () {}}
            ];
            break;
    }


    // Create structure
    // Container
    container = $('<div>').html(
        $('<div class="ealert-image"></div>')
        .add( $('<div class="ealert-content"></div>').html( $('<p>').html($('<span>').html(options.content))) )
    );
    // Buttons bar
    buttons = $('<div class="ealert-buttons"></div>');
    $.map(options.buttons, function(v, i) {
        buttons.append($("<button>", {
        'class': 'ealert-button ebutton ebutton-small ' + (v.type ? v.type: options.btype),
        'html': v.value,
        'click': v.click
    }));
    });
    // Structure
    background = $('<div id="' + id + '" class="ealert-holder"></div>');
    holder = $('<div>', {
        'class': 'ealert ' + alertType,
        'html': $('<div class="ealert-title"></div>').html(options.title)
                .add(container)
                .add(options.showButtons ? buttons : '')
    });
    // Render
    win.$("body").append(background.append(holder));


    // Positioning
    var autoPosition = function () {
        var width = holder.width();
        var height = holder.height();
        dim = win.Elise.win.dims();
        top = height >= dim.height ? 0 : (dim.height / 2 - height / 2);
        left = width >= dim.width ? 0 : (dim.width / 2 - width / 2);
        holder.css({
            top: top,
            left: left
        });
        background.css({
            width: dim.width,
            height: dim.height
        });
    };


    // Show
    var show = function () {
        if (isShown) {
            return;
        }
        holder.css({
            top: top - 50,
            left: left
        });
        background.css({
            opacity: 0,
            width: dim.width,
            height: dim.height
        }).animate({
            opacity: 1
        }, 200);
        holder.animate({
            top: top,
            left: left
        }, 200, function () {
            holder.find('button').focus();
            options.afterShow();
        });
        isShown = true;
        holder.trigger('focus');
        options.beforeShow();
    };


    // Hide
    var hide = function () {
        if (!isShown) {
            return;
        }
        holder.animate({
            opacity: 0,
            top: top - 50,
            left: left
        }, 200, function () {
            isShown = false;
            background.remove();
            eleFocus.trigger('focus');
            options.afterClose();
        });
        options.beforeClose();
    };


    // Initialization
    autoPosition();

    $(win).on('resize', function () {
        if (isShown) {
            autoPosition();
        }
    });
    holder.find('button.ealert-button').on('click', function (e) {
        e.preventDefault();
        options.success($(this).text() === 'Okay' ? true : false);
        hide();
    });
    if (options.autoClose) {
        options.timeOut = options.timeOut ? options.timeOut : (options.content ? options.content.length * 70 : 500);
        setTimeout(hide, options.timeOut);
    }
    background.on('click', function (G) {
        if (!options.showButtons || options.autoClose) {
            hide();
        } else {
            holder.fadeOut(200).fadeIn(200);
        }
    });
    show();
    return background;

};

// Override window.alert
window._alert = window.alert;
window.alert = function (content, config) {
    config = $.extend(config, {
        content: content
    });
    return Elise.alert(config);
};



// Tip Extended
// Copyright 2010 Drew Wilson
// code.drewwilson.com/entry/tiptip-jquery-plugin
// Modified by Romel Perez 2013
jQuery.fn.tip = function (c) {

    // Configuration
    var defaults = {
        activation: "hover",
        keepAlive: false,
        maxWidth: "300px",
        edgeOffset: 3,
        defaultPosition: "bottom",
        delay: 200,
        fadeIn: 200,
        fadeOut: 200,
        attribute: "title",
        content: false,
        enter: function () {},
        exit: function () {}
    };
    var opts = $.extend(defaults, c);


    // Create o select tip
    var tooltip_holder, tooltip_content, tooltip_arrow;
    if ($("#tiptip_holder").length <= 0) {
        tooltip_holder = $('<div id="tiptip_holder"></div>');
        tooltip_content = $('<div id="tiptip_content"></div>');
        tooltip_arrow = $('<div id="tiptip_arrow"></div>');
        $("body").append(tooltip_holder.html(tooltip_content).prepend(tooltip_arrow.html('<div id="tiptip_arrow_inner"></div>')))
    } else {
        tooltip_holder = $("#tiptip_holder");
        tooltip_content = $("#tiptip_content");
        tooltip_arrow = $("#tiptip_arrow")
    }

    return this.each(function () {
        var org_elem = $(this);
        var content = "";
        var timeout = false;

        tooltip_holder.css("max-width", opts.maxWidth);

        if (org_elem.attr(opts.attribute) != undefined && org_elem.attr(opts.attribute) != "") {
            content = org_elem.attr(opts.attribute);
            org_elem.removeAttr(opts.attribute)
        } else {
            if (org_elem.data("idtooltip") != undefined) {
                $content = $("#" + org_elem.data("idtooltip"));
                content = $content.html();
                $content.remove();
                opts.keepAlive = true
            }
        }

        // If there is content to render
        if (content !== "") {
            if (!opts.content) {
                org_elem.removeAttr(opts.attribute)
            }
            $.fn.toolTipOver = false;
            if (opts.activation === "hover") {
                org_elem.hover(function () {
                    $.fn.toolTipOver = true;
                    activate()
                }, function () {
                    $.fn.toolTipOver = false;
                    if (!opts.keepAlive) {
                        disable()
                    } else {
                        setTimeout(function () {
                            if (!$.fn.toolTipOver) {
                                disable()
                            }
                        }, opts.delay)
                    }
                });
                if (opts.keepAlive) {
                    tooltip_holder.hover(function () {
                        $.fn.toolTipOver = true
                    }, function () {
                        $.fn.toolTipOver = false;
                        disable()
                    })
                }
            } else {
                if (opts.activation === "focus") {
                    org_elem.focus(function () {
                        activate()
                    }).blur(function () {
                        disable()
                    })
                } else {
                    if (opts.activation == "click") {
                        org_elem.click(function () {
                            activate();
                            return false
                        }).hover(function () {},
                            function () {
                                if (!opts.keepAlive) {
                                    disable()
                                }
                            });
                        if (opts.keepAlive) {
                            tooltip_holder.hover(function () {}, function () {
                                disable()
                            })
                        }
                    }
                }
            }

            // Show tip
            function activate () {
                opts.enter.call(this);
                tooltip_content.html(content);
                tooltip_holder.hide().removeAttr("class").css("margin", "0");
                tooltip_arrow.removeAttr("style");

                var top = parseInt(org_elem.offset()["top"]);
                var left = parseInt(org_elem.offset()["left"]);
                var org_width = parseInt(org_elem.outerWidth());
                var org_height = parseInt(org_elem.outerHeight());
                var tip_w = tooltip_holder.outerWidth();
                var tip_h = tooltip_holder.outerHeight();
                var w_compare = Math.round((org_width - tip_w) / 2);
                var h_compare = Math.round((org_height - tip_h) / 2);
                var marg_left = Math.round(left + w_compare);
                var marg_top = Math.round(top + org_height + opts.edgeOffset);
                var t_class = "";
                var arrow_top = "";
                var arrow_left = Math.round(tip_w - 12) / 2;

                if (opts.defaultPosition == "bottom") {
                    t_class = "_bottom"
                } else {
                    if (opts.defaultPosition == "top") {
                        t_class = "_top"
                    } else {
                        if (opts.defaultPosition == "left") {
                            t_class = "_left"
                        } else {
                            if (opts.defaultPosition == "right") {
                                t_class = "_right"
                            }
                        }
                    }
                }

                var right_compare = (w_compare + left) < parseInt($(window).scrollLeft());
                var left_compare = (tip_w + left) > parseInt($(window).width());

                if ((right_compare && w_compare < 0) || (t_class == "_right" && !left_compare) || (t_class == "_left" && left < (tip_w + opts.edgeOffset + 5))) {
                    t_class = "_right";
                    arrow_top = Math.round(tip_h - 13) / 2;
                    arrow_left = -6;
                    marg_left = Math.round(left + org_width + opts.edgeOffset);
                    marg_top = Math.round(top + h_compare)
                } else {
                    if ((left_compare && w_compare < 0) || (t_class == "_left" && !right_compare)) {
                        t_class = "_left";
                        arrow_top = Math.round(tip_h - 13) / 2;
                        arrow_left = Math.round(tip_w);
                        marg_left = Math.round(left - (tip_w + opts.edgeOffset + 5));
                        marg_top = Math.round(top + h_compare)
                    }
                }

                var top_compare = (top + org_height + opts.edgeOffset + tip_h + 8) > parseInt($(window).height() + $(window).scrollTop());
                var bottom_compare = ((top + org_height) - (opts.edgeOffset + tip_h + 8)) < 0;

                if (top_compare || (t_class == "_bottom" && top_compare) || (t_class == "_top" && !bottom_compare)) {
                    if (t_class == "_top" || t_class == "_bottom") {
                        t_class = "_top"
                    } else {
                        t_class = t_class + "_top"
                    }
                    arrow_top = tip_h;
                    marg_top = Math.round(top - (tip_h + 5 + opts.edgeOffset))
                } else {
                    if (bottom_compare | (t_class == "_top" && bottom_compare) || (t_class == "_bottom" && !top_compare)) {
                        if (t_class == "_top" || t_class == "_bottom") {
                            t_class = "_bottom"
                        } else {
                            t_class = t_class + "_bottom"
                        }
                        arrow_top = -6;
                        marg_top = Math.round(top + org_height + opts.edgeOffset)
                    }
                }

                if (t_class == "_right_top" || t_class == "_left_top") {
                    marg_top = marg_top + 5
                } else {
                    if (t_class == "_right_bottom" || t_class == "_left_bottom") {
                        marg_top = marg_top - 5
                    }
                }

                if (t_class == "_left_top" || t_class == "_left_bottom") {
                    marg_left = marg_left + 5
                }

                tooltip_arrow.css({
                    "margin-left": arrow_left + "px",
                    "margin-top": arrow_top + "px"
                });
                tooltip_holder.css({
                    "margin-left": marg_left + "px",
                    "margin-top": marg_top + "px"
                }).attr("class", "tip" + t_class);
                if (timeout) {
                    clearTimeout(timeout)
                }
                timeout = setTimeout(function () {
                    tooltip_holder.stop(true, true).fadeIn(opts.fadeIn)
                }, opts.delay)
            }

            // Hide tip
            function disable () {
                opts.exit.call(this);
                if (timeout) {
                    clearTimeout(timeout)
                }
                tooltip_holder.fadeOut(opts.fadeOut)
            }
        }
    });

};



// Loader
Elise.loader = function (data) {

    var $animation, $texto;
    var handler = {};


    // Configuration
    handler.config = $.extend({
        selector: '',  // Where to append it
        type: 'spin',  // spin | bar
        text: 'Loading, please wait...',  // false | '' to not add text
        textPosition: 'bottom',  // 'bottom' | 'top'
        determinate: false,  // If you know the percentages
        percentage: 0,  // The process if there is determinate
        show: true,  // Show at start
        width: '100%',  // Its width
        fadeTime: 250,  // show/hide animation time
        updateTime: 200,  // animation time at text change

        // Loader Styles
        size: 'normal',  // spin: size
        border: true  // bar: border
    }, data);


    // Create structure
    handler.loader = $('<div class="eloader" style="display:none"></div>').css('width', handler.config.width);
    $animation = $('<div>');
    handler.loader.append($animation);
    // SPIN
    if (handler.config.type === 'spin') {
        $animation.addClass('spin');
        if (handler.config.determinate) {
            $animation.append('<svg>'
                            + '<circle class="progress" transform="translate(30,30) rotate(-90)" r="25" cy="0" cx="0"></circle>'
                            + '<circle transform="translate(30,30)" r="25" cy="0" cx="0"></circle>'
                            + '</svg>'
                            + '<div class="progress-count">0%</div>');
        } else {
            $animation.addClass('undeterminate').html('<div class="spin-ball1"></div><div class="spin-ball2"></div>');
            if (handler.config.size === 'mini') {
                $animation.addClass('spin-mini');
            }
        }
    }
    // BAR
    else {
        $animation.addClass('bar')
        if (!handler.config.border) {
            $animation.css('border-width', 0);
        }
        if (handler.config.determinate) {
            $animation.append($('<div class="progress" style="width: 0%">').html('0%'));
        } else {
            $animation.addClass('undeterminate')
            .append('<div class="bar-ball bar-ball1"></div>'
                  + '<div class="bar-ball bar-ball2"></div>'
                  + '<div class="bar-ball bar-ball3"></div>'
                  + '<div class="bar-ball bar-ball4"></div>');
        }
    }
    // If create text
    if (handler.config.text) {
        $texto = $('<div class="state">').html(handler.config.text);
        if (handler.config.textPosition === 'bottom') {
            handler.loader.append($texto);
        } else {
            handler.loader.prepend($texto);
        }
    }


    // Update loader state
    // @config = {text, percentage, width}
    handler.update = function (config) {
        var $state, width, rotated;

        if (config) {
            // Update text if it exists
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

            // Update percentage
            if (config.percentage && handler.config.determinate) {
                // SPIN
                if (handler.config.type === 'spin') {
                    rotated = 157 * (config.percentage / 100);  // 157 is stroke-dasharray value of .progress
                    $animation.find('.progress').animate({'stroke-dashoffset': 157 - rotated}, handler.config.updateTime);
                    handler.loader.find('.progress-count').html(config.percentage + '%');
                }
                // BAR
                else {
                    handler.loader.find('.progress')
                    .animate({'width': config.percentage + '%'}, handler.config.updateTime)
                    .html(config.percentage + '%');
                }
            }

            // Update loader width
            config.width ? handler.loader.animate({width: config.width}, handler.config.updateTime) : undefined;
        }

        return handler;
    };


    // Finish animation
    handler.destroy = function (time, fn) {
        handler.hide(time ? time : handler.config.fadeTime, function () {
            handler.loader.remove();
            fn ? fn() : undefined;
        });
        return handler;
    };


    // Show
    handler.show = function (time, fn) {
        handler.loader.show(time ? time : handler.config.fadeTime, fn);
        return handler;
    };


    // Hide
    handler.hide = function (time, fn) {
        handler.loader.hide(time ? time : handler.config.fadeTime, fn);
        return handler;
    };


    // Initialization
    $(handler.config.selector).append(handler.loader);
    if (handler.config.show) {
        handler.loader.fadeIn(handler.config.fadeTime);
    }
    handler.update({percentage: handler.config.percentage});
    return handler;

};

// jQuery plugin loader
jQuery.fn.loader = function (data) {
    $.extend(data, {selector: this});
    return Elise.loader(data);
};



// Hope
Elise.hope = function (data) {

    var handler, hope_hold, hope;
    var win = window.top;
    var defaultConfig = {
        reset: false,
        width: 300,
        background: 'rgba(0,0,0,0.3)',
        animation: 'slideDown',  // Animation show/hide: slideDown, fadeIn
        animationIn: 250,
        animationOut: 250,
        onOpen: function () {},
        onClose: function () {},
        loader: {text: 'Processing, please wait...'}
    };


    // Update if it is being shown AND there is not a reset parameter
    if (win.Elise._fn.hope && win.Elise._fn.hope._shown) {
        if (data && !data.reset) {
            win.Elise._fn.hope.update(data);  // Update
            return win.Elise._fn.hope;  // Return it
        }
    }


    // Reinstantiate
    if (win.Elise._fn.hope) {
        
        handler = win.Elise._fn.hope;
        handler.config = $.extend(defaultConfig, data);
        hope_hold = handler.hope;
        hope = hope_hold.find('.ehope').html('');

    }
    // Create it
    else {

        // Save reference
        handler = win.Elise._fn.hope = {};


        // Configuration
        handler.config = $.extend(defaultConfig, data);


        // Create
        hope_hold = $('<div id="ehope" class="ehope-hold" style="display: none;"></div>');
        hope = $('<div class="ehope"></div>');
        handler.hope = hope_hold;  // Referenciar


        // Configurate
        win.$('body').append(hope_hold.html(hope));
        $(win).on('resize', function () {
            handler._shown ? handler.position('fadein') : undefined;
        });

    }


    // Others
    handler.config.animation = handler.config.animation.toLowerCase();


    // Instantiate loader
    handler.config.loader.selector = hope;
    handler.loader = Elise.loader(handler.config.loader);


    // Update
    handler.update = function (config) {
        // If there is @config, update the showing modal
        if (handler._shown && config) {
            handler.loader.update(config);
        }
        // Update modal if it is not shown
        // @width, @background
        else {
            hope.css('width', handler.config.width);
            hope_hold.css('background-color', handler.config.background);
        }
        // Reset focus
        hope.trigger('focus');
    };


    // Positioning
    handler.position = function (type) {
        // Only if it is shown
        if (handler._shown) {
            var width = hope.outerWidth();
            var height = hope.outerHeight();
            var dim = win.Elise.win.dims();
            var left = '50%';
            var top = '50%';
            hope_hold.css({
                width: dim.width,
                height: dim.height
            });
            hope.css({
                'left': left,
                'top': 0,
                'margin-left': '-' + (width / 2) + 'px',
                'margin-top': '-' + (height / 2) + 'px'
            });
            if (!type && handler.config.animation === 'slidedown') {
                hope.stop().animate({top: top}, handler.config.animationIn);
            } else {
                hope.css('top', top);
            }
        }
    };


    // Hide
    handler.destroy = handler.hide = function () {
        if (handler._shown) {
            hope_hold.fadeOut(handler.config.animationOut, function () {
                handler._shown = false;
                handler.config.onClose();
            });
            if (handler.config.animation === 'slidedown') {
                hope.animate({top: 0}, handler.config.animationOut);
            }
        }
    };


    // Initialization
    handler.update();
    hope_hold.stop().show(handler.config.animationIn);
    handler._shown = true;
    handler.config.animation === 'slidedown' ? handler.position() : handler.position("fadein");
    handler.config.onOpen();
    return handler;

};



// DOM Loaded Events
$(document).ready(function () {

    // Nothing so far...

});


