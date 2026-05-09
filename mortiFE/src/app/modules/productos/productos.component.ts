import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto } from '../../core/services/producto.service';
import { UiService } from '../../core/services/ui.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  filteredProductos: Producto[] = [];
  searchTerm: string = '';
  soloActivos: boolean = false;
  isLoading: boolean = false;

  constructor(
    private productoService: ProductoService,
    private uiService: UiService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProductos();

    // Escuchar cuando se guarde un producto desde el drawer global
    this.uiService.productSaved$.subscribe(() => {
      this.loadProductos();
    });
  }

  loadProductos(): void {
    this.isLoading = true;
    this.productoService.getProductos(this.soloActivos).subscribe({
      next: (data) => {
        this.productos = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const search = this.searchTerm.toLowerCase();
    this.filteredProductos = this.productos.filter(p => 
      p.nombre.toLowerCase().includes(search) || 
      p.descripcion.toLowerCase().includes(search)
    );
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.loadProductos();
  }

  openCreateDrawer(): void {
    this.uiService.openDrawer('producto', 'create');
  }

  openEditDrawer(producto: Producto): void {
    this.uiService.openDrawer('producto', 'edit', producto);
  }

  toggleEstado(producto: Producto): void {
    const nuevoEstado = !producto.activo;
    
    this.productoService.cambiarEstado(producto.id_producto, nuevoEstado).subscribe({
      next: () => {
        producto.activo = nuevoEstado;
        this.notify.success(nuevoEstado ? 'Producto activado' : 'Producto desactivado');
      },
      error: (err: any) => {
        this.notify.error('Error al cambiar el estado del producto');
        console.error(err);
      }
    });
  }
}
