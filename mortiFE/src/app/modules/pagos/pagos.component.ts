import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagos.component.html'
})
export class PagosComponent implements OnInit {
  // Datos simulados para el diseño inicial
  pagos = [
    { cliente: 'Juan Perez', producto: 'Mesa Roble', total: 500, pagado: 200, restante: 300, proxima_cuota: '2026-05-15', estado: 'pendiente' },
    { cliente: 'Maria Lopez', producto: 'Silla Gamer', total: 300, pagado: 300, restante: 0, proxima_cuota: '-', estado: 'pagado' },
    { cliente: 'Carlos Ruiz', producto: 'Armario 2 Cuerpos', total: 800, pagado: 100, restante: 700, proxima_cuota: '2026-05-10', estado: 'vencido' },
  ];

  constructor() {}

  ngOnInit(): void {}

  getEstadoClass(estado: string): string {
    switch(estado) {
      case 'vencido': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'pagado': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  }
}
