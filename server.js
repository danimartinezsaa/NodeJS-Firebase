// imports
const express = require('express');
const app = express();
const bodyParser = require('body-parser');


// inicializamos la conexion con firebase
// necesitamos json con las credenciales 
var admin = require('firebase-admin');
var serviceAccount = require('./credenciales.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://notificaciones-91fad.firebaseio.com"
});

var db = admin.database();
var ref = db.ref("/");
var resultado = null;

ref.on("value", function(snapshot) {
    console.log("dentro de la funcion:" + snapshot.val());
    resultado = snapshot.val();
    
    for(var elemento in resultado) {
        let consulta=elemento;
        console.log(consulta);
        
    }

}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});

//especificamos el subdirectorio donde se encuentran las páginas estáticas
app.use(express.static(__dirname + '/html'));

//extended: false significa que parsea solo string (no archivos de imagenes por ejemplo)
app.use(bodyParser.urlencoded({ extended: false }));

//Post Method
app.post('/enviar', (req, res) => {
    let token = req.body.token;
    let msg = req.body.msg;
    let pagina = '<!doctype html><html><head></head><body>';
    pagina += `<p>(${token}/${msg}) Enviado </p>`;
    pagina += '</body></html>';
    
    var registrationToken = token;

    // Creamos el cuerpo de la notificación
    var message = {
        notification:{
            "title":"Notificación desde NodeJS",
            "body": msg
        },
        token: registrationToken
    };

    //Envío de la notificación
    admin.messaging().send(message)
        .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
    })
    .catch((error) => {
        console.log('Error sending message:', error);
    });
    
    //Envío de la página
    res.send(pagina);
});

//Get Method
app.get('/mostrar', (req, res) => {
    let pagina = '<!doctype html><html><head></head><body>';
    pagina += 'Muestro<br>';
    pagina += '<div id="resultado">' + resultado + '</div>'
    pagina += '<p>...</p>';
    pagina += '</body></html>';
    res.send(pagina);
});


var server = app.listen(8080, () => {
    console.log('Servidor web iniciado');
});