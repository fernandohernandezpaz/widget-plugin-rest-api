(function () {
    /* jQuery('.elementor-widget-container').bind('DOMSubtreeModified', function() {
         alert('node inserted');
     });*/
    // ==================================================================

    // let existeGraficoId = document.getElementById('grafico1');

    // if (existeGraficoId) {
    //   graficar(existeGraficoId);
    // }

    /* jQuery('body')
         .on('change', '#widget-graficos_widget-REPLACE_TO_ID-select', function () {
             console.log(1);
         });*/

    var myTimer2 = function () {
        var that = this,
            timer;

        that.set = function (graficoId) {
            var intentosDeBusqueda = 0;
            timer = setInterval(function () {
                let divGrafico = document.createElement('div');
                divGrafico.style.width = '100%';
                divGrafico.style.height = '400px';
                divGrafico.style.id = 'divGrafico';

                const existeDivGrafico = document.getElementById(graficoId); //  jQuery('#elementor-preview-iframe').contents().find('#grafico2');
                console.log('En timer ', graficoId, existeDivGrafico, intentosDeBusqueda++);
                if (existeDivGrafico) {
                    let grafico = window.setGrafico(existeDivGrafico);


                    jQuery('#elementor-preview-iframe').contents().find(`#${graficoId}`).html(divGrafico);
                    jQuery(window).on('resize', function () {
                        if (grafico !== null && grafico !== undefined) {
                            grafico.resize();
                        }
                    });

                    jQuery(window).resize();

                    clearInterval(timer);
                } else if (intentosDeBusqueda > 6) {
                    clearInterval(timer);
                }
            }, 1000);
        }
        return that;
    }();

    /*
        document.addEventListener('readystatechange', event => {
            // When window loaded ( external resources are loaded too- `css`,`src`, etc...)
            console.log('Listen ready');
            if (event.target.readyState === "complete") {

                console.log('Listen complete');

                const existeIframe = jQuery('#elementor-preview-iframe').length > 0;

                if (existeIframe) {
                    const iframe = document.getElementById('elementor-preview-iframe');
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (iframeDoc.readyState.toLowerCase() === 'complete') {
                        myTimer.set();
                    }
                }
            }
        });*/

    window.setGrafico = function graficar(html, graficoId) {

        if (!html) {
            myTimer2.set(graficoId);
            return;
        }

        let myChart = echarts.init(html);

        option = {
            dataset: {
                source: [
                    ['score', 'amount', 'product'],
                    [89.3, 58212, 'Matcha Latte'],
                    [57.1, 78254, 'Milk Tea'],
                    [74.4, 41032, 'Cheese Cocoa'],
                    [50.1, 12755, 'Cheese Brownie'],
                    [89.7, 20145, 'Matcha Cocoa'],
                    [68.1, 79146, 'Tea'],
                    [19.6, 91852, 'Orange Juice'],
                    [10.6, 101852, 'Lemon Juice'],
                    [32.7, 20112, 'Walnut Brownie']
                ]
            },
            grid: {containLabel: true},
            xAxis: {name: 'amount'},
            yAxis: {type: 'category'},
            visualMap: {
                orient: 'horizontal',
                left: 'center',
                min: 10,
                max: 100,
                text: ['High Score', 'Low Score'],
                // Map the score column to color
                dimension: 0,
                inRange: {
                    color: ['#65B581', '#FFCE34', '#FD665F']
                }
            },
            series: [
                {
                    type: 'bar',
                    encode: {
                        // Map the "amount" column to X axis.
                        x: 'amount',
                        // Map the "product" column to Y axis
                        y: 'product'
                    }
                }
            ]
        };

        isNaN(graficoId) ? myChart.setOption(option) : myChart.setOption(window.otroGrafico);
        return myChart;
    }
})();