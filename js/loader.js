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
