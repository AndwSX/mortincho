import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export type DrawerType = 'producto' | 'venta' | 'movimiento' | 'none';

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

  openDrawer(type: DrawerType, mode: 'create' | 'edit' | 'view', data?: any) {
    this.drawerState.next({ open: true, type, mode, data });
  }

  closeDrawer() {
    this.drawerState.next({ ...this.drawerState.value, open: false });
  }

  notifyProductSaved() {
    this.productSaved.next();
  }
}
