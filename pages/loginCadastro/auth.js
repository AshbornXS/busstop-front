document.addEventListener('DOMContentLoaded', () => {
    // --- Listener para o formulário de Login ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();
            // Seleciona os campos de e-mail e senha do formulário de login
            const username = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            login(username, password);
        });
    }

    // --- Listener para o formulário de Registro ---
    // ATENÇÃO: A lógica de UI para o registro de múltiplos passos está em 'loginCadastro.js'.
    // Este listener do arquivo original pode não ser executado como esperado.
    // As funções 'login' e 'register' abaixo são as partes importantes deste arquivo.
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Os campos abaixo são do formulário de registro original
            const name = document.getElementById('name').value;
            const username = document.getElementById('username-register').value;
            const password = document.getElementById('password-register').value;
            const role = 'ROLE_USER';

            // Carrega uma imagem de perfil padrão (exemplo)
            const response = await fetch('../../assets/images/avatar.png'); // Caminho corrigido
            const blob = await response.blob();

            const formData = new FormData();
            formData.append('name', name);
            formData.append('username', username);
            formData.append('password', password);
            formData.append('role', role);
            formData.append('profilePicture', blob, 'avatar.png');

            register(formData);
        });
    }
});

/**
 * Envia as credenciais de login para a API e lida com a resposta.
 * @param {string} username - O e-mail do usuário.
 * @param {string} password - A senha do usuário.
 */
function login(username, password) {
    fetch('http://localhost:8081/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.text())
    .then(data => {
        const [token, userId, username] = data.split(', ');

        if (token && userId && username) {
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            localStorage.setItem('username', username);
            // Redireciona para a página inicial (index)
            window.location.href = '../index/index.html'; 
        } else {
            // A mensagem de erro de login pode ser exibida no HTML em vez de um alerta
            const loginError = document.getElementById('loginError');
            if(loginError) loginError.textContent = 'E-mail ou senha inválidos.';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        const loginError = document.getElementById('loginError');
        if(loginError) loginError.textContent = 'Erro ao conectar. Tente novamente.';
    });
}

/**
 * Envia os dados de um novo usuário para a API de registro.
 * @param {FormData} formData - Os dados do formulário de registro.
 */
function register(formData) {
    fetch('http://localhost:8081/auth/register', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.status === 201) {
            // Se o cadastro for bem-sucedido, faz o login automaticamente
            login(formData.get('username'), formData.get('password'));
        } else {
            // Se falhar, exibe o erro no HTML
            const registerError = document.getElementById('registerError');
            if(registerError) registerError.textContent = 'Erro ao cadastrar usuário.';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        const registerError = document.getElementById('registerError');
        if(registerError) registerError.textContent = 'Erro de conexão. Tente novamente.';
    });
}

