import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardLayoutComponent } from './features/dashboard/layout/dashboard-layout';
import { ViewingPageComponent } from './features/dashboard/viewing/viewing-page/viewing-page';
import { AnalyticsPageComponent } from './features/dashboard/analytics/analytics-page';

export const routes: Routes = [
  { path: '', component: LoginComponent },

  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    children: [
      { path: '', redirectTo: 'management', pathMatch: 'full' },
      { path: 'management', component: ViewingPageComponent },
      { path: 'analytics', component: AnalyticsPageComponent }
    ]
  },

  { path: '**', redirectTo: '' }
];