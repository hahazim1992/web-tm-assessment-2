import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDialogueComponent } from './product-dialogue.component';

describe('ProductDialogueComponent', () => {
  let component: ProductDialogueComponent;
  let fixture: ComponentFixture<ProductDialogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDialogueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
