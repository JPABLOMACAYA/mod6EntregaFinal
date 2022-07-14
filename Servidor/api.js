// Importaciones.
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs'); //se importa módulo file system.
const { dirname } = require('path');
const axios = require('axios').default;
const { v4 : uuidv4 } = require('uuid');
const { newRoommate, saveRoommate, saveGasto } = require('./fnModulos.js');

//Se especifica el directorio donde se encuentran los recursos estáticos.
app.use(express.static(__dirname + '/public'));

//Se establece bodyParser para analizar texto como datos codificados de URL, utilizando librería querystring.
app.use(bodyParser.urlencoded({ extended: false }));

//Enrutamiento.
//Accediendo al documento HTML usado como Index.
app.get('/', (request, response) => 
{   
    response.redirect(__dirname + 'index.html');
})

//Solicitando y agregando nuevos roomates.
app.post('/roommates', (req, res) => 
{   
    newRoommate()
        .then( (ranRoommate) => 
        {
            saveRoommate(ranRoommate);
            res.end(JSON.stringify(ranRoommate));
        })
        .catch((err) => 
        {
            res.statusCode = 500;
            res.end();
            console.log(err);
        });
});

//Leyendo los roommates actualizados, luego de ser solicitado por la aplicación cliente, lo que permitirá poder renderizarlos posteriormente.
app.get('/roommates', (req, res) => 
{
    res.end(fs.readFileSync('roommates.json', 'utf8'));
});

//Agregando nuevos gastos a gastos.json 
app.post('/gasto', (req, res) => 
{   try {

    let gasto = {
        id: uuidv4().slice(26),
        roommate: req.body.selectRoommate,
        descripcion: req.body.descripcion,
        monto: parseInt(req.body.monto)
    };
    
    const gastosJSON = JSON.parse(fs.readFileSync('gastos.json', 'utf8'));
    gastosJSON.gastos.unshift(gasto);
    console.log(JSON.stringify(gastosJSON));
    fs.writeFileSync('gastos.json', JSON.stringify(gastosJSON));
    saveGasto(req.body); // al parecer esto debe reemplazarse por una nueva función, que actualice los gastos de los roommates

    let paginaExito = `<!DOCTYPE html>
    <html lang="es">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css">
        <link rel="stylesheet" href="style.css">
        <title>Gasto guardado con éxito</title>
    </head>
    
    <body>
        <h4>El gasto por concepto de ${req.body.descripcion}, cuyo monto es de: $ ${req.body.monto} pesos, pagado por ${req.body.selectRoommate}, ha sido guardado con éxito.</h4>
        <p> <a href="http://localhost:8080"> Volver al panel principal </a> </p>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    
    </html>`;

    res.send (paginaExito);

} catch (err) {
    console.log(err);
};   
    
});

//Leyendo los gastos actualizados, luego de ser solicitado por la aplicación cliente, lo que permitirá poder renderizarlos posteriormente.
app.get('/gastos', (req, res) => 
{  
    const gastosJSON = JSON.parse(fs.readFileSync('gastos.json', 'utf8'));
    res.end(JSON.stringify(gastosJSON));
});

//Eliminado un gasto registrado, luego de ser solicitado por la aplicación cliente, identificándolo mediante su id.
app.delete('/gasto', (req, res) => 
{
    console.log(req.query.id);
    const id = req.query.id;
    const gastosJSON = JSON.parse(fs.readFileSync('gastos.json', 'utf8'));
    gastosJSON.gastos = gastosJSON.gastos.filter((gasto) => gasto.id !== id);
    fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON));
    res.end();
});


//Método get utilizado para enrutar página de edición de un gasto.
app.get('/editarGasto', (req, res) => 
{   try {
    const id = req.query.id;
    const gastosJSON = JSON.parse(fs.readFileSync('gastos.json', 'utf8'));
    const gastoSeleccionado = gastosJSON.gastos.filter((gasto) => gasto.id == id);

    let paginaEdicion = `<!DOCTYPE html>
    <html lang="es">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css">
        <link rel="stylesheet" href="style.css">
        <title>Edición Gasto</title>
    </head>
    
    <body>
        <h4>A continuación puede editar el gasto asociado al roommate seleccionado :</h4>
        <div id="divEditGasto">
            <form action="saveEditGasto" method="post">
                <h6 id="tituloSelect">Roommate:</h6>
                <select class="form-select" name="selectRoommate" id="selectRoommate">
                <option value="${gastoSeleccionado[0].roommate}">${gastoSeleccionado[0].roommate}</option>
                </select>
                <br>
                <h6>Descripción:</h6>
                <textarea class="form-control" name="descripcion" id="descripcionNueva">${gastoSeleccionado[0].descripcion}</textarea>
                <br>
                <h6>Monto:</h6>
                <input type="number" class="form-control" name="monto" id="montoNuevo" value="${gastoSeleccionado[0].monto}">
                <br>
                <br>
                <input type="hidden" name="idGasto" value="${gastoSeleccionado[0].id}">
                <button type="submit">Guardar modificación</button>
                <br>
                <br>
            </form>
        </div>
        <p> <a href="http://localhost:8080"> Cancelar modificación </a> </p>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    
    </html>`;

    res.send(paginaEdicion);

} catch (err) {
    console.log(err);
};   

});


//Guardando en gastos.json la edición solicitada desde ruta editarGasto.
app.post('/saveEditGasto', (req, res) => 
{   try {
    console.log("entramos a editar");
    let gasto = {
        id: req.body.idGasto,
        roommate: req.body.selectRoommate,
        descripcion: req.body.descripcion,
        monto: parseInt(req.body.monto)
    };
    const id = req.body.idGasto;
    const gastosJSON = JSON.parse(fs.readFileSync('gastos.json', 'utf8'));
    gastosJSON.gastos = gastosJSON.gastos.filter((gasto) => gasto.id !== id);
    gastosJSON.gastos.unshift(gasto);
    console.log(JSON.stringify(gastosJSON));
    fs.writeFileSync('gastos.json', JSON.stringify(gastosJSON));
    saveGasto(req.body);

    let paginaExito = `<!DOCTYPE html>
    <html lang="es">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css">
        <link rel="stylesheet" href="style.css">
        <title>Gasto actualizado con éxito</title>
    </head>
    
    <body>
        <h4>El gasto por concepto de ${req.body.descripcion}, cuyo monto es de: $ ${req.body.monto} pesos, pagado por ${req.body.selectRoommate}, ha sido actualizado con éxito.</h4>
        <p> <a href="http://localhost:8080"> Volver al panel principal </a> </p>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    
    </html>`;

    res.send (paginaExito);    

} catch (err) {
    console.log(err);
};   
    
});

const PORT = 8080;

app.listen(PORT, () => 
{
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
