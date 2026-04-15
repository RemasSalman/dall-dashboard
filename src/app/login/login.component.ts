import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'] 
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  // قمنا بإزالة Auth من هنا لكي لا يطالبك بـ API Key عند التشغيل
  constructor(private router: Router) {}

  async onLogin() {
    this.errorMessage = ''; 

    // وضع التجربة: التحقق من البيانات يدوياً بدون إنترنت أو Firebase
    if (this.email === 'admin@dall.com' && this.password === '123456') {
      
      console.log('تم تسجيل الدخول بنجاح (وضع التجربة المحلي)');
      
      // التوجه مباشرة للوحة التحكم
      this.router.navigate(['/dashboard']); 

    } else {
      // رسالة الخطأ في حال كانت البيانات المدخلة غير admin@dall.com
      this.errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة (استخدم الحساب التجريبي).';
      console.warn('محاولة دخول خاطئة في وضع التجربة');
    }
  }
  
}

