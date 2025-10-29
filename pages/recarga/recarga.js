document.addEventListener('DOMContentLoaded', function() {
  
  // --- CONFIGURAÇÕES DE SIMULAÇÃO ---
  // Altere o valor abaixo para definir o tempo do cronômetro do PIX (em segundos).
  const TIMER_DURATION_SECONDS = 5; 
  
  // Altere para 'true' para simular um pagamento bem-sucedido, ou 'false' para simular uma falha/expirado.
  const SIMULATE_PAYMENT_SUCCESS = true;
  // ------------------------------------


  // --- Lógica da Página de Recarga ---
  const valorStep = document.getElementById('valor-step');
  const pixStep = document.getElementById('pix-step');
  const confirmationStep = document.getElementById('confirmation-step');
  const errorStep = document.getElementById('error-step');
  
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
    
    const rechargeContainer = document.getElementById('recharge-container');
    const loggedOutMessage = document.getElementById('logged-out-message');

    if (currentUser) {
        if(rechargeContainer) rechargeContainer.style.display = 'block';
        if(loggedOutMessage) loggedOutMessage.style.display = 'none';

        const cardNumberInput = document.getElementById('card-number');
        const balanceAmountInput = document.getElementById('balance-amount');
        if(cardNumberInput) cardNumberInput.value = currentUser.carteirinha || 'N/A';
        if(balanceAmountInput) balanceAmountInput.value = `R$ ${currentUser.saldo.toFixed(2).replace('.', ',')}`;
    } else {
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
        currentUser.saldo = parseFloat(newBalance.toFixed(2));

        localStorage.setItem('currentUser', JSON.stringify(currentUser));

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
        let value = event.target.value.replace(/[^0-9,]/g, '');
        const parts = value.split(',');
        if (parts.length > 2) {
            value = parts[0] + ',' + parts.slice(1).join('');
        }
        const decimalIndex = value.indexOf(',');
        if (decimalIndex !== -1 && value.length - decimalIndex - 1 > 2) {
            value = value.substring(0, decimalIndex + 3);
        }
        event.target.value = value;
        selectedValue = 0;
        valueBtns.forEach(btn => btn.classList.remove('selected'));
        if(otherAmountBtn) otherAmountBtn.classList.add('selected');
        updateProceedButton();
      });

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

            // Pega o resultado da simulação da variável de configuração
            const paymentSuccess = SIMULATE_PAYMENT_SUCCESS; 

            if (paymentSuccess) {
                updateBalance(finalRechargeValue);
                pixStep.classList.remove('active');
                confirmationStep.classList.add('active');
            } else {
                pixStep.classList.remove('active');
                errorStep.classList.add('active');
            }
        }
    }, 1000);
  }

  if (proceedBtn) {
    proceedBtn.addEventListener('click', () => {
      const finalValue = otherAmountBtn.classList.contains('selected') 
          ? getCustomAmountValue()
          : selectedValue;

      if (finalValue > 0) {
          finalRechargeValue = finalValue;
          document.getElementById('pix-amount').textContent = 'R$ ' + finalValue.toFixed(2).replace('.', ',');
          document.getElementById('recharged-amount').textContent = 'R$ ' + finalValue.toFixed(2).replace('.', ',');
          
          valorStep.classList.remove('active');
          pixStep.classList.add('active');
          
          const timerDisplay = document.getElementById('pix-timer');
          
          // Define o valor inicial do timer no HTML para evitar a inconsistência
          const minutes = Math.floor(TIMER_DURATION_SECONDS / 60).toString().padStart(2, '0');
          const seconds = (TIMER_DURATION_SECONDS % 60).toString().padStart(2, '0');
          timerDisplay.textContent = `${minutes}:${seconds}`;
          
          startTimer(TIMER_DURATION_SECONDS, timerDisplay);
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
        navigator.clipboard.writeText(pixCodeInput.value).then(() => {
            feedback.textContent = 'Copiado!';
            setTimeout(() => { feedback.textContent = ''; }, 2000);
        }, () => {
            feedback.textContent = 'Falha ao copiar!';
            setTimeout(() => { feedback.textContent = ''; }, 2000);
        });
      });
  }

  setupPageForUser();
});

