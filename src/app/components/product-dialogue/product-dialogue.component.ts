import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../services/product.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatIcon
  ],
  templateUrl: './product-dialogue.component.html',
  styleUrl: './product-dialogue.component.scss'
})
export class ProductDialogComponent {
  productForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductDialogComponent>,
    private productService: ProductService,
    @Inject(MAT_DIALOG_DATA) public data: Product | null
  ) {
    this.productForm = this.fb.group({
      productName: [data?.productName || '', Validators.required],
      url: [data?.url || '', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]]
    });
  }

  onSubmit() {
  if (this.productForm.valid) {
    const productData = this.productForm.value;
    if (this.data) {
      // Edit mode
      this.productService.updateProduct(this.data.id, productData);
      this.dialogRef.close(true);
    } else {
      // Add mode
      this.productService.addProduct(productData);
      this.dialogRef.close(true);
    }
  }
}

  onCancel() {
    this.dialogRef.close();
  }
}
