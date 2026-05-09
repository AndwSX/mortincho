import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  userData = {
    usuario: '',
    correo: '',
    password: ''
  };

  isLoading: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private notify: NotificationService
  ) {}

  onRegistro() {
    if (this.isLoading) return;
    
    this.isLoading = true;

    this.authService.register(this.userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.notify.success('¡Registro exitoso! Ya puedes iniciar sesión.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.notify.error('No se pudo completar el registro. Revisa los datos.');
      }
    });
  }
}
