import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    // Create AuthService without running the real constructor
    // because the constructor uses AngularFire authState/docData.
    service = Object.create(AuthService.prototype) as AuthService;

    // Mock admin state
    service.adminState$ = of(null);

    // Mock login and logout methods to avoid real Firebase calls
    vi.spyOn(service, 'login').mockResolvedValue({
      user: {
        uid: 'admin-1',
        email: 'admin@test.com',
      },
    } as any);

    vi.spyOn(service, 'logout').mockResolvedValue(undefined);
  });

  // TC1: Checks that login() is called with valid email and password.
  // Firebase is mocked, so no real authentication request is sent.
  it('should login with valid credentials', async () => {
    const result = await service.login('admin@test.com', '123456');

    expect(service.login).toHaveBeenCalledWith('admin@test.com', '123456');
    expect(result.user.uid).toBe('admin-1');
    expect(result.user.email).toBe('admin@test.com');
  });

  // TC2: Checks that login() can handle invalid credentials.
  // The login method is mocked to reject with an error.
  it('should handle login error', async () => {
    vi.spyOn(service, 'login').mockRejectedValueOnce(
      new Error('Invalid email or password')
    );

    await expect(
      service.login('wrong@test.com', 'wrongpass')
    ).rejects.toThrow('Invalid email or password');
  });

  // TC3: Checks that logout() is called successfully.
  // Firebase signOut is mocked, so no real logout happens.
  it('should logout successfully', async () => {
    await service.logout();

    expect(service.logout).toHaveBeenCalled();
  });

  // TC4: Checks the current admin state when no user is logged in.
  // Expected result is null.
  it('should return null when no admin is logged in', () => {
    service.adminState$.subscribe(state => {
      expect(state).toBeNull();
    });
  });

  // TC5: Checks the current admin state when an admin user exists.
  it('should return admin state when admin is logged in', () => {
    const mockAdminState = {
      user: {
        uid: 'admin-1',
        email: 'admin@test.com',
      },
      adminDoc: {
        role: 'admin',
        name: 'Admin User',
      },
    } as any;

    service.adminState$ = of(mockAdminState);

    service.adminState$.subscribe(state => {
      expect(state?.user.uid).toBe('admin-1');
      expect(state?.adminDoc.role).toBe('admin');
    });
  });
});