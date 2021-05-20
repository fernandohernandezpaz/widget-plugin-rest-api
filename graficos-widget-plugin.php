<?php
/*
Plugin Name: Gráficos Widget
Plugin URI: http://www.wpexplorer.com/create-widget-plugin-wordpress/
Description: Agrega widget para gráficos.
Version: 1.0
Author: Guegue
Author URI: http://localhost:9090/
License: GPL2
*/

// The widget class
class Graficos_Widget extends WP_Widget
{
    public $nuevosCampos;

    // Main constructor
    public function __construct()
    {
        parent::__construct(
            'graficos_widget',
            __('Gráficos Widget', 'text_domain'),
            array(
                'customize_selective_refresh' => true,
            )
        );

        $url = 'http://127.0.0.1:8000/api/test';
        $response = wp_remote_get($url);
        if (is_wp_error($response)) {
            $responseApi['-'] = 'Sin conexion al listado de apis';
        } else {
            $response = json_decode(wp_remote_retrieve_body($response));
            $responseApi = [];
            $responseApi[''] = 'Seleccione el origen de los datos';
            foreach ($response as $api) {
                $responseApi["$api->url"] = $api->name;
            }
        }

        $this->nuevosCampos = [
            [
                'name' => 'tipoGrafico',
                'title' => 'Seleccione el tipo de grafico',
                'exclude' => true,//excluir de js
                'type' => [
                    'input' => 'select',
                    'options' => array(
                        '' => 'Seleccione',
                        '1' => 'Gráfica Barra',
                        '2' => 'Gráfica Pastel',
                        '3' => 'Gráfica Linea',
                    )
                ]
            ],
            [
                'name' => 'tituloGrafico',
                'title' => 'Título del gráfico',
                'exclude' => false,
                'type' => [
                    'input' => 'text'
                ]
            ],
            [
                'name' => 'api',
                'title' => 'Origen de los datos',
                'exclude' => false,
                'type' => [
                    'input' => 'select',
                    'options' => $responseApi
                ]
            ]
        ];

    }

    // The widget form (for the backend )
    public function form($instance)
    {
        // Set widget defaults
        $defaults = array(
            'title' => '',
            'text' => '',
            'textarea' => '',
            'checkbox' => '',
            'select' => '',
        );

        // Parse current settings with defaults
        extract(wp_parse_args(( array )$instance, $defaults)); ?>

        <?php // Dropdown
        ?>
        <p>
            <?php
            foreach ($this->nuevosCampos as $campo) {
                ?>
                <label for="<?php echo $this->get_field_id($campo['name']); ?>"><?php echo $campo['title']; ?></label>
                <?php
                switch ($campo['type']['input']) {
                    case 'select':
                        ?>
                        <select name="<?php echo $this->get_field_name($campo['name']); ?>"
                                id="<?php echo $this->get_field_id($campo['name']); ?>" class="widefat">
                            <?php
                            foreach ($campo['type']['options'] as $key => $name) {
                                echo '<option value="' . esc_attr($key) . '" id="' . esc_attr($key) . '" ' .
                                    selected($instance[$campo['name']], $key, false) . '>'
                                    . $name . '</option>';
                            } ?>
                        </select>
                        <?php
                        break;
                    case 'text':
                        ?>
                        <input type="<?php echo strtolower($campo['type']['input']); ?>"
                               id="<?php echo $this->get_field_id($campo['name']); ?>" maxlength="30"
                               name="<?php echo $this->get_field_name($campo['name']); ?>" class="widefat"
                               placeholder="Escriba el nombre del gráfico"
                               value="<?php echo $instance[$campo['name']]; ?>"
                        >
                        <?php
                        break;
                }
            }
            ?>
        </p>
    <?php }

    // Update widget settings
    public function update($new_instance, $old_instance)
    {
        $instance = $old_instance;

        foreach ($this->nuevosCampos as $campo) {
            if (isset($new_instance[$campo['name']])) {
                $instance[$campo['name']] = wp_strip_all_tags($new_instance[$campo['name']]);
            } else {
                $instance[$campo['name']] = '';
            }
        }
        return $instance;
    }

