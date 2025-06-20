import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule],
      providers: [
        provideAnimations(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call auth.login and navigate on successful login', () => {
    authServiceSpy.login.and.returnValue(of({}));
    component.loginForm.setValue({ username: 'user', password: 'pass' });
    component.onSubmit();
    expect(authServiceSpy.login).toHaveBeenCalledWith('user', 'pass');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
    expect(component.loading).toBeFalse();
    expect(component.error).toBeNull();
  });

  it('should set error on failed login', () => {
    authServiceSpy.login.and.returnValue(throwError(() => new Error('fail')));
    component.loginForm.setValue({ username: 'user', password: 'wrong' });
    component.onSubmit();
    expect(authServiceSpy.login).toHaveBeenCalledWith('user', 'wrong');
    expect(component.loading).toBeFalse();
    expect(component.error).toBe('Login failed. Please check your credentials.');
  });

  it('should not submit if form is invalid', () => {
    component.loginForm.setValue({ username: '', password: '' });
    component.onSubmit();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });
});
