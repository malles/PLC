/* *
 *  PLC
 *  dashboard.js.js
 *  Created on 5-9-14 13:37
 *  
 *  @author Matthijs
 *  @copyright Copyright (C)2014 Bixie.nl
 *
 */

//creeren eigen 'namespace'
(function ($,document) {
    "use strict";

    //initatie variabelen
    var url = 'Tags.htm', interval = 1000,
    counters = {}, gages = {};
    //fill dom-vars en set timeout na domready
    $(document).ready(function(){
        counters = {
            counter: $('#counter1'),
            teller: $('#counter2'),
            anders: $('#meer')
        };
        $('[data-gage]').each(function () {
            var ele = $(this), options = $.extend({}, parseOptions(ele.data('gage')));
            gages[options.id] = new JustGage(options);

        });
        setInterval(function() {
            getData ();
        }, interval);
    });

    function getData () {
        $.ajax({
            type: "POST",
            dataType: 'json',
            url: url,
            cache: false,
            data: {}
        })
            .done(function (data) {
                console.log(data); //uitcommenten in livesite
                //counters updaten
                $.each(counters,function (key) {
                    //this staat nu voor waarde 'counters', de elementen die daar gekoppeld zijn, key is de key in json data
                    if (typeof data.tags[key] !== 'undefined') this.text(data.tags[key]);
                });
                //gages updaten
                $.each(gages,function (key) {
                    if (typeof data.tags[key] !== 'undefined') this.refresh(data.tags[key]);
                });
            })
            .fail(function () {
                //bij fout in request
            })
            .always(function (data) {
                //wordt altijd uitgevoerd na request (stop spinners e.d.)
            });
    }

    function parseOptions(string) {

        if ($.isPlainObject(string)) return string;

        var start = (string ? string.indexOf("{") : -1), options = {};

        if (start != -1) {
            try {
                options = (new Function("", "var json = " + string.substr(start) + "; return JSON.parse(JSON.stringify(json));"))();
            } catch (e) {}
        }

        return options;
    };


})(jQuery,document);
