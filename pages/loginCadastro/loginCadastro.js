document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.querySelector('.main-container');
    const toggleBtn = document.getElementById('toggleBtn');
    const proceedBtn = document.getElementById('proceedBtn');
    const backBtn = document.getElementById('backBtn');
    
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const personalInfoForm = document.getElementById('personalInfoForm');
    const successMessage = document.getElementById('successMessage');
    
    const overlayTitle = document.getElementById('overlay-title');
    const overlayText = document.getElementById('overlay-text');

    // --- Inputs ---
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const registerEmailInput = document.getElementById('register-email');
    const registerPasswordInput = document.getElementById('register-password');
    const registerConfirmPasswordInput = document.getElementById('register-confirm-password');

    const nomeInput = document.getElementById('nome');
    const cpfInput = document.getElementById('cpf');
    const telefoneInput = document.getElementById('telefone');
    const cepInput = document.getElementById('cep');
    const enderecoInput = document.getElementById('endereco');
    const numeroInput = document.getElementById('numero');
    const complementoInput = document.getElementById('complemento');
    const cidadeInput = document.getElementById('cidade');
    const estadoInput = document.getElementById('estado');

    // --- Mensagens de Erro ---
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');
    const personalInfoError = document.getElementById('personalInfoError');

    // --- FUNÇÃO PARA LIMPAR OS FORMULÁRIOS ---
    function resetAllForms() {
        if (registerForm) registerForm.reset();
        if (personalInfoForm) personalInfoForm.reset();
    }
    
    // --- FUNÇÃO DE VALIDAÇÃO DE E-MAIL ---
    function isValidEmail(email) {
        if (!email) return false;
        const parts = email.split('@');
        return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
    }

    // --- LÓGICA DA ANIMAÇÃO E UI ---
    function updateUIBasedOnHash() {
        const hash = window.location.hash;
        mainContainer.classList.remove('step-two-active');
        if (personalInfoForm) personalInfoForm.style.display = '';
        if (successMessage) successMessage.classList.remove('visible');

        if (hash === '#cadastro') {
            mainContainer.classList.add('panel-active');
            loginForm.classList.remove('visible');
            registerForm.classList.add('visible');
            overlayTitle.textContent = 'Bem-vindo de Volta!';
            overlayText.textContent = 'Já possui uma conta? Faça login para continuar.';
            toggleBtn.textContent = 'Entrar';
        } else {
            mainContainer.classList.remove('panel-active');
            loginForm.classList.add('visible');
            registerForm.classList.remove('visible');
            overlayTitle.textContent = 'Olá!';
            overlayText.textContent = 'Ainda não tem uma conta? Cadastre-se agora.';
            toggleBtn.textContent = 'Cadastrar';
        }
    }

    updateUIBasedOnHash();
    toggleBtn.addEventListener('click', () => { window.location.hash = (window.location.hash === '#cadastro') ? '#login' : '#cadastro'; });
    window.addEventListener('hashchange', updateUIBasedOnHash);

    // --- LÓGICA DO FORMULÁRIO DE LOGIN ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (loginError) loginError.textContent = '';

            if (loginEmailInput.value.trim() === '' || loginPasswordInput.value.trim() === '') {
                if (loginError) loginError.textContent = 'Por favor, preencha todos os dados.';
                return;
            }
            if (!isValidEmail(loginEmailInput.value)) {
                if (loginError) loginError.textContent = 'Por favor, insira um e-mail válido.';
                return;
            }
            login(loginEmailInput.value, loginPasswordInput.value);
        });
    }

    // --- LÓGICA DO CADASTRO MULTI-PASSOS ---
    proceedBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerError.textContent = '';

        const userDb = getSimulatedUserDb();
        const emailExists = userDb.some(user => user.email === registerEmailInput.value.trim());

        if (registerEmailInput.value.trim() === '' || registerPasswordInput.value.trim() === '' || registerConfirmPasswordInput.value.trim() === '') {
            registerError.textContent = 'Por favor, preencha todos os dados.'; return;
        }
        if (!isValidEmail(registerEmailInput.value)) {
            registerError.textContent = 'Por favor, insira um e-mail válido.'; return;
        }
        if (emailExists) {
            registerError.textContent = 'Este e-mail já está cadastrado em nosso sistema.'; return;
        }
        if (registerPasswordInput.value.length < 4) {
            registerError.textContent = 'A senha deve ter no mínimo 4 caracteres.'; return;
        }
        if (registerPasswordInput.value !== registerConfirmPasswordInput.value) {
            registerError.textContent = 'As senhas não coincidem. Por favor, verifique.'; return;
        }
        
        mainContainer.classList.add('step-two-active');
    });

    backBtn.addEventListener('click', () => {
        mainContainer.classList.remove('step-two-active');
        setTimeout(updateUIBasedOnHash, 50);
    });

    // --- MÁSCARAS, VALIDAÇÕES E CONSULTA DE CEP ---
    if(nomeInput) {
        nomeInput.addEventListener('input', (event) => {
            const regex = /[^a-zA-Z\u00C0-\u017F\s]/g;
            event.target.value = event.target.value.replace(regex, '');
        });
    }
    if(numeroInput) {
        numeroInput.addEventListener('input', (event) => {
            event.target.value = event.target.value.replace(/\D/g, '');
        });
    }
    if(complementoInput) {
        complementoInput.addEventListener('input', (event) => {
            const regex = /[^a-zA-Z\u00C0-\u017F\s]/g;
            event.target.value = event.target.value.replace(regex, '');
        });
    }
    if(cpfInput) {
        cpfInput.addEventListener('input', (event) => {
            let value = event.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            event.target.value = value;
        });
    }
    if(telefoneInput) {
        telefoneInput.addEventListener('input', (event) => {
            let value = event.target.value.replace(/\D/g, '');
            value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            event.target.value = value;
        });
    }
     if(cepInput) {
        cepInput.addEventListener('input', (event) => {
            let value = event.target.value.replace(/\D/g, '');
            value = value.replace(/^(\d{5})(\d)/, '$1-$2');
            event.target.value = value;
        });
        cepInput.addEventListener('blur', async (event) => {
            const cep = event.target.value.replace(/\D/g, '');
            if (cep.length !== 8) return;
            personalInfoError.textContent = 'Buscando endereço...';
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                if (!response.ok) throw new Error('Falha na requisição');
                const data = await response.json();
                if (data.erro) { personalInfoError.textContent = 'CEP não encontrado.'; return; }
                personalInfoError.textContent = ''; 
                enderecoInput.value = data.logradouro;
                cidadeInput.value = data.localidade;
                estadoInput.value = data.uf;
            } catch (error) {
                personalInfoError.textContent = 'Não foi possível buscar o CEP.';
            }
        });
    }

    // --- SUBMISSÃO FINAL DO CADASTRO (COM AUTO-LOGIN) ---
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            personalInfoError.textContent = '';
            
            const userDb = getSimulatedUserDb();
            const cpfExists = userDb.some(user => user.cpf === cpfInput.value);

            if (cpfExists) {
                personalInfoError.textContent = 'O CPF informado já está cadastrado.';
                return;
            }

            if (cpfInput.value.length < 14) { personalInfoError.textContent = 'Por favor, preencha o CPF completo.'; return; }
            if (telefoneInput.value.length < 15) { personalInfoError.textContent = 'Por favor, preencha o telefone completo.'; return; }

            const inputs = personalInfoForm.querySelectorAll('input[required]');
            let allFilled = true;
            inputs.forEach(input => { if (input.value.trim() === '') allFilled = false; });

            if (!allFilled) {
                personalInfoError.textContent = 'Por favor, preencha todos os dados obrigatórios.';
            } else {
                const userData = {
                    email: registerEmailInput.value,
                    password: registerPasswordInput.value,
                    name: nomeInput.value,
                    cpf: cpfInput.value,
                    telefone: telefoneInput.value,
                    cep: cepInput.value,
                    endereco: enderecoInput.value,
                    numero: numeroInput.value,
                    complemento: complementoInput.value,
                    cidade: cidadeInput.value,
                    estado: estadoInput.value,
                };
                
                register(userData);
                
                if (successMessage) successMessage.classList.add('visible');

                setTimeout(() => {
                    login(userData.email, userData.password);
                }, 2500);
            }
        });
    }
    
      // --- LÓGICA PARA VER/OCULTAR SENHA ---
    const toggleButtons = document.querySelectorAll('.password-toggle-btn');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetInputId = this.dataset.target;
            const targetInput = document.getElementById(targetInputId);
            const icon = this.querySelector('i');

            if (targetInput && icon) {
                if (targetInput.type === 'password') {
                    targetInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    targetInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
        });
    });

});

