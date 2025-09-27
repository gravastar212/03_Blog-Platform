import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  currentYear: number = new Date().getFullYear();
  
  footerLinks = [
    { name: 'About', icon: 'info', route: '/about' },
    { name: 'Contact', icon: 'mail', route: '/contact' },
    { name: 'Privacy Policy', icon: 'privacy_tip', route: '/privacy' },
    { name: 'Terms of Service', icon: 'description', route: '/terms' }
  ];

  socialLinks = [
    { name: 'GitHub', icon: 'code', url: 'https://github.com/your-github', ariaLabel: 'GitHub' },
    { name: 'Twitter', icon: 'alternate_email', url: 'https://twitter.com/your-twitter', ariaLabel: 'Twitter' },
    { name: 'LinkedIn', icon: 'linkedin', url: 'https://linkedin.com/in/your-linkedin', ariaLabel: 'LinkedIn' }
  ];

  onExternalLink(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
