import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDialogComponent } from './product-dialogue.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Product, ProductService } from '../../services/product.service';
import { FormBuilder } from '@angular/forms';

describe('ProductDialogComponent', () => {
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ProductDialogComponent>>;

  const mockProduct: Product = {
    id: '1',
    productName: 'Test Product',
    url: 'https://test.com'
  };

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj('ProductService', ['addProduct', 'updateProduct', 'deleteProduct']);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ProductDialogComponent],
      providers: [
        ...provideHttpClientTesting(),
        provideAnimations(),
        FormBuilder,
        { provide: ProductService, useValue: productServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: null }
      ]
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(ProductDialogComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component };
  }

  it('should create', () => {
    const { component } = createComponent();
    expect(component).toBeTruthy();
  });

  it('should call addProduct and close dialog on submit in add mode', () => {
    const { component } = createComponent();
    component.productForm.setValue({ productName: 'New Product', url: 'https://new.com' });
    component.data = null;
    component.onSubmit();
    expect(productServiceSpy.addProduct).toHaveBeenCalledWith({ productName: 'New Product', url: 'https://new.com' });
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('should call updateProduct and close dialog on submit in edit mode', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ProductDialogComponent],
      providers: [
        ...provideHttpClientTesting(),
        provideAnimations(),
        FormBuilder,
        { provide: ProductService, useValue: productServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockProduct }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ProductDialogComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.productForm.setValue({ productName: 'Updated', url: 'https://updated.com' });
    component.onSubmit();
    expect(productServiceSpy.updateProduct).toHaveBeenCalledWith('1', { productName: 'Updated', url: 'https://updated.com' });
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('should not submit if form is invalid', () => {
    const { component } = createComponent();
    component.productForm.setValue({ productName: '', url: '' });
    component.data = null;
    component.onSubmit();
    expect(productServiceSpy.addProduct).not.toHaveBeenCalled();
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('should close dialog on cancel', () => {
    const { component } = createComponent();
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should call deleteProduct and close dialog with {deleted: true} on confirm', async () => {
    spyOn(window, 'confirm').and.returnValue(true);

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ProductDialogComponent],
      providers: [
        ...provideHttpClientTesting(),
        provideAnimations(),
        FormBuilder,
        { provide: ProductService, useValue: productServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockProduct }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ProductDialogComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.onDelete();
    expect(productServiceSpy.deleteProduct).toHaveBeenCalledWith('1');
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ deleted: true });
  });

  it('should not call deleteProduct if confirm is cancelled', async () => {
    spyOn(window, 'confirm').and.returnValue(false);

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ProductDialogComponent],
      providers: [
        ...provideHttpClientTesting(),
        provideAnimations(),
        FormBuilder,
        { provide: ProductService, useValue: productServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockProduct }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ProductDialogComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.onDelete();
    expect(productServiceSpy.deleteProduct).not.toHaveBeenCalled();
    expect(dialogRefSpy.close).not.toHaveBeenCalledWith({ deleted: true });
  });
});