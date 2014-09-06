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
    "use strict";

    UI.component('bixdashboard', {

        defaults: {
            debug: false,
            ajaxUrl: 'Tags.htm',
            interval: 1000,
            widgets: {
                tact: {type: 'progress', selector: '#tactProgress'},
                shelf: {type: 'target', selector: '#shelfTarget'},
                shift: {type: 'progress', selector: '#shiftProgress'}
            }
        },

        init: function () {
            var $this = this, tactProgress = $('#tactProgress'), shelfTarget = $('#shelfTarget'), shiftProgress = $('#shiftProgress');
            this.form = this.find('form');
            this.datetimes = this.find('[data-bix-datetime]');
            this.errorMessage = this.find('[data-bix-error]');
            $this.widgets = {};
            $.each(this.options.widgets, function (name) {
                var ele = $(this.selector);
                $this.widgets[name] = UI['bix' + this.type](ele, UI.Utils.options(ele.attr('data-bix-' + this.type)));
            });
            setInterval(function () {
                $this.getData();
            }, this.options.interval);
            $this.getData();
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
                    $this.datetimes.text(data.tags.now);
                    if (data.tags.andon) {
                        $this.errorMessage.show().find('.content').text(data.tags.andon);
                    } else {
                        $this.errorMessage.hide().find('.content').text('');
                    }
                    $.each($this.widgets, function () {
                        this.setData(data);
                    });
                })
                .fail(function () {
                    //fout in request
                })
                .always(function (data) {
                    if ($this.options.debug) {
                        console.info('Data ververst:');
                        console.log(data.tags);
                    }
                    $.each($this.widgets, function () {
                        this.reset(data);
                    });
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
    "use strict";

    UI.component('bixprogress', {

        defaults: {
            type: 'tact',
            suffix: ' sec',
            blink: 0,
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
            this.blinker = false;
            this.blinkState = true;
            this.progress = this.find('div.uk-progress-bar');
            this.alertEl = this.find('div.uk-alert');
            this.resetInput = this.find('input[name=' + this.options.keys[this.options.type].reset + ']');
            this.resetButton = this.find('button').click(function () {
                $this.resetInput.val(1);
                $(this).addClass('uk-button-success');
            });
        },
        setData: function (data) {
            var value = data.tags[this.options.keys[this.options.type].key],
                marge = data.tags[this.options.keys[this.options.type].marge],
                max = data.tags[this.options.keys[this.options.type].max],
                perc = value >= 0 ? (value / max) * 100 : 100,
                className = value < 0 ? 'danger' : value <= marge ? 'warning' : 'success';

            if (this.options.blink) {
                this.setBlink(value <= 0);
            }

            this.progress.parent().removeClass('uk-progress-success uk-progress-warning uk-progress-danger').addClass('uk-progress-' + className);
            this.progress.css('width', perc + '%');
            this.alertEl.removeClass('uk-alert-success uk-alert-warning uk-alert-danger').addClass('uk-alert-' + className);
            this.alertEl.text(value + this.options.suffix);

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
                this.blinker = false;
            }
        },
        blink: function () {
            if (this.blinkState) {
                this.progress.css('opacity', 0);
            } else {
                this.progress.css('opacity', 1);
            }
            this.blinkState = !this.blinkState;
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
    "use strict";

    UI.component('bixtarget', {

        defaults: {
        },

        init: function () {
            var $this = this;
            this.alertEl = this.find('div.uk-alert');
            this.targetEl = $('.bix-target');
            this.deltaEl = $('.bix-delta');
            this.progressNeg = this.find('div.bix-negative div.uk-progress-bar');
            this.progressPos = this.find('div.bix-positive div.uk-progress-bar');

            this.resetInput = this.find('input[name=shelfReset]');
            this.resetButton = this.find('button').click(function () {
                $this.resetInput.val(1);
                $(this).addClass('uk-button-success');
            });
        },
        setData: function (data) {
            var produced = data.tags.shelf, target = data.tags.shift * (data.tags.shelfTarget / data.tags.shiftLengte),
                delta = produced - target, perc = (Math.abs(delta) / (2 * data.tags.shelfMarge)) * 100,
                className = produced > target ? 'success' : produced < (target - data.tags.shelfMarge) ? 'danger' : 'warning';
            if (delta < 0) {
                this.progressNeg.parent().removeClass('uk-progress-warning uk-progress-danger').addClass('uk-progress-' + className);
                this.progressNeg.css('width', perc + '%');
                this.progressPos.css('width', 0);
            } else {
                this.progressPos.css('width', perc + '%');
                this.progressNeg.css('width', 0);
            }
            this.deltaEl.removeClass('uk-text-success uk-text-warning uk-text-danger').addClass('uk-text-' + className);
            this.alertEl.removeClass('uk-alert-success uk-alert-warning uk-alert-danger').addClass('uk-alert-' + className);

            this.targetEl.text(Math.round(target));
            this.deltaEl.text(Math.round(delta));
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
