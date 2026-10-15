const { Op } = require('sequelize')
const Usuario = require('../models/Usuario')

const cryptoJs = require('crypto-js')
const CHAVE_SECRETA = 'segredo' // deve ficar no arquivo .env

const criptografar = (texto)=>{
    return cryptoJs.AES.encrypt(String(texto), CHAVE_SECRETA).toString()
}

const descriptografar = (textoCripto)=>{
    const bytes = cryptoJs.AES.decrypt(textoCripto, CHAVE_SECRETA)
    return bytes.toString(cryptoJs.enc.Utf8)
}

// monta o que será devolvido ao front: CPF descriptografado e SEM a senha
const formatarUsuario = (usuario)=>{
    return {
        codUsuario: usuario.codUsuario,
        nome: usuario.nome,
        email: usuario.email,
        cpf: descriptografar(usuario.cpf),
        telefone: usuario.telefone
    }
}

const cpfValido = (cpf)=> /^\d{11}$/.test(String(cpf))

const cadastrar = async (req, res)=>{
    const valores = req.body

    if(!valores.nome || !valores.email || !valores.senha ||
        !valores.cpf || !valores.telefone){
        return res.status(400).json({message: 'Todos os campos são obrigatórios!'})
    }

    if(!cpfValido(valores.cpf)){
        return res.status(400).json({message: 'CPF inválido! Informe os 11 números, sem pontos ou traço.'})
    }

    try{
        // o e-mail é o identificador do login, então não pode repetir
        const emailExiste = await Usuario.findOne({where: { email: valores.email}})
        if(emailExiste){
            return res.status(409).json({message: 'E-mail já cadastrado!'})
        }

        // senha e cpf são criptografados ANTES de gravar no banco
        await Usuario.create({
            nome: valores.nome,
            email: valores.email,
            senha: criptografar(valores.senha),
            cpf: criptografar(valores.cpf),
            telefone: valores.telefone
        })
        res.status(201).json({message: 'Usuario Cadastrado com sucesso!'})
    }catch(err){
        console.error('Não foi possível cadastrar o Usuário',err)
        res.status(500).json({message: 'Não foi possível cadastrar o Usuário'})
    }
}
const listar = async (req,res)=>{
    try{
        const dados = await Usuario.findAll()
        res.status(200).json(dados.map(formatarUsuario))
    }catch(err){
        console.error('Não foi possível listar os Usuários',err)
        res.status(500).json({message: 'Não foi possível listar os Usuários'})
    }
}
const buscarPorCod = async (req,res)=>{
    const id = req.params.id
    try{
        const dados = await Usuario.findByPk(id)
        if(!dados){
            res.status(404).json({message: 'Usuário não encontrado!'})
        }else{
            res.status(200).json(formatarUsuario(dados))
        }
    }catch(err){
        console.error('Não foi possível encontrar o Usuário',err)
        res.status(500).json({message: 'Não foi possível encontrar o Usuário'})
    }
}
const buscarPorNome = async (req,res)=>{
    const nome = req.params.nome
    try{
        const dados = await Usuario.findOne({where: { nome: nome}})
        if(!dados){
            res.status(404).json({message: 'Nome do Usuário não encontrado!'})
        }else{
            res.status(200).json(formatarUsuario(dados))
        }
    }catch(err){
        console.error('Não foi possível encontrar o nome do Usuário',err)
        res.status(500).json({message: 'Não foi possível encontrar o nome do Usuário'})
    }
}
const excluir = async (req,res)=>{
    const id = req.params.id
    try{
        const dados = await Usuario.findByPk(id)
        if(!dados){
            res.status(404).json({message: 'Usuário não encontrado no banco de dados!'})
        }else{
            await Usuario.destroy({where: { codUsuario: id}})
            res.status(200).json({message: 'Usuário excluído com sucesso!'})
        }
    }catch(err){
        console.error('Não foi possível excluir o Usuário',err)
        res.status(500).json({message: 'Não foi possível excluir o Usuário'})
    }
}
const atualizar = async (req,res)=>{
    const id = req.params.id
    const valores = req.body
    try{
        let dados = await Usuario.findByPk(id)
        if(!dados){
            return res.status(404).json({message: 'Usuário não encontrado no banco de dados!'})
        }

        // só atualiza os campos que foram enviados (preenchidos)
        const campos = {}
        if(valores.nome) campos.nome = valores.nome
        if(valores.telefone) campos.telefone = valores.telefone

        if(valores.email){
            const emailExiste = await Usuario.findOne({
                where: { email: valores.email, codUsuario: { [Op.ne]: id } }
            })
            if(emailExiste){
                return res.status(409).json({message: 'E-mail já cadastrado!'})
            }
            campos.email = valores.email
        }

        // senha e cpf são criptografados ANTES de gravar no banco
        if(valores.senha){
            campos.senha = criptografar(valores.senha)
        }
        if(valores.cpf){
            if(!cpfValido(valores.cpf)){
                return res.status(400).json({message: 'CPF inválido! Informe os 11 números, sem pontos ou traço.'})
            }
            campos.cpf = criptografar(valores.cpf)
        }

        if(Object.keys(campos).length === 0){
            return res.status(400).json({message: 'Informe ao menos um campo para atualizar!'})
        }

        await dados.update(campos)
        dados = await Usuario.findByPk(id)
        res.status(200).json(formatarUsuario(dados))
    }catch(err){
        console.error('Não foi possível atualizar o Usuário',err)
        res.status(500).json({message: 'Não foi possível atualizar o Usuário'})
    }
}
module.exports = { cadastrar, listar, buscarPorCod, buscarPorNome, excluir, atualizar}