    function collectiveray_theme_scripts_function()
    {
        // wp_enqueue_script('js-file', plugin_dir_url(__FILE__) . 'js/myscript.js', array('echart'));
    }

    // Display the widget
    public function widget($args, $instance)
    {
        extract($args);

        foreach ($this->nuevosCampos as $campo) {
            ${$campo['name']} = $instance[$campo['name']] ?? '';
        }

        $extras = [];
        if (isset($instance['tituloGrafico']) && !empty($instance['tituloGrafico'])) {
            $extras['titulo'] = $instance['tituloGrafico'];
        }
        if (isset($instance['api']) && !empty($instance['api'])) {
            $extras['api'] = $instance['api'];
        }
        // WordPress core before_widget hook (always include )
        echo $before_widget;

        // Display the widget
        echo '<div class="widget-text wp_widget_plugin_box">';
        $styles = 'width:100%; height:400px;';
        $randomNumber = rand(1, 15);

        // Display select field
        switch (${'tipoGrafico'}) {
            case '':
                echo '<p style="text-align: center">Por favor seleccionar el tipo de gráfico que desea mostrar en este bloque</p>';
                break;
            case 1:
                echo "<div id='grafico_$randomNumber' data-tipo_grafico='barra' style='$styles'> </div>";
                wp_enqueue_script('echart', plugin_dir_url(__FILE__) . 'js/echart.js');
                $this->impririrDetallesEnScript("grafico_$randomNumber", $extras);
                break;
            case 2:
                $randomNumber = $randomNumber + 1 * 2;
                echo "<div id='grafico_$randomNumber' data-tipo_grafico='pastel' style='$styles'> </div>";
                $this->impririrDetallesEnScript("grafico_$randomNumber", $extras);
                break;
            case 3:
                $randomNumber = $randomNumber + 5 * 3;
                echo "<div id='grafico_$randomNumber' data-tipo_grafico='linea' style='$styles'> </div>";
                $this->impririrDetallesEnScript("grafico_$randomNumber", $extras);
                break;
            default:
                echo '<p style="text-align: center">Por favor seleccionar el tipo de gráfico que desea mostrar en este bloque.</p>';
        }

        echo '</div>';

        // WordPress core after_widget hook (always include )
        echo $after_widget;
    }

    public function impririrDetallesEnScript($graficoId, $extras = [])
    { ?>
        <script>
            <?php if($extras) {?>
            window['<?php echo $graficoId;?>'] = {};
            <?php foreach (array_keys($extras) as $llave) { ?>
            window['<?php echo $graficoId;?>']['<?php echo $llave;?>'] = '<?php echo $extras[$llave]; ?>'
            <?php }
            } ?>
            // para graficar
            window.setGraficar(
                document.getElementById('<?php echo $graficoId;?>'),
                '<?php echo $graficoId;?>'
            );
        </script>
        <?php
    }
}

global $phpvariable;
$phpvariable = "This is from PHP";

function js_enqueue_scripts()
{
    global $phpvariable;
    wp_enqueue_script('echart', plugin_dir_url(__FILE__) . 'js/echart.js');
    wp_register_script('js-baseOpcionesGrafico', plugin_dir_url(__FILE__) . '/js/baseOpcionesGraficos.js', ['echart']);
    wp_enqueue_script('js-baseOpcionesGrafico');
    wp_register_script('js-basescript', plugin_dir_url(__FILE__) . '/js/basescript.js', ['echart', 'js-baseOpcionesGrafico', 'jquery']);
    wp_enqueue_script('js-basescript');
}

add_action("wp_enqueue_scripts", "js_enqueue_scripts");

// Register the widget
function registrar_graficos_widget()
{
    register_widget('Graficos_Widget');
}

add_action('widgets_init', 'registrar_graficos_widget');

