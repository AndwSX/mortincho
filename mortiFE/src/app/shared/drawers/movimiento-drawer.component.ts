import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../core/services/inventario.service';
import { ProductoService, Producto } from '../../core/services/producto.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-movimiento-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
        <!-- Tipo y Motivo -->
        <div class="space-y-6">
            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300 ml-1">Tipo de Movimiento</label>
                <div class="grid grid-cols-2 gap-3">
                    <button 
                        *ngFor="let tipo of tipos"
                        (click)="form.tipo_movimiento = tipo.id"
                        [ngClass]="form.tipo_movimiento === tipo.id ? tipo.activeClass : 'bg-white/5 border-white/5 text-gray-500'"
                        class="px-4 py-3 rounded-2xl border text-xs font-bold uppercase tracking-wider transition-all">
                        {{ tipo.label }}
                    </button>
                </div>
            </div>

            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300 ml-1">Motivo / Observaciones</label>
                <textarea 
                    [(ngModel)]="form.motivo"
                    rows="3"
                    class="input-field w-full py-3 resize-none" 
                    placeholder="Escribe el motivo del movimiento..."></textarea>
            </div>
        </div>

        <!-- Lista de Productos -->
        <div class="space-y-4">
            <div class="flex items-center justify-between ml-1">
                <label class="text-sm font-medium text-gray-300">Productos involucrados</label>
                <button (click)="addProductRow()" class="text-blue-500 hover:text-blue-400 text-xs font-bold uppercase flex items-center gap-1 transition-all">
                    <i class="bi bi-plus-circle"></i> Añadir
                </button>
            </div>

            <div class="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                <div *ngFor="let item of form.productos; let i = index" class="glass p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-3 items-end relative group/item">
                    
                    <!-- Select Producto -->
                    <div class="flex-1 w-full space-y-1.5">
                        <label class="text-[10px] uppercase font-bold text-gray-500 ml-1">Producto</label>
                        <select 
                            [(ngModel)]="item.id_producto"
                            (change)="onProductChange()"
                            class="input-field w-full py-2 text-sm bg-[#18181b]">
                            <option [value]="0" disabled>Selecciona un producto...</option>
                            <option 
                                *ngFor="let p of getAvailableProducts(i)" 
                                [value]="p.id_producto">
                                {{ p.nombre }}
                            </option>
                        </select>
                    </div>

                    <!-- Control de Cantidad (Compacto) -->
                    <div class="w-full sm:w-28 space-y-1.5">
                        <label class="text-[10px] uppercase font-bold text-gray-500 ml-1">Cantidad</label>
                        <div class="flex items-center bg-[#18181b] rounded-xl border border-white/10 overflow-hidden h-[38px]">
                            <button (click)="decrement(item)" class="px-2.5 h-full hover:bg-white/5 text-gray-400 transition-colors">
                                <i class="bi bi-dash text-lg"></i>
                            </button>
                            <input 
                                type="number" 
                                [(ngModel)]="item.cantidad"
                                min="1"
                                class="w-full bg-transparent text-center text-sm border-none focus:ring-0 appearance-none no-spinner p-0">
                            <button (click)="increment(item)" class="px-2.5 h-full hover:bg-white/5 text-gray-400 transition-colors">
                                <i class="bi bi-plus text-lg"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Eliminar Fila -->
                    <button 
                        *ngIf="form.productos.length > 1"
                        (click)="removeProductRow(i)"
                        class="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all mb-0.5">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div footer class="flex gap-3 w-full pt-4">
            <button 
                (click)="onCancel()"
                class="flex-1 py-3 rounded-2xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-all">
                Cancelar
            </button>
            <button 
                (click)="onSave()"
                [disabled]="!isFormValid() || isSaving"
                class="btn-primary flex-1 py-3 rounded-2xl flex items-center justify-center gap-2">
                <span *ngIf="isSaving" class="spinner"></span>
                <span class="text-lg font-semibold">{{ isSaving ? 'Registrando...' : 'Registrar Todo' }}</span>
            </button>
        </div>
    </div>
  `,
  styles: [`
    .no-spinner::-webkit-inner-spin-button, 
    .no-spinner::-webkit-outer-spin-button { 
      -webkit-appearance: none; 
      margin: 0; 
    }
    .no-spinner { -moz-appearance: textfield; }
    
    /* Ajuste de altura del select para igualar al control de cantidad */
    select.input-field {
        height: 38px;
    }
  `]
})
export class MovimientoDrawerComponent implements OnInit {
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  productosList: Producto[] = [];
  isSaving = false;

  tipos = [
    { id: 'entrada', label: 'Entrada', activeClass: 'bg-green-500/10 border-green-500/50 text-green-500' },
    { id: 'salida', label: 'Salida', activeClass: 'bg-red-500/10 border-red-500/50 text-red-500' },
    { id: 'ajuste_entrada', label: 'Ajuste (+)', activeClass: 'bg-blue-500/10 border-blue-500/50 text-blue-500' },
    { id: 'ajuste_salida', label: 'Ajuste (-)', activeClass: 'bg-orange-500/10 border-orange-500/50 text-orange-500' }
  ];

  form = {
    tipo_movimiento: 'entrada',
    motivo: '',
    productos: [
      { id_producto: 0, cantidad: 1 }
    ]
  };

  constructor(
    private inventarioService: InventarioService,
    private productoService: ProductoService,
    private notify: NotificationService
  ) {}

  ngOnInit() {
    this.productoService.getProductos().subscribe(prods => {
      this.productosList = prods;
    });
  }

  // Filtrado reactivo de productos
  getAvailableProducts(index: number): Producto[] {
    // Obtenemos los IDs seleccionados en OTRAS filas (convertidos a Number)
    const otherSelectedIds = this.form.productos
      .filter((_, i) => i !== index)
      .map(p => Number(p.id_producto))
      .filter(id => id !== 0);
    
    return this.productosList.filter(p => !otherSelectedIds.includes(p.id_producto));
  }

  onProductChange() {
    // Forzamos la detección de cambios para los filtros
    this.form.productos = [...this.form.productos];
  }

  increment(item: any) {
    item.cantidad++;
  }

  decrement(item: any) {
    if (item.cantidad > 1) item.cantidad--;
  }

  addProductRow() {
    this.form.productos.push({ id_producto: 0, cantidad: 1 });
  }

  removeProductRow(index: number) {
    this.form.productos.splice(index, 1);
  }

  isFormValid(): boolean {
    return this.form.motivo.length > 0 && 
           this.form.productos.length > 0 &&
           this.form.productos.every(p => Number(p.id_producto) > 0 && p.cantidad > 0);
  }

  onSave() {
    this.isSaving = true;
    
    // Aseguramos que los IDs vayan como números al backend
    const payload = {
      ...this.form,
      productos: this.form.productos.map(p => ({
        id_producto: Number(p.id_producto),
        cantidad: p.cantidad
      }))
    };

    this.inventarioService.registerMovimiento(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.notify.success('Movimientos registrados correctamente');
        this.saved.emit();
        this.resetForm();
      },
      error: (err: any) => {
        this.isSaving = false;
        this.notify.error('Error al registrar movimientos');
        console.error(err);
      }
    });
  }

  onCancel() {
    this.cancelled.emit();
    this.resetForm();
  }

  private resetForm() {
    this.form = {
      tipo_movimiento: 'entrada',
      motivo: '',
      productos: [{ id_producto: 0, cantidad: 1 }]
    };
  }
}
