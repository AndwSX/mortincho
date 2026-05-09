import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovimientosService } from '../../core/services/movimientos.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-prestamo-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
        <form (submit)="$event.preventDefault()" class="space-y-6">
            
            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300 ml-1">Tipo de Préstamo</label>
                <div class="grid grid-cols-2 gap-3">
                    <button 
                        (click)="form.tipo = 'entregado'"
                        [ngClass]="form.tipo === 'entregado' ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-white/5 border-white/5 text-gray-500'"
                        class="px-4 py-3 rounded-2xl border text-xs font-bold uppercase tracking-wider transition-all">
                        Entregado (Prestas dinero)
                    </button>
                    <button 
                        (click)="form.tipo = 'recibido'"
                        [ngClass]="form.tipo === 'recibido' ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-white/5 border-white/5 text-gray-500'"
                        class="px-4 py-3 rounded-2xl border text-xs font-bold uppercase tracking-wider transition-all">
                        Recibido (Te prestan)
                    </button>
                </div>
            </div>

            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300 ml-1">Concepto / Entidad</label>
                <div class="relative group">
                    <i class="bi bi-person absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"></i>
                    <input 
                        type="text" 
                        [(ngModel)]="form.concepto"
                        name="concepto"
                        class="input-field w-full pl-12" 
                        placeholder="Ej. Juan, Banco Santander..." 
                        required>
                </div>
            </div>

            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300 ml-1">Monto Total</label>
                <div class="relative group">
                    <i class="bi bi-currency-dollar absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"></i>
                    <input 
                        type="number" 
                        [(ngModel)]="form.monto_total"
                        name="monto_total"
                        class="input-field w-full pl-12 text-lg font-bold" 
                        placeholder="0.00" 
                        required>
                </div>
            </div>

            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300 ml-1">Observaciones (Opcional)</label>
                <textarea 
                    [(ngModel)]="form.observaciones"
                    name="observaciones"
                    rows="3"
                    class="input-field w-full py-3 resize-none" 
                    placeholder="Agrega detalles del préstamo..."></textarea>
            </div>

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
                    <span class="text-lg font-semibold">{{ isSaving ? 'Procesando...' : 'Registrar Préstamo' }}</span>
                </button>
            </div>
        </form>
    </div>
  `
})
export class PrestamoDrawerComponent {
  @Input() form: any = {
    tipo: 'entregado',
    concepto: '',
    monto_total: null,
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
    return this.form.concepto.length > 0 && this.form.monto_total && this.form.monto_total > 0;
  }

  onSave() {
    if (!this.isValid()) return;

    this.isSaving = true;
    
    const payload = {
        ...this.form,
        observaciones: this.form.observaciones.trim() === '' ? null : this.form.observaciones
    };

    this.movimientosService.createPrestamo(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.notify.success('Préstamo registrado exitosamente');
        this.saved.emit();
      },
      error: (err: any) => {
        console.error('Error saving', err);
        this.isSaving = false;
        this.notify.error('No se pudo registrar el préstamo');
      }
    });
  }

  onCancel() {
    this.cancelled.emit();
  }
}
