import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

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
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegistro() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.userData).subscribe({
      next: (response) => {
        console.log('Registro exitoso', response);
        this.isLoading = false;
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Error en registro', err);
        this.isLoading = false;
        this.errorMessage = 'Ocurrió un error al registrar el usuario. Inténtalo de nuevo.';
      }
    });
  }
}
