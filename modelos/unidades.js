const mongoose = require('mongoose')

const UnidadesSchema = mongoose.Schema({
    numUnidad: String,
    celular: String,
    conductor: String,
    placa: String,
    modelo: String,
    agno: String,
    propietario: String,
    chatId: String
}, {versionKey: false})

module.exports = mongoose.model('Unidades', UnidadesSchema)