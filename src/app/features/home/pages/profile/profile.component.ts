import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services';
import { User } from '../../../../core/models';
import { HeaderComponent } from '../../../../core/components/header/header.component';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, HeaderComponent, FormsModule],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss'
})
export class ProfileComponent {
    user: User | null = null;
    isEditMode: boolean = false;
    twoFactorEnabled: boolean = true;
    offlineMode: boolean = true;
    currencyToggle: boolean = false;
    selectedCurrency: string = 'MAD';

    profileForm = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: 'Morocco'
    };

    constructor(private readonly authService: AuthService) {
        this.user = this.authService.getCurrentUser();
        this.initializeForm();
    }

    private initializeForm(): void {
        if (this.user) {
            this.profileForm = {
                firstName: this.user.firstName || '',
                lastName: this.user.lastName || '',
                email: this.user.email || '',
                phone: '',
                country: 'Morocco'
            };
        }
    }

    get userInitials(): string {
        if (!this.user) return '';
        const firstInitial = this.user.firstName?.charAt(0)?.toUpperCase() || '';
        const lastInitial = this.user.lastName?.charAt(0)?.toUpperCase() || '';
        return `${firstInitial}${lastInitial}`;
    }

    get fullName(): string {
        if (!this.user) return '';
        return `${this.user.firstName} ${this.user.lastName}`;
    }

    toggleEditMode(): void {
        this.isEditMode = !this.isEditMode;
    }

    openChangePassword(): void {
        // TODO: Implement change password modal
        console.log('Open change password modal');
    }

    saveChanges(): void {
        // TODO: Implement save changes
        console.log('Saving changes:', this.profileForm);
        this.isEditMode = false;
    }

    cancelChanges(): void {
        this.initializeForm();
        this.isEditMode = false;
    }

    logout(): void {
        this.authService.logout();
    }
}
