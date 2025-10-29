document.addEventListener('DOMContentLoaded', function() {

    /**
     * Exibe uma notificação toast (baseada no global.js e perfil.js).
     * @param {string} message - A mensagem a ser exibida.
     * @param {string} type - 'success' (verde) ou 'error' (vermelho).
     */
    function showToastNotification(message, type = 'success') {
        // Remove qualquer toast existente
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        
        // Define a cor e o ícone com base no tipo
        if (type === 'error') {
            toast.style.backgroundColor = '#dc3545'; // Vermelho para erro
            toast.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> <span>${message}</span>`;
        } else {
            toast.style.backgroundColor = '#28a745'; // Verde padrão para sucesso
            toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
        }
        
        document.body.appendChild(toast);

        // O toast já tem uma animação de fade-out definida no global.css
        // Mas garantimos a remoção dele caso a animação falhe
        setTimeout(() => {
            if (toast) {
                toast.remove();
            }
        }, 4000); // 4 segundos (duração da animação)
    }

    // --- ALTERAÇÃO REMOVIDA ---
    // O limite de caracteres agora está diretamente no arquivo .html
    // --- FIM DA ALTERAÇÃO ---

    // Lógica do formulário
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email-forgot').value;
            
            if (email) {
                // Substitui o alert() pela notificação toast
                const message = `Se o e-mail ${email} estiver cadastrado, você receberá um link em breve.`;
                showToastNotification(message, 'success');
                
                this.reset();
            } else {
                // Adiciona mensagem de erro se o campo estiver vazio
                showToastNotification('Por favor, digite seu e-mail.', 'error');
            }
        });
    }
});

