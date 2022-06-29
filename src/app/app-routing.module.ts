import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { LogoutComponent } from './pages/auth/logout/logout.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { DashboardComponent } from './pages/components/dashboard/dashboard.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './pages/auth/verify-email/verify-email.component';
import { AuthGuard } from './services/guards/auth.guard';
import { ProfileComponent } from './pages/components/profile/profile.component';
import { DetailsComponent } from './pages/components/details/details.component';
import { PageNotFoundComponent } from './pages/components/page-not-found/page-not-found.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  { path: 'details/:id', component: DetailsComponent },
  { path: 'sign-in', component: LoginComponent },
  { path: 'sign-up', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'email-verification', component: VerifyEmailComponent },
  { path: 'page-not-found', component: PageNotFoundComponent },
  { path: '**', redirectTo: '/page-not-found' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
