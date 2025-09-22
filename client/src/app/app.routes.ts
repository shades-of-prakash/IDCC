import { Routes } from '@angular/router';
import { MainlayoutComponent } from './layouts/mainlayout/mainlayout.component';
import { UserloginComponent } from './pages/userlogin/userlogin.component';
import { TestComponent } from './components/test/test.component';
import { AdminlayoutComponent } from './layouts/adminlayout/adminlayout.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'userlogin',
    component: UserloginComponent,
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
    component: AdminlayoutComponent,
    children: [],
  },
];
