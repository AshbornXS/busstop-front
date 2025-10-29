document.addEventListener('DOMContentLoaded', function() {
      // --- Elementos da Página ---
      const renewalFormContainer = document.getElementById('renewal-form-container');
      const loggedOutMessage = document.getElementById('logged-out-message');
      
      const renewalForm = document.getElementById('renewal-form');
      const submitBtn = document.getElementById('submit-btn');
      const fileInputs = renewalForm.querySelectorAll('input[type="file"]');
      const dataMissingWarning = document.getElementById('data-missing-warning'); // NOVO
      
      let currentUser = null; // Armazena os dados do usuário
      let allDataFilled = false; // Flag para dados do perfil
      let allFilesSelected = false; // Flag para arquivos

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
          
          document.body.appendChild(toast);
      }

      /**
       * Verifica o status de login e configura a página de acordo.
       */
      function setupPageForUser() {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('currentUser');

        if (token && storedUser) {
          try {
            currentUser = JSON.parse(storedUser);
          } catch(e) {
            console.error("Erro ao ler dados do usuário.", e);
            currentUser = null;
          }
        }

        if (currentUser) {
          // Usuário logado: mostra o formulário e preenche os dados.
          if(renewalFormContainer) renewalFormContainer.style.display = 'block';
          if(loggedOutMessage) loggedOutMessage.style.display = 'none';
          populateUserData(currentUser);
          
          // NOVO: Verifica se os dados estão preenchidos
          allDataFilled = checkAllDataFilled(currentUser);
          checkFormValidity(); // Atualiza o botão

        } else {
          // Usuário deslogado: mostra a mensagem de acesso restrito.
          if(renewalFormContainer) renewalFormContainer.style.display = 'none';
          if(loggedOutMessage) loggedOutMessage.style.display = 'block';
        }
      }

      /**
       * Preenche o formulário com os dados do usuário.
       * @param {object} userData - O objeto do usuário atual.
       */
      function populateUserData(userData) {
        // (Campos obrigatórios de perfil)
        document.getElementById('nome').value = userData.name || '';
        document.querySelector('input[type="email"]').value = userData.email || '';
        
        // (Campos opcionais de perfil, mas necessários para renovação)
        document.getElementById('cpf').value = userData.cpf || '';
        document.getElementById('telefone').value = userData.telefone || '';
        document.getElementById('cep').value = userData.cep || '';
        document.getElementById('endereco').value = userData.endereco || '';
        document.getElementById('bairro').value = userData.bairro || '';
        document.getElementById('numero').value = userData.numero || '';
        document.getElementById('cidade').value = userData.cidade || '';
        document.getElementById('estado').value = userData.estado || '';

        // (Dados fixos)
        document.getElementById('carteirinha').value = userData.carteirinha || '';
        document.getElementById('complemento').value = userData.complemento || '';
      }

      /**
       * NOVO: Verifica se todos os dados essenciais do perfil estão preenchidos.
       */
      function checkAllDataFilled(user) {
         const requiredFields = ['name', 'cpf', 'telefone', 'cep', 'endereco', 'bairro', 'numero', 'cidade', 'estado'];
         
         for (const field of requiredFields) {
            if (!user[field] || user[field].trim() === '' || user[field].trim() === '+55') {
                return false; // Encontrou um campo faltando
            }
         }
         return true; // Todos os campos estão preenchidos
      }


      // Lógica para mostrar nome do arquivo e validar o tipo
      fileInputs.forEach(input => {
        input.addEventListener('change', function() {
          const display = document.querySelector(`.file-name-display[data-for="${this.id}"]`);
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
          const file = this.files[0];

          if (file) {
            if (allowedTypes.includes(file.type)) {
                // Tipo de arquivo válido
                display.textContent = file.name;
                display.style.color = ''; // Reseta a cor para o padrão
            } else {
                // Tipo de arquivo inválido
                // ATUALIZAÇÃO: Usa o toast para erro
                showToastNotification('Arquivo inválido! (Use JPG, PNG ou PDF)', 'fa-solid fa-triangle-exclamation');
                this.value = ''; // Limpa o campo de arquivo
                display.textContent = 'Arquivo inválido. Tente novamente.';
                display.style.color = '#a62828'; // Muda a cor para vermelho
            }
          } else {
            display.textContent = 'Nenhum arquivo selecionado';
            display.style.color = ''; // Reseta a cor
          }
           checkFormValidity();
        });
      });
      
      /**
       * ATUALIZADO: Verifica arquivos E dados do perfil para habilitar o botão.
       */
      function checkFormValidity() {
        // 1. Verifica os arquivos
        allFilesSelected = true;
        fileInputs.forEach(input => {
          if (input.files.length === 0) {
            allFilesSelected = false;
          }
        });

        // 2. Habilita/Desabilita o botão
        if (allDataFilled && allFilesSelected) {
            submitBtn.disabled = false;
            dataMissingWarning.style.display = 'none';
        } else {
            submitBtn.disabled = true;
            // 3. Mostra o aviso correto
            if (!allDataFilled) {
                dataMissingWarning.innerHTML = 'Você precisa completar seu perfil para renovar. <a href="../perfil/perfil.html">Ir para o perfil</a>';
                dataMissingWarning.style.display = 'block';
            } else if (!allFilesSelected) {
                 dataMissingWarning.textContent = 'Por favor, anexe os dois documentos necessários.';
                 dataMissingWarning.style.display = 'block';
            }
        }
      }
      
      // ATUALIZADO: Simulação de envio com TOAST
      renewalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // ATUALIZAÇÃO: Usa o toast
        showToastNotification('Documentos enviados para análise!', 'fa-solid fa-file-arrow-up');
        
        renewalForm.reset();
        fileInputs.forEach(input => {
            const display = document.querySelector(`.file-name-display[data-for="${input.id}"]`);
            display.textContent = 'Nenhum arquivo selecionado';
            display.style.color = '';
        });
        
        // Repopula os dados do usuário (pois o form.reset() limpa os campos disabled)
        if (currentUser) {
            populateUserData(currentUser);
        }
        
        checkFormValidity();
      });

      // Inicializa a página
      setupPageForUser();
});
