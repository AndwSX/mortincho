import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  currentModule: string = 'Dashboard';

  private routeMapping: { [key: string]: string } = {
    '/app/dashboard': 'Dashboard',
    '/app/productos': 'Productos',
    '/app/stock': 'Control de Stock',
    '/app/ventas': 'Ventas',
    '/app/movimientos': 'Movimientos',
    '/app/reportes': 'Reportes'
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateBreadcrumb(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateBreadcrumb(event.urlAfterRedirects);
    });
  }

  private updateBreadcrumb(url: string): void {
    // Busca la coincidencia más cercana en el mapeo
    const match = Object.keys(this.routeMapping).find(route => url.startsWith(route));
    this.currentModule = match ? this.routeMapping[match] : 'Panel';
  }
}
