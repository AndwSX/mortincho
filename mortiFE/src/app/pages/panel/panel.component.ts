import { Component } from '@angular/core';
import { NavbarComponent } from '../../core/navbar/navbar.component';
import { SidebarComponent } from '../../core/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-panel',
  imports: [RouterOutlet, NavbarComponent,SidebarComponent],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css'
})
export class PanelComponent {

}
