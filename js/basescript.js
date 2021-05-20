const iframeId = '#elementor-preview-iframe';
(function () {

    let myTimerVerificacion = null;

    window.setGraficar = async function graficar(html, graficoId) {
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
        const tipoGrafico = document.getElementById(graficoId).dataset['tipo_grafico'];
        let response = [];
        if (window[graficoId] !== undefined && window[graficoId]['api']) {
            const urlAPI = window[graficoId]['api'];
            response = await fetch(urlAPI).then(response => response.json());
        }
        switch (tipoGrafico) {
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
        if (response.length) {
            switch (tipoGrafico) {
                case 'barra':
                    opciones['xAxis'] = response.map(record => record.nombre);
                    opciones['series'][0]['data'] = response.map(record => record.puntuacion);
                    break;
                case 'pastel':
                    opciones['series'][0]['data'] = response.map(record => ({
                        name: record.nombre,
                        value: record.puntuacion
                    }));
                    break;
            }
        }

        const divGrafico = crearDiv(graficoId);
        asignarNuevasLlavesOpcion(graficoId, opciones, tipoGrafico);
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

    const asignarNuevasLlavesOpcion = (graficoId, opcionesGrafico, tipoGrafico) => {
        if (window[graficoId] !== undefined) {
            const campos = window[graficoId];
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
                        });
                        if (tipoGrafico === 'pastel') {
                            opcionesGrafico['series'][0]['name'] = campos[llave];
                        }
                        break;
                }
            }
        }
    }
})();
