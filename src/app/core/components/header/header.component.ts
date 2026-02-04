import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services';
import { User } from '../../models';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {
    user: User | null = null;

    constructor(private authService: AuthService, private router: Router) {
        // Subscribe to currentUser changes so the header updates automatically on login/logout
        this.authService.currentUser$.subscribe(user => {
            this.user = user;
        });
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }
}
