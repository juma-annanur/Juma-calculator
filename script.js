const buttonsContainer    = document.getElementById('buttons');
const display             = document.getElementById('display');
const historyContainer    = document.getElementById('history');
const clearHistoryButton  = document.getElementById('clear-history');

const buttonLabels = [
  'C', '(', ')', '/',
  '7', '8', '9', '*',
  '4', '5', '6', '-',
  '1', '2', '3', '+',
  '0', '.', '⌫', '='
];

let currentInput = '';
let shouldResetDisplay = false;
let lastActionWasEqual = false;

const buttonElements = {};

function appendToDisplay(value) {
    if (shouldResetDisplay) {
      display.value = '';
      currentInput = '';
      shouldResetDisplay = false;
    }
    display.value += value;
    currentInput += value;
  }
  
function clearDisplay() {
  display.value = '';
  currentInput = '';
}

function flashDisplay() {
  display.classList.add('flash');
  setTimeout(() => {
    display.classList.remove('flash');
  }, 500);
}

function addToHistory(entry) {
  const newEntry = document.createElement('div');
  newEntry.textContent = entry;
  
  if (historyContainer.firstChild) {
    historyContainer.insertBefore(newEntry, historyContainer.firstChild);
  } else {
    historyContainer.appendChild(newEntry);
  }
  
  if (historyContainer.children.length > 10) {
    historyContainer.removeChild(historyContainer.lastChild);
  }
  
  historyContainer.scrollTop = 0;
}

function calculate() {
  // Если только что уже нажали '=', игнорируем повтор
  if (lastActionWasEqual) return;
  
  try {
    // 1) Подготовка выражения
    let expression = currentInput
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-');
    
    // 2) Пустая строка?
    if (!expression.trim()) return;
    
    // 3) Конец на оператор?
    if (/[\+\-\*\/]$/.test(expression)) {
      throw new Error('Неполное выражение');
    }
    
    // 4) Вычисляем
    const rawResult = eval(expression);
    
    // 5) Проверка на деление на 0
    if (rawResult === Infinity || rawResult === -Infinity) {
      throw new Error('Деление на ноль');
    }
    
    // 6) Округляем до 10 знаков
    const formattedResult = parseFloat(rawResult.toFixed(10));
    
    // 7) Собираем строку для истории
    const formattedExpression = currentInput
      .replace(/\*/g, '×')
      .replace(/\//g, '÷')
      .replace(/\-/g, '−');
    
    addToHistory(`${formattedExpression} = ${formattedResult}`);
    display.value = formattedResult;
    currentInput = formattedResult.toString();
    shouldResetDisplay = true;
    flashDisplay();
    
    // Устанавливаем, что только что нажали '='
    lastActionWasEqual = true;
  } catch (error) {
    display.value = 'Ошибка';
    setTimeout(() => {
      if (currentInput) {
        display.value = currentInput;
      } else {
        clearDisplay();
      }
    }, 1000);
  }
}

function handleInput(value) {
  // При любом вводе (цифра, оператор, Backspace и т.д.) 
  // сбрасываем флаг «только что =»
  lastActionWasEqual = false;

  if (value === 'C') {
    clearDisplay();
  } else if (value === '=') {
    calculate();
  } else if (value === '⌫') {
    removeLastCharacter();
  } else if (['+', '-', '*', '/'].includes(value)) {
    const lastChar = currentInput.slice(-1);
    
    if (value === '-') {
      // Разрешаем минус как первый символ,
      // либо после любого оператора ('+', '-', '*', '/', '(')
      if (
        currentInput === '' ||
        ['+', '-', '*', '/', '('].includes(lastChar)
      ) {
        appendToDisplay(value);
      } else if (
        currentInput !== '' &&
        !['+', '-', '*', '/', '('].includes(lastChar)
      ) {
        // Обычный минус (вычитание) после числа или ')'
        appendToDisplay(value);
      }
    } else {
      // '+' '*' '/' — только если предыдущий символ не оператор
      if (currentInput !== '' && !['+', '-', '*', '/', '('].includes(lastChar)) {
        appendToDisplay(value);
      }
    }
  } else {
    // Всё остальное (цифры, точка, скобки)
    appendToDisplay(value);
  }
}

// Генерация кнопок
buttonLabels.forEach(label => {
  const button = document.createElement('button');
  button.textContent = label;
  
  // Классы для спец. кнопок
  if (['+', '-', '*', '/'].includes(label)) {
    button.classList.add('operator');
  } else if (label === '=') {
    button.classList.add('equals');
  } else if (label === 'C') {
    button.classList.add('clear');
  }
  
  button.addEventListener('click', () => {
    handleInput(label);
    highlightButton(label);
  });
  
  buttonsContainer.appendChild(button);
  buttonElements[label] = button;
});

// Клавиатурный ввод + подсветка кнопок
document.addEventListener('keydown', (event) => {
  const key = event.key;
  const allowedKeys = [
    '0','1','2','3','4','5','6','7','8','9','.',
    '+','-','*','/','(',')','Enter','Backspace','Delete','='
  ];
  
  if (!allowedKeys.includes(key)) return;
  event.preventDefault();
  
  if (key === 'Enter' || key === '=') {
    handleInput('=');
    highlightButton('=');
  } else if (key === 'Backspace') {
    handleInput('⌫');
    highlightButton('⌫');
  } else if (key === 'Delete') {
    handleInput('C');
    highlightButton('C');
  } else {
    handleInput(key);
    highlightButton(key);
  }
});

function highlightButton(key) {
  const button = buttonElements[key];
  if (button) {
    button.classList.add('active-button');
    setTimeout(() => {
      button.classList.remove('active-button');
    }, 150);
  }
}

function removeLastCharacter() {
  if (currentInput.length > 0) {
    currentInput = currentInput.slice(0, -1);
    display.value = display.value.slice(0, -1);
  }
}

clearHistoryButton.addEventListener('click', () => {
  historyContainer.innerHTML = '';
});

