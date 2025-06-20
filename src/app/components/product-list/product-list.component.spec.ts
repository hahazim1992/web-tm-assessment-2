import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductService, Product } from '../../services/product.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockProducts: Product[] = [
    { id: '1', productName: 'Product 1', url: 'https://test1.com' },
    { id: '2', productName: 'Product 2', url: 'https://test2.com' }
  ];

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj('ProductService', ['getProducts']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);


    productServiceSpy.getProducts.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        ...provideHttpClientTesting(),
        provideAnimations(),
        { provide: ProductService, useValue: productServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init (success)', () => {
    productServiceSpy.getProducts.and.returnValue(of(mockProducts));
    component.loadProducts();
    expect(component.products).toEqual(mockProducts);
    expect(component.loading).toBeFalse();
    expect(component.error).toBeNull();
  });

  it('should set error on load products failure', () => {
    productServiceSpy.getProducts.and.returnValue(throwError(() => new Error('fail')));
    component.loadProducts();
    expect(component.error).toBe('Failed to load products');
    expect(component.loading).toBeFalse();
  });

  it('should open dialog and reload products if dialog closed with result', () => {
    const afterClosed$ = new Subject<any>();
    dialogSpy.open.and.returnValue({ afterClosed: () => afterClosed$ } as any);
    productServiceSpy.getProducts.and.returnValue(of(mockProducts));

    spyOn(component, 'loadProducts');

    component.openProductDialog(mockProducts[0]);
    afterClosed$.next(true);
    afterClosed$.complete();

    expect(dialogSpy.open).toHaveBeenCalled();
    expect(component.loadProducts).toHaveBeenCalled();
  });

  it('should not reload products if dialog closed without result', () => {
    const afterClosed$ = new Subject<any>();
    dialogSpy.open.and.returnValue({ afterClosed: () => afterClosed$ } as any);
    spyOn(component, 'loadProducts');

    component.openProductDialog(mockProducts[0]);
    afterClosed$.next(null);
    afterClosed$.complete();

    expect(dialogSpy.open).toHaveBeenCalled();
    expect(component.loadProducts).not.toHaveBeenCalled();
  });

  it('should navigate to product detail on goToProduct', () => {
    const product = mockProducts[0];
    component.goToProduct(product);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products', product.id]);
  });

  it('should not call loadProducts if dialogRef.afterClosed emits undefined', () => {
    const afterClosed$ = new Subject<any>();
    dialogSpy.open.and.returnValue({ afterClosed: () => afterClosed$ } as any);
    spyOn(component, 'loadProducts');

    component.openProductDialog();
    afterClosed$.next(undefined);
    afterClosed$.complete();

    expect(component.loadProducts).not.toHaveBeenCalled();
  });

  it('should not call loadProducts if dialogRef.afterClosed emits false', () => {
    const afterClosed$ = new Subject<any>();
    dialogSpy.open.and.returnValue({ afterClosed: () => afterClosed$ } as any);
    spyOn(component, 'loadProducts');

    component.openProductDialog();
    afterClosed$.next(false);
    afterClosed$.complete();

    expect(component.loadProducts).not.toHaveBeenCalled();
  });
});
