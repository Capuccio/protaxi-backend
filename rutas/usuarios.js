const express = require('express')
const Operadores = require('../modelos/operadores')
const Clientes = require('../modelos/clientes')

const rutas = express()

/** GET */
rutas.get('/clientes/:pagina', async (req, res, next) => {
    let porPagina = 10
    let pagina = req.params.pagina
    const { opcionesbusqueda, valorbusqueda } = req.headers

    let busqueda = {}

    if (opcionesbusqueda != 'undefined' && valorbusqueda != 'undefined') {
        busqueda[opcionesbusqueda] = { $regex: '.*' + valorbusqueda + '.*'}
    }

    Clientes
    .find(busqueda)
    .skip((porPagina * pagina) - porPagina)
    .limit(porPagina)
    .sort({
        nombre: -1
    })
    .exec(function(error, clientes) {
        if (error) {
            res.json({
                error: true,
                servidor: true,
                respuesta: error
            })
        }
        Clientes.countDocuments((error, count) => {
            if (error) {
                res.json({
                    error: true,
                    servidor: true,
                    respuesta: 'Error en consulta Count de clientes, contactar con el técnico'
                })
            }

            if (!clientes) {
                res.json({
                    error: true,
                    servidor: false,
                    respuesta: 'No hay usuarios registrados'
                })
            } else {
                res.json({
                    error: false,
                    servidor: false,
                    respuesta: clientes,
                    maximo: Math.ceil(count / porPagina)
                })
            }

        })

    })
})

/** POST */
rutas.post('/clientes/numero', async (req, res) => {
    const numero = req.body.numero
    Clientes.findOne({$or: [{celular: numero}, {telefono: numero}]}, function(err, cliente) {
        if (err) {
            res.json({
                error: true,
                servidor: true,
                respuesta: 'Error en la consulta de datos, por favor contacte al técnico'
            })
        }

        if (cliente) {
            res.json({
                error: false,
                servidor: false,
                respuesta: cliente
            })
        } else {
            res.json({
                error: true,
                servidor: false,
                respuesta: 'Usuario no existente'
            })
        }
    })
})

rutas.post('/clientes/registro', async (req, res) => {
    const datosCliente = req.body
    const nuevoCliente = new Clientes({
        nombre: datosCliente.nombre,
        apellido: datosCliente.apellido,
        telefono: datosCliente.telefono,
        celular: datosCliente.celular,
        direccionUno: datosCliente.direccionuno,
        direccionDos: datosCliente.direcciondos,
        correo: datosCliente.correo
    })

    nuevoCliente.save()
    .catch(error => {
        console.log(error)
        res.json({
            error: true,
            servidor: true,
            respuesta: 'Error al guardar los datos, contacte con un técnico'
        })
    })
    .then(exitoso => {
        res.json({
            error: false,
            servidor: false,
            respuesta: 'Cliente registrado con éxito'
        })
    })
})

rutas.post('/clientes/dato', async (req, res) => {
    Clientes.findById(req.body.id, function(error, cliente) {
        res.json({
            error: false,
            servidor: false,
            respuesta: cliente
        })
    })
})

rutas.post('/clientes/validar', async (req, res) => {
    const { celular, telefono } = req.body
    Clientes.findOne({celular: celular}, async function(err, nroCelular) {
        if (err) {
            console.log(err)
            res.json({
                error: true,
                servidor: true,
                respuesta: 'Error al validar datos, consulte al técnico'
            })
        }

        if (nroCelular) {
            res.json({
                error: true,
                servidor: false,
                respuesta: 'El celular colocado ya existe'
            })
        } else {

            Clientes.findOne({telefono: telefono}, async function(err, nroTelefono) {
                if (err) {
                    res.json({
                        error: true,
                        servidor: true,
                        respuesta: 'Error al validar datos, consulte al técnico'
                    })
                }

                if (nroTelefono.telefono) {
                    res.json({
                        error: true,
                        servidor: false,
                        respuesta: 'El teléfono colocado ya existe'
                    })
                } else {
                    res.json({
                        error: false,
                        servidor: false,
                        respuesta: 'Usuario no existente'
                    })
                }
            })

        }
    })
})

/** PUT */
rutas.put('/clientes/actualizar', async(req, res) => {
    const datosCliente = req.body
    Clientes.updateOne({_id: req.body.id}, datosCliente, function(err, update) {
        if (err) {
            res.json({
                error: true,
                servidor: true,
                respuesta: 'Error al actualizar clientes'
            })
        }

        if (update) {
            res.json({
                error: false,
                servidor: false,
                respuesta: 'Usuario actualizado, vuelva a seleccionar Clientes en el menú para recargar la vista'
            })
        }
    })
})

/** DELETE */
rutas.delete('/clientes/eliminar', async (req, res) => {
    const eliminado = await Clientes.findByIdAndDelete(req.body.id)

    if (eliminado) {
        res.json({
            error: false,
            servidor: false,
            respuesta: 'Cliente eliminado correctamente, recargue la vista por favor',
            lugar: 'clientes-error'
        })
    } else {
        res.json({
            error: true,
            servidor: true,
            respuesta: 'Error al eliminar el Cliente, contacte con el técnico',
            lugar: 'clientes-error'
        })
    }
})

module.exports = rutas;