import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../core/services/producto.service';
import { UiService } from '../../core/services/ui.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-producto-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (submit)="$event.preventDefault()" class="space-y-6">
        <div class="space-y-2">
            <label class="text-sm font-medium text-gray-300 ml-1">Nombre del Producto</label>
            <div class="relative group">
                <i class="bi bi-tag absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"></i>
                <input 
                    type="text" 
                    [(ngModel)]="form.nombre"
                    name="nombre"
                    class="input-field w-full pl-12" 
                    placeholder="Ej: Mesa de Comedor" 
                    required>
            </div>
        </div>

        <div class="space-y-2">
            <label class="text-sm font-medium text-gray-300 ml-1">Descripción</label>
            <div class="relative group">
                <i class="bi bi-justify-left absolute left-4 top-4 text-gray-500 group-focus-within:text-blue-500 transition-colors"></i>
                <textarea 
                    [(ngModel)]="form.descripcion"
                    name="descripcion"
                    rows="4"
                    class="input-field w-full pl-12 py-3 resize-none" 
                    placeholder="Detalles del producto..."></textarea>
            </div>
        </div>

        <div class="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
            <div class="flex gap-3">
                <i class="bi bi-info-circle text-blue-500 mt-0.5"></i>
                <p class="text-[11px] text-gray-400 leading-relaxed">
                    Al {{ mode === 'create' ? 'crear' : 'editar' }} el producto, los cambios se reflejarán inmediatamente.
                </p>
            </div>
        </div>

        <!-- Footer Buttons projected into the shared drawer -->
        <div footer class="flex gap-3 w-full">
            <button 
                (click)="onCancel()"
                class="flex-1 py-3 rounded-2xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-all">
                Cancelar
            </button>
            <button 
                (click)="onSave()"
                [disabled]="!form.nombre || isSaving"
                class="btn-primary flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 group">
                <span *ngIf="isSaving" class="spinner"></span>
                <span class="text-lg font-semibold">{{ isSaving ? 'Guardando...' : (mode === 'create' ? 'Crear Producto' : 'Guardar') }}</span>
            </button>
        </div>
    </form>
  `
})
export class ProductoDrawerComponent {
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() form: any = { nombre: '', descripcion: '' };
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  isSaving = false;

  constructor(
    private productoService: ProductoService,
    private notify: NotificationService
  ) {}

  onSave() {
    this.isSaving = true;
    const request = this.mode === 'create' 
      ? this.productoService.createProducto(this.form)
      : this.productoService.updateProducto(this.form.id_producto, this.form);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.notify.success(this.mode === 'create' ? 'Producto creado' : 'Cambios guardados');
        this.saved.emit();
      },
      error: (err: any) => {
        console.error('Error saving product', err);
        this.isSaving = false;
        this.notify.error('No se pudo guardar el producto');
      }
    });
  }

  onCancel() {
    this.cancelled.emit();
  }
}
