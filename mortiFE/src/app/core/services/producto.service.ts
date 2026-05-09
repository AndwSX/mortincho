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
   * Obtiene un producto por ID.
   */
  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/productos/${id}`);
  }

  /**
   * Crea un nuevo producto.
   */
  createProducto(producto: { nombre: string; descripcion: string }): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}/productos/`, producto);
  }

  /**
   * Actualiza un producto existente.
   */
  updateProducto(id: number, producto: { nombre: string; descripcion: string }): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/productos/${id}`, producto);
  }

  /**
   * Cambia el estado (activo/inactivo) de un producto.
   */
  cambiarEstado(id: number, activo: boolean): Observable<Producto> {
    return this.http.patch<Producto>(`${this.apiUrl}/productos/${id}/estado`, { activo });
  }
}
