/* *
 *  PLC
 *  bixie-plc-progress.js
 *  Created on 11-9-14 13:14
 *  
 *  @author Matthijs Alles
 *  @copyright Copyright (C)2014 Bixie.nl
 *
 */


(function (addon) {
    "use strict";

    var component;

    if (jQuery && jQuery.UIkit) {
        component = addon(jQuery, jQuery.UIkit);
    }

    if (typeof define == "function" && define.amd) {
        define("uikit-bixprogress", ["uikit"], function () {
            return component || addon(jQuery, jQuery.UIkit);
        });
    }

})(function ($, UI) {
    "use strict";

    UI.component('bixprogress', {

        defaults: {
            type: 'tact',
            suffix: '',
            blink: 0,
            progressbar: true,
            keys: {
                tact: {
                    key: 'Tact',
                    max: 'TactTijd',
                    target: 'TactTijd',
                    marge: 'TactMarge',
                    reset: 'tactReset'
                },
                shift: {
                    key: 'Shift',
                    max: 'ShiftLengte',
                    target: 'ShiftLengte',
                    reset: 'ShiftReset'
                }
            }
        },

        init: function () {
            this.blinker = false;
            this.blinkState = true;
            if (this.options.progressbar) {
                this.progress = this.find('div.uk-progress-bar');
                this.progress.parent().show();
            }
            this.blinkEl = this.find('.bix-blink');
            this.tactEl = this.find('.bix-tact');
        },
        setData: function (data) {
            var value = data.tags[this.options.keys[this.options.type].key],
                marge = data.tags[this.options.keys[this.options.type].marge],
                max = data.tags[this.options.keys[this.options.type].max],
                perc = value >= 0 ? (value / max) * 100 : 100,
                className = value <= 0 ? 'danger' : value <= marge ? 'warning' : 'success';

            if (this.options.blink) {
                this.setBlink(value <= 0);
            }

            if (this.options.progressbar) {
                this.progress.parent().removeClass('uk-progress-success uk-progress-warning uk-progress-danger').addClass('uk-progress-' + className);
                this.progress.css('width', perc + '%');
            }
            this.tactEl.removeClass('uk-text-success uk-text-warning uk-text-danger').addClass('uk-text-' + className);
            this.tactEl.text(value + this.options.suffix);
        },
        setBlink: function (state) {
            var $this = this;
            if (state && !this.blinker) {
                this.blinker = setInterval(function () {
                    $this.blink();
                }, this.options.blink);
            }
            if (!state && this.blinker) {
                clearInterval(this.blinker);
                this.blinkEl.css('opacity', 1);
                this.blinker = false;
            }
        },
        blink: function () {
            if (this.blinkState) {
                this.blinkEl.css('opacity', 0);
            } else {
                this.blinkEl.css('opacity', 1);
            }
            this.blinkState = !this.blinkState;
        }
    });

    return $.fn.ukbixprogress;
});
