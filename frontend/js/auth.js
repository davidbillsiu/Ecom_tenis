// ------------------------------------------------------------
// Funções de autenticação usadas por TODAS as páginas privadas
// (precisa ser carregado antes do js da própria página)
// ------------------------------------------------------------

// Se não existe token salvo, manda o usuário para a tela de login
function exigirLogin(){
    if(!localStorage.getItem('token')){
        location.href = './login.html'
    }
}

// Encerra a sessão: apaga o token e volta para o login
function sairDaSessao(){
    localStorage.clear()
    location.href = './login.html'
}

// fetch que já envia o token no cabeçalho Authorization.
// Se o servidor responder 401/403 (sem token, token inválido ou sessão
// expirada após 1,5 hora), avisa o usuário e volta para o login.
function fetchAuth(url, opcoes = {}){
    const headers = Object.assign({}, opcoes.headers, {
        'Authorization': localStorage.getItem('token')
    })

    return fetch(url, Object.assign({}, opcoes, { headers: headers }))
        .then(res => {
            if(res.status === 401 || res.status === 403){
                return res.json().then(dados => {
                    alert(dados.message)
                    sairDaSessao()
                    return new Promise(() => {}) // interrompe o restante da cadeia de .then
                })
            }
            return res
        })
}
