const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/** Rutas */
app.use(require('./rutas/unidades'))
app.use(require('./rutas/usuarios'))
app.use(require('./rutas/operadores'))

/** Conexión a la Base de Datos */
mongoose.connect('mongodb://localhost/protaxi', { useNewUrlParser: true })
.then(db => console.log('Se logró conectar a la Base de Datos, Protaxi'))
.catch(error => console.log('No se logró conectar a la base de datos: ', error))

/** Levantando API */
app.set('puerto', process.env.POST || 3500)

app.listen(app.get('puerto'), () => {
    console.log('Api inicializado en el puerto', app.get('puerto'));
})