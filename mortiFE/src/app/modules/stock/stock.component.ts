import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService, Movimiento } from '../../core/services/inventario.service';
import { ProductoService, Producto } from '../../core/services/producto.service';
import { UiService } from '../../core/services/ui.service';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.css'
})
export class StockComponent implements OnInit {
  movimientos: Movimiento[] = [];
  filteredMovimientos: Movimiento[] = [];
  productos: Producto[] = [];
  
  // Filtros
  searchTerm: string = '';
  filtroTipo: string = 'todos';
  isLoading: boolean = false;

  // KPIs
  totalEntradas: number = 0;
  totalSalidas: number = 0;
  stockTotal: number = 0;

  constructor(
    private inventarioService: InventarioService,
    private productoService: ProductoService,
    private uiService: UiService
  ) {}

  ngOnInit(): void {
    this.loadData();

    // Recargar datos cuando se guarde un movimiento
    this.uiService.productSaved$.subscribe(() => {
      this.loadData();
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.productoService.getProductos().subscribe(prods => {
      this.productos = prods;
      this.stockTotal = this.productos.reduce((acc, curr) => acc + (curr.stock_actual || 0), 0);
      
      this.inventarioService.getMovimientos().subscribe({
        next: (data) => {
          this.movimientos = data.map(m => ({
            ...m,
            nombre_producto: this.productos.find(p => p.id_producto === m.id_producto)?.nombre || 'Producto Desconocido'
          }));
          this.applyFilters();
          this.calculateKPIs();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading movements', err);
          this.isLoading = false;
        }
      });
    });
  }

  calculateKPIs(): void {
    this.totalEntradas = this.movimientos
      .filter(m => m.tipo_movimiento === 'entrada' || m.tipo_movimiento === 'ajuste_entrada')
      .reduce((acc, curr) => acc + curr.cantidad, 0);

    this.totalSalidas = this.movimientos
      .filter(m => m.tipo_movimiento === 'salida' || m.tipo_movimiento === 'ajuste_salida')
      .reduce((acc, curr) => acc + curr.cantidad, 0);
  }

  openMovimientoDrawer(): void {
    this.uiService.openDrawer('movimiento', 'create');
  }

  applyFilters(): void {
    this.filteredMovimientos = this.movimientos.filter(m => {
      const matchSearch = m.nombre_producto?.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                          m.motivo?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchTipo = this.filtroTipo === 'todos' || m.tipo_movimiento === this.filtroTipo;
      
      return matchSearch && matchTipo;
    });
  }

  getTipoLabel(tipo: string): string {
    const labels: any = {
      'entrada': 'Entrada',
      'salida': 'Salida',
      'ajuste_entrada': 'Ajuste (+)',
      'ajuste_salida': 'Ajuste (-)'
    };
    return labels[tipo] || tipo;
  }

  isPositive(tipo: string): boolean {
    return tipo === 'entrada' || tipo === 'ajuste_entrada';
  }
}
