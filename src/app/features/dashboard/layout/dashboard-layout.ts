import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-dashboard-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './dashboard-layout.html',
    styleUrls: ['./dashboard-layout.scss']
})
export class DashboardLayoutComponent {
    constructor(private router: Router) { }

    signOut(): void {
        this.router.navigate(['/']);
    }
}