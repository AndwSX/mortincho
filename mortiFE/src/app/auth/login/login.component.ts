import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

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

  constructor(
    private authService: AuthService, 
    private router: Router,
    private notify: NotificationService
  ) {}

  onLogin() {
    if (this.isLoading) return;
    this.isLoading = true;
    
    this.authService.login(this.loginData).subscribe({
      next: (response: any) => {
        this.authService.setToken(response.access_token);
        this.isLoading = false;
        this.notify.success('¡Bienvenido de nuevo!');
        this.router.navigate(['/app/dashboard']);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.notify.error('Error al iniciar sesión. Revisa tus datos.');
      }
    });
  }
}
