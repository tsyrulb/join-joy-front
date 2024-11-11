// categories.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Category } from '../user.model';
import { CommonModule } from '@angular/common';
import { SubcategoriesComponent } from '../subcategories/subcategories.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
  standalone: true,
  imports: [CommonModule, SubcategoriesComponent]
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  selectedCategory: Category | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (error) => console.error('Error fetching categories:', error)
    });
  }

  selectCategory(category: Category): void {
    this.selectedCategory = category;
  }
}
