import { Component, inject } from '@angular/core';
import { AdminnavbarComponent } from '../../components/adminnavbar/adminnavbar.component';
import { RouterOutlet } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { CommonModule } from '@angular/common';
import { AdminSideMenuComponent } from '../../component/admin-side-menu/admin-side-menu.component';
@Component({
  selector: 'app-adminlayout',
  imports: [AdminnavbarComponent, RouterOutlet,CommonModule,AdminSideMenuComponent],
  templateUrl: './adminlayout.component.html',
})
export class AdminlayoutComponent {
  adminAuthService=inject(AdminAuthService)
}
