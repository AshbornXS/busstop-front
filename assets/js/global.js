document.addEventListener('DOMContentLoaded', function() {
    
    let isLoggingOut = false; // Flag para controlar o processo de logout

    /**
     * Controla a abertura e fechamento dos menus dropdown no cabeçalho.
     */
    function setupDropdowns() {
        const servicosBtn = document.getElementById('servicos-btn');
        const servicosContent = document.getElementById('servicos-content');
        const userBtn = document.getElementById('user-btn');
        const userContent = document.getElementById('user-content');

        function toggleDropdown(button, content) {
            if (button && content) {
                button.classList.toggle('open');
                content.classList.toggle('show');
            }
        }

        function closeAllDropdowns() {
            if (servicosContent && servicosContent.classList.contains('show')) {
                toggleDropdown(servicosBtn, servicosContent);
            }
            if (userContent && userContent.classList.contains('show')) {
                toggleDropdown(userBtn, userContent);
            }
        }

        if(servicosBtn) {
            servicosBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (userContent && userContent.classList.contains('show')) {
                    toggleDropdown(userBtn, userContent);
                }
                toggleDropdown(servicosBtn, servicosContent);
            });
        }

        if(userBtn) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (servicosContent && servicosContent.classList.contains('show')) {
                    toggleDropdown(servicosBtn, servicosContent);
                }
                toggleDropdown(userBtn, userContent);
            });
        }
        
        window.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                closeAllDropdowns();
            }
        });
    }

    /**
     * Atualiza o menu do usuário para mostrar "Login/Cadastro" ou "Meu Perfil/Sair".
     */
    function updateUserMenu() {
        const userContent = document.getElementById('user-content');
        if (!userContent) return; 

        const token = localStorage.getItem('token');

        if (token) {
            // CORRIGIDO: Caminhos absolutos para evitar erros de navegação
            userContent.innerHTML = `
                <a href="/pages/perfil/perfil.html">Meu Perfil</a>
                <a href="#" id="logout-link">Sair</a>
            `;
        } else {
            userContent.innerHTML = `
                <a href="/pages/loginCadastro/loginCadastro.html#login">Login</a>
                <a href="/pages/loginCadastro/loginCadastro.html#cadastro">Cadastro</a>
            `;
        }
    }

    /**
     * Adiciona um event listener para o botão de logout.
     */
    function setupLogout() {
        document.addEventListener('click', (event) => {
            if (event.target.id === 'logout-link' && !isLoggingOut) {
                event.preventDefault();
                isLoggingOut = true; // Impede cliques múltiplos
                
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
                
                showLogoutMessage();

                setTimeout(() => {
                    window.location.href = '/pages/loginCadastro/loginCadastro.html';
                }, 2000);
            }
        });
    }

    /**
     * Exibe um toast de notificação de logout.
     */
    function showLogoutMessage() {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            <span>Você saiu da sua conta. Redirecionando...</span>
        `;
        
        document.body.appendChild(toast);

        // O CSS agora controla a remoção da notificação com a animação
    }

    /**
     * Exibe um toast de notificação de boas-vindas.
     * @param {string} userName - O nome do usuário.
     */
    function showWelcomeMessage(userName) {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <i class="fa-solid fa-hand-sparkles"></i>
            <span>Bem-vindo(a), ${userName}!</span>
        `;
        
        document.body.appendChild(toast);
    }

    /**
     * Verifica se uma mensagem de boas-vindas deve ser exibida.
     */
    function checkAndShowWelcomeMessage() {
        if (localStorage.getItem('showWelcomeMessage') === 'true') {
            const currentUserData = localStorage.getItem('currentUser');
            if (currentUserData) {
                try {
                    const currentUser = JSON.parse(currentUserData);
                    const firstName = currentUser.name.split(' ')[0];
                    showWelcomeMessage(firstName);
                } catch (e) {
                    console.error("Erro ao processar dados do usuário:", e);
                }
            }
            localStorage.removeItem('showWelcomeMessage');
        }
    }

    // Inicializa todas as funcionalidades globais
    setupDropdowns();
    updateUserMenu();
    setupLogout();
    checkAndShowWelcomeMessage();
});

