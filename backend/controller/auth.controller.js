const Usuario = require('../models/Usuario')

const cryptoJs = require('crypto-js')
const CHAVE_SECRETA = 'segredo' // deve ficar no arquivo .env

const login = async (req,res)=>{
    const valores = req.body

    if(!valores.email || !valores.senha){
        return res.status(400).json({message: 'Campos email e senha obrigatórios!'})
    }

    try{
        const usuario = await Usuario.findOne({where: { email: valores.email}})

        if(!usuario){
            return res.status(404).json({message: 'Usuário não encontrado!'})
        }

        // descriptografa a senha salva no banco para comparar com a digitada
        const bytes = cryptoJs.AES.decrypt(usuario.senha, CHAVE_SECRETA)
        const senha = bytes.toString(cryptoJs.enc.Utf8)

        if(valores.senha !== senha){
            return res.status(401).json({message: 'Senha incorreta, não autorizado!'})
        }

        // sessão de 1,5 hora (90 minutos) em milissegundos
        const noventaMinutosEmMs = 90 * 60 * 1000
        const tempoExpirar = Date.now() + noventaMinutosEmMs

        const payload = {
            idUsuario: usuario.codUsuario,
            nome: usuario.nome,
            expiraEm: tempoExpirar
        }

        const token = cryptoJs.AES.encrypt(JSON.stringify(payload), CHAVE_SECRETA).toString()

        return res.status(200).json({
            message: 'Login realizado com sucesso',
            nome: usuario.nome,
            token: token
        })

    }catch(err){
        console.error('Não foi possível fazer o login!',err)
        res.status(500).json({message: 'Não foi possível fazer o login!'})
    }
}

module.exports = { login }
