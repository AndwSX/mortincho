import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Venta {
  id_venta?: number;
  id_producto: number;
  nombre_cliente: string;
  total_venta: number;
  anticipo: number;
  numero_cuotas: number;
  fecha_venta?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getVentas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ventas/`);
  }

  createVenta(venta: Venta): Observable<any> {
    return this.http.post(`${this.apiUrl}/ventas/`, venta);
  }
}
