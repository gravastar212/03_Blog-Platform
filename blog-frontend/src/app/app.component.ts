import { Component } from '@angular/core';
import { LayoutComponent } from './components/layout/layout.component';
import { GlobalSpinnerComponent } from './components/global-spinner/global-spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutComponent, GlobalSpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'blog-frontend';
}
