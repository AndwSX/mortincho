import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Movimiento {
  id_movimiento: number;
  id_producto: number;
  tipo_movimiento: 'entrada' | 'salida' | 'ajuste_entrada' | 'ajuste_salida';
  cantidad: number;
  motivo: string;
  fecha_movimiento: string;
  // Estos campos suelen venir unidos en el backend o se pueden añadir
  nombre_producto?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMovimientos(id_producto?: number, limit: number = 100): Observable<Movimiento[]> {
    let url = `${this.apiUrl}/inventario/movimientos?limit=${limit}`;
    if (id_producto) {
      url += `&id_producto=${id_producto}`;
    }
    return this.http.get<Movimiento[]>(url);
  }

  registerMovimiento(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/inventario/movimientos`, data);
  }
}
