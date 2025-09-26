import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PostsService, CreatePostRequest } from '../../services/posts.service';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.scss'
})
export class CreatePostComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  postForm: FormGroup;
  isSubmitting = false;
  currentUser: User | null = null;

  statusOptions = [
    { value: 'DRAFT', label: 'Draft', description: 'Save as draft for later editing' },
    { value: 'PUBLISHED', label: 'Published', description: 'Publish immediately for public viewing' }
  ];

  constructor(
    private fb: FormBuilder,
    private postsService: PostsService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      content: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10000)]],
      status: ['DRAFT', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.initializeAuth();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeAuth(): void {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
    });
  }

  onSubmit(): void {
    if (this.postForm.valid && this.currentUser) {
      this.isSubmitting = true;

      const postData: CreatePostRequest = {
        title: this.postForm.value.title,
        content: this.postForm.value.content,
        status: this.postForm.value.status
      };

      this.postsService.createPost(postData).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (newPost) => {
          this.isSubmitting = false;
          this.snackBar.open('Post created successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          
          // Navigate to the new post
          this.router.navigate(['/posts', newPost.id]);
        },
        error: (error) => {
          console.error('Error creating post:', error);
          this.isSubmitting = false;
          this.snackBar.open('Failed to create post. Please try again.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/posts']);
  }

  onSaveDraft(): void {
    this.postForm.patchValue({ status: 'DRAFT' });
    this.onSubmit();
  }

  onPublish(): void {
    this.postForm.patchValue({ status: 'PUBLISHED' });
    this.onSubmit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.postForm.controls).forEach(key => {
      const control = this.postForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.postForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${fieldName} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  getCharacterCount(fieldName: string): number {
    const field = this.postForm.get(fieldName);
    return field?.value?.length || 0;
  }

  getMaxLength(fieldName: string): number {
    const field = this.postForm.get(fieldName);
    return field?.errors?.['maxlength']?.requiredLength || 0;
  }
}