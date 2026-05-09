import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PagoRequest {
  id_venta: number;
  valor_pagado: number;
}

@Injectable({
  providedIn: 'root'
})
export class PagosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createPago(pago: PagoRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/pagos/`, pago);
  }
}
