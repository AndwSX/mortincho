import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService, DrawerData } from '../../core/services/ui.service';
import { VentasService } from '../../core/services/ventas.service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css'
})
export class VentasComponent implements OnInit {
  ventas: any[] = [];
  filteredVentas: any[] = [];
  isLoading: boolean = false;
  drawerState: DrawerData = { open: false, type: 'none', mode: 'create' };

  searchTerm: string = '';
  filtroEstado: string = 'todos'; // todos, contado, financiadas

  kpis = {
    ventasHoyTotal: 0,
    pagosPendientes: 0,
    entradasTotal: 0,
    tasaCobranza: 0
  };

  constructor(
    private uiService: UiService,
    private ventasService: VentasService
  ) {}

  ngOnInit() {
    this.uiService.drawerState$.subscribe(state => {
      this.drawerState = state;
    });

    this.loadVentas();
  }

  loadVentas() {
    this.isLoading = true;
    this.ventasService.getVentas().subscribe({
      next: (data) => {
        this.ventas = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading sales', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    const search = this.searchTerm.toLowerCase();
    
    this.filteredVentas = this.ventas.filter(v => {
      const matchSearch = v.nombre_cliente.toLowerCase().includes(search) || 
                          (v.nombre_producto || '').toLowerCase().includes(search);
      
      let matchEstado = true;
      if (this.filtroEstado === 'contado') {
        matchEstado = !v.cuotas || v.cuotas.length === 0;
      } else if (this.filtroEstado === 'financiadas') {
        matchEstado = v.cuotas && v.cuotas.length > 0;
      }

      return matchSearch && matchEstado;
    });

    this.calculateKPIs();
  }

  calculateKPIs() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let ventasHoy = 0;
    let pendientes = 0;
    let entradasSum = 0;
    let totalCobrado = 0;
    let totalEsperado = 0;

    this.filteredVentas.forEach(v => {
      const vDate = new Date(v.fecha_venta);
      vDate.setHours(0, 0, 0, 0);

      // Ventas hoy
      if (vDate.getTime() === today.getTime()) {
        ventasHoy += Number(v.total_venta) || 0;
      }

      // Pagos pendientes (ventas no pagadas)
      if (v.estado !== 'pagado') {
        pendientes++;
      }

      // Entradas
      entradasSum += Number(v.anticipo) || 0;

      // Para tasa de cobranza
      const totalVenta = Number(v.total_venta) || 0;
      totalEsperado += totalVenta;
      
      // Cobrado = anticipo + cuotas pagadas
      let cobrado = Number(v.anticipo) || 0;
      if (v.cuotas && v.cuotas.length > 0) {
        v.cuotas.forEach((c: any) => {
          if (c.estado === 'pagada') {
            cobrado += Number(c.valor_original) || 0;
          }
        });
      } else if (v.estado === 'pagado') {
        cobrado = totalVenta; // Si es contado y está pagado
      }
      
      totalCobrado += cobrado;
    });

    this.kpis = {
      ventasHoyTotal: ventasHoy,
      pagosPendientes: pendientes,
      entradasTotal: entradasSum,
      tasaCobranza: totalEsperado > 0 ? (totalCobrado / totalEsperado) * 100 : 0
    };
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  openNuevaVenta() {
    this.uiService.openDrawer('venta', 'create', {
      id_producto: 0,
      nombre_cliente: '',
      total_venta: 0,
      anticipo: 0,
      numero_cuotas: 0
    });
  }

  verDetalles(venta: any) {
    this.uiService.openDrawer('venta', 'view', venta);
  }

  closeDrawer() {
    this.uiService.closeDrawer();
  }

  onVentaSaved() {
    this.closeDrawer();
    this.loadVentas();
  }
}
