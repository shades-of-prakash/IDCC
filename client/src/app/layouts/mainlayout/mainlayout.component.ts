import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-mainlayout',
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './mainlayout.component.html',
})
export class MainlayoutComponent {}
