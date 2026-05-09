import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginData = {
    usuario: '',
    password: ''
  };
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        console.log('Login exitoso', response);
        // Guardamos el token
        this.authService.setToken(response.access_token);
        this.isLoading = false;
        this.router.navigate(['/app']);
      },
      error: (err) => {
        console.error('Error en login', err);
        this.isLoading = false;
        this.errorMessage = 'Usuario o contraseña incorrectos. Inténtalo de nuevo.';
      }
    });
  }
}
