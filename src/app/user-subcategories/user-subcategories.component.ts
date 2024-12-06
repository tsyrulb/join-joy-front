import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Subcategory, UserSubcategory, Category } from '../user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-user-subcategories',
  templateUrl: './user-subcategories.component.html',
  styleUrls: ['./user-subcategories.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
  ],
})
export class UserSubcategoriesComponent implements OnInit {
  userId: number | null = null;
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  userSubcategories: UserSubcategory[] = [];
  selectedCategoryId: number | null = null;

  // Default image if no match found
  defaultCategoryImage = 'assets/images/default.jpg';

  // Map categories names to their image paths
  private categoryImages: { [key: string]: string } = {
    'Music': 'assets/categories/music.png',
    'Sports': 'assets/categories/sports.png',
    'Art': 'assets/categories/art.png',
    'Literature': 'assets/categories/literature.png',
    'Technology': 'assets/categories/technology.png',
    'Outdoor Activities': 'assets/categories/outdoor.png',
    'Food & Drink': 'assets/categories/food_drink.png',
    'Travel': 'assets/categories/travel.png',
    'Games': 'assets/categories/games.png',
    'Movies & TV Shows': 'assets/categories/movies_tv.png',
    'Performing Arts': 'assets/categories/performing_arts.png',
    'Science': 'assets/categories/science.png',
    'Social Activities': 'assets/categories/social.png',
    'MBTI': 'assets/categories/mbti.png'
  };

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
        console.log('Categories:', categories);
        this.categories = categories;
      },
      error: (error) => console.error('Error fetching categories:', error),
    });
  }

  loadUserSubcategories(): void {
    if (!this.userId) {
      console.error('User ID is not set.');
      return;
    }
    console.log('Fetching user subcategories for userId:', this.userId);
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
            error: (error) =>
              console.error(
                `Error fetching subcategory ${userSubcategory.subcategoryId}:`,
                error
              ),
          });
        });
      },
      error: (error) => {
        console.error('Error fetching user subcategories:', error);
      },
    });
  }

  // Replace onCategorySelect with selectCategory
  selectCategory(category: Category): void {
    this.selectedCategoryId = category.id;
    if (category.id) {
      this.apiService.getSubcategoriesByCategoryId(category.id).subscribe({
        next: (subcategories) => {
          // Filter out any subcategories the user already has
          this.subcategories = subcategories.filter(
            (s) =>
              !this.userSubcategories.some(
                (us) => us.subcategoryId === s.id
              )
          );
        },
        error: (error) =>
          console.error(`Error fetching subcategories for category ${category.id}:`, error),
      });
    }
  }

  addUserSubcategory(subcategoryId: number): void {
    if (!this.userId) return;
    this.apiService.addUserSubcategory(this.userId, subcategoryId).subscribe({
      next: () => {
        this.loadUserSubcategories(); // Refresh user subcategories
        this.subcategories = this.subcategories.filter((s) => s.id !== subcategoryId);
      },
      error: (error) => {
        console.error('Error adding user subcategory:', error);
      },
    });
  }

  removeUserSubcategory(subcategoryId: number): void {
    if (!this.userId) return;
    this.apiService.removeUserSubcategory(this.userId, subcategoryId).subscribe({
      next: () => {
        const removedUserSubcategory = this.userSubcategories.find(
          (us) => us.subcategoryId === subcategoryId
        );

        if (removedUserSubcategory) {
          const subcategoryToRestore = removedUserSubcategory.subcategory;

          // Remove from userSubcategories
          this.userSubcategories = this.userSubcategories.filter(
            (us) => us.subcategoryId !== subcategoryId
          );

          // If this subcategory belongs to the currently selected category, restore it
          if (
            subcategoryToRestore &&
            subcategoryToRestore.categoryId === this.selectedCategoryId
          ) {
            this.subcategories.push(subcategoryToRestore);
          }
        }
      },
      error: (error) => {
        console.error('Error removing user subcategory:', error);
      },
    });
  }

  // Helper method to get category image
  getCategoryImage(category: Category): string {
    return this.categoryImages[category.name] || this.defaultCategoryImage;
  }
}
