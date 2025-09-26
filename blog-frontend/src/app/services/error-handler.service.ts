import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

export interface ErrorInfo {
  message: string;
  status?: number;
  statusText?: string;
  url?: string;
  timestamp: Date;
  userMessage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService implements ErrorHandler {
  constructor(
    private injector: Injector
  ) {}

  handleError(error: any): void {
    console.error('Global error handler:', error);

    const snackBar = this.injector.get(MatSnackBar);
    const router = this.injector.get(Router);

    let errorInfo: ErrorInfo;

    if (error instanceof HttpErrorResponse) {
      errorInfo = this.handleHttpError(error);
    } else if (error instanceof Error) {
      errorInfo = this.handleGenericError(error);
    } else {
      errorInfo = this.handleUnknownError(error);
    }

    // Show user-friendly error message
    this.showErrorNotification(snackBar, errorInfo);

    // Handle specific error scenarios
    this.handleErrorScenarios(errorInfo, router);
  }

  private handleHttpError(error: HttpErrorResponse): ErrorInfo {
    const errorInfo: ErrorInfo = {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      url: error.url || undefined,
      timestamp: new Date()
    };

    // Handle different HTTP status codes
    switch (error.status) {
      case 0:
        errorInfo.userMessage = 'Network error. Please check your internet connection.';
        break;
      case 400:
        errorInfo.userMessage = this.getValidationErrorMessage(error);
        break;
      case 401:
        errorInfo.userMessage = 'You are not authorized. Please log in.';
        break;
      case 403:
        errorInfo.userMessage = 'Access denied. You don\'t have permission to perform this action.';
        break;
      case 404:
        errorInfo.userMessage = 'The requested resource was not found.';
        break;
      case 409:
        errorInfo.userMessage = this.getConflictErrorMessage(error);
        break;
      case 422:
        errorInfo.userMessage = this.getValidationErrorMessage(error);
        break;
      case 429:
        errorInfo.userMessage = 'Too many requests. Please try again later.';
        break;
      case 500:
        errorInfo.userMessage = 'Server error. Please try again later.';
        break;
      case 502:
        errorInfo.userMessage = 'Service temporarily unavailable. Please try again later.';
        break;
      case 503:
        errorInfo.userMessage = 'Service unavailable. Please try again later.';
        break;
      case 504:
        errorInfo.userMessage = 'Request timeout. Please try again.';
        break;
      default:
        errorInfo.userMessage = 'An unexpected error occurred. Please try again.';
    }

    return errorInfo;
  }

  private handleGenericError(error: Error): ErrorInfo {
    return {
      message: error.message,
      timestamp: new Date(),
      userMessage: 'An unexpected error occurred. Please try again.'
    };
  }

  private handleUnknownError(error: any): ErrorInfo {
    return {
      message: String(error),
      timestamp: new Date(),
      userMessage: 'An unknown error occurred. Please try again.'
    };
  }

  private getValidationErrorMessage(error: HttpErrorResponse): string {
    if (error.error && error.error.message) {
      if (Array.isArray(error.error.message)) {
        return error.error.message.join(', ');
      }
      return error.error.message;
    }
    return 'Validation error. Please check your input.';
  }

  private getConflictErrorMessage(error: HttpErrorResponse): string {
    if (error.error && error.error.message) {
      return error.error.message;
    }
    return 'Conflict error. The resource already exists or is in use.';
  }

  private showErrorNotification(snackBar: MatSnackBar, errorInfo: ErrorInfo): void {
    const duration = this.getNotificationDuration(errorInfo);
    const action = this.getNotificationAction(errorInfo);

    snackBar.open(
      errorInfo.userMessage || 'An error occurred',
      action,
      {
        duration,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      }
    );
  }

  private getNotificationDuration(errorInfo: ErrorInfo): number {
    // Longer duration for more serious errors
    if (errorInfo.status && errorInfo.status >= 500) {
      return 8000; // 8 seconds for server errors
    }
    if (errorInfo.status === 401 || errorInfo.status === 403) {
      return 6000; // 6 seconds for auth errors
    }
    return 4000; // 4 seconds for other errors
  }

  private getNotificationAction(errorInfo: ErrorInfo): string {
    if (errorInfo.status === 401) {
      return 'Login';
    }
    if (errorInfo.status === 403) {
      return 'Go Home';
    }
    return 'Close';
  }

  private handleErrorScenarios(errorInfo: ErrorInfo, router: Router): void {
    // Handle authentication errors
    if (errorInfo.status === 401) {
      // Redirect to login after a delay
      setTimeout(() => {
        router.navigate(['/login'], {
          queryParams: { returnUrl: router.url }
        });
      }, 2000);
    }

    // Handle forbidden errors
    if (errorInfo.status === 403) {
      // Redirect to home after a delay
      setTimeout(() => {
        router.navigate(['/home']);
      }, 2000);
    }

    // Handle not found errors for specific routes
    if (errorInfo.status === 404 && errorInfo.url?.includes('/posts/')) {
      // Redirect to posts list if a specific post is not found
      setTimeout(() => {
        router.navigate(['/posts']);
      }, 2000);
    }
  }

  // Public method to manually show errors
  showError(message: string, action: string = 'Close', duration: number = 4000): void {
    const snackBar = this.injector.get(MatSnackBar);
    snackBar.open(message, action, {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  // Public method to show success messages
  showSuccess(message: string, action: string = 'Close', duration: number = 3000): void {
    const snackBar = this.injector.get(MatSnackBar);
    snackBar.open(message, action, {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  // Public method to show info messages
  showInfo(message: string, action: string = 'Close', duration: number = 3000): void {
    const snackBar = this.injector.get(MatSnackBar);
    snackBar.open(message, action, {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['info-snackbar']
    });
  }

  // Public method to show warning messages
  showWarning(message: string, action: string = 'Close', duration: number = 4000): void {
    const snackBar = this.injector.get(MatSnackBar);
    snackBar.open(message, action, {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['warning-snackbar']
    });
  }
}