import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePage {
  num1: number | null = null;
  num2: number | null = null;
  operacion: string = '+';
  resultado: string = '';
  historial: string[] = [];

  onNum1Change(event: any): void {
    const val = parseFloat(event.detail.value);
    this.num1 = isNaN(val) ? null : val;
  }

  onNum2Change(event: any): void {
    const val = parseFloat(event.detail.value);
    this.num2 = isNaN(val) ? null : val;
  }

  onOperacionChange(event: any): void {
    this.operacion = event.detail.value;
  }

  calcular(): void {
    if (this.num1 === null || this.num2 === null) {
      this.resultado = 'Ingresa números válidos';
      return;
    }

    let res: number | string = 0;

    switch (this.operacion) {
      case '+':
        res = this.num1 + this.num2;
        break;
      case '-':
        res = this.num1 - this.num2;
        break;
      case '*':
        res = this.num1 * this.num2;
        break;
      case '/':
        res = this.num2 !== 0 ? this.num1 / this.num2 : 'Error (div entre 0)';
        break;
    }

    this.resultado = res.toString();
    this.historial.push(`${this.num1} ${this.operacion} ${this.num2} = ${res}`);
  }
}