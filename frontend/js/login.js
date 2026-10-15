let resposta_login = document.getElementById('resposta_login')
let btn_login = document.getElementById('btn_login')

btn_login.addEventListener('click', (e) => {
    e.preventDefault()

    const email = document.getElementById('email').value
    const senha = document.getElementById('senha').value

    const valores = {
        email: email,
        senha: senha
    }

    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(valores)
    })
    .then(res => res.json())
    .then(dados => {
        resposta_login.innerHTML = ''
        resposta_login.innerHTML += `<p>${dados.message}</p>`

        if (dados.token) {
            localStorage.setItem('token', dados.token)
            localStorage.setItem('nome', dados.nome)
            location.href = '../index.html'
        }
    })
    .catch((err) => {
        console.error('Erro ao fazer login', err)
        resposta_login.innerHTML = '<p>Erro ao tentar fazer login.</p>'
    })
})
