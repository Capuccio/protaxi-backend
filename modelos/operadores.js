const mongoose = require('mongoose')

const OperadoresSchema = mongoose.Schema({
    nombre: String,
    apellido: String,
    correo: String,
    clave: String,
    nivel: String
}, {versionKey: false})

module.exports = mongoose.model('Operadores', OperadoresSchema)