// --- FUNÇÕES DE API (SIMULAÇÃO) ---
function getSimulatedUserDb() {
    let userDb = JSON.parse(localStorage.getItem('simulatedUserDb')) || [];
    const defaultUserExists = userDb.some(user => user.email === 'user@test.com');

    if (!defaultUserExists) {
        userDb.push({
            email: 'user@test.com',
            password: '1234',
            name: 'Usuário de Teste',
            cpf: '123.456.789-00',
            telefone: '(11) 98765-4321',
            cep: '01001-000',
            endereco: 'Praça da Sé',
            numero: '1',
            complemento: 'Lado ímpar',
            cidade: 'São Paulo',
            estado: 'SP',
            carteirinha: '12345',
            saldo: 0.00
        });
        localStorage.setItem('simulatedUserDb', JSON.stringify(userDb));
    }
    return userDb;
}

function login(email, password) {
    const loginError = document.getElementById('loginError');
    if(loginError) loginError.textContent = 'Verificando...';

    setTimeout(() => {
        const userDb = getSimulatedUserDb();
        const foundUser = userDb.find(user => user.email === email && user.password === password);

        if (foundUser) {
            localStorage.setItem('token', 'fake-jwt-token-for-simulation');
            localStorage.setItem('currentUser', JSON.stringify(foundUser));
            localStorage.setItem('showWelcomeMessage', 'true');
            window.location.href = '/pages/index/index.html'; 
        } else {
            if(loginError) loginError.textContent = 'E-mail ou senha inválidos.';
        }
    }, 1000);
}

function register(userData) {
    const userDb = getSimulatedUserDb();
    userData.carteirinha = Math.floor(10000 + Math.random() * 90000).toString();
    userData.saldo = 0.00;
    userDb.push(userData);
    localStorage.setItem('simulatedUserDb', JSON.stringify(userDb));
}

