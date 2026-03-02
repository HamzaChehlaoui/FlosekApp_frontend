import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, UserService } from '../../../../core/services';
import { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '../../../../core/services/user.service';
import { HeaderComponent } from '../../../../core/components/header/header.component';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, HeaderComponent, FormsModule, TranslateModule],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
    user: UserProfile | null = null;
    isLoading = true;
    isEditMode = false;
    isSaving = false;
    errorMessage = '';
    successMessage = '';

    // Password change
    showPasswordModal = false;
    isChangingPassword = false;
    passwordError = '';
    passwordSuccess = '';

    // Settings
    twoFactorEnabled = true;
    offlineMode = true;
    currencyToggle = false;
    selectedCurrency = 'MAD';

    profileForm = {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    };

    passwordForm: ChangePasswordRequest = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };

    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService
    ) {}

    ngOnInit(): void {
        this.loadProfile();
    }

    loadProfile(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.userService.getProfile().subscribe({
            next: (profile) => {
                this.user = profile;
                this.initializeForm();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading profile:', error);
                this.errorMessage = 'Failed to load profile. Please try again.';
                this.isLoading = false;
                // Fallback to local user data
                const localUser = this.authService.getCurrentUser();
                if (localUser) {
                    this.user = {
                        id: '',
                        firstName: localUser.firstName,
                        lastName: localUser.lastName,
                        email: localUser.email
                    };
                    this.initializeForm();
                }
            }
        });
    }

    private initializeForm(): void {
        if (this.user) {
            this.profileForm = {
                firstName: this.user.firstName || '',
                lastName: this.user.lastName || '',
                email: this.user.email || '',
                phone: this.user.phone || ''
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
        this.successMessage = '';
        this.errorMessage = '';
    }

    saveChanges(): void {
        this.isSaving = true;
        this.errorMessage = '';
        this.successMessage = '';

        const updateData: UpdateProfileRequest = {
            firstName: this.profileForm.firstName,
            lastName: this.profileForm.lastName,
            phone: this.profileForm.phone || undefined
        };

        this.userService.updateProfile(updateData).subscribe({
            next: (updatedProfile) => {
                this.user = updatedProfile;
                this.successMessage = 'Profile updated successfully!';
                this.isEditMode = false;
                this.isSaving = false;
            },
            error: (error) => {
                console.error('Error updating profile:', error);
                this.errorMessage = error.error?.message || 'Failed to update profile. Please try again.';
                this.isSaving = false;
            }
        });
    }

    cancelChanges(): void {
        this.initializeForm();
        this.isEditMode = false;
        this.errorMessage = '';
    }

    openChangePassword(): void {
        this.showPasswordModal = true;
        this.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        };
        this.passwordError = '';
        this.passwordSuccess = '';
    }

    closePasswordModal(): void {
        this.showPasswordModal = false;
        this.passwordError = '';
        this.passwordSuccess = '';
    }

    changePassword(): void {
        // Validate passwords
        if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
            this.passwordError = 'New passwords do not match';
            return;
        }

        if (this.passwordForm.newPassword.length < 8) {
            this.passwordError = 'Password must be at least 8 characters';
            return;
        }

        this.isChangingPassword = true;
        this.passwordError = '';

        this.userService.changePassword(this.passwordForm).subscribe({
            next: () => {
                this.passwordSuccess = 'Password changed successfully!';
                this.isChangingPassword = false;
                setTimeout(() => this.closePasswordModal(), 2000);
            },
            error: (error) => {
                console.error('Error changing password:', error);
                this.passwordError = error.error?.message || 'Failed to change password. Please try again.';
                this.isChangingPassword = false;
            }
        });
    }

    logout(): void {
        this.authService.logout();
    }
}
