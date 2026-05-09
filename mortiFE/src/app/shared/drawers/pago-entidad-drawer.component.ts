import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovimientosService } from '../../core/services/movimientos.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-pago-entidad-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
        <form (submit)="$event.preventDefault()" class="space-y-6">
            
            <div class="glass p-4 rounded-2xl mb-6">
                <p class="text-[10px] text-gray-500 uppercase font-bold mb-1">Saldo Pendiente Actual</p>
                <p class="text-white font-bold text-2xl">&#36;{{ form.saldo_restante }}</p>
            </div>

            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300 ml-1">Monto a Abonar</label>
                <div class="relative group">
                    <i class="bi bi-cash absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"></i>
                    <input 
                        type="number" 
                        [(ngModel)]="form.monto"
                        name="monto"
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
                    placeholder="Agrega detalles del pago..."></textarea>
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
                    <span class="text-lg font-semibold">{{ isSaving ? 'Procesando...' : 'Registrar Pago' }}</span>
                </button>
            </div>
        </form>
    </div>
  `
})
export class PagoEntidadDrawerComponent implements OnInit {
  @Input() form: any = {
    entidad: 'prestamo', // 'prestamo' | 'deuda'
    id: 0,
    saldo_restante: 0,
    monto: null,
    observaciones: ''
  };
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  isSaving = false;

  constructor(
    private movimientosService: MovimientosService,
    private notify: NotificationService
  ) {}

  ngOnInit() {
      // Initialize
  }

  isValid() {
    return this.form.monto && 
           this.form.monto > 0 && 
           this.form.monto <= this.form.saldo_restante && 
           this.form.id > 0;
  }

  onSave() {
    if (!this.isValid()) return;

    this.isSaving = true;

    const payload: any = {
        monto: this.form.monto,
        observaciones: this.form.observaciones.trim() === '' ? null : this.form.observaciones
    };

    let request$;

    if (this.form.entidad === 'prestamo') {
        payload.id_prestamo = this.form.id;
        request$ = this.movimientosService.payPrestamo(payload);
    } else {
        payload.id_deuda = this.form.id;
        request$ = this.movimientosService.payDeuda(payload);
    }

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.notify.success('Pago registrado exitosamente');
        this.saved.emit();
      },
      error: (err: any) => {
        console.error('Error saving payment', err);
        this.isSaving = false;
        this.notify.error('No se pudo registrar el pago');
      }
    });
  }

  onCancel() {
    this.cancelled.emit();
  }
}
