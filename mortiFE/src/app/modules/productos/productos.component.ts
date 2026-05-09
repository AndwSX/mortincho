import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto } from '../../core/services/producto.service';

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

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.loadProductos();
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

  toggleEstado(producto: Producto): void {
    // Para propósitos de demostración, cambiaremos el estado localmente
    // ya que no confirmamos si el endpoint de toggle existe en el backend real.
    // Pero la lógica de llamada al servicio sería esta:
    /*
    this.productoService.toggleEstado(producto.id_producto).subscribe(() => {
      producto.activo = !producto.activo;
    });
    */
    producto.activo = !producto.activo;
  }
}
