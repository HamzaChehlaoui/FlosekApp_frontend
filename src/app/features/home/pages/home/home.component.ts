import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services';
import { User } from '../../../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  user: User | null = null;

  constructor(private authService: AuthService) {
    this.user = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
