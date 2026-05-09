import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Cierra la sesión del usuario.
   */
  logout(): void {
    this.removeToken();
    this.router.navigate(['/login']);
  }

  /**
   * Inicia sesión en el backend.
   * @param credentials Objeto con usuario y password.
   */
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials);
  }

  /**
   * Registra un nuevo usuario en el backend.
   * @param userData Objeto con usuario, correo y password.
   */
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/registro`, userData);
  }

  /**
   * Guarda el token JWT en el almacenamiento local.
   * @param token El token JWT recibido del backend.
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Obtiene el token JWT del almacenamiento local.
   * @returns El token JWT o null si no existe.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Elimina el token JWT del almacenamiento local.
   */
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Verifica si el usuario está autenticado comprobando la existencia del token.
   * @returns true si el token existe, false en caso contrario.
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  /**
   * Obtiene el perfil del usuario autenticado.
   */
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios/me`);
  }
}
