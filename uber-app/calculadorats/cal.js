"use strict";

const inputNum1 = document.getElementById('num1');
const selectOperacion = document.getElementById('operacion');
const inputNum2 = document.getElementById('num2');
const btnCalcular = document.getElementById('btnCalcular');
const spanResultado = document.getElementById('resultado');
const listaHistorial = document.getElementById('historial');
btnCalcular.addEventListener('click', () => {
    const val1 = parseFloat(inputNum1.value);
    const val2 = parseFloat(inputNum2.value)
    const operador = selectOperacion.value;
    if (isNaN(val1) || isNaN(val2)) {
        spanResultado.textContent = "Ingresa números válidos";
        return;
    }
    let res = 0;
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
    const li = document.createElement('li');
    li.textContent = `${val1} ${operador} ${val2} = ${res}`;
    listaHistorial.appendChild(li);
});
