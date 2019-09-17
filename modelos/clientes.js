const mongoose = require('mongoose')

const ClientesSchema = mongoose.Schema({
    nombre: String,
    apellido: String,
    telefono: String,
    celular: String,
    direccionUno: String,
    direccionDos: String,
    correo: String
}, {versionKey: false})

module.exports = mongoose.model('Clientes', ClientesSchema)