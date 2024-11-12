import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Subcategory, UserSubcategory, Category } from '../user.model';
import { Observable, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-subcategories',
  templateUrl: './user-subcategories.component.html',
  styleUrls: ['./user-subcategories.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class UserSubcategoriesComponent implements OnInit {
  userId: number | null = null;
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  userSubcategories: UserSubcategory[] = [];
  selectedCategoryId: number | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCategories();
    const token = localStorage.getItem('token');
    if (token) {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      this.userId = tokenPayload.id;

      if (this.userId) {
        this.loadUserSubcategories();
      }
    }
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (categories) => (this.categories = categories),
      error: (error) => console.error('Error fetching categories:', error)
    });
  }

   loadUserSubcategories(): void {
    this.apiService.getUserSubcategories(this.userId).subscribe({
      next: (userSubcategories) => {
        this.userSubcategories = userSubcategories;

        // Fetch full Subcategory details for each UserSubcategory
        this.userSubcategories.forEach((userSubcategory, index) => {
          this.apiService.getSubcategoryById(userSubcategory.subcategoryId).subscribe({
            next: (subcategory) => {
              this.userSubcategories[index].subcategory = subcategory;
            },
            error: (error) => {
              console.error(`Error fetching subcategory ${userSubcategory.subcategoryId}:`, error);
            }
          });
        });
      },
      error: (error) => {
        console.error('Error fetching user subcategories:', error);
      }
    });
  }

  onCategorySelect(categoryId: number): void {
    this.selectedCategoryId = categoryId;
    this.apiService.getSubcategoriesByCategoryId(categoryId).subscribe({
      next: (subcategories) => (this.subcategories = subcategories),
      error: (error) => console.error(`Error fetching subcategories for category ${categoryId}:`, error)
    });
  }

  addUserSubcategory(subcategoryId: number): void {
    this.apiService.addUserSubcategory(this.userId, subcategoryId).subscribe({
      next: () => {
        this.loadUserSubcategories(); // Refresh user subcategories
      },
      error: (error) => {
        console.error('Error adding user subcategory:', error);
      }
    });
  }

  removeUserSubcategory(subcategoryId: number): void {
    this.apiService.removeUserSubcategory(this.userId, subcategoryId).subscribe({
      next: () => {
        this.loadUserSubcategories(); // Refresh user subcategories
      },
      error: (error) => {
        console.error('Error removing user subcategory:', error);
      }
    });
  }
}
