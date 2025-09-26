import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { SidenavComponent } from '../../core/components/sidenav/sidenav.component';
import { FooterComponent } from '../../core/components/footer/footer.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    SidenavComponent,
    FooterComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  sidenavOpened = false;

  onToggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  onCloseSidenav(): void {
    this.sidenavOpened = false;
  }
}