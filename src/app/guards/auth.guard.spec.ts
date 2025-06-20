import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { Router, UrlTree } from '@angular/router';
import { EnvironmentInjector, createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['hasValidToken', 'logout']);
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    injector = createEnvironmentInjector(
      [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
      TestBed.inject(EnvironmentInjector)
    );
  });

  function runGuard() {
    const dummyRoute = {} as any;
    const dummyState = {} as any;
    return runInInjectionContext(injector, () => authGuard(dummyRoute, dummyState));
  }

  it('should return true if token is valid', () => {
    authServiceSpy.hasValidToken.and.returnValue(true);
    const result = runGuard();
    expect(result).toBeTrue();
    expect(authServiceSpy.logout).not.toHaveBeenCalled();
  });

  it('should logout and return UrlTree if token is invalid', () => {
    authServiceSpy.hasValidToken.and.returnValue(false);
    const urlTree = {} as UrlTree;
    routerSpy.createUrlTree.and.returnValue(urlTree);

    const result = runGuard();
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(urlTree);
  });
});