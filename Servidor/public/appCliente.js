// Arreglos vacíos definidos de manera global, para ser utilizados posteriormente por funciones.
let roommatesActualizados = [];
let gastosActualizados = [];

// Variables asociadas a elementos html.
let addRoommate = document.querySelector('#addRoommate');

let addGasto = document.querySelector('#addGasto');

let bodyTablaR = document.querySelector('#bodyTablaR');

let bodyTablaH = document.querySelector('#bodyTablaH');

let selectRoommate = document.querySelector('#selectRoommate');

let descripcionGasto = document.querySelector('#descripcion');

let montoGasto = document.querySelector('#montoGasto');

let botonEliminar = document.querySelector('.boton-remover');

let divStatus= document.querySelector('#divCodStatus');

//Como cliente HTTP para consumir la API fue utiliza la librería de AXIOS.
//A continuación método get utilizado para consumir la API, trayendo los roommates actualizados.
const traerRoommates = async () => {
        await axios.get('roommates')
                .then((res) => {
                        if (res.status == 200) {
                                roommatesActualizados = res.data.roommates;
                        }
                })
                .catch((err) => {
                        console.log(err);
                }); 
};

//Método get utilizado para consumir la API, trayendo los gastos actualizados.
const traerGastos = async () => {
        await axios.get('gastos')
                .then((res) => {
                        if (res.status == 200) {
                                gastosActualizados = res.data.gastos;
                        }
                })
                .catch((err) => {
                        console.log(err);
                }); 
};

//La siguiente función se encarga de renderizar en el navegador la información actualizada.
const renderizar = async () => {
        try {
                bodyTablaR.innerHTML = ''; 
                bodyTablaH.innerHTML = ''; //Se dejan vacías las tablas y el select,
                selectRoommate.innerHTML = ''; //para luego colocar allí datos actualizados.
                await traerRoommates();

                //Renderizando la tabla actualizada de roommates ingresados, creando una fila por cada roommate.
                roommatesActualizados.forEach((data) => 
                {      
                        let nuevaFila = document.createElement('div');
                        nuevaFila.classList.add("row")
                        nuevaFila.innerHTML = `
                                <div class="col-4">
                                <h6>${data.nombre}</h6>
                                </div>
                                <div class="col-4">
                                <h6>${data.debe}</h6>
                                </div>
                                <div class="col-4">
                                <h6>${data.recibe}</h6>
                                </div>     
                        `
                        bodyTablaR.appendChild(nuevaFila); //Agregando cada nueva fila dentro de la tabla.
                });

                // Renderizando los roommates actualizados en el select de agregar gasto.
                roommatesActualizados.forEach((data) => 
                {      
                        let nuevaOption = document.createElement('option');
                        nuevaOption.innerHTML = `
                        <option value="${data.nombre}">${data.nombre}</option>  
                        `
                        selectRoommate.appendChild(nuevaOption); 
                });

                //Se ubica este await en traerGastos(), para asegurar que finalice la operación antes de renderizar las filas que contendrán dicha información.
                await traerGastos();
                //Renderizando la tabla de gastos actualizada.
                gastosActualizados.forEach((data) => 
                {
                        let nuevaFila = document.createElement('div');
                        nuevaFila.classList.add("row")
                        nuevaFila.innerHTML = `
                                <div class="col-4">
                                        <p>${data.roommate}</p>
                                </div>
                                <div class="col-4">
                                        <p>${data.descripcion}</p>
                                </div>
                                <div class="col-2">
                                        <p>${data.monto}</p>
                                </div>
                                <div class="col-2">
                                        <a class="boton-editar" href="editarGasto?id=${data.id}"><i class="fa-solid fa-pen"></i></a>
                                        <button class="boton-remover" onclick="borrarGasto('${data.id}')"><i class="fa-solid fa-trash"></i></button>
                                </div>         
                        `
                        bodyTablaH.appendChild(nuevaFila);  
                });
                
        } catch (err) {
                console.log(err);
        }
};

//Método post, sin payload, utilizado para conseguir que la API del servidor solicite a una API externa los datos de un usuario (roommate) aleatorio, los cuales serán almacenados en un archivo JSON en el servidor. 
//Una vez finalizada esta operación, se procedería a renderizar la información actualizada.
addRoommate.addEventListener("click", async () => { 
        await axios.post('/roommates', {responseType: 'json'})
                .then((res) => {
                        if(res.status==200){
                                renderizar();
                                renderStatus(`El código de estado de respuesta HTTP es: ${res.status}`);  
                        }
                })
                .catch((err) => {
                        console.log(err);
                }); 
});

//Método delete utilizado para lograr que desde la API del servidor se elimine un gasto, asociado por un id al botón eliminar de su correspondiente fila.
const borrarGasto = async (id) => {
        await axios.delete('/gasto?id=' + id, {responseType: 'json'})
                .then((res) => {
                        if(res.status==200){
                                renderizar();
                                renderStatus(`El código de estado de respuesta HTTP es: ${res.status}`);  
                        } 
                })
                .catch((err) => {
                        console.log(err);
                }); 
};

//Función creada para mostrar códigos de estado HTML.
const renderStatus = (status) => {
                divStatus.innerHTML = ''; //Se deja vacío el div que contiene los status previos
                let nuevoParrafo = document.createElement('p');
                nuevoParrafo.innerHTML = status;                        
                divStatus.appendChild(nuevoParrafo);
};        

renderizar();
