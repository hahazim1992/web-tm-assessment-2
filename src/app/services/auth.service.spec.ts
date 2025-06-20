import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const apiUrl = 'https://intermediate-test-v-2-web-test.apps.ocp.tmrnd.com.my/api/auth';

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and store token and expiry, and set isAuthenticated$', () => {
    const mockResponse = { success: true, token: 'abc123', tokenExpiry: '1hr' };
    spyOn<any>(service, 'autoLogout').and.callThrough();

    service.login('user', 'pass').subscribe();
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'user', password: 'pass' });

    req.flush(mockResponse);

    expect(localStorage.getItem('auth_token')).toBe('abc123');
    expect(localStorage.getItem('auth_token_expiry')).toBeTruthy();
    expect(service.isAuthenticated$.value).toBeTrue();
    expect((service as any).autoLogout).toHaveBeenCalled();
  });

  it('should login and use custom expiry if provided', () => {
    const expiry = new Date(Date.now() + 5000).toISOString();
    const mockResponse = { success: true, token: 'abc123', tokenExpiry: expiry };

    service.login('user', 'pass').subscribe();
    const req = httpMock.expectOne(apiUrl);
    req.flush(mockResponse);

    expect(localStorage.getItem('auth_token_expiry')).toBe(expiry);
  });

  it('should return token from localStorage', () => {
    localStorage.setItem('auth_token', 'mytoken');
    expect(service.getToken()).toBe('mytoken');
  });

  it('should validate token and expiry correctly', () => {
    expect(service.hasValidToken()).toBeFalse();

    localStorage.setItem('auth_token', 't');
    localStorage.setItem('auth_token_expiry', new Date(Date.now() - 1000).toISOString());
    expect(service.hasValidToken()).toBeFalse();

    localStorage.setItem('auth_token', 't');
    localStorage.setItem('auth_token_expiry', new Date(Date.now() + 10000).toISOString());
    expect(service.hasValidToken()).toBeTrue();
  });

  it('should logout, clear storage, update isAuthenticated$, and navigate', () => {
    localStorage.setItem('auth_token', 't');
    localStorage.setItem('auth_token_expiry', 'e');
    service.isAuthenticated$.next(true);

    service.logout();

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_token_expiry')).toBeNull();
    expect(service.isAuthenticated$.value).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should autoLogout and set timer if expiry is in future', fakeAsync(() => {
    const expiry = new Date(Date.now() + 100).toISOString();
    localStorage.setItem('auth_token_expiry', expiry);
    spyOn(service, 'logout');

    service.autoLogout();
    tick(101);

    expect(service.logout).toHaveBeenCalled();
  }));

  it('should autoLogout and logout immediately if expiry is past', () => {
    const expiry = new Date(Date.now() - 1000).toISOString();
    localStorage.setItem('auth_token_expiry', expiry);
    spyOn(service, 'logout');

    service.autoLogout();

    expect(service.logout).toHaveBeenCalled();
  });
});