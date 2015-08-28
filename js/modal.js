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
