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

//Base de datos
var db = admin.database();
var ref = db.ref("/");
//Para guardar el resultado de la base
var resultado = null;


//Listener Base de datos que se actualiza en tiempo real
ref.on("value", function(snapshot) {
    resultado = snapshot;
}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});

//especificamos el subdirectorio donde se encuentran las páginas estáticas
app.use(express.static(__dirname + '/html'));

//extended: false significa que parsea solo string (no archivos de imagenes por ejemplo)
app.use(bodyParser.urlencoded({ extended: false }));



//Post Method
app.post('/enviar', (req, res) => {
    //Recogemos los datos del formulario
    let token=req.body.confirmado
    let usuario=req.body.usuario
    let cafeleche=req.body.cafeleche
    let cafelargo=req.body.cafelargo
    let croissant=req.body.croissant
    let tortilla=req.body.tortilla
    let tostada=req.body.tostada
    
    let pagina = '<!doctype html><html><head></head><body>';
    pagina += '<p>'+usuario+' Confirmado </p>';
    pagina += '</body></html>';
    
    let pedido=db.ref("/")
    let modificacion=pedido.child(token);
    modificacion.set({
        "usuario":usuario,
        "confirmado": "true",
        "cafeleche": cafeleche,
        "cafesololargo":cafelargo,
        "croissant":croissant,
        "tortilla":tortilla,
        "tostada":tostada
    });
    
    var registrationToken = token;

    // Creamos el cuerpo de la notificación
    var message = {
        //Pasamos Datos para que los recoja la activity
        data:{
            "usuario":usuario,
            "confirmado":"true",
            "cafeleche": cafeleche,
            "cafesololargo":cafelargo,
            "croissant":croissant,
            "tortilla":tortilla,
            "tostada":tostada
        },
        //Mensaje de la notificación
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
    
    res.redirect('/');

});



//Get Method
app.get('/', (req, res) => {
    let pagina = '<!doctype html><html><head><link rel="stylesheet" type="text/css" href="estilo.css"></head><body>';
    pagina += '<h1>Pedidos</h1>';
    
    //Listamos los pedidos
    resultado.forEach(function(data) {
        console.log(data.key + "Tiene un pedido. Confirmado: " + data.val().confirmado);
        let usuario=data.val().usuario
        pagina += '<form action="/enviar" method="post">';
        pagina += '<div id="lista"><ul><li>'+usuario+'</li>';
        pagina += '<li> Café con leche:'+data.val().cafeleche+'</li>';
        pagina += '<li> Café solo largo:'+data.val().cafesololargo+'</li>';
        pagina += '<li> Croissant: '+data.val().croissant+'</li>';
        pagina += '<li> Tortilla: '+data.val().tortilla+'</li>';
        pagina += '<li> Tostada: '+data.val().tostada+'</li>';
        pagina += '<li>Confirmado: '+data.val().confirmado+'</li>';
        pagina += '</ul></div>';
        pagina += '<input type="hidden" name="confirmado" value='+data.key+'>';
        pagina += '<input type="hidden" name="usuario" value='+usuario+'>';
        pagina += '<input type="hidden" name="cafeleche" value='+data.val().cafeleche+'>';
        pagina += '<input type="hidden" name="cafelargo" value='+data.val().cafesololargo+'>';
        pagina += '<input type="hidden" name="croissant" value='+data.val().croissant+'>';
        pagina += '<input type="hidden" name="tortilla" value='+data.val().tortilla+'>';
        pagina += '<input type="hidden" name="tostada" value='+data.val().tostada+'>';
        pagina += '<button type="submit">Confirmar</button>';
        pagina += '</form>';
    });

    pagina += '</body></html>';
    res.send(pagina);
});


var server = app.listen(8080, () => {
    console.log('Servidor web iniciado');
});