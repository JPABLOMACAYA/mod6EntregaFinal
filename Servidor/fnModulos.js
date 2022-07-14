// Importaciones
const fs = require('fs');
const axios = require('axios')
const { v4 : uuidv4 } = require('uuid');

//Función utilizada para solicitar usuarios nuevos a la API externa, mediante el método get de axios.
const newRoommate = async () => 
{
    try {
        const response = await axios.get('https://randomuser.me/api');
        const dataUser = response.data.results[0];
                                      
        const usuarioRandom = {
            id: uuidv4().slice(26), 
            nombre: dataUser.name.first + ' ' + dataUser.name.last,
            correo: dataUser.email,
            debe: 0,
            recibe: 0
        };
        return usuarioRandom;
    } catch(error) {
            console.log(error);
    }
};

//Luego de generado un roommate nuevo, la siguiente función se encarga de almacenarlo en la base de datos.
const saveRoommate = (newRoommate) => 
{
    const roommatesJSON = JSON.parse(fs.readFileSync('roommates.json', 'utf8'));
    roommatesJSON.roommates.unshift(newRoommate);
    fs.writeFileSync('roommates.json', JSON.stringify(roommatesJSON));
};

//Mediante la siguiente función se actualizan las cuentas de cada roommate en roommates.json, acorde a los nuevos gastos.
const saveGasto = (body) => {
    console.log(body);
    let roommatesJSON = JSON.parse(fs.readFileSync("roommates.json", "utf8"));
    let arregloRoommates = roommatesJSON.roommates;
    let conteoRoommates = arregloRoommates.length;
    
    arregloRoommates.map((roommate) => {
        if (conteoRoommates > 1) {
            if (roommate.nombre == body.selectRoommate) {
            let recibe = body.monto - (body.monto / conteoRoommates);
            roommate.recibe += Math.round(parseFloat(recibe));
            } else {
                console.log(roommate.nombre);
                console.log(body.selectRoommate);
                let debe = body.monto / conteoRoommates;
            roommate.debe += Math.round(parseFloat(debe));
            }
        }
        fs.writeFileSync("roommates.json", JSON.stringify(roommatesJSON))
    });
};

//Desde aquí se exportan los módulos de funciones, para ser utilizadas en la API.
module.exports = { newRoommate, saveRoommate, saveGasto };