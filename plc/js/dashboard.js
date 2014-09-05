/* *
 *  PLC
 *  dashboard.js.js
 *  Created on 5-9-14 13:37
 *  
 *  @author Matthijs
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
        define("uikit-bixdashboard", ["uikit"], function () {
            return component || addon(jQuery, jQuery.UIkit);
        });
    }


})(function ($, UI) {

    UI.component('bixdashboard', {

        defaults: {
            ajaxUrl: 'test.php',
            interval: 1000
        },

        init: function () {
            var $this = this, tactProgress = $('#tactProgress'), shelfTarget = $('#shelfTarget'), shiftProgress = $('#shiftProgress');
            this.form = this.find('form');
            this.datetimes = this.find('[data-bix-datetime]');
            this.tact = UI.bixprogress(tactProgress,UI.Utils.options(tactProgress.attr('data-bix-progress')));
            this.shelf = UI.bixtarget(shelfTarget,UI.Utils.options(shelfTarget.attr('data-bix-target')));
            this.shift = UI.bixprogress(shiftProgress,UI.Utils.options(shiftProgress.attr('data-bix-progress')));
            setInterval(function() {
                $this.setData();
            }, this.options.interval);
            $this.setData();
    },
    setData: function () {
        var now = new Date();
        this.datetimes.text(UI.datepicker.moment(now).format("YYYY-MM-DD HH:mm:ss"));
        this.getData();
    },
    getData: function () {
        var $this = this;
        $.ajax({
            type: "GET",
            dataType: 'json',
            url: this.options.ajaxUrl,
            cache: false,
            data: $this.form.serialize()
        })
            .done(function (data) {
                //tact
                $this.tact.setData(data);
                $this.shelf.setData(data);
                $this.shift.setData(data);
            })
            .fail(function () {
                //bij fout in request
            })
            .always(function (data) {
                $this.tact.reset();
                $this.shelf.reset();
                $this.shift.reset();
                //wordt altijd uitgevoerd na request (stop spinners e.d.)
            });
    }

});

    // init code
    UI.ready(function (context) {

        $("[data-bix-dashboard]", context).each(function () {

            var $ele = $(this);

            if (!$ele.data("bixdashboard")) {
                UI.bixdashboard($ele, UI.Utils.options($ele.attr('data-bix-dashboard')));
            }
        });

    });

    return $.fn.ukbixdashboard;
});

/**
 * Tact weergave
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

    UI.component('bixprogress', {

        defaults: {
            type: 'tact',
            suffix: ' sec',
            keys: {
                tact: {
                    key: 'tact',
                    max: 'tactTijd',
                    marge: 'tactMarge',
                    reset: 'tactReset'
                },
                shift: {
                    key: 'shift',
                    max: 'shiftLengte',
                    reset: 'shiftReset'
                }
            }
        },

        init: function () {
            var $this = this;
            this.progress = this.find('div.uk-progress-bar');
            this.alertEl = this.find('div.uk-alert');
            this.resetInput = this.find('input[name=' + this.options.keys[this.options.type].reset+ ']');
            this.resetButton = this.find('button').click(function () {
                $this.resetInput.val(1);
                $(this).addClass('uk-button-success');
            })
        },
        setData: function (data) {
            var value = data.tags[this.options.keys[this.options.type].key],
                marge = data.tags[this.options.keys[this.options.type].marge],
                max = data.tags[this.options.keys[this.options.type].max],
                perc =  value >= 0 ?(value / max) * 100 : 100,
                className = value < 0 ? 'danger' : value <= marge ? 'warning': 'success';

            this.progress.parent().removeClass('uk-progress-success uk-progress-warning uk-progress-danger').addClass('uk-progress-' + className);
            this.progress.css('width',perc + '%');
            this.alertEl.removeClass('uk-alert-success uk-alert-warning uk-alert-danger').addClass('uk-alert-' + className);
            this.alertEl.text(value + this.options.suffix);

        },
        reset: function () {
            this.resetInput.val(0);
            this.resetButton.removeClass('uk-button-success');
        }
    });

    return $.fn.ukbixprogress;
});

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

    UI.component('bixtarget', {

        defaults: {
        },

        init: function () {
            var $this = this;
            this.alertEl = this.find('div.uk-alert');
            this.targetEl = this.find('.bix-target');
            this.deltaEl = this.find('.bix-delta');
            this.progressNeg = this.find('div.bix-negative div.uk-progress-bar');
            this.progressPos = this.find('div.bix-positive div.uk-progress-bar');

            this.resetInput = this.find('input[name=shelfReset]');
            this.resetButton = this.find('button').click(function () {
                $this.resetInput.val(1);
                $(this).addClass('uk-button-success');
            })
        },
        setData: function (data) {
            var produced = data.tags.shelf, target = data.tags.shift * (data.tags.shelfTarget / data.tags.shiftLengte),
                delta = produced - target, perc = (Math.abs(delta) / (2 * data.tags.shelfMarge)) * 100,
                className = produced > target ? 'success': produced < (target - data.tags.shelfMarge) ? 'danger' : 'warning';
            console.log(produced,target,className);
            if (delta < 0) {
                this.progressNeg.parent().removeClass('uk-progress-warning uk-progress-danger').addClass('uk-progress-' + className);
                this.progressNeg.css('width',perc + '%');
                this.progressPos.css('width',0);
            } else {
                this.progressPos.css('width',perc + '%');
                this.progressNeg.css('width',0);
            }
            this.deltaEl.removeClass('uk-text-success uk-text-warning uk-text-danger').addClass('uk-text-' + className);
            this.alertEl.removeClass('uk-alert-success uk-alert-warning uk-alert-danger').addClass('uk-alert-' + className);

            this.targetEl.text(target);
            this.deltaEl.text(delta);
            this.alertEl.text(produced + ' stuks');
        },
        reset: function () {
            this.resetInput.val(0);
            this.resetButton.removeClass('uk-button-success');
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
