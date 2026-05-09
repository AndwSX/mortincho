import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  stock_actual: number;
  activo: boolean;
  fecha_creacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista de productos.
   * @param soloActivos Si es true, solo devuelve productos activos.
   */
  getProductos(soloActivos: boolean = false): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos/`, {
      params: { solo_activos: soloActivos.toString() }
    });
  }

  /**
   * Cambia el estado de un producto (Activar/Desactivar).
   * @param id ID del producto.
   */
  toggleEstado(id: number): Observable<any> {
    // Asumiendo que hay un endpoint para esto o que se hace vía PATCH
    return this.http.patch(`${this.apiUrl}/productos/${id}/toggle`, {});
  }
}
