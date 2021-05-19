const iframeId = '#elementor-preview-iframe';
(function () {

    let myTimerVerificacion = null;

    window.setGraficar = function graficar(html, graficoId) {
        if (!html) {
            return null;
        }
        const existeIframe = jQuery(iframeId).length > 0;

        if (existeIframe) {
            realizarBusquedaContenedor(graficoId);
            return null;
        }

        let chart = echarts.init(html);
        let opciones = {};
        const opcion = document.getElementById(graficoId).dataset['tipo_grafico'];
        switch (opcion) {
            case 'barra':
                opciones = opcionesGraficoBarra;
                break;
            case 'pastel':
                opciones = opcionesGraficoPastel;
                break;
            case 'linea':
                opciones = opcionesGraficoLinea;
                break;
        }
        const divGrafico = crearDiv(graficoId);
        asignarNuevasLlavesOpcion(graficoId, opciones);

        jQuery(iframeId).contents().find(`#grafico_${graficoId}`).html(divGrafico);

        chart.setOption(opciones);

        jQuery(window).on('resize', function () {
            if (chart !== null && chart !== undefined) {
                chart.resize();
            }
        });

        jQuery(window).resize();
        return chart;
    }

    const realizarBusquedaContenedor = (graficoId) => {
        myTimerVerificacion = setInterval(() => {
            if (document.readyState === 'complete') {
                const iframe = document.getElementsByTagName('iframe')[0];
                if (document.body.contains(iframe)) {
                    console.log('renderizado');
                    clearInterval(myTimerVerificacion);
                    graficar(
                        document.getElementById(graficoId),
                        graficoId
                    );
                }
            }
        }, 500);
    }

    const crearDiv = (graficoId) => {
        let divGrafico = document.createElement('div');
        divGrafico.style.width = '100%';
        divGrafico.style.height = '400px';
        divGrafico.style.id = `divGrafico${graficoId}`;

        return divGrafico;
    }

    const asignarNuevasLlavesOpcion = (graficoId, opcionesGrafico) => {
        if (Object.keys(camposExtrasParaGraficos).length) {
            const campos = camposExtrasParaGraficos[graficoId];
            const llaves = Object.keys(campos);

            for (const llave of llaves) {
                switch (llave) {
                    case 'titulo':
                        Object.assign(opcionesGrafico, {
                            title: {
                                text: campos[llave],
                                left: 'center',
                                show: true
                            },
                        })
                        break;
                }
            }
        }
    }
})();
