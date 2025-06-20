import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  productId!: string;
  data: any[] = [];
  total = 0;
  loading = false;

  displayedColumns = ['index', 'alertName', 'alertValue', 'alertDate'];

  filterForm: FormGroup;
  pageSize = 5;
  pageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    this.filterForm = this.fb.group({
      startDate: [yesterday.toISOString().slice(0, 10)],
      endDate: [today.toISOString().slice(0, 10)]
    });
  }

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id')!;
    this.loadData();
  }

  loadData(event?: any) {
    this.loading = true;
    if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
    }
    const { startDate, endDate } = this.filterForm.value;
    this.productService.getProductAlerts(
      this.productId,
      this.pageIndex,
      this.pageSize,
      startDate,
      endDate
    ).subscribe({
      next: res => {
        this.data = res.data;
        this.total = res.total;
        this.loading = false;
      },
      error: () => {
        this.data = [];
        this.total = 0;
        this.loading = false;
      }
    });
  }

  onFilter() {
    this.pageIndex = 0;
    this.loadData();
  }
}