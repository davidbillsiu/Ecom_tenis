const { DataTypes } = require('sequelize')
const db = require('../db/conn')

const Usuario = db.define('usuario',{
    codUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nome: {
        type: DataTypes.STRING(40),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true // o e-mail é o identificador do login
    },
    senha: {
        type: DataTypes.STRING(255), // texto criptografado (AES) é bem maior que a senha original
        allowNull: false
    },
    cpf: {
        type: DataTypes.STRING(100), // texto criptografado (AES)
        allowNull: false
    },
    telefone: {
        type: DataTypes.STRING(20),
        allowNull: false
    }
},{
    timestamps: false,
    tableName: 'usuarios'
})

module.exports = Usuario
