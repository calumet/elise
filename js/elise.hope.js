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
