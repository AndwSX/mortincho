import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../core/navbar/navbar.component';
import { SidebarComponent } from '../../core/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { UiService, DrawerData, DrawerType } from '../../core/services/ui.service';
import { CommonModule } from '@angular/common';
import { SharedDrawerComponent } from '../../shared/components/drawer/drawer.component';
import { ProductoDrawerComponent } from '../../shared/drawers/producto-drawer.component';
import { MovimientoDrawerComponent } from '../../shared/drawers/movimiento-drawer.component';
import { VentaDrawerComponent } from '../../shared/drawers/venta-drawer.component';
import { PagoDrawerComponent } from '../../shared/drawers/pago-drawer.component';
import { MovimientoSaldoDrawerComponent } from '../../shared/drawers/movimiento-saldo-drawer.component';
import { PrestamoDrawerComponent } from '../../shared/drawers/prestamo-drawer.component';
import { DeudaDrawerComponent } from '../../shared/drawers/deuda-drawer.component';
import { PagoEntidadDrawerComponent } from '../../shared/drawers/pago-entidad-drawer.component';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [
    RouterOutlet, 
    NavbarComponent, 
    SidebarComponent, 
    CommonModule, 
    SharedDrawerComponent,
    ProductoDrawerComponent,
    MovimientoDrawerComponent,
    VentaDrawerComponent,
    PagoDrawerComponent,
    MovimientoSaldoDrawerComponent,
    PrestamoDrawerComponent,
    DeudaDrawerComponent,
    PagoEntidadDrawerComponent
  ],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css'
})
export class PanelComponent implements OnInit {
  isDrawerOpen: boolean = false;
  drawerType: DrawerType = 'none';
  drawerMode: DrawerData['mode'] = 'create';
  
  drawerData: any = null;

  constructor(private uiService: UiService) {}

  ngOnInit() {
    this.uiService.drawerState$.subscribe((state: DrawerData) => {
      this.isDrawerOpen = state.open;
      this.drawerType = state.type;
      this.drawerMode = state.mode;
      this.drawerData = state.data ? { ...state.data } : { nombre: '', descripcion: '' };
    });
  }

  get drawerTitle(): string {
    if (this.drawerType === 'producto') {
      return this.drawerMode === 'create' ? 'Nuevo Producto' : 'Editar Producto';
    }
    if (this.drawerType === 'movimiento') {
      return 'Registrar Movimientos';
    }
    if (this.drawerType === 'venta') {
      if (this.drawerMode === 'view') return 'Detalles de la Venta';
      return this.drawerMode === 'create' ? 'Nueva Venta' : 'Editar Venta';
    }
    if (this.drawerType === 'pago') {
      return 'Registrar Pago';
    }
    if (this.drawerType === 'movimiento_saldo') {
      return this.drawerData?.tipo === 'ingreso' ? 'Registrar Ingreso' : 'Registrar Gasto';
    }
    if (this.drawerType === 'prestamo') return 'Registrar Préstamo';
    if (this.drawerType === 'deuda') return 'Registrar Deuda';
    if (this.drawerType === 'pago_entidad') return 'Abonar Pago';

    return 'Formulario';
  }

  get drawerSubtitle(): string {
    if (this.drawerType === 'producto') {
      return this.drawerMode === 'create' ? 'Agrega un nuevo producto al catálogo.' : 'Actualiza la información del producto.';
    }
    if (this.drawerType === 'movimiento') {
      return 'Registra entradas, salidas o ajustes masivos.';
    }
    if (this.drawerType === 'venta') {
      if (this.drawerMode === 'view') return 'Información completa y cronograma de pagos.';
      return this.drawerMode === 'create' ? 'Registra una nueva venta.' : 'Actualiza los datos de la venta.';
    }
    if (this.drawerType === 'pago') {
      return 'Abona al saldo pendiente de la venta.';
    }
    if (this.drawerType === 'movimiento_saldo') {
      return 'Agrega un nuevo movimiento al balance general.';
    }
    if (this.drawerType === 'prestamo') return 'Agrega un nuevo préstamo.';
    if (this.drawerType === 'deuda') return 'Agrega una nueva deuda.';
    if (this.drawerType === 'pago_entidad') return 'Abona al saldo pendiente de la entidad.';

    return 'Completa los datos necesarios.';
  }

  closeDrawer() {
    this.uiService.closeDrawer();
  }

  handleSaved() {
    if (this.drawerType === 'producto') {
      this.uiService.notifyProductSaved();
    } else if (this.drawerType === 'venta') {
      this.uiService.notifyVentaSaved();
    } else if (this.drawerType === 'pago') {
      this.uiService.notifyPagoSaved();
    } else if (this.drawerType === 'movimiento_saldo') {
      this.uiService.notifyMovimientoSaldoSaved();
    } else if (['prestamo', 'deuda', 'pago_entidad'].includes(this.drawerType)) {
      this.uiService.notifyEntidadSaved();
    }
    this.closeDrawer();
  }
}
