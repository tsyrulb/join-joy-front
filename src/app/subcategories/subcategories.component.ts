import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Subcategory, UserSubcategory, Category } from '../user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subcategories',
  templateUrl: './subcategories.component.html',
  styleUrls: ['./subcategories.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SubcategoriesComponent implements OnInit {
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  userSubcategories: UserSubcategory[] = [];
  selectedCategoryId: number | null = null;
  userId: number = 8; // Replace with actual user ID

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadUserSubcategories();
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe((categories) => {
      this.categories = categories;
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
              // Attach the full subcategory object to the userSubcategory
              this.userSubcategories[index].subcategory = subcategory;
            },
            error: (error) => {
              console.error(`Error fetching subcategory ${userSubcategory.subcategoryId}:`, error);
            },
          });
        });
      },
      error: (error) => {
        console.error('Error fetching user subcategories:', error);
      },
    });
  }

  onCategorySelect(categoryId: number): void {
    this.selectedCategoryId = categoryId;
    this.apiService.getSubcategoriesByCategoryId(categoryId).subscribe((subcategories) => {
      this.subcategories = subcategories;
    });
  }

  addUserSubcategory(subcategoryId: number): void {
    this.apiService.addUserSubcategory(this.userId, subcategoryId).subscribe({
      next: () => {
        this.loadUserSubcategories(); // Refresh user subcategories
      },
      error: (error) => {
        console.error('Error adding user subcategory:', error);
      },
    });
  }
}
