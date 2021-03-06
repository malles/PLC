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
                targetActual: 'ShelfTargetActueel',
                target: 'ShelfTarget',
                marge: 'ShelfMarge',
                reset: 'ShelfReset'
            }
        },

        init: function () {
            this.actualEl = $('.bix-actual');
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
                target = data.tags[this.options.keys.targetActual],
                delta = produced - target,
                perc = (Math.abs(delta) / (2 * data.tags[this.options.keys.marge])) * 100,
                className = produced >= target ? 'success' : produced <= (target - data.tags[this.options.keys.marge]) ? 'danger' : 'warning';

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

            this.targetEl.text(Math.round(target));

            this.actualEl.removeClass('uk-text-success uk-text-warning uk-text-danger').addClass('uk-text-' + className);
            this.actualEl.text(produced + this.options.suffix);

            this.deltaEl.removeClass('uk-text-success uk-text-warning uk-text-danger').addClass('uk-text-' + className);
            this.deltaEl.text(Math.round(delta));
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
