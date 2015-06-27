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
