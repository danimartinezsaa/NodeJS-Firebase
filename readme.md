Qué hace esta APP
=================
Este servidor NodeJS tiene una interfaz de usuario en dónde a los camareros de un bar les salen los pedidos realizados a través de una aplicación android, y estos pueden confirmar el pedido o eliminarlo.

Se informa al usuario que usa la aplicación mediante una notificación de las modificaciones en su pedido.

Cómo usar Base de datos Firebase en servidor NodeJS
=====================

1. Añadir Firebase mediante el gestor de paquetes de NodeJS

```
npm install firebase

```

2. Añadir el **JSON** con las credenciales que puedes encontrar en tu proyecto Firebase a la carpeta del proyecto

3. Importar **firebase-admin** y **credenciales.json**, pasarle la URL de la base de datos en Firebase y recogerla en la variable db. A partir de ahí ya podrás trabajar con la base de datos y realizar operaciones CRUD.

```
var admin = require('firebase-admin');
var serviceAccount = require('./credenciales.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "urlDatabase"
});


//Base de datos
var db = admin.database();

```