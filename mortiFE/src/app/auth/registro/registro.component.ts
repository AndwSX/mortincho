import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  constructor(private router: Router) {}

  onRegistro() {
    // Por ahora sin validación, solo navega
    this.router.navigate(['/app']);
  }
}
