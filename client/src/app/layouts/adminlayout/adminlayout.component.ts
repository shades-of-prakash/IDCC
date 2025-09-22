import { Component } from '@angular/core';
import { AdminnavbarComponent } from '../../components/adminnavbar/adminnavbar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-adminlayout',
  imports: [AdminnavbarComponent, RouterOutlet],
  templateUrl: './adminlayout.component.html',
  styleUrl: './adminlayout.component.css',
})
export class AdminlayoutComponent {}
