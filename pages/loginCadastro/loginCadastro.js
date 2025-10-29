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

    // Informações Pessoais (Etapa 2)
    const nomeInput = document.getElementById('nome');
    const cpfInput = document.getElementById('cpf');
    const telefoneInput = document.getElementById('telefone');
    const cepInput = document.getElementById('cep');
    const enderecoInput = document.getElementById('endereco');
    const numeroInput = document.getElementById('numero');
    const complementoInput = document.getElementById('complemento'); // Validação adicionada aqui
    const bairroInput = document.getElementById('bairro');
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
    // (Valida Etapa 1: Email e Senha)
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
    
    // Validação Nome (Etapa 2)
    if(nomeInput) {
        nomeInput.addEventListener('input', (event) => {
            const regex = /[^a-zA-Z\u00C0-\u017F\s]/g;
            event.target.value = event.target.value.replace(regex, '');
        });
    }
    
    // Validação Número (Etapa 2)
    if(numeroInput) {
        numeroInput.addEventListener('input', (event) => {
            event.target.value = event.target.value.replace(/\D/g, '');
        });
    }
    
    // ATUALIZAÇÃO: Validação Complemento (Etapa 2) - Sem caracteres especiais
    if(complementoInput) {
        complementoInput.addEventListener('input', (event) => {
            // Permite letras (com acentos), números e espaços
            const regex = /[^a-zA-Z0-9\u00C0-\u017F\s]/g; 
            event.target.value = event.target.value.replace(regex, '');
        });
    }
    
    // Máscara CPF (Etapa 2)
    if(cpfInput) {
        cpfInput.addEventListener('input', (event) => {
            let value = event.target.value.replace(/\D/g, '');
            if (value.length > 11) { // Limite
               value = value.substring(0, 11);
            }
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            event.target.value = value;
        });
    }
    
    // Máscara Telefone (Etapa 2)
    if(telefoneInput) {
        // NÃO define o valor no load, para o placeholder aparecer
        // telefoneInput.value = '+55 '; 

        // ADICIONA o '+55 ' quando o usuário clica (focus)
        telefoneInput.addEventListener('focus', () => {
            if (telefoneInput.value === '') {
                telefoneInput.value = '+55 ';
            }
        });

        // LIMPA o campo se o usuário clicar fora (blur) sem digitar nada
        telefoneInput.addEventListener('blur', () => {
            if (telefoneInput.value === '+55 ') {
                telefoneInput.value = ''; 
            }
        });

        // Lógica da máscara (existente)
        telefoneInput.addEventListener('input', (event) => {
            let value = event.target.value;
            if (!value.startsWith('+55 ')) {
                value = '+55 ';
            }
            let numbers = value.substring(4).replace(/\D/g, '');
            let maskedNumbers = '';
            if (numbers.length > 0) {
                maskedNumbers = '(' + numbers.substring(0, 2);
            }
            if (numbers.length > 2) {
                maskedNumbers += ') ' + numbers.substring(2, 7);
            }
            if (numbers.length > 7) {
                maskedNumbers += '-' + numbers.substring(7, 11);
            }
            event.target.value = '+55 ' + maskedNumbers;
        });
        
        // Lógica de bloqueio do backspace (existente)
        telefoneInput.addEventListener('keydown', (event) => {
            if (event.target.selectionStart <= 4 && (event.key === 'Backspace' || event.key === 'Delete')) {
                event.preventDefault();
            }
        });
    }
    
    // Máscara e API CEP (Etapa 2)
     if(cepInput) {
        cepInput.addEventListener('input', (event) => {
            let value = event.target.value.replace(/\D/g, '');
            if (value.length > 8) { // Limite
               value = value.substring(0, 8);
            }
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
                if (data.erro) { 
                    personalInfoError.textContent = 'CEP não encontrado.'; 
                    enderecoInput.disabled = false;
                    bairroInput.disabled = false;
                    cidadeInput.disabled = false;
                    estadoInput.disabled = false;
                    return; 
                }
                personalInfoError.textContent = ''; 
                enderecoInput.value = data.logradouro;
                bairroInput.value = data.bairro;
                cidadeInput.value = data.localidade;
                estadoInput.value = data.uf;
                
                // Desabilita campos preenchidos pelo CEP
                enderecoInput.disabled = !!data.logradouro;
                bairroInput.disabled = !!data.bairro;
                cidadeInput.disabled = !!data.localidade;
                estadoInput.disabled = !!data.uf;
                
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
            
            // 1. Validação do Nome (obrigatório)
            if (nomeInput.value.trim() === '') {
                personalInfoError.textContent = 'Por favor, preencha o Nome completo.';
                return;
            }
            
            // 2. Validação do CPF (opcional, mas valida se preenchido)
            const cpfValor = cpfInput.value.replace(/\D/g, '');
            if (cpfValor.trim() !== '') {
                const userDb = getSimulatedUserDb();
                // Verifica se o CPF já existe
                const cpfExists = userDb.some(user => user.cpf === cpfValor);
                if (cpfExists) {
                    personalInfoError.textContent = 'O CPF informado já está cadastrado.';
                    return;
                }
                if (cpfValor.length < 11) { 
                    personalInfoError.textContent = 'Por favor, preencha o CPF completo.'; 
                    return; 
                }
            }

            // 3. Validação do Telefone (opcional, mas valida se preenchido)
            const telefoneValor = telefoneInput.value;
            // CORREÇÃO: Verifica se o valor é diferente de VAZIO ou do prefixo E se é menor que 19
            if (telefoneValor !== '' && telefoneValor !== '+55 ' && telefoneValor.length < 19) { 
                personalInfoError.textContent = 'Por favor, preencha o telefone completo.'; 
                return; 
            }
            
            // 4. Validação do CEP (opcional, mas valida se preenchido)
            const cepValor = cepInput.value.replace(/\D/g, '');
            if (cepValor.trim() !== '' && cepValor.length < 8) { 
                personalInfoError.textContent = 'Por favor, preencha o CEP completo.'; 
                return; 
            }
            
            // Coleta de dados (Nome da Etapa 2)
            const userData = {
                email: registerEmailInput.value,
                password: registerPasswordInput.value,
                name: nomeInput.value,
                cpf: cpfValor, // Salva sem máscara
                // CORREÇÃO: Salva o telefone apenas se ele foi realmente preenchido
                telefone: (telefoneValor !== '+55 ' && telefoneValor !== '') ? telefoneInput.value : '',
                cep: cepValor, // Salva sem máscara
                endereco: enderecoInput.value,
                numero: numeroInput.value,
                complemento: complementoInput.value,
                bairro: bairroInput.value,
                cidade: cidadeInput.value,
                estado: estadoInput.value,
            };
            
            register(userData);
            
            mainContainer.classList.add('registration-complete');
            if (successMessage) {
                successMessage.style.display = 'flex';
                setTimeout(() => successMessage.classList.add('visible'), 50);
            }

            setTimeout(() => {
                login(userData.email, userData.password);
            }, 2000);
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
            cpf: '12345678900', // Salvo sem máscara
            telefone: '+55 (11) 98765-4321',
            cep: '01001000', // Salvo sem máscara
            endereco: 'Praça da Sé',
            numero: '1',
            complemento: 'Lado ímpar',
            bairro: 'Sé', // Bairro adicionado ao usuário padrão
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
    
    // Garante que campos opcionais vazios sejam salvos como strings vazias
    userData.cpf = userData.cpf || '';
    userData.telefone = userData.telefone || ''; // Já deve ser string vazia se não preenchido
    userData.cep = userData.cep || '';
    userData.endereco = userData.endereco || '';
    userData.numero = userData.numero || '';
    userData.complemento = userData.complemento || '';
    userData.bairro = userData.bairro || '';
    userData.cidade = userData.cidade || '';
    userData.estado = userData.estado || '';

    userDb.push(userData);
    localStorage.setItem('simulatedUserDb', JSON.stringify(userDb));
}

