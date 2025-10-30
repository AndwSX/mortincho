import { Routes } from '@angular/router';

//Importacion de componentes
import { LoginComponent } from './auth/login/login.component';
import { PanelComponent } from './pages/panel/panel.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { ProductosComponent } from './modules/productos/productos.component';
import { StockComponent } from './modules/stock/stock.component';
import { VentasComponent } from './modules/ventas/ventas.component';
import { MovimientosComponent } from './modules/movimientos/movimientos.component';
import { ReportesComponent } from './modules/reportes/reportes.component';
import { RegistroComponent } from './auth/registro/registro.component';
import { AuthComponent } from './auth/auth-layout/auth.component';


export const routes: Routes = [
    { path: 'auth', component: AuthComponent, 
        children: [
            {path: 'login', component: LoginComponent},
            {path: 'registro', component: RegistroComponent},
            { path: '', redirectTo: 'login', pathMatch: 'full' }
        ]
     },
    { path: 'app', component: PanelComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'productos', component: ProductosComponent },
            { path: 'stock', component: StockComponent },
            { path: 'ventas', component: VentasComponent },
            { path: 'movimientos', component: MovimientosComponent },
            { path: 'reportes', component: ReportesComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'auth' }
];
