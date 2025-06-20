import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductService, Product } from '../../services/product.service';
import { MatDialog } from '@angular/material/dialog';
import { ProductDialogComponent } from '../product-dialogue/product-dialogue.component';
import { Router } from '@angular/router';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatProgressSpinnerModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  pagedProducts: Product[] = [];
  loading = true;
  error: string | null = null;
  displayedColumns = ['productName', 'address', 'action'];
  pageSize = 5;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts(goToLastPage = false) {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        if (goToLastPage) {
          this.pageIndex = Math.floor((this.products.length - 1) / this.pageSize);
          
          if (this.paginator) {
            this.paginator.pageIndex = this.pageIndex;
          }
        }
        this.setPagedProducts();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load products';
        this.loading = false;
      }
    });
  }

  setPagedProducts() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pagedProducts = this.products.slice(start, end);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.setPagedProducts();
  }

  openProductDialog(product?: Product) {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      data: product ? { ...product } : null,
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts(true);
      }
    });
  }

  goToProduct(product: Product) {
    this.router.navigate(['/products', product.id]);
  }
}