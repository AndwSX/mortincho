import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MovimientoSaldo {
  id_movimiento: number;
  tipo: string;
  concepto: string;
  monto: string | number;
  fecha: string;
  afecta_capital: boolean;
  referencia_tabla?: string;
  referencia_id?: number;
  observaciones?: string;
}

export interface Prestamo {
  id_prestamo: number;
  tipo: string;
  concepto: string;
  monto_total: string | number;
  saldo_restante: string | number;
  fecha: string;
  estado: string;
  observaciones?: string;
  pagos?: any[];
}

export interface Deuda {
  id_deuda: number;
  concepto: string;
  monto_total: string | number;
  saldo_restante: string | number;
  fecha: string;
  estado: string;
  observaciones?: string;
  pagos?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class MovimientosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMovimientosSaldo(): Observable<MovimientoSaldo[]> {
    return this.http.get<MovimientoSaldo[]>(`${this.apiUrl}/movimientos-saldo/`);
  }

  getCapital(): Observable<{ capital_actual: string }> {
    return this.http.get<{ capital_actual: string }>(`${this.apiUrl}/movimientos-saldo/capital`);
  }

  getPrestamos(): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(`${this.apiUrl}/prestamos/`);
  }

  getDeudas(): Observable<Deuda[]> {
    return this.http.get<Deuda[]>(`${this.apiUrl}/deudas/`);
  }

  createMovimientoSaldo(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/movimientos-saldo/`, data);
  }

  createPrestamo(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/prestamos/`, data);
  }

  payPrestamo(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/prestamos/pagos`, data);
  }

  createDeuda(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/deudas/`, data);
  }

  payDeuda(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/deudas/pagos`, data);
  }
}
