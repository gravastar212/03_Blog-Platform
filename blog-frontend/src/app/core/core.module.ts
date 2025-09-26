import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreRoutingModule } from './core-routing.module';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CoreRoutingModule,
    NavbarComponent,
    SidenavComponent,
    FooterComponent
  ],
  exports: [
    NavbarComponent,
    SidenavComponent,
    FooterComponent
  ]
})
export class CoreModule { }
