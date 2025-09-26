import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  footerLinks = [
    { name: 'About', route: '/about' },
    { name: 'Contact', route: '/contact' },
    { name: 'Privacy Policy', route: '/privacy' },
    { name: 'Terms of Service', route: '/terms' },
  ];

  socialLinks = [
    { name: 'GitHub', icon: 'code', url: 'https://github.com' },
    { name: 'Twitter', icon: 'alternate_email', url: 'https://twitter.com' },
    { name: 'LinkedIn', icon: 'work', url: 'https://linkedin.com' },
  ];

  onSocialLinkClick(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}