var Snake = (function() {

    //propiedades
    var $canvas = undefined;
    var canvas = undefined;
    var ctx = undefined;

    var fps = 5;
    var intervalo;
    var es_fin_juego = false;

    var color_fondo = '#A9CB95';
    var ancho_cuadro = 10;

    var serpiente;
    var comida;

    //objeto para la comida
    function comida() {
        var posicion_x = 0;
        var posicion_y = 0;
        var color_comida = '#000000';
        var posicionAleatoria = [];

        this.colocar = function() {
            posicionAleatoria = this.conseguirPosicion();

            while (serpiente.obtenerCuerpo().some(this.posicionOcupada)) {
                posicionAleatoria = this.conseguirPosicion();
            }

            posicion_x = posicionAleatoria[0];
            posicion_y = posicionAleatoria[1];
        }

        this.colision = function(x, y) {
            if (posicion_x == x && posicion_y == y)
                return true;
        }

        this.mostrar = function() {
            ctx.fillStyle = color_comida;
            ctx.fillRect(posicion_x, posicion_y, ancho_cuadro, ancho_cuadro);
        }

        this.conseguirPosicion = function() {
            var X = Math.floor(Math.random() * ($canvas.width() / ancho_cuadro)) * ancho_cuadro;
            var Y = Math.floor(Math.random() * ($canvas.height() / ancho_cuadro)) * ancho_cuadro;

            return [X, Y];
        }

        this.posicionOcupada = function(element) {
            return (element[0] == posicionAleatoria[0] && element[1] == posicionAleatoria[1]);
        }
    }

    //objeto para la serpiente
    function serpiente() {
        var posicion_x = 0;
        var posicion_y = 0;
        var color_serpiente = '#000000'; //color negro en hexadecimal
        var direccion = 'derecha';

        var cuerpo = [];
        var tamano_inicial = 3;

        this.obtenerCuerpo = function() {
            return cuerpo;
        }

        this.dibujar = function() {
            //dibujar serpiente
            ctx.fillStyle = color_serpiente;
            for (i = 0; i < cuerpo.length; i++)
                ctx.fillRect(cuerpo[i][0], cuerpo[i][1], ancho_cuadro, ancho_cuadro);
        }

        this.colocar = function(x, y) {
            posicion_x = x;
            posicion_y = y;

            cuerpo = [];
            direccion = 'derecha';

            for (i = 0; i < tamano_inicial; i++)
                cuerpo.push([x - (i * ancho_cuadro), y]);
        }

        this.mover = function() {
            if (this.comprobarColisiones())
                fin_juego();

            var nuevaPosicion = cuerpo[0].slice();

            switch (direccion) {
                case 'arriba':
                    nuevaPosicion[1] -= ancho_cuadro;
                    break;
                case 'derecha':
                    nuevaPosicion[0] += ancho_cuadro;
                    break;
                case 'abajo':
                    nuevaPosicion[1] += ancho_cuadro;
                    break;
                case 'izquierda':
                    nuevaPosicion[0] -= ancho_cuadro;
                    break;
            }

            cuerpo.unshift(nuevaPosicion);
            cuerpo.pop();

            if (comida.colision(nuevaPosicion[0], nuevaPosicion[1])) {
                comida.colocar();

                var cola = cuerpo[cuerpo.length - 1].slice();
                cuerpo.push(cola);
            }
        }

        this.comprobarColisiones = function() {
            var cabeza = cuerpo[0].slice();
            var resto = cuerpo.slice(1);
            var fueraHorizontalmente = cabeza[0] > ($canvas.width() - ancho_cuadro) || cabeza[0] < 0;
            var fueraVerticalmente = cabeza[1] > ($canvas.height() - ancho_cuadro) || cabeza[1] < 0;

            if (fueraHorizontalmente || fueraVerticalmente)
                return true;


            if (resto.some(this.seComioAsiMisma))
                return true;

            return false;
        }

        this.seComioAsiMisma = function(element, index, array) {
            var cabeza = cuerpo[0].slice();
            if (element[0] == cabeza[0] && element[1] == cabeza[1])
                return true;

            return false;
        }

        this.cambiarDireccion = function(nuevaDireccion) {
            if (direccion == 'arriba' || direccion == 'abajo')
                var direccionesPermitidas = ['derecha', 'izquierda']
            else
                var direccionesPermitidas = ['arriba', 'abajo'];

            if (direccionesPermitidas.indexOf(nuevaDireccion) >= 0)
                direccion = nuevaDireccion;
        }
    }


    function iniciar_canvas() {
        //elemento jQuery del canvas
        $canvas = $('#pantalla');

        //elemento DOM del canvas
        canvas = $canvas[0];

        //dar dimensiones al canvas
        $canvas.prop('width', '400');
        $canvas.prop('height', '400');

        //obtener el contexto
        ctx = canvas.getContext('2d');

        ctx.fillStyle = '#fea';
        ctx.fillRect(0, 0, 400, 400);

        iniciar_juego();
    }

    function iniciar_juego() {
        es_fin_juego = false;

        serpiente = new serpiente();
        comida = new comida();

        //iniciar propiedades
        serpiente.colocar(50, 50);

        comida.colocar();

        //iniciar juego
        ciclo();
    }

    function fin_juego() {
        es_fin_juego = true;
        clearTimeout(intervalo);

        var x = $canvas.width() / 2;
        var y = $canvas.height() / 2;

        ctx.font = '30px Georgia';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#F00';
        ctx.fillText('Fin del Juego!', x, y);
        ctx.font = '20px Georgia';
        ctx.fillStyle = '#000';
        ctx.fillText('Presiona R, para reiniciar', x, y + 30);

    }

    function ciclo() {
        //limpiar pantalla
        ctx.fillStyle = color_fondo;
        ctx.fillRect(0, 0, 400, 400);

        serpiente.dibujar();
        comida.mostrar();

        serpiente.mover();

        if (!es_fin_juego)
            intervalo = setTimeout(ciclo, 1000 / fps);
    }

    function reiniciar() {
        es_fin_juego = false;

        //iniciar propiedades
        serpiente.colocar(50, 50);

        comida.colocar();

        //iniciar juego
        ciclo();
    }

    var Direccion = {
        '38': 'arriba',
        '39': 'derecha',
        '40': 'abajo',
        '37': 'izquierda'
    };

    $(document).keydown(function(e) {
        var tecla = e.which;

        if (Direccion[tecla])
            serpiente.cambiarDireccion(Direccion[tecla]);

        if (tecla == 82) // tecla R
            reiniciar();
    });

    return {
        iniciar_canvas: iniciar_canvas
    };

})();


$(document).ready(Snake.iniciar_canvas);
