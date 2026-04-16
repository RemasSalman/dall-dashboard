import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private auth = inject(Auth);
  private router = inject(Router);

  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  async onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await signInWithEmailAndPassword(this.auth, this.email, this.password);
      await this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.handleError(error.code);
    } finally {
      this.isLoading = false;
    }
  }

  private handleError(code: string) {
    switch (code) {
      case 'auth/invalid-credential':
        this.errorMessage = 'Invalid email or password.';
        break;
      case 'auth/user-not-found':
        this.errorMessage = 'User not found.';
        break;
      case 'auth/wrong-password':
        this.errorMessage = 'Incorrect password.';
        break;
      case 'auth/invalid-email':
        this.errorMessage = 'Invalid email format.';
        break;
      default:
        this.errorMessage = 'Login failed. Please try again.';
    }
  }
}