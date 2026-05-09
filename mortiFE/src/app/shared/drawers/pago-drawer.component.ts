import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagosService } from '../../core/services/pagos.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-pago-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
        <form (submit)="$event.preventDefault()" class="space-y-6">
            
            <div class="glass p-4 rounded-2xl mb-6">
                <p class="text-[10px] text-gray-500 uppercase font-bold mb-1">Saldo Pendiente Actual</p>
                <p class="text-white font-bold text-2xl">&#36;{{ form.saldo_pendiente }}</p>
            </div>

            <!-- Valor Pagado -->
            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300 ml-1">Monto a Pagar</label>
                <div class="relative group">
                    <i class="bi bi-cash absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"></i>
                    <input 
                        type="number" 
                        [(ngModel)]="valor_pagado"
                        name="valor_pagado"
                        class="input-field w-full pl-12 text-lg font-bold" 
                        placeholder="0.00" 
                        required>
                </div>
            </div>

            <div class="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                <div class="flex gap-3">
                    <i class="bi bi-info-circle text-blue-500 mt-0.5"></i>
                    <p class="text-[11px] text-gray-400 leading-relaxed">
                        Este pago se distribuirá automáticamente en las cuotas pendientes más antiguas. El saldo de la venta se actualizará de forma automática.
                    </p>
                </div>
            </div>

            <!-- Footer Buttons -->
            <div footer class="flex gap-3 w-full">
                <button 
                    (click)="onCancel()"
                    class="flex-1 py-3 rounded-2xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-all">
                    Cancelar
                </button>
                <button 
                    (click)="onSave()"
                    [disabled]="!isValid() || isSaving"
                    class="btn-primary flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 group">
                    <span *ngIf="isSaving" class="spinner"></span>
                    <span class="text-lg font-semibold">{{ isSaving ? 'Procesando...' : 'Registrar Pago' }}</span>
                </button>
            </div>
        </form>
    </div>
  `
})
export class PagoDrawerComponent implements OnInit {
  @Input() form: any = {
    id_venta: 0,
    saldo_pendiente: 0
  };
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  valor_pagado: number | null = null;
  isSaving = false;

  constructor(
    private pagosService: PagosService,
    private notify: NotificationService
  ) {}

  ngOnInit() {
    console.log('PagoDrawerComponent initialized with data:', this.form);
    // Podemos pre-cargar el valor con el saldo pendiente, o dejarlo en blanco. 
    // Lo dejaremos en blanco por si quiere pagar una cuota parcial.
  }

  isValid() {
    return this.valor_pagado && 
           this.valor_pagado > 0 && 
           this.valor_pagado <= this.form.saldo_pendiente && 
           this.form.id_venta > 0;
  }

  onSave() {
    if (!this.isValid()) return;

    this.isSaving = true;
    this.pagosService.createPago({
      id_venta: this.form.id_venta,
      valor_pagado: this.valor_pagado!
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.notify.success('Pago registrado exitosamente');
        this.saved.emit();
      },
      error: (err: any) => {
        console.error('Error saving payment', err);
        this.isSaving = false;
        this.notify.error(err.error?.detail || 'No se pudo registrar el pago');
      }
    });
  }

  onCancel() {
    this.cancelled.emit();
  }
}
