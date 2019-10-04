const express = require('express')
const Reportes = require('../modelos/reportes')
const Operadores = require('../modelos/operadores')

const rutas = express()

/** GET */
rutas.post('/reportes/actualizarhora', async (req, res) => {
    for (let i = 0; i < req.body.length; i++) {
        Reportes.findByIdAndUpdate(req.body[i]._id, {$set: req.body[i]}).exec()
    }

    res.json({
        respuesta: 'Listo'
    })
})

rutas.get('/reportes', async (req, res) => {
    Reportes.find(function(err, reportes) {
        res.json({
            datos: reportes
        })
    })
})

rutas.get('/reportes/:pagina', async (req, res) => {
    let porPagina = 10
    let pagina = req.params.pagina
    const { opcionbusquedareportes, valorbusquedareportes } = req.headers

    let busqueda = {}

    if (opcionbusquedareportes != 'undefined' && valorbusquedareportes != 'undefined') {
        busqueda[opcionbusquedareportes] = { $regex: '.*' + valorbusquedareportes + '.*'}
    }

    Reportes
    .find(busqueda)
    .skip((porPagina * pagina) - porPagina)
    .limit(porPagina)
    .sort({
        fecha: 'desc',
        hora: 'desc',
    })
    .exec(function(err, reportes) {
        if (err) {
            res.json({
                error: true,
                servidor: true,
                respuesta: 'Error en el servidor, contactar con el técnico'
            })
        }

        Reportes.countDocuments((error, count) => {
            if (error) {
                res.json({
                    error: true,
                    servidor: true,
                    respuesta: 'Error en el Count, contactar con el técnico'
                })
            }

            if (reportes.length === 0) {
                res.json({
                    error: true,
                    servidor: false,
                    respuesta: 'No hay reportes registrados'
                })
            } else {
                res.json({
                    error: false,
                    servidor: false,
                    respuesta: reportes,
                    maximo: Math.ceil(count / porPagina)
                })
            }
        })
    })
})

rutas.get('/operadores/:pagina', async (req, res) => {
    let porPagina = 10
    let pagina = req.params.pagina

    Operadores
    .find({})
    .skip((porPagina * pagina) - porPagina)
    .limit(porPagina)
    .sort({
        nombre: -1
    })
    .exec(function(err, operadores) {
        if (err) {
            res.json({
                error: true,
                servidor: true,
                respuesta: 'Error en el servidor, contactar con el técnico'
            })
        }

        Operadores.countDocuments((error, count) => {
            if (error) {
                res.json({
                    error: true,
                    servidor: true,
                    respuesta: 'Error en el Count, contactar con el técnico'
                })
            }

            if (operadores.length === 0) {
                res.json({
                    error: true,
                    servidor: false,
                    respuesta: 'No hay operadores registrados'
                })
            } else {
                res.json({
                    error: false,
                    servidor: false,
                    respuesta: operadores,
                    maximo: Math.ceil(count / porPagina)
                })
            }
        })
    })
})

/** POST */

rutas.post('/operadores/login', async (req, res) => {
    let { correo, clave } = req.body

    Operadores.findOne({correo: correo}, async function(err, operador) {
        if (err) {
            res.json({
                error: true,
                respuesta: 'Hubo un error en el servidor'
            })
        }

        /** Validar si existe el usuario & La clave sea igual */
        if (operador && operador.clave === clave) {
            res.json({
                error: false,
                respuesta: operador
            })
        } else {
            res.json({
                error: true,
                respuesta: 'El correo o la clave introducido no son válidos'
            })
        }
    })
})

module.exports = rutas