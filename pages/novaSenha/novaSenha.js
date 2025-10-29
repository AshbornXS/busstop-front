document.addEventListener('DOMContentLoaded', function() {

    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const resetError = document.getElementById('resetError');
    const toggleButtons = document.querySelectorAll('.password-toggle-btn');

    /**
     * Exibe um toast de notificação.
     * @param {string} message - A mensagem a ser exibida.
     * @param {string} type - 'success' ou 'error'.
     */
    function showToastNotification(message, type = 'success') {
        // Remove qualquer toast existente para evitar duplicatas
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        
        const iconClass = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark';
        
        toast.innerHTML = `
            <i class="${iconClass}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);

        // Remove o toast após a animação
        setTimeout(() => {
            toast.remove();
        }, 3000); // 3 segundos
    }

    // Lógica para mostrar/ocultar senha
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

    // Lógica de submissão do formulário
    resetPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        resetError.textContent = ''; // Limpa erros internos

        const novaSenha = newPasswordInput.value;
        const confirmarSenha = confirmPasswordInput.value;

        // Validações
        if (novaSenha === '' || confirmarSenha === '') {
            resetError.textContent = 'Por favor, preencha todos os campos.';
            showToastNotification('Por favor, preencha todos os campos.', 'error');
            return;
        }

        if (novaSenha.length < 4) {
             resetError.textContent = 'A senha deve ter no mínimo 4 caracteres.';
             showToastNotification('A senha deve ter no mínimo 4 caracteres.', 'error');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            resetError.textContent = 'As senhas não coincidem.';
            showToastNotification('As senhas não coincidem.', 'error');
            return;
        }

        // Simulação de sucesso
        showToastNotification('Senha alterada com sucesso!', 'success');
        resetPasswordForm.reset();
        
        // Redireciona para o login após 2 segundos
        setTimeout(() => {
            window.location.href = '../loginCadastro/loginCadastro.html#login';
        }, 2000);
    });
});
