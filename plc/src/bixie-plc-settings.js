/* *
 *  PLC
 *  bixie-plc-settings.js
 *  Created on 11-9-14 13:24
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
        define("uikit-bixplcsettings", ["uikit"], function () {
            return component || addon(jQuery, jQuery.UIkit);
        });
    }

})(function ($, UI) {
    "use strict";

    UI.component('bixplcsettings', {

        defaults: {
            ajaxUrl: 'Tags.htm',
            keys: [],
            buttons: {}
        },

        init: function () {
            var $this = this;
            this.outputs = {};
            this.inputs = {};
            $.each(this.options.keys, function () {
                $this.outputs[this] = $this.find('[data-bix-output=' + this + ']');
                $this.inputs[this] = $this.find('[name*=' + this + ']');
            });
            this.buttons = {};
            this.resets = {};
            $.each(this.options.buttons, function (key) {
                $this.buttons[key] = $this.find(this.selector);
                if (this.reset) {
                    $this.resets[key] = $(this.reset);
                }
                $this.buttons[key].click(function () {
                    $(this).find('i').addClass('uk-icon-spin');
                    if ($this.resets[key]) {
                        $this.resets[key].val(1);
                    }
                    $this.submit();
                });
            });

        },
        submit: function () {
            var $this = this;
            $.ajax({
                type: "POST",
                url: this.options.ajaxUrl,
                cache: false,
                data: $this.element.serialize()
            })
                .always(function (data) {
                    if ($this.options.debug) {
                        console.log(data);
                    }
                    $this.reset();
                });
        },
        setData: function (data) {
            var $this = this;
            $.each(data.tags, function (key) {
                if ($this.outputs[key] !== undefined) {
                    $this.outputs[key].text(data.tags[key]);
                }
            });
        },
        reset: function () {
            $.each(this.inputs, function () {
                this.val('');
            });
            $.each(this.resets, function () {
                this.val(0);
            });
            $.each(this.buttons, function () {
                this.find('i').removeClass('uk-icon-spin');
            });
        }
    });

    // init code
    UI.ready(function (context) {

        $("[data-bix-plcsettings]", context).each(function () {

            var $ele = $(this);

            if (!$ele.data("bixplcsettings")) {
                UI.bixplcsettings($ele, UI.Utils.options($ele.attr('data-bix-plcsettings')));
            }
        });

    });

    return $.fn.ukbixplcsettings;
});
