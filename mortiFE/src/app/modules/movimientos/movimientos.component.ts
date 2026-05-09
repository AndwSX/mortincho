import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovimientosService, MovimientoSaldo, Prestamo, Deuda } from '../../core/services/movimientos.service';
import { UiService } from '../../core/services/ui.service';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimientos.component.html',
  styleUrl: './movimientos.component.css'
})
export class MovimientosComponent implements OnInit {
  activeTab: 'movimientos' | 'prestamos' | 'deudas' = 'movimientos';
  
  movimientos: MovimientoSaldo[] = [];
  prestamos: Prestamo[] = [];
  deudas: Deuda[] = [];

  filteredMovimientos: MovimientoSaldo[] = [];
  filteredPrestamos: Prestamo[] = [];
  filteredDeudas: Deuda[] = [];

  isLoading: boolean = false;
  searchTerm: string = '';
  
  kpis = {
    ingresosMes: 0,
    gastosMes: 0,
    prestamosPendientes: 0,
    capitalDisponible: 0,
    balanceGeneral: 0
  };

  constructor(
    private movimientosService: MovimientosService,
    private uiService: UiService
  ) {}

  ngOnInit() {
    this.uiService.movimientoSaldoSaved$.subscribe(() => {
      this.loadData();
    });

    this.uiService.entidadSaved$.subscribe(() => {
      this.loadData();
    });

    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    
    // Load Capital
    this.movimientosService.getCapital().subscribe({
      next: (res) => this.kpis.capitalDisponible = Number(res.capital_actual) || 0,
      error: (err) => console.error('Error fetching capital', err)
    });

    // Load Movimientos
    this.movimientosService.getMovimientosSaldo().subscribe({
      next: (data) => {
        this.movimientos = Array.isArray(data) ? data : [];
        this.applyFilters();
        this.calculateMovimientoKPIs();
      },
      error: (err) => console.error('Error fetching movimientos', err)
    });

    // Load Prestamos
    this.movimientosService.getPrestamos().subscribe({
      next: (data) => {
        this.prestamos = Array.isArray(data) ? data : [];
        this.applyFilters();
        this.calculatePrestamosKPIs();
      },
      error: (err) => console.error('Error fetching prestamos', err)
    });

    // Load Deudas
    this.movimientosService.getDeudas().subscribe({
      next: (data) => {
        this.deudas = Array.isArray(data) ? data : [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching deudas', err);
        this.isLoading = false;
      }
    });
  }

  setTab(tab: 'movimientos' | 'prestamos' | 'deudas') {
    this.activeTab = tab;
    this.searchTerm = '';
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  applyFilters() {
    const search = this.searchTerm?.toLowerCase() || '';
    
    if (this.activeTab === 'movimientos') {
      this.filteredMovimientos = (this.movimientos || []).filter(m => 
        (m.concepto || '').toLowerCase().includes(search) || 
        (m.tipo || '').toLowerCase().includes(search)
      );
    } else if (this.activeTab === 'prestamos') {
      this.filteredPrestamos = (this.prestamos || []).filter(p => 
        (p.concepto || '').toLowerCase().includes(search) || 
        (p.estado || '').toLowerCase().includes(search)
      );
    } else if (this.activeTab === 'deudas') {
      this.filteredDeudas = (this.deudas || []).filter(d => 
        (d.concepto || '').toLowerCase().includes(search) || 
        (d.estado || '').toLowerCase().includes(search)
      );
    }
  }

  calculateMovimientoKPIs() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let ingresos = 0;
    let gastos = 0;
    
    let totalIngresosHist = 0;
    let totalGastosHist = 0;

    this.movimientos.forEach(m => {
      const monto = Number(m.monto) || 0;
      
      // Historial para balance general (solo ingresos y gastos puros)
      if (m.tipo === 'ingreso') {
        totalIngresosHist += monto;
      } else if (m.tipo === 'gasto') {
        totalGastosHist += monto;
      }

      const mDate = new Date(m.fecha);
      if (mDate.getMonth() === currentMonth && mDate.getFullYear() === currentYear) {
        if (m.tipo === 'ingreso' || m.tipo === 'prestamo_recibido') {
          ingresos += monto;
        } else if (m.tipo === 'gasto' || m.tipo === 'prestamo_entregado') {
          gastos += monto;
        }
      }
    });

    this.kpis.ingresosMes = ingresos;
    this.kpis.gastosMes = gastos;
    this.kpis.balanceGeneral = totalIngresosHist - totalGastosHist;
  }

  calculatePrestamosKPIs() {
    let pendientes = 0;
    this.prestamos.forEach(p => {
      if (p.estado === 'activo' || p.estado === 'pendiente' || p.estado === 'pagando') {
        pendientes += Number(p.saldo_restante) || 0;
      }
    });
    this.kpis.prestamosPendientes = pendientes;
  }

  isPositive(tipo: string): boolean {
    return tipo === 'ingreso' || tipo === 'prestamo_recibido';
  }

  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'ingreso': 'Ingreso',
      'gasto': 'Gasto',
      'prestamo_entregado': 'Préstamo Entregado',
      'prestamo_recibido': 'Préstamo Recibido'
    };
    return labels[tipo] || tipo;
  }

  openNuevoMovimiento(tipo: 'ingreso' | 'gasto') {
    this.uiService.openDrawer('movimiento_saldo', 'create', {
      tipo: tipo,
      concepto: '',
      monto: null,
      afecta_capital: true,
      referencia_tabla: null,
      referencia_id: null,
      observaciones: ''
    });
  }

  openNuevaEntidad(entidad: 'prestamo' | 'deuda') {
    this.uiService.openDrawer(entidad, 'create', {
      tipo: entidad === 'prestamo' ? 'entregado' : undefined,
      concepto: '',
      monto_total: null,
      observaciones: ''
    });
  }

  openPagoEntidad(item: any, entidad: 'prestamo' | 'deuda') {
    this.uiService.openDrawer('pago_entidad', 'create', {
      entidad: entidad,
      id: entidad === 'prestamo' ? item.id_prestamo : item.id_deuda,
      saldo_restante: item.saldo_restante,
      monto: null,
      observaciones: ''
    });
  }
}
