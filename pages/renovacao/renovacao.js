document.addEventListener('DOMContentLoaded', function() {
      // --- Elementos da Página ---
      const renewalFormContainer = document.getElementById('renewal-form-container');
      const loggedOutMessage = document.getElementById('logged-out-message');
      
      const renewalForm = document.getElementById('renewal-form');
      const submitBtn = document.getElementById('submit-btn');
      const fileInputs = renewalForm.querySelectorAll('input[type="file"]');

      /**
       * Verifica o status de login e configura a página de acordo.
       */
      function setupPageForUser() {
        const token = localStorage.getItem('token');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (token && currentUser) {
          // Usuário logado: mostra o formulário e preenche os dados.
          if(renewalFormContainer) renewalFormContainer.style.display = 'block';
          if(loggedOutMessage) loggedOutMessage.style.display = 'none';
          populateUserData(currentUser);
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
        document.getElementById('nome').value = userData.name || '';
        document.querySelector('input[type="email"]').value = userData.email || '';
        document.getElementById('cpf').value = userData.cpf || '';
        document.getElementById('carteirinha').value = userData.carteirinha || '';
        document.getElementById('telefone').value = userData.telefone || '';
        document.getElementById('cep').value = userData.cep || '';
        document.getElementById('endereco').value = userData.endereco || '';
        document.getElementById('numero').value = userData.numero || '';
        document.getElementById('complemento').value = userData.complemento || '';
        document.getElementById('cidade').value = userData.cidade || '';
        document.getElementById('estado').value = userData.estado || '';
      }

      // Lógica para mostrar nome do arquivo selecionado
      fileInputs.forEach(input => {
        input.addEventListener('change', function() {
          const display = document.querySelector(`.file-name-display[data-for="${this.id}"]`);
          if (this.files.length > 0) {
            display.textContent = this.files[0].name;
          } else {
            display.textContent = 'Nenhum arquivo selecionado';
          }
           checkFormValidity();
        });
      });
      
      function checkFormValidity() {
        let allFilesSelected = true;
        fileInputs.forEach(input => {
          if (input.files.length === 0) {
            allFilesSelected = false;
          }
        });
        submitBtn.disabled = !allFilesSelected;
      }
      
      // Simulação de envio
      renewalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Documentos enviados para análise!');
        renewalForm.reset();
        fileInputs.forEach(input => {
            const display = document.querySelector(`.file-name-display[data-for="${input.id}"]`);
            display.textContent = 'Nenhum arquivo selecionado';
        });
        checkFormValidity();
      });

      // Inicializa a página
      checkFormValidity();
      setupPageForUser();
});

