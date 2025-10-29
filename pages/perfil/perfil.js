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
  
  // --- Inputs para Máscaras e Validações ---
  const telefoneInput = document.getElementById('telefone');
  const cpfInput = document.getElementById('cpf');
  const cepInput = document.getElementById('cep'); // NOVO: Para máscara
  const numeroInput = document.getElementById('numero'); // NOVO: Para validação
  const complementoInput = document.getElementById('complemento'); // NOVO: Para validação
  
  // Inputs de Senha
  const editPasswordBtn = document.getElementById('edit-password-btn');
  const savePasswordBtn = document.getElementById('save-password-btn');
  const cancelPasswordBtn = document.getElementById('cancel-password-btn');
  const allPasswordInputs = ['senha-atual', 'nova-senha', 'confirmar-senha']; 
  
  // Variáveis para armazenar o estado original dos dados
  let originalPersonalData = {};
  let originalPasswordData = {};

  // --- FUNÇÃO ADICIONADA (necessária para validação de CPF) ---
  function getSimulatedUserDb() {
      let userDb = JSON.parse(localStorage.getItem('simulatedUserDb')) || [];
      // Não recria o usuário padrão aqui, apenas lê o DB
      return userDb;
  }

  /**
   * NOVA FUNÇÃO: Exibe um toast de notificação global (estilo global.js).
   * @param {string} message - A mensagem a ser exibida.
   * @param {string} iconClass - A classe do ícone (ex: 'fa-solid fa-circle-check').
   */
  function showToastNotification(message, iconClass = 'fa-solid fa-circle-check') {
      const existingToast = document.querySelector('.toast-notification');
      if (existingToast) {
          existingToast.remove();
      }

      const toast = document.createElement('div');
      toast.className = 'toast-notification';
      toast.innerHTML = `
          <i class="${iconClass}"></i>
          <span>${message}</span>
      `;
      
      // Adiciona o toast ao body (pois é 'fixed')
      document.body.appendChild(toast);
      
      // O CSS em global.css cuida da animação de entrada e saída
  }

  function showMessage(element, text, type) {
    element.textContent = text;
    element.className = 'form-message ' + type;
    // Remove o timer, pois a mensagem de erro deve persistir
    if (type === 'error') {
        setTimeout(() => {
           element.className = 'form-message';
        }, 3000);
    }
  }

  function isValidEmail(email) {
      if (!email) return false;
      const parts = email.split('@');
      return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
  }
  
  function setPersonalEditMode(isEditing) {
    // ATUALIZAÇÃO: Exclui 'email' da seleção principal
    const personalInputs = personalInputsGrid.querySelectorAll('input:not(#cpf):not(#carteirinha):not(#email)');
    
    personalInputs.forEach(input => {
      // ATUALIZAÇÃO: 'bairro' incluído na lógica do CEP
      if (['endereco', 'cidade', 'estado', 'bairro'].includes(input.id)) {
        // Se o campo já tiver valor (do CEP), mantém desabilitado.
        // Se estiver em modo de edição e o CEP não preencheu, habilita.
        input.disabled = (isEditing && !input.value) ? false : true;
      } else {
        input.disabled = !isEditing;
      }
    });
    
    // O CEP, CPF e Email são re-habilitados manualmente se estivermos editando
    document.getElementById('cep').disabled = !isEditing;
    document.getElementById('cpf').disabled = !isEditing;
    document.getElementById('email').disabled = !isEditing; // Habilita Email

    // Garante que campos de endereço fiquem desabilitados se o CEP preencheu
    if(isEditing && document.getElementById('cep').value) {
        ['endereco', 'cidade', 'estado', 'bairro'].forEach(id => {
            if(document.getElementById(id).value) {
                 document.getElementById(id).disabled = true;
            }
        });
    }


    editPersonalBtn.style.display = isEditing ? 'none' : 'block';
    savePersonalBtn.style.display = isEditing ? 'block' : 'none';
    cancelPersonalBtn.style.display = isEditing ? 'block' : 'none';

    if (isEditing) {
        editPasswordBtn.style.display = 'none';
        passwordMessage.className = 'form-message';
        personalMessage.className = 'form-message'; // Limpa msg de erro
    } else {
        editPasswordBtn.style.display = 'block';
    }
  }
  
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
    cancelPasswordBtn.style.display = isEditing ? 'block' : 'none';

    if (isEditing) {
        editPersonalBtn.style.display = 'none';
        personalMessage.className = 'form-message';
        passwordMessage.className = 'form-message'; // Limpa msg de erro
    } else {
        editPasswordBtn.style.display = 'block';
    }
  }

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
      
      // ATUALIZAÇÃO MÁSCARA: Aplica a máscara ao carregar o CPF (se existir)
      document.getElementById('cpf').value = (userData.cpf) 
          ? userData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') 
          : ''; 
          
      document.getElementById('telefone').value = userData.telefone || ''; // Telefone opcional
      
      // ATUALIZAÇÃO MÁSCARA: Aplica máscara ao carregar o CEP (se existir)
      document.getElementById('cep').value = (userData.cep)
          ? userData.cep.replace(/(\d{5})(\d{3})/, '$1-$2')
          : '';
          
      document.getElementById('endereco').value = userData.endereco || '';
      document.getElementById('numero').value = userData.numero || '';
      document.getElementById('complemento').value = userData.complemento || '';
      document.getElementById('cidade').value = userData.cidade || '';
      document.getElementById('estado').value = userData.estado || '';
      document.getElementById('carteirinha').value = userData.carteirinha || '';
      document.getElementById('bairro').value = userData.bairro || '';

    } else {
        if (profileFormContainer) profileFormContainer.style.display = 'none';
        if (loggedOutMessage) loggedOutMessage.style.display = 'block';
    }

    setPersonalEditMode(false);
    setPasswordEditMode(false);
  }


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
    const cpfInput = document.getElementById('cpf');
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Limpa mensagem de erro anterior
    personalMessage.className = 'form-message';
    
    // Apenas Nome e Email são obrigatórios.
    if (!nomeInput.value || !emailInput.value) {
        showMessage(personalMessage, 'Nome e E-mail são campos obrigatórios.', 'error');
        return;
    }
    if (!isValidEmail(emailInput.value)) {
        showMessage(personalMessage, 'Por favor, insira um e-mail válido.', 'error');
        return;
    }

    // Valida o telefone APENAS se estiver preenchido (opcional)
    const telefoneValor = telefoneInput.value;
    if (telefoneValor !== '' && telefoneValor !== '+55 ' && telefoneValor.length < 19) {
        showMessage(personalMessage, 'Por favor, preencha o telefone completo.', 'error');
        return;
    }
    
    // Valida CPF APENAS se preenchido (opcional)
    const cpfValor = cpfInput.value.replace(/\D/g, ''); 
    if (cpfValor.trim() !== '') {
        const userDb = getSimulatedUserDb();
        // Verifica se o CPF pertence a *outro* usuário
        const cpfExists = userDb.some(user => user.cpf === cpfValor && user.email !== storedUser.email);
        if (cpfExists) {
            showMessage(personalMessage, 'O CPF informado já está cadastrado por outro usuário.', 'error');
            return;
        }
        if (cpfValor.length < 11) { // Valida o tamanho do valor sem máscara
            showMessage(personalMessage, 'Por favor, preencha o CPF completo.', 'error'); 
            return; 
        }
    }
    
    // ATUALIZAÇÃO: Valida CEP APENAS se preenchido
    const cepValor = cepInput.value.replace(/\D/g, '');
    if (cepValor.trim() !== '' && cepValor.length < 8) {
         showMessage(personalMessage, 'Por favor, preencha o CEP completo.', 'error'); 
         return;
    }

    if (storedUser) {
        const updatedUser = { ...storedUser };
        const inputs = personalInputsGrid.querySelectorAll('input');
        
        // Loop para salvar todos os dados do grid
        inputs.forEach(input => {
            if(input.id !== 'carteirinha' && input.id !== 'balance-amount') {
                 
                 if (input.id === 'nome') {
                    updatedUser.name = input.value;
                 }
                 else if (input.id === 'cpf') {
                    updatedUser.cpf = cpfValor; // Salva sem máscara
                 }
                 else if (input.id === 'cep') {
                    updatedUser.cep = cepValor; // Salva sem máscara
                 }
                 else if (input.id === 'telefone') {
                    updatedUser.telefone = (telefoneValor !== '+55 ' && telefoneValor !== '') ? telefoneInput.value : '';
                 } else {
                    updatedUser[input.id] = input.value;
                 }
            }
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
    showToastNotification('Dados atualizados com sucesso!', 'fa-solid fa-circle-check');
  });

  editPasswordBtn.addEventListener('click', () => {
    originalPasswordData = {};
    allPasswordInputs.forEach(id => {
        originalPasswordData[id] = document.getElementById(id).value;
    });
    setPasswordEditMode(true);
    showMessage(passwordMessage, 'Modo de edição de senha ativado.', 'success');
  });

  cancelPasswordBtn.addEventListener('click', () => {
    allPasswordInputs.forEach(id => {
        if(originalPasswordData[id] !== undefined) {
            document.getElementById(id).value = originalPasswordData[id];
        }
    });
    setPasswordEditMode(false);
    showMessage(passwordMessage, 'Edição de senha cancelada.', 'error');
  });


  savePasswordBtn.addEventListener('click', () => {
    const currentPasswordInput = document.getElementById('senha-atual');
    const newPasswordInput = document.getElementById('nova-senha');
    const confirmPasswordInput = document.getElementById('confirmar-senha');
    
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentSimulatedPassword = storedUser ? storedUser.password : ''; 

    passwordMessage.className = 'form-message';
    
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
    showToastNotification('Senha alterada com sucesso!', 'fa-solid fa-key');
  });

  // ATUALIZAÇÃO: Lógica do CEP para incluir 'bairro'
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
                  // Habilita campos se o CEP não for encontrado
                  ['endereco', 'cidade', 'estado', 'bairro'].forEach(id => {
                      const el = document.getElementById(id);
                      el.value = '';
                      el.disabled = false;
                  });
              } else {
                  personalMessage.className = 'form-message'; // Limpa "buscando"
                  document.getElementById('endereco').value = data.logradouro || '';
                  document.getElementById('cidade').value = data.localidade || '';
                  document.getElementById('estado').value = data.uf || '';
                  document.getElementById('bairro').value = data.bairro || '';
                  
                  // Desabilita campos preenchidos pelo CEP (se houver dados)
                  document.getElementById('endereco').disabled = !!data.logradouro;
                  document.getElementById('cidade').disabled = !!data.localidade;
                  document.getElementById('estado').disabled = !!data.uf;
                  document.getElementById('bairro').disabled = !!data.bairro;
              }
          } catch (error) {
              showMessage(personalMessage, 'Erro ao buscar o CEP.', 'error');
          }
      }
  });

  // MÁSCARA DO TELEFONE
  if(telefoneInput) {
      telefoneInput.addEventListener('focus', () => {
          if (telefoneInput.value === '') {
              telefoneInput.value = '+55 ';
          }
      });
      telefoneInput.addEventListener('blur', () => {
          if (telefoneInput.value === '+55 ') {
              telefoneInput.value = ''; 
          }
      });
      
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
      telefoneInput.addEventListener('keydown', (event) => {
          if (event.target.selectionStart <= 4 && (event.key === 'Backspace' || event.key === 'Delete')) {
              event.preventDefault();
          }
      });
  }

  // MÁSCARA DO CPF (ATUALIZADA com limite)
  if(cpfInput) {
      cpfInput.addEventListener('input', (event) => {
          if (cpfInput.disabled) return;
          let value = event.target.value.replace(/\D/g, '');
          
          if (value.length > 11) { // Limita o total de dígitos a 11
             value = value.substring(0, 11);
          }
          
          value = value.replace(/(\d{3})(\d)/, '$1.$2');
          value = value.replace(/(\d{3})(\d)/, '$1.$2');
          value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
          event.target.value = value;
      });
  }

  // MÁSCARA DO CEP (ADICIONADA)
  if(cepInput) {
      cepInput.addEventListener('input', (event) => {
          if (cepInput.disabled) return;
          let value = event.target.value.replace(/\D/g, '');
          
          if (value.length > 8) { // Limita o total de dígitos a 8
             value = value.substring(0, 8);
          }
          
          value = value.replace(/^(\d{5})(\d)/, '$1-$2');
          event.target.value = value;
      });
  }
  
  // VALIDAÇÃO 'APENAS NÚMEROS' PARA NÚMERO (ADICIONADA)
  if(numeroInput) {
      numeroInput.addEventListener('input', (event) => {
          if (numeroInput.disabled) return;
          event.target.value = event.target.value.replace(/\D/g, '');
      });
  }
  
  // VALIDAÇÃO 'SEM ESPECIAIS' PARA COMPLEMENTO (ADICIONADA)
  if(complementoInput) {
      complementoInput.addEventListener('input', (event) => {
          if (complementoInput.disabled) return;
          // Permite letras (com acentos), números e espaços
          const regex = /[^a-zA-Z0-9\u00C0-\u017F\s]/g; 
          event.target.value = event.target.value.replace(regex, '');
      });
  }

  // Lógica de ver senha
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

  setPersonalData();
});

