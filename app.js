const debug = require('debug')('app:inicio');
// const dbDebug = require('debug')('app:db')
const express = require('express');
const Joi = require('@hapi/joi')
const app = express();
// const logger = require('./logger');
// const authenticator = require('./authenticator');
const morgan = require('morgan');
const config = require('config');
const puerto = process.env.PORT | 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

//Configuración de entorno
console.log(`Aplicación: ${config.get('nombre')}`);
console.log(`BD Server: ${config.get('configDB.host')}`);

//Uso de middleware de terceros - Morgan

if(app.get('env') === 'development'){

    app.use(morgan('tiny'));

    // console.log('Morgan habilitado...');
    debug('Morgan está habilitado...')
}

//Trabajos con db

debug('Conectando con la db....')

// app.use(logger);

// app.use(authenticator);

const usuarios = [
    {
        id: 1,
        nombre: 'Grover'
    },
    {
        id: 2,
        nombre: 'Luis'
    },
    {
        id: 3,
        nombre: 'Ana'
    }
]

app.get('/', (req, res) => {
    res.send('Hola Mundo desde Express');
});

app.get('/api/usuarios', (req, res) => {
    res.send(usuarios)
})

app.get('/api/usuarios/:id', (req, res) => {

    let usuario = existeUsuario(req.params.id);
    if (!usuario) res.status(404).send('No se encontró el usuario')
    res.send(usuario);

})

app.post('/api/usuarios', (req, res) => {

    const { error, value } = validarUsuario(req.body.nombre);

    if (!error) {
        let usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    } else {
        const mensaje = error.details[0].message
        res.status(400).send(mensaje);
    }
})

app.put('/api/usuarios/:id', (req, res) => {

    let usuario = existeUsuario(req.params.id);
    if (!usuario) {
        res.status(404).send('No se encontró el usuario');
        return;
    }

    const { error, value } = validarUsuario(req.body.nombre);

    if (error) {
        const mensaje = error.details[0].message
        res.status(400).send(mensaje);
        return;
    }

    usuario.nombre = value.nombre;
    res.send(usuario);

})

app.delete('/api/usuarios/:id', (req, res) => {

    let usuario = existeUsuario(req.params.id);
    if (!usuario) {
        res.status(404).send('No se encontró el usuario');
        return;
    }

    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1);

    res.send(usuario)


})

app.listen(puerto, () => {
    console.log(`Escuchando en http://localhost:${puerto}`);
})

function existeUsuario(id) {
    return (usuarios.find(u => u.id === parseInt(id)))
}

function validarUsuario(nom) {
    const schema = Joi.object({
        nombre: Joi.string()
            .alphanum()
            .min(3)
            .max(30)
            .required()
    });

    return (schema.validate({ nombre: nom }))
}