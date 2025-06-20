import { TestBed } from '@angular/core/testing';
import { ProductService, Product } from './product.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockToken = 'mock-token';
  const mockProducts: Product[] = [
    { id: '1', productName: 'Product 1', url: 'http://test1.com' },
    { id: '2', productName: 'Product 2', url: 'http://test2.com' }
  ];

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);
    authServiceSpy.getToken.and.returnValue(mockToken);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProductService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get products from API and cache them if not in sessionStorage', () => {
    service.getProducts().subscribe(products => {
      expect(products).toEqual(mockProducts);
      expect(JSON.parse(sessionStorage.getItem('product_list')!)).toEqual(mockProducts);
    });

    const req = httpMock.expectOne(service['apiUrl']);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    req.flush(mockProducts);
  });

  it('should get products from sessionStorage if cached', () => {
    sessionStorage.setItem('product_list', JSON.stringify(mockProducts));
    service.getProducts().subscribe(products => {
      expect(products).toEqual(mockProducts);
    });
    httpMock.expectNone(service['apiUrl']);
  });

  it('should add a product and save to sessionStorage', () => {
    service.addProduct({ productName: 'New Product', url: 'http://new.com' });
    const products = JSON.parse(sessionStorage.getItem('product_list')!);
    expect(products.length).toBe(1);
    expect(products[0].productName).toBe('New Product');
    expect(products[0].url).toBe('http://new.com');
    expect(products[0].id).toBeTruthy();
  });

  it('should update a product in sessionStorage', () => {
    sessionStorage.setItem('product_list', JSON.stringify(mockProducts));
    service.updateProduct('1', { productName: 'Updated', url: 'http://updated.com' });
    const products = JSON.parse(sessionStorage.getItem('product_list')!);
    expect(products[0].productName).toBe('Updated');
    expect(products[0].url).toBe('http://updated.com');
  });

  it('should delete a product from sessionStorage', () => {
    sessionStorage.setItem('product_list', JSON.stringify(mockProducts));
    service.deleteProduct('1');
    const products = JSON.parse(sessionStorage.getItem('product_list')!);
    expect(products.length).toBe(1);
    expect(products[0].id).toBe('2');
  });

  it('should call getProductAlerts with correct params and headers', () => {
    const mockResponse = { data: [{ foo: 'bar' }], total: 1 };
    service.getProductAlerts('1', 0, 5, '2022-01-25', '2022-02-16').subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      r =>
        r.url === 'https://intermediate-test-v-2-web-test.apps.ocp.tmrnd.com.my/api/data/alert/list/1' &&
        r.params.get('indexNumber') === '0' &&
        r.params.get('pageSize') === '5' &&
        r.params.get('startDate') === '2022-01-25' &&
        r.params.get('endDate') === '2022-02-16'
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    req.flush(mockResponse);
  });
});