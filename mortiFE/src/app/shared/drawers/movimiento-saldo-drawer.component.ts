import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovimientosService } from '../../core/services/movimientos.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-movimiento-saldo-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
        <form (submit)="$event.preventDefault()" class="space-y-6">
            
            <!-- Concepto -->
            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300 ml-1">Concepto</label>
                <div class="relative group">
                    <i class="bi bi-tag absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"></i>
                    <input 
                        type="text" 
                        [(ngModel)]="form.concepto"
                        name="concepto"
                        class="input-field w-full pl-12" 
                        placeholder="Ej. Pago de luz, Venta mostrador..." 
                        required>
                </div>
            </div>

            <!-- Monto -->
            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300 ml-1">Monto</label>
                <div class="relative group">
                    <i class="bi bi-currency-dollar absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"></i>
                    <input 
                        type="number" 
                        [(ngModel)]="form.monto"
                        name="monto"
                        class="input-field w-full pl-12 text-lg font-bold" 
                        placeholder="0.00" 
                        required>
                </div>
            </div>

            <!-- Afecta Capital Checkbox -->
            <div class="glass p-4 rounded-xl flex items-center justify-between cursor-pointer" (click)="form.afecta_capital = !form.afecta_capital">
                <div>
                    <p class="text-sm font-semibold text-white">Afecta Capital</p>
                    <p class="text-[10px] text-gray-500">Actívalo si el dinero entra o sale de la caja principal.</p>
                </div>
                <div class="relative">
                    <input type="checkbox" [(ngModel)]="form.afecta_capital" name="afecta_capital" class="sr-only">
                    <div class="block bg-white/10 w-10 h-6 rounded-full transition-colors"
                         [ngClass]="form.afecta_capital ? 'bg-blue-500' : 'bg-white/10'"></div>
                    <div class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"
                         [ngClass]="form.afecta_capital ? 'transform translate-x-4' : ''"></div>
                </div>
            </div>

            <!-- Observaciones -->
            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300 ml-1">Observaciones (Opcional)</label>
                <textarea 
                    [(ngModel)]="form.observaciones"
                    name="observaciones"
                    rows="3"
                    class="input-field w-full py-3 resize-none" 
                    placeholder="Agrega algún comentario extra..."></textarea>
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
                    <span class="text-lg font-semibold">{{ isSaving ? 'Procesando...' : 'Registrar' }}</span>
                </button>
            </div>
        </form>
    </div>
  `
})
export class MovimientoSaldoDrawerComponent {
  @Input() form: any = {
    tipo: 'ingreso', // will be overwritten by drawerData
    concepto: '',
    monto: null,
    afecta_capital: true,
    referencia_tabla: null,
    referencia_id: null,
    observaciones: ''
  };
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  isSaving = false;

  constructor(
    private movimientosService: MovimientosService,
    private notify: NotificationService
  ) {}

  isValid() {
    return this.form.concepto.length > 0 && this.form.monto && this.form.monto > 0;
  }

  onSave() {
    if (!this.isValid()) return;

    this.isSaving = true;
    
    // Convert empty string to null for observaciones
    const payload = {
        ...this.form,
        observaciones: this.form.observaciones.trim() === '' ? null : this.form.observaciones
    };

    this.movimientosService.createMovimientoSaldo(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.notify.success('Registro guardado exitosamente');
        this.saved.emit();
      },
      error: (err: any) => {
        console.error('Error saving', err);
        this.isSaving = false;
        this.notify.error('No se pudo guardar el registro');
      }
    });
  }

  onCancel() {
    this.cancelled.emit();
  }
}
