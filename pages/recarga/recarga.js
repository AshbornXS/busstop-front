document.addEventListener('DOMContentLoaded', function() {
  // --- Lógica da Página de Recarga ---
  const valorStep = document.getElementById('valor-step');
  const pixStep = document.getElementById('pix-step');
  const confirmationStep = document.getElementById('confirmation-step');
  
  const valueBtns = document.querySelectorAll('.value-btn[data-value]');
  const otherAmountBtn = document.getElementById('other-amount-btn');
  const customAmountInput = document.getElementById('custom-amount');
  const customAmountWrapper = document.getElementById('custom-amount-wrapper');

  const proceedBtn = document.getElementById('proceed-to-payment-btn');
  const backBtn = document.getElementById('back-to-value-btn');
  const copyBtn = document.getElementById('copy-btn');
  
  let selectedValue = 0;
  let finalRechargeValue = 0; // Armazena o valor final da recarga
  let timerInterval;

  /**
   * Puxa os dados do usuário do localStorage e decide o que exibir na página.
   */
  function setupPageForUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Pega os containers principais
    const rechargeContainer = document.getElementById('recharge-container');
    const loggedOutMessage = document.getElementById('logged-out-message');

    if (currentUser) {
        // --- USUÁRIO LOGADO ---
        if(rechargeContainer) rechargeContainer.style.display = 'block';
        if(loggedOutMessage) loggedOutMessage.style.display = 'none';

        // Preenche os dados do usuário
        const cardNumberInput = document.getElementById('card-number');
        const balanceAmountInput = document.getElementById('balance-amount');
        if(cardNumberInput) cardNumberInput.value = currentUser.carteirinha || 'N/A';
        if(balanceAmountInput) balanceAmountInput.value = `R$ ${currentUser.saldo.toFixed(2).replace('.', ',')}`;
    } else {
        // --- USUÁRIO DESLOGADO ---
        if(rechargeContainer) rechargeContainer.style.display = 'none';
        if(loggedOutMessage) loggedOutMessage.style.display = 'block';
    }
  }
  
  /**
   * Atualiza o saldo do usuário no localStorage.
   * @param {number} rechargeAmount - O valor a ser adicionado ao saldo.
   */
  function updateBalance(rechargeAmount) {
    const currentUserJSON = localStorage.getItem('currentUser');
    const userDbJSON = localStorage.getItem('simulatedUserDb');

    if (currentUserJSON) {
        let currentUser = JSON.parse(currentUserJSON);
        const newBalance = currentUser.saldo + rechargeAmount;
        currentUser.saldo = parseFloat(newBalance.toFixed(2)); // Arredonda para 2 casas decimais

        // Salva o usuário atualizado de volta no localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Atualiza o "banco de dados" simulado também para consistência
        if (userDbJSON) {
            let userDb = JSON.parse(userDbJSON);
            const userIndex = userDb.findIndex(user => user.email === currentUser.email);
            if (userIndex !== -1) {
                userDb[userIndex].saldo = currentUser.saldo;
                localStorage.setItem('simulatedUserDb', JSON.stringify(userDb));
            }
        }
    }
  }


  function getCustomAmountValue() {
    if (customAmountInput.value) {
      const sanitizedValue = customAmountInput.value.replace(',', '.');
      return parseFloat(sanitizedValue);
    }
    return 0;
  }

  function updateProceedButton() {
    const customValue = getCustomAmountValue();
    const isCustomValueSelected = otherAmountBtn.classList.contains('selected') && customValue > 0;
    const isPredefinedValueSelected = selectedValue > 0 && !otherAmountBtn.classList.contains('selected');
    
    proceedBtn.disabled = !(isCustomValueSelected || isPredefinedValueSelected);
  }
  
  valueBtns.forEach(button => {
    button.addEventListener('click', function() {
      selectedValue = parseFloat(this.dataset.value);
      valueBtns.forEach(btn => btn.classList.remove('selected'));
      this.classList.add('selected');
      if(otherAmountBtn) otherAmountBtn.classList.remove('selected');
      if(customAmountWrapper) customAmountWrapper.style.display = 'none';
      if(customAmountInput) customAmountInput.value = '';
      updateProceedButton();
    });
  });

  if (otherAmountBtn) {
    otherAmountBtn.addEventListener('click', function() {
        selectedValue = 0;
        valueBtns.forEach(btn => btn.classList.remove('selected'));
        this.classList.add('selected');
        if(customAmountWrapper) customAmountWrapper.style.display = 'block';
        if(customAmountInput) customAmountInput.focus();
        updateProceedButton();
    });
  }

  if (customAmountInput) {
      customAmountInput.addEventListener('input', (event) => {
        // Limita a entrada a no máximo duas casas decimais
        let value = event.target.value;
        
        // Substitui vírgula por ponto para consistência no processamento
        value = value.replace(',', '.');

        const decimalIndex = value.indexOf('.');

        // Se houver um ponto decimal e mais de dois dígitos depois dele
        if (decimalIndex !== -1 && value.length - decimalIndex - 1 > 2) {
            // Trunca a string para ter apenas duas casas decimais
            event.target.value = value.substring(0, decimalIndex + 3);
        }

        // Continua com a lógica original para atualizar o botão
        selectedValue = 0;
        valueBtns.forEach(btn => btn.classList.remove('selected'));
        if(otherAmountBtn) otherAmountBtn.classList.add('selected');
        updateProceedButton();
      });

      // Formata o valor para duas casas decimais quando o usuário sai do campo
      customAmountInput.addEventListener('blur', (event) => {
        const value = getCustomAmountValue();
        if (value > 0) {
            event.target.value = value.toFixed(2).replace('.', ',');
        }
      });
  }

  function startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    clearInterval(timerInterval); 
    
    timerInterval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.textContent = minutes + ":" + seconds;
        if (--timer < 0) {
            clearInterval(timerInterval);
            // Pagamento validado: atualiza o saldo e avança para a confirmação
            updateBalance(finalRechargeValue);
            pixStep.classList.remove('active');
            confirmationStep.classList.add('active');
        }
    }, 1000);
  }

  if (proceedBtn) {
    proceedBtn.addEventListener('click', () => {
      const finalValue = otherAmountBtn.classList.contains('selected') 
          ? getCustomAmountValue()
          : selectedValue;

      if (finalValue > 0) {
          finalRechargeValue = finalValue; // Armazena o valor para usar na atualização
          document.getElementById('pix-amount').textContent = 'R$ ' + finalValue.toFixed(2).replace('.', ',');
          document.getElementById('recharged-amount').textContent = 'R$ ' + finalValue.toFixed(2).replace('.', ',');
          
          valorStep.classList.remove('active');
          pixStep.classList.add('active');
          const tenMinutes = 10 * 60; // 10 minutos (600 segundos)
          const timerDisplay = document.getElementById('pix-timer');
          startTimer(tenMinutes, timerDisplay);
      }
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      pixStep.classList.remove('active');
      valorStep.classList.add('active');
      clearInterval(timerInterval);
    });
  }

  if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const pixCodeInput = document.getElementById('pix-code');
        const feedback = document.getElementById('copy-feedback');
        // Usa navigator.clipboard.writeText para copiar
        navigator.clipboard.writeText(pixCodeInput.value).then(() => {
            feedback.textContent = 'Copiado!';
            setTimeout(() => { feedback.textContent = ''; }, 2000);
        }, () => {
            feedback.textContent = 'Falha ao copiar!';
            setTimeout(() => { feedback.textContent = ''; }, 2000);
        });
      });
  }

  // Configura a página assim que ela carregar
  setupPageForUser();
});
