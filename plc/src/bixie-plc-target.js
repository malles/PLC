/* *
 *  PLC
 *  bixie-plc-target.js
 *  Created on 11-9-14 13:23
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
        define("uikit-bixtarget", ["uikit"], function () {
            return component || addon(jQuery, jQuery.UIkit);
        });
    }


})(function ($, UI) {
    "use strict";

    UI.component('bixtarget', {

        defaults: {
            suffix: '',
            progressbar: true,
            keys: {
                key: 'Shelf',
                shift: 'Shift',
                shiftLengte: 'ShiftLengte',
                target: 'ShelfTarget',
                marge: 'ShelfMarge',
                reset: 'ShelfReset'
            }
        },

        init: function () {
            this.alertEl = this.find('div.uk-alert');
            this.targetEl = $('.bix-target');
            this.deltaEl = $('.bix-delta');

            if (this.options.progressbar) {
                this.progressNeg = this.find('div.bix-negative div.uk-progress-bar');
                this.progressPos = this.find('div.bix-positive div.uk-progress-bar');
                this.progressPos.closest('.uk-grid').show();
            }
        },
        setData: function (data) {
            var produced = data.tags[this.options.keys.key],
                target = data.tags[this.options.keys.shift] * (data.tags[this.options.keys.target] / data.tags[this.options.keys.shiftLengte]),
                delta = produced - target,
                perc = (Math.abs(delta) / (2 * data.tags[this.options.keys.marge])) * 100,
                className = produced > target ? 'success' : produced < (target - data.tags[this.options.keys.marge]) ? 'danger' : 'warning';

            if (this.options.progressbar) {
                if (delta < 0) {
                    this.progressNeg.parent().removeClass('uk-progress-warning uk-progress-danger').addClass('uk-progress-' + className);
                    this.progressNeg.css('width', perc + '%');
                    this.progressPos.css('width', 0);
                } else {
                    this.progressPos.css('width', perc + '%');
                    this.progressNeg.css('width', 0);
                }
            }
            this.deltaEl.removeClass('uk-text-success uk-text-warning uk-text-danger').addClass('uk-text-' + className);
            this.deltaEl.text(Math.round(delta));

            console.log(data);
            console.log(this.alertEl);
            this.alertEl.removeClass('uk-alert-success uk-alert-warning uk-alert-danger').addClass('uk-alert-' + className);
            this.alertEl.text(produced + this.options.suffix);

            this.targetEl.text(Math.round(target));
        }
    });

    // init code
    UI.ready(function (context) {

        $("[data-bix-target]", context).each(function () {

            var $ele = $(this);

            if (!$ele.data("bixtarget")) {
                UI.bixtarget($ele, UI.Utils.options($ele.attr('data-bix-target')));
            }
        });

    });

    return $.fn.ukbixtarget;
});
