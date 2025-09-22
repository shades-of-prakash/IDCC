import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { UserloginComponent } from './pages/userlogin/userlogin.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
    {
        path:"",component:MainLayoutComponent,
    },
    {
        path:"user-login",component:UserloginComponent,
    }
];
