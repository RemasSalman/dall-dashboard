import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let authMock: any;
  let routerMock: any;

  beforeEach(() => {
    // mock AuthService
    authMock = {
      login: vi.fn()
    };

    //  mock Router
    routerMock = {
      navigate: vi.fn()
    };

    component = new LoginComponent(authMock, routerMock);
  });

  // =========================
  // SUCCESS LOGIN
  // =========================

  it('should login successfully and navigate to dashboard', async () => {
    authMock.login.mockResolvedValue(true);

    component.email = 'test@test.com';
    component.password = '123456';

    await component.onLogin();

    expect(authMock.login).toHaveBeenCalledWith('test@test.com', '123456');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.error).toBe('');
    expect(component.loading).toBe(false);
  });

  // =========================
  // LOGIN ERROR
  // =========================

  it('should show error message on login failure', async () => {
    authMock.login.mockRejectedValue(new Error('fail'));

    component.email = 'wrong@test.com';
    component.password = 'wrong';

    await component.onLogin();

    expect(component.error).toBe('Invalid email or password.');
    expect(component.loading).toBe(false);
  });

  // =========================
  // LOADING STATE
  // =========================

  it('should set loading true during login', async () => {
    let resolveFn: any;

    authMock.login.mockReturnValue(
      new Promise(resolve => {
        resolveFn = resolve;
      })
    );

    component.email = 'test@test.com';
    component.password = '123456';

    const promise = component.onLogin();

    expect(component.loading).toBe(true);

    resolveFn(); // finish login
    await promise;

    expect(component.loading).toBe(false);
  });
});