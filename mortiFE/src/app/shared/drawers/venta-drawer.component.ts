import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService, Venta } from '../../core/services/ventas.service';
import { ProductoService, Producto } from '../../core/services/producto.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-venta-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
        <!-- FORMULARIO DE CREACIÓN (Solo si el modo no es 'view') -->
        <form *ngIf="mode !== 'view'" (submit)="$event.preventDefault()" class="space-y-6">
            <!-- Cliente -->
            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300 ml-1">Nombre del Cliente</label>
                <div class="relative group">
                    <i class="bi bi-person absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"></i>
                    <input 
                        type="text" 
                        [(ngModel)]="form.nombre_cliente"
                        name="nombre_cliente"
                        class="input-field w-full pl-12" 
                        placeholder="Ej: Juan Pérez" 
                        required>
                </div>
            </div>

            <!-- Producto -->
            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300 ml-1">Producto</label>
                <div class="relative group">
                    <i class="bi bi-box-seam absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"></i>
                    <select 
                        [(ngModel)]="form.id_producto"
                        name="id_producto"
                        class="input-field w-full pl-12 bg-[#18181b]"
                        required>
                        <option [value]="0" disabled>Seleccione un producto</option>
                        <option *ngFor="let prod of productos" [value]="prod.id_producto">
                            {{ prod.nombre }} (Stock: {{ prod.stock_actual }})
                        </option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <!-- Total -->
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-300 ml-1">Total Venta</label>
                    <div class="relative group">
                        <i class="bi bi-currency-dollar absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"></i>
                        <input 
                            type="number" 
                            [(ngModel)]="form.total_venta"
                            name="total_venta"
                            class="input-field w-full pl-12" 
                            placeholder="0.00" 
                            required>
                    </div>
                </div>

                <!-- Anticipo (Entrada) -->
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-300 ml-1">Entrada</label>
                    <div class="relative group">
                        <i class="bi bi-cash absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"></i>
                        <input 
                            type="number" 
                            [(ngModel)]="form.anticipo"
                            name="anticipo"
                            class="input-field w-full pl-12" 
                            placeholder="0.00">
                    </div>
                </div>
            </div>

            <!-- Cuotas -->
            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300 ml-1">Número de Cuotas</label>
                <div class="relative group">
                    <i class="bi bi-calendar-range absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"></i>
                    <input 
                        type="number" 
                        [(ngModel)]="form.numero_cuotas"
                        name="numero_cuotas"
                        class="input-field w-full pl-12" 
                        placeholder="0 para contado">
                </div>
                <p class="text-[10px] text-gray-500 ml-1">Usa 0 para ventas de contado.</p>
            </div>

            <div class="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                <div class="flex gap-3">
                    <i class="bi bi-info-circle text-blue-500 mt-0.5"></i>
                    <p class="text-[11px] text-gray-400 leading-relaxed">
                        Al registrar la venta, el stock se actualizará automáticamente y se generarán los pagos correspondientes.
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
                    <span class="text-lg font-semibold">{{ isSaving ? 'Procesando...' : 'Registrar Venta' }}</span>
                </button>
            </div>
        </form>

        <!-- VISTA DE DETALLES (Solo si el modo es 'view') -->
        <div *ngIf="mode === 'view'" class="space-y-8">
            <div class="grid grid-cols-2 gap-4">
                <div class="glass p-4 rounded-2xl">
                    <p class="text-[10px] text-gray-500 uppercase font-bold mb-1">Cliente</p>
                    <p class="text-white font-medium">{{ form.nombre_cliente }}</p>
                </div>
                <div class="glass p-4 rounded-2xl">
                    <p class="text-[10px] text-gray-500 uppercase font-bold mb-1">Estado</p>
                    <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase border"
                        [ngClass]="getEstadoClass(form.estado)">
                        {{ form.estado }}
                    </span>
                </div>
                <div class="glass p-4 rounded-2xl">
                    <p class="text-[10px] text-gray-500 uppercase font-bold mb-1">Total</p>
                    <p class="text-white font-bold text-lg">&#36;{{ form.total_venta }}</p>
                </div>
                <div class="glass p-4 rounded-2xl text-blue-400">
                    <p class="text-[10px] text-gray-500 uppercase font-bold mb-1">Saldo Pendiente</p>
                    <p class="font-bold text-lg">&#36;{{ form.saldo_pendiente }}</p>
                </div>
            </div>

            <div class="space-y-4">
                <h3 class="text-sm font-bold text-white flex items-center gap-2">
                    <i class="bi bi-list-check text-blue-500"></i>
                    Cronograma de Cuotas
                </h3>
                
                <div *ngIf="form.cuotas && form.cuotas.length > 0; else noCuotas" class="space-y-2">
                    <div *ngFor="let cuota of form.cuotas" 
                        class="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <div class="flex items-center gap-4">
                            <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-gray-400">
                                {{ cuota.numero_cuota }}
                            </div>
                            <div>
                                <p class="text-sm font-semibold text-white">&#36;{{ cuota.valor_original }}</p>
                                <p class="text-[10px] text-gray-500">{{ cuota.fecha_vencimiento | date:'dd/MM/yyyy' }}</p>
                            </div>
                        </div>
                        <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase border"
                            [ngClass]="getCuotaEstadoClass(cuota.estado)">
                            {{ cuota.estado }}
                        </span>
                    </div>
                </div>
                <ng-template #noCuotas>
                    <div class="p-8 text-center glass rounded-3xl border-dashed border-white/10">
                        <i class="bi bi-check-circle text-green-500 text-3xl mb-2 block opacity-50"></i>
                        <p class="text-gray-500 text-sm">Venta de contado sin cuotas pendientes.</p>
                    </div>
                </ng-template>
            </div>

            <div footer class="w-full">
                <button 
                    (click)="onCancel()"
                    class="w-full py-3 rounded-2xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-all">
                    Cerrar Detalles
                </button>
            </div>
        </div>
    </div>
  `
})
export class VentaDrawerComponent implements OnInit {
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() form: any = {
    id_producto: 0,
    nombre_cliente: '',
    total_venta: 0,
    anticipo: 0,
    numero_cuotas: 0
  };
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  productos: Producto[] = [];
  isSaving = false;

  constructor(
    private ventasService: VentasService,
    private productoService: ProductoService,
    private notify: NotificationService
  ) {}

  ngOnInit() {
    this.loadProductos();
    console.log('VentaDrawerComponent initialized with mode:', this.mode, 'and data:', this.form);
  }

  loadProductos() {
    this.productoService.getProductos(true).subscribe({
      next: (prods) => {
        this.productos = prods;
        console.log('Productos loaded:', prods.length);
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.notify.error('No se pudieron cargar los productos');
      }
    });
  }

  isValid() {
    return this.form.nombre_cliente && 
           this.form.id_producto > 0 && 
           this.form.total_venta > 0;
  }

  getEstadoClass(estado: string): string {
    switch(estado?.toLowerCase()) {
      case 'pendiente': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'pagando': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'pagado': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-white/5 text-gray-400 border-white/10';
    }
  }

  getCuotaEstadoClass(estado: string): string {
    switch(estado?.toLowerCase()) {
      case 'pagada': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'vencida': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    }
  }

  onSave() {
    if (!this.isValid()) return;

    this.isSaving = true;
    this.ventasService.createVenta(this.form).subscribe({
      next: () => {
        this.isSaving = false;
        this.notify.success('Venta registrada exitosamente');
        this.saved.emit();
      },
      error: (err: any) => {
        console.error('Error saving sale', err);
        this.isSaving = false;
        this.notify.error(err.error?.detail || 'No se pudo registrar la venta');
      }
    });
  }

  onCancel() {
    this.cancelled.emit();
  }
}
