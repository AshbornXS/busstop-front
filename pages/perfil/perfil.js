document.addEventListener('DOMContentLoaded', function() {
  
  // --- Elementos da Página ---
  const profileFormContainer = document.getElementById('logged-in-content');
  const loggedOutMessage = document.getElementById('logged-out-message');
  
  const profileForm = document.getElementById('profile-form');
  const personalMessage = document.getElementById('personal-message');
  const passwordMessage = document.getElementById('password-message');

  // Seção de Dados Pessoais
  const editPersonalBtn = document.getElementById('edit-personal-btn');
  const savePersonalBtn = document.getElementById('save-personal-btn');
  const cancelPersonalBtn = document.getElementById('cancel-personal-btn');
  const personalInputsGrid = document.getElementById('dados-pessoais-grid');
  
  // Inputs de Senha
  const editPasswordBtn = document.getElementById('edit-password-btn');
  const savePasswordBtn = document.getElementById('save-password-btn');
  const cancelPasswordBtn = document.getElementById('cancel-password-btn');
  const allPasswordInputs = ['senha-atual', 'nova-senha', 'confirmar-senha']; 
  
  // Variáveis para armazenar o estado original dos dados pessoais
  let originalPersonalData = {};

  // Função utilitária para exibir mensagens (Sucesso/Erro)
  function showMessage(element, text, type) {
    element.textContent = text;
    element.className = 'form-message ' + type;
    setTimeout(() => {
        element.textContent = '';
        element.className = 'form-message';
    }, 4000);
  }

  // --- FUNÇÃO DE VALIDAÇÃO DE E-MAIL (ADICIONADA) ---
  function isValidEmail(email) {
      if (!email) return false;
      const parts = email.split('@');
      return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
  }
  
  // Função para configurar o modo de edição dos dados pessoais
  function setPersonalEditMode(isEditing) {
    const personalInputs = personalInputsGrid.querySelectorAll('input:not(#cpf):not(#carteirinha)');
    
    personalInputs.forEach(input => {
      if (input.id === 'endereco' || input.id === 'cidade' || input.id === 'estado') {
        input.disabled = true; 
      } else {
        input.disabled = !isEditing;
      }
    });

    editPersonalBtn.style.display = isEditing ? 'none' : 'block';
    savePersonalBtn.style.display = isEditing ? 'block' : 'none';
    cancelPersonalBtn.style.display = isEditing ? 'block' : 'none';

    if (isEditing) {
        editPasswordBtn.style.display = 'none';
        passwordMessage.className = 'form-message';
    } else {
        editPasswordBtn.style.display = 'block';
    }
  }
  
  // Função para configurar o modo de edição de senha
  function setPasswordEditMode(isEditing) {
    allPasswordInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.disabled = !isEditing;
            if (!isEditing) input.value = '';
        }
    });
    
    editPasswordBtn.style.display = isEditing ? 'none' : 'block';
    savePasswordBtn.style.display = isEditing ? 'block' : 'none';
    cancelPersonalBtn.style.display = isEditing ? 'block' : 'none';

    if (isEditing) {
        editPersonalBtn.style.display = 'none';
        personalMessage.className = 'form-message';
    } else {
        editPersonalBtn.style.display = 'block';
    }
  }

  // --- FUNÇÃO CRUCIAL: Carrega dados do localStorage ---
  function setPersonalData() {
    const token = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('currentUser');

    if (token && storedUserData) {
      if (profileFormContainer) profileFormContainer.style.display = 'block';
      if (loggedOutMessage) loggedOutMessage.style.display = 'none';

      let userData;
      try {
          userData = JSON.parse(storedUserData);
      } catch (e) {
          console.error("Erro ao fazer parse dos dados do usuário:", e);
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          window.location.reload();
          return;
      }
      
      document.getElementById('balance-amount').value = `R$ ${userData.saldo ? userData.saldo.toFixed(2).replace('.', ',') : '0,00'}`;
      document.getElementById('nome').value = userData.name || '';
      document.getElementById('email').value = userData.email || '';
      document.getElementById('cpf').value = userData.cpf ? userData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '';
      document.getElementById('telefone').value = userData.telefone || '';
      document.getElementById('cep').value = userData.cep || '';
      document.getElementById('endereco').value = userData.endereco || '';
      document.getElementById('numero').value = userData.numero || '';
      document.getElementById('complemento').value = userData.complemento || '';
      document.getElementById('cidade').value = userData.cidade || '';
      document.getElementById('estado').value = userData.estado || '';
      document.getElementById('carteirinha').value = userData.carteirinha || '';

    } else {
        if (profileFormContainer) profileFormContainer.style.display = 'none';
        if (loggedOutMessage) loggedOutMessage.style.display = 'block';
    }

    setPersonalEditMode(false);
    setPasswordEditMode(false);
  }

  // --- Lógica para edição de Dados Pessoais ---

  editPersonalBtn.addEventListener('click', () => {
    const inputs = personalInputsGrid.querySelectorAll('input');
    originalPersonalData = {};
    inputs.forEach(input => {
        originalPersonalData[input.id] = input.value;
    });
    setPersonalEditMode(true);
    showMessage(personalMessage, 'Modo de edição ativado.', 'success');
  });

  cancelPersonalBtn.addEventListener('click', () => {
    const inputs = personalInputsGrid.querySelectorAll('input');
    inputs.forEach(input => {
        if(originalPersonalData[input.id] !== undefined) {
            input.value = originalPersonalData[input.id];
        }
    });
    setPersonalEditMode(false);
    showMessage(personalMessage, 'Edição cancelada.', 'error');
  });

  savePersonalBtn.addEventListener('click', () => {
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const telefoneInput = document.getElementById('telefone');

    if (!nomeInput.value || !emailInput.value || !telefoneInput.value) {
        showMessage(personalMessage, 'Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    if (!isValidEmail(emailInput.value)) {
        showMessage(personalMessage, 'Por favor, insira um e-mail válido.', 'error');
        return;
    }
    if (telefoneInput.value.length < 15) {
        showMessage(personalMessage, 'Por favor, preencha o telefone completo.', 'error');
        return;
    }

    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (storedUser) {
        const updatedUser = { ...storedUser };
        const inputs = personalInputsGrid.querySelectorAll('input');
        inputs.forEach(input => {
            updatedUser[input.id] = input.value;
        });

        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        let userDb = JSON.parse(localStorage.getItem('simulatedUserDb')) || [];
        const index = userDb.findIndex(u => u.email === storedUser.email);
        if (index !== -1) {
            userDb[index] = updatedUser;
            localStorage.setItem('simulatedUserDb', JSON.stringify(userDb));
        }
    }

    setPersonalEditMode(false);
    showMessage(personalMessage, 'Dados atualizados com sucesso!', 'success');
  });


  // --- Lógica para edição de Senha ---

  editPasswordBtn.addEventListener('click', () => {
    setPasswordEditMode(true);
    showMessage(passwordMessage, 'Modo de edição de senha ativado.', 'success');
  });

  cancelPasswordBtn.addEventListener('click', () => {
    setPasswordEditMode(false);
    showMessage(passwordMessage, 'Edição de senha cancelada.', 'error');
  });


  savePasswordBtn.addEventListener('click', () => {
    const currentPasswordInput = document.getElementById('senha-atual');
    const newPasswordInput = document.getElementById('nova-senha');
    const confirmPasswordInput = document.getElementById('confirmar-senha');
    
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentSimulatedPassword = storedUser ? storedUser.password : ''; 

    if (!currentPasswordInput.value || !newPasswordInput.value || !confirmPasswordInput.value) {
        showMessage(passwordMessage, 'Preencha todos os campos de senha.', 'error');
        return;
    }
    if (currentPasswordInput.value !== currentSimulatedPassword) {
        showMessage(passwordMessage, 'Senha atual incorreta.', 'error');
        return;
    }
    if (newPasswordInput.value.length < 4) {
        showMessage(passwordMessage, 'A nova senha deve ter no mínimo 4 caracteres.', 'error');
        return;
    }
    if (newPasswordInput.value !== confirmPasswordInput.value) {
        showMessage(passwordMessage, 'As novas senhas não coincidem.', 'error');
        return;
    }
    if (newPasswordInput.value === currentSimulatedPassword) {
        showMessage(passwordMessage, 'A nova senha não pode ser igual à atual.', 'error');
        return;
    }

    if (storedUser) {
        storedUser.password = newPasswordInput.value;
        localStorage.setItem('currentUser', JSON.stringify(storedUser));
        
        let userDb = JSON.parse(localStorage.getItem('simulatedUserDb')) || [];
        const index = userDb.findIndex(u => u.email === storedUser.email);
        if (index !== -1) {
            userDb[index].password = newPasswordInput.value;
            localStorage.setItem('simulatedUserDb', JSON.stringify(userDb));
        }
    }
    
    setPasswordEditMode(false);
    showMessage(passwordMessage, 'Senha alterada com sucesso!', 'success');
  });


  // --- Lógica para busca de CEP e Máscaras ---
  
  const cepInput = document.getElementById('cep');
  cepInput.addEventListener('blur', async function() {
      if (this.disabled === false) {
          let cep = this.value.replace(/\D/g, '');
          if (cep.length !== 8) return;
          
          showMessage(personalMessage, 'Buscando CEP...', 'success');
          
          try {
              const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
              const data = await response.json();
              
              if (data.erro) {
                  showMessage(personalMessage, 'CEP não encontrado.', 'error');
                  ['endereco', 'cidade', 'estado'].forEach(id => {
                      const el = document.getElementById(id);
                      el.value = '';
                      el.disabled = false;
                  });
              } else {
                  showMessage(personalMessage, '', 'success');
                  document.getElementById('endereco').value = data.logradouro || '';
                  document.getElementById('cidade').value = data.localidade || '';
                  document.getElementById('estado').value = data.uf || '';
                  
                  ['endereco', 'cidade', 'estado'].forEach(id => {
                      document.getElementById(id).disabled = true;
                  });
              }
          } catch (error) {
              showMessage(personalMessage, 'Erro ao buscar o CEP.', 'error');
          }
      }
  });

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

  // Chama a função para carregar os dados ao iniciar
  setPersonalData();
});

