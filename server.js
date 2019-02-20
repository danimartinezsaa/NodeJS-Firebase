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


//Listener Base de datos
ref.on("value", function(snapshot) {

    resultado = snapshot;

}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});


//especificamos el subdirectorio donde se encuentran las páginas estáticas
//app.use(express.static(__dirname + '/html'));

//extended: false significa que parsea solo string (no archivos de imagenes por ejemplo)
app.use(bodyParser.urlencoded({ extended: false }));

//Post Method
app.post('/enviar', (req, res) => {
    let token=req.body.confirmado
    let usuario=req.body.usuario
    let pagina = '<!doctype html><html><head></head><body>';
    pagina += '<p>'+usuario+' Confirmado </p>';
    pagina += '</body></html>';
    
    let pedido=db.ref("/")
    let modificacion=pedido.child(token);
    modificacion.set({
        "confirmado": "true"
    });
    
    var registrationToken = token;

    // Creamos el cuerpo de la notificación
    var message = {
        data:{
          "msg":"Ya puedes venir al bar!"
        },
        notification:{
            "title":"Pedido Confirmado",
            "body": "Ya puedes venir al bar!"
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
app.get('/', (req, res) => {
    let pagina = '<!doctype html><html><head></head><body>';
    pagina += '<h1>Pedidos</h1>';
    
    resultado.forEach(function(data) {
        console.log(data.key + "Tiene un pedido. Confirmado: " + data.val().confirmado);
        let usuario=data.val().usuario
        pagina += '<form action="/enviar" method="post">';
        pagina += '<h3>'+usuario+'</h3>';
        pagina += '<ul>';
        pagina += '<li> Café con leche:'+data.val().cafeleche+'</li>';
        pagina += '<li> Café solo largo:'+data.val().cafesololargo+'</li>';
        pagina += '<li> Croissant: '+data.val().croissant+'</li>';
        pagina += '<li> Tortilla: '+data.val().tortilla+'</li>';
        pagina += '<li> Tostada: '+data.val().tostada+'</li>';
        pagina += '<li style="color:red">Confirmado: '+data.val().confirmado+'</li>';
        pagina += '</ul>';
        pagina += '<input type="hidden" name="confirmado" value='+data.key+'>';
        pagina += '<input type="hidden" name="usuario" value='+usuario+'>';
        pagina += '<button type="submit">Confirmar</button>';
        pagina += '</form>';
    });

    pagina += '</body></html>';
    res.send(pagina);
});


var server = app.listen(8080, () => {
    console.log('Servidor web iniciado');
});