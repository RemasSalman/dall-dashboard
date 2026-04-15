import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ViewingPageComponent } from './features/dashboard/viewing/viewing-page/viewing-page';

export const routes: Routes = [
  // 1. اجعلي المسار الفارغ يفتح صفحة اللوق ان
  { path: '', component: LoginComponent },

  // 2. اجعلي لوحة التحكم على مسار مستقل اسمه dashboard
  { path: 'dashboard', component: ViewingPageComponent },

  // 3. أي مسار آخر غير معروف يرجعنا للوق ان
  { path: '**', redirectTo: '' }
];