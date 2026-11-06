export {};

const inputNum1 = document.getElementById('num1') as HTMLInputElement;
const selectOperacion = document.getElementById('operacion') as HTMLSelectElement;
const inputNum2 = document.getElementById('num2') as HTMLInputElement;
const btnCalcular = document.getElementById('btnCalcular') as HTMLButtonElement;
const spanResultado = document.getElementById('resultado') as HTMLSpanElement;
const listaHistorial = document.getElementById('historial') as HTMLUListElement;

btnCalcular.addEventListener('click', (): void => {
  
    const val1: number = parseFloat(inputNum1.value);
    const val2: number = parseFloat(inputNum2.value);
    const operador: string = selectOperacion.value;

    if (isNaN(val1) || isNaN(val2)) {
        spanResultado.textContent = "Ingresa números válidos";
        return;
    }

    let res: number | string = 0;

    switch (operador) {
        case '+':
            res = val1 + val2;
            break;
        case '-':
            res = val1 - val2;
            break;
        case '*':
            res = val1 * val2;
            break;
        case '/':
            res = val2 !== 0 ? val1 / val2 : 'Error (div entre 0)';
            break;
    }

    spanResultado.textContent = res.toString();

    const li: HTMLLIElement = document.createElement('li');
    li.textContent = `${val1} ${operador} ${val2} = ${res}`;
    listaHistorial.appendChild(li);
});