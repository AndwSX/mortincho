import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export type DrawerType = 'producto' | 'venta' | 'movimiento' | 'pago' | 'none';

export interface DrawerData {
  open: boolean;
  type: DrawerType;
  mode: 'create' | 'edit' | 'view';
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private drawerState = new BehaviorSubject<DrawerData>({ 
    open: false, 
    type: 'none', 
    mode: 'create' 
  });
  drawerState$ = this.drawerState.asObservable();

  private productSaved = new Subject<void>();
  productSaved$ = this.productSaved.asObservable();

  private ventaSaved = new Subject<void>();
  ventaSaved$ = this.ventaSaved.asObservable();

  private pagoSaved = new Subject<void>();
  pagoSaved$ = this.pagoSaved.asObservable();

  openDrawer(type: DrawerType, mode: 'create' | 'edit' | 'view', data?: any) {
    this.drawerState.next({ open: true, type, mode, data });
  }

  closeDrawer() {
    this.drawerState.next({ ...this.drawerState.value, open: false });
  }

  notifyProductSaved() {
    this.productSaved.next();
  }

  notifyVentaSaved() {
    this.ventaSaved.next();
  }

  notifyPagoSaved() {
    this.pagoSaved.next();
  }
}
