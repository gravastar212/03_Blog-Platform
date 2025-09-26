import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-global-spinner',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
  ],
  templateUrl: './global-spinner.component.html',
  styleUrl: './global-spinner.component.scss'
})
export class GlobalSpinnerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  isLoading = false;
  loadingCount = 0;

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    // Subscribe to loading state changes
    this.loadingService.loading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(loading => {
      this.isLoading = loading;
    });

    // Subscribe to loading count changes for debugging
    this.loadingService.loading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadingCount = this.loadingService.getLoadingCount();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}