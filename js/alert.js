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
