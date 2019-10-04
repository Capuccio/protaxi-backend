const mongoose = require('mongoose')

const ReportesSchema = mongoose.Schema({
    cliente: String,
    numeroCliente: String,
    unidad: String,
    hora: String,
    fecha: String,
    operador: String,
    descripcion: String,
}, {versionKey: false})

module.exports = mongoose.model('Reportes', ReportesSchema)