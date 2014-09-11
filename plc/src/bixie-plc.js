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
            blink: 0,
            keys: {
                now: 'Now',
                andon: 'Andon'
            },
            widgets: {
                tact: {type: 'progress', selector: '#tactProgress'},
                shelf: {type: 'target', selector: '#bixShelfTarget'},
                settings: {type: 'plcsettings', selector: '#plcSettings'}
            }
        },

        init: function () {
            var $this = this, tactProgress = $('#tactProgress'), shelfTarget = $('#shelfTarget'), shiftProgress = $('#shiftProgress');
            this.form = this.find('form');
            this.datetimes = this.find('[data-bix-datetime]');
            this.blinkEl = $('body');
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
                type: "POST",
                url: this.options.ajaxUrl,
                cache: false
            })
                .done(function (returnData) {
                    var data = {};
                    if (typeof returnData === 'object') {
                        data = returnData;
                    } else {
                        try {
                            data = JSON.parse(returnData.trim());
                        } catch (e) {
                            console.log('Fout in JSON response: ' + returnData);
                            data.tags = {};
                        }
                    }
                    $this.datetimes.text(data.tags[$this.options.keys.now]);
                    if (data.tags[$this.options.keys.andon]) {
                        $this.errorMessage.show().find('.content').text(data.tags[$this.options.keys.andon]);
                    } else {
                        $this.errorMessage.hide().find('.content').text('');
                    }
                    if ($this.options.blink) {
                        $this.setBlink(data.tags[$this.options.keys.andon] !== '');
                    }
                    $.each($this.widgets, function () {
                        this.setData(data);
                    });
                })
                .fail(function () {
                    //fout in request
                })
                .always(function (returnData) {
                    if ($this.options.debug) {
                        console.log(returnData);
                    }
                });
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
                this.blinkEl.removeClass('uk-body-danger');
                this.blinker = false;
            }
        },
        blink: function () {
            if (this.blinkState) {
                this.blinkEl.addClass('uk-body-danger');
            } else {
                this.blinkEl.removeClass('uk-body-danger');
            }
            this.blinkState = !this.blinkState;
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
