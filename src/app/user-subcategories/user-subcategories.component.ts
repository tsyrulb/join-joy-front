import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Subcategory, UserSubcategory, Category } from '../user.model';
import { Observable, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-subcategories',
  templateUrl: './user-subcategories.component.html',
  styleUrls: ['./user-subcategories.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class UserSubcategoriesComponent implements OnInit {
  userId: number | null = null;
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  userSubcategories: UserSubcategory[] = [];
  selectedCategoryId: number | null = null;
  // Table columns
  displayedColumns: string[] = ['name', 'actions'];
  selectedCategoryIndex: number | null = null; // Updated variable

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCategories();
    const token = localStorage.getItem('token');
    if (token) {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      this.userId = tokenPayload.nameid;

      if (this.userId) {
        this.loadUserSubcategories();
      }
    }
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (categories) => {
        console.log('Categories:', categories); // Debug log
        this.categories = categories;
      },
      error: (error) => console.error('Error fetching categories:', error),
    });
  }
  
  loadUserSubcategories(): void {
    console.log('Fetching user subcategories for userId:', this.userId);
    if (this.userId) {
      this.apiService.getUserSubcategories(this.userId).subscribe({
        next: (userSubcategories) => {
          console.log('User subcategories:', userSubcategories);
          this.userSubcategories = userSubcategories;
  
          // Fetch full Subcategory details for each UserSubcategory
          this.userSubcategories.forEach((userSubcategory, index) => {
            this.apiService.getSubcategoryById(userSubcategory.subcategoryId).subscribe({
              next: (subcategory) => {
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
    } else {
      console.error('User ID is not set.');
    }
  }
  
  

  onCategorySelect(index: number): void {
    this.selectedCategoryIndex = index; // Update index
    const category = this.categories[index];
    if (category) {
      this.selectedCategoryId = category.id; // Get the ID dynamically
      this.apiService.getSubcategoriesByCategoryId(category.id).subscribe({
        next: (subcategories) => {
          this.subcategories = subcategories.filter(
            (subcategory) =>
              !this.userSubcategories.some(
                (userSubcategory) =>
                  userSubcategory.subcategoryId === subcategory.id
              )
          );
        },
        error: (error) =>
          console.error(
            `Error fetching subcategories for category ${category.id}:`,
            error
          ),
      });
    }
  }
  
  

  addUserSubcategory(subcategoryId: number): void {
    this.apiService.addUserSubcategory(this.userId, subcategoryId).subscribe({
      next: () => {
        this.loadUserSubcategories(); // Refresh user subcategories
        this.subcategories = this.subcategories.filter(
          (s) => s.id !== subcategoryId
        ); // Remove from subcategories list
      },
      error: (error) => {
        console.error('Error adding user subcategory:', error);
      },
    });
  }

  removeUserSubcategory(subcategoryId: number): void {
    this.apiService.removeUserSubcategory(this.userId, subcategoryId).subscribe({
      next: () => {
        const removedUserSubcategory = this.userSubcategories.find(
          (userSubcategory) => userSubcategory.subcategoryId === subcategoryId
        );
  
        if (removedUserSubcategory) {
          const subcategoryToRestore = removedUserSubcategory.subcategory;
  
          // Remove from userSubcategories
          this.userSubcategories = this.userSubcategories.filter(
            (userSubcategory) =>
              userSubcategory.subcategoryId !== subcategoryId
          );
  
          // Add back to the correct subcategories list if it matches the selected category
          if (subcategoryToRestore?.categoryId === this.selectedCategoryId) {
            this.subcategories.push(subcategoryToRestore);
          }
        }
      },
      error: (error) => {
        console.error('Error removing user subcategory:', error);
      },
    });
  }
  
  
}
