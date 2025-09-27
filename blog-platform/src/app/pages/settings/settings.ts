import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Auth, User } from '../../auth/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSlideToggleModule
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings implements OnInit, OnDestroy {
  currentUser: User | null = null;
  settingsForm: FormGroup;
  isLoading = false;
  private authSubscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authService: Auth
  ) {
    this.settingsForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      notifications: [true],
      newsletter: [false]
    });
  }

  ngOnInit(): void {
    this.authSubscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.settingsForm.patchValue({
            name: user.name,
            email: user.email
          });
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  onSubmit(): void {
    if (this.settingsForm.valid && this.currentUser) {
      this.isLoading = true;
      console.log('Settings updated:', this.settingsForm.value);
      
      // Simulate API call
      setTimeout(() => {
        this.isLoading = false;
        alert('Settings updated successfully!');
      }, 2000);
    }
  }
}
