const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const Unidades = require('../modelos/unidades')
const Clientes = require('../modelos/clientes')
const Operadores = require('../modelos/operadores')
const Reportes = require('../modelos/reportes')
require('dotenv').config()

const token = process.env.MI_TOKEN

const bot = new TelegramBot(token, {polling: true});

const rutas = express()

/** GET */
rutas.get('/unidades/:pagina', async (req, res) => {
    let porPagina = 10
    let pagina = req.params.pagina
    const { opcionesbusqueda, valorbusqueda } = req.headers

    let busqueda = {}

    if (opcionesbusqueda != 'undefined' && valorbusqueda != 'undefined') {
        busqueda[opcionesbusqueda] = { $regex: '.*' + valorbusqueda + '.*'}
    }

    Unidades
    .find(busqueda)
    .skip((porPagina * pagina) - porPagina)
    .limit(porPagina)
    .sort({
        numUnidad: -1
    })
    .exec(function(error, unidades) {
        if (error) {
            res.json({
                error: true,
                servidor: true,
                respuesta: error
            })
        }
        Unidades.countDocuments((error, count) => {
            if (error) {
                res.json({
                    error: true,
                    servidor: true,
                    respuesta: 'Error en consulta de unidades, contactar con el técnico'
                })
            }

            if (!unidades) {
                res.json({
                    error: true,
                    servidor: false,
                    respuesta: 'No hay unidades registradas'
                })
            } else {
                res.json({
                    error: false,
                    servidor: false,
                    respuesta: unidades,
                    maximo: Math.ceil(count / porPagina)
                })
            }

        })

    })
})

/** POST */
rutas.post('/unidades/asignar', async (req, res) => {
    const { numeroUnidad } = req.body
    const { datosoperador } = req.headers
    const { idUsuario } = req.body

    Unidades.findOne({numUnidad: numeroUnidad}, function(err, unidad) {
        if (err) {
            res.json({
                error: true,
                servidor: true,
                respuesta: 'Error del servidor, contactar al técnico'
            })
        }

        if (unidad) {

            Clientes.findById(idUsuario, async function(error, cliente) {
                if (error) {
                    res.json({
                        error: true,
                        servidor: true,
                        respuesta: 'Error del servidor, contactar al técnico'
                    })
                }

                Operadores.findById(datosoperador, function(err, operador) {
                    if (err) {
                        res.json({
                            error: true,
                            servidor: true,
                            respuesta: 'Error servidor Operadores'
                        })
                    }

                    if (operador) {
                        const reportes = new Reportes({
                            cliente: `${req.body.nombre} ${req.body.apellido}`,
                            numeroCliente: `${req.body.celular} ${req.body.telefono}`,
                            unidad: numeroUnidad,
                            hora: req.body.hora,
                            fecha: req.body.dia,
                            operador: `${operador.nombre} ${operador.apellido}`,
                            descripcion: req.body.descripcion
                        })

                        reportes.save()
                        .catch(error => {
                            res.json({
                                error: true,
                                servidor: true,
                                respuesta: 'Error al guardar'
                            })
                        })
                    }
                })

                const direccion = req.body.direccion == 1 ? cliente.direccionUno : cliente.direccionDos

                bot.sendMessage(unidad.chatId, `
                LineaTaxi
                Cliente asignado:
                ${req.body.nombre} ${req.body.apellido}

                Dirección:
                ${direccion}

                Descripción:
                ${req.body.descripcion}
                `)

                res.json({
                    error: false,
                    servidor: false,
                    respuesta: 'Cliente asignado con éxito'
                })
            })

        } else {
            res.json({
                error: true,
                servidor: false,
                respuesta: 'La unidad colocada no está registrada'
            })
        }

    })
})

rutas.post('/unidades/registro', async (req, res) => {
    const datosUnidad = req.body

    const nuevaUnidad = new Unidades({
        numUnidad: datosUnidad.numero,
        celular: datosUnidad.celular,
        conductor: datosUnidad.conductor,
        placa: datosUnidad.placa,
        modelo: datosUnidad.modelo,
        agno: datosUnidad.agno,
        propietario: datosUnidad.propietario,
        chatId: datosUnidad.telegram
    })

    nuevaUnidad.save()
    .catch(error => console.log(error))
    .then(existoso => {
        res.json({
            error: false,
            servidor: false,
            respuesta: 'Se logró registrar la unidad correctamente'
        })
    })
})

rutas.post('/unidades/dato', async (req, res) => {
    Unidades.findById(req.body.id, function(error, unidad) {
        res.json({
            error: false,
            servidor: false,
            respuesta: unidad
        })
    })
})

/** PUT */
rutas.put('/unidades/actualizar', async (req, res) => {
    const datosUnidad = req.body
    Unidades.updateOne({_id: req.body.id}, datosUnidad, function(err, actualizada) {
        if (err) {
            res.json({
                error: true,
                servidor: true,
                respuesta: 'Error al actualizar Unidad'
            })
        }

        if (actualizada) {
            res.json({
                error: false,
                servidor: false,
                respuesta: 'Unidad actualizada, vuelva a seleccionar Unidades en el menú para recargar la vista'
            })
        }
    })
})

/** DELETE */
rutas.delete('/unidades/eliminar', async (req, res) => {
    const eliminado = await Unidades.findByIdAndDelete(req.body.id)

    if (eliminado) {
        res.json({
            error: false,
            servidor: false,
            respuesta: 'Unidad eliminada correctamente, recargue la vista por favor',
            lugar: 'unidades-error'
        })
    } else {
        res.json({
            error: true,
            servidor: true,
            respuesta: 'Error al eliminar la Unidad, contacte con el técnico',
            lugar: 'unidades-error'
        })
    }
})

module.exports = rutas