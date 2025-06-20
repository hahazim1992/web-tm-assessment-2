import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDetailComponent } from './product-detail.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj('ProductService', ['getProductAlerts']);
    productServiceSpy.getProductAlerts.and.returnValue(of({ data: [], total: 0 }));
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProductDetailComponent, HttpClientTestingModule],
      providers: [
        provideAnimations(),
        ProductService,
        { provide: ProductService, useValue: productServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => 'test-id' } }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set productId from route and call loadData on init', () => {
    spyOn(component, 'loadData');
    component.ngOnInit();
    expect(component.productId).toBe('test-id');
    expect(component.loadData).toHaveBeenCalled();
  });

  it('should load data and set data/total on success', () => {
    const mockRes = { data: [{ status: 'Up' }], total: 1 };
    productServiceSpy.getProductAlerts.and.returnValue(of(mockRes));
    component.loadData();
    expect(component.data).toEqual(mockRes.data);
    expect(component.total).toBe(1);
    expect(component.loading).toBeFalse();
  });

  it('should set data and total to empty/0 on error', () => {
    productServiceSpy.getProductAlerts.and.returnValue(throwError(() => new Error('fail')));
    component.loadData();
    expect(component.data).toEqual([]);
    expect(component.total).toBe(0);
    expect(component.loading).toBeFalse();
  });

  it('should reset pageIndex and call loadData on onFilter', () => {
    spyOn(component, 'loadData');
    component.pageIndex = 2;
    component.onFilter();
    expect(component.pageIndex).toBe(0);
    expect(component.loadData).toHaveBeenCalled();
  });

  it('should navigate back to products on goBack', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should format date as YYYY-MM-DD', () => {
    const date = new Date('2022-01-25');
    expect(component.formatDate(date)).toBe('2022-01-25');
  });
});