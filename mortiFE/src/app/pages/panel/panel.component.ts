import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../core/navbar/navbar.component';
import { SidebarComponent } from '../../core/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { UiService, DrawerData, DrawerType } from '../../core/services/ui.service';
import { CommonModule } from '@angular/common';
import { SharedDrawerComponent } from '../../shared/components/drawer/drawer.component';
import { ProductoDrawerComponent } from '../../shared/drawers/producto-drawer.component';
import { MovimientoDrawerComponent } from '../../shared/drawers/movimiento-drawer.component';

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
    MovimientoDrawerComponent
  ],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css'
})
export class PanelComponent implements OnInit {
  isDrawerOpen: boolean = false;
  drawerType: DrawerType = 'none';
  drawerMode: 'create' | 'edit' = 'create';
  
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
    return 'Formulario';
  }

  get drawerSubtitle(): string {
    if (this.drawerType === 'producto') {
      return this.drawerMode === 'create' ? 'Agrega un nuevo producto al catálogo.' : 'Actualiza la información del producto.';
    }
    if (this.drawerType === 'movimiento') {
      return 'Registra entradas, salidas o ajustes masivos.';
    }
    return 'Completa los datos necesarios.';
  }

  closeDrawer() {
    this.uiService.closeDrawer();
  }

  handleSaved() {
    this.uiService.notifyProductSaved();
    this.closeDrawer();
  }
}
