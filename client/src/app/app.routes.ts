import { Routes } from '@angular/router';
import { MainlayoutComponent } from './layouts/mainlayout/mainlayout.component';
import { UserloginComponent } from './pages/userlogin/userlogin.component';
import { TestComponent } from './components/test/test.component';
import { AdminlayoutComponent } from './layouts/adminlayout/adminlayout.component';
import { HomeComponent } from './pages/home/home.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminAuthGuard } from './guard/admin-auth-guard.service';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'user-login',
    component: UserloginComponent,
  },
  {
    path: 'admin-login',
    component: AdminLoginComponent,
  },
  {
    path: 'idcc',
    component: MainlayoutComponent,
    children: [
      {
        path: '',
        component: TestComponent,
      },
    ],
  },
  {
    path: 'admin',
    // canActivate: [AdminAuthGuard],
    component: AdminlayoutComponent,
    children: [],
  },
];
