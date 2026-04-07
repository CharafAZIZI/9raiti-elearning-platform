import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../../core/services/token.service';
import { AdminUserService, User } from '../../core/services/admin-user.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class DashboardAdminComponent implements OnInit {

  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;
  actionLoading: { [key: number]: string } = {};
  errorMessage = '';
  successMessage = '';
  searchQuery = '';
  roleFilter = 'all';
  statusFilter = 'all';
  activeTab = 'users';
  deleteConfirmId: number | null = null;
  logoutLoading = false;

  displayName = '';
  email = '';
  initials = '?';

  constructor(
    private adminService: AdminUserService,
    private tokenService: TokenService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.tokenService.getUser();
    if (user) {
      this.email = user.email ?? '';
      this.displayName = this.tokenService.getDisplayName();
      if (user.prenom && user.nom) {
        this.initials = (user.prenom[0] + user.nom[0]).toUpperCase();
      } else if (user.email) {
        this.initials = user.email.substring(0, 2).toUpperCase();
      }
    }
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getAll().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les utilisateurs.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let result = [...this.users];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(u =>
        u.nom?.toLowerCase().includes(q) ||
        u.prenom?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }

    if (this.roleFilter !== 'all') {
      result = result.filter(u => u.role?.toLowerCase() === this.roleFilter);
    }

    if (this.statusFilter === 'active') {
      result = result.filter(u => u.est_actif);
    } else if (this.statusFilter === 'inactive') {
      result = result.filter(u => !u.est_actif);
    } else if (this.statusFilter === 'pending') {
      result = result.filter(u => u.role?.toLowerCase() === 'enseignant' && !u.est_valide);
    }

    this.filteredUsers = result;
  }

  get stats() {
    return {
      total: this.users.length,
      apprenants: this.users.filter(u => u.role?.toLowerCase() === 'apprenant').length,
      enseignants: this.users.filter(u => u.role?.toLowerCase() === 'enseignant').length,
      pending: this.users.filter(u => u.role?.toLowerCase() === 'enseignant' && !u.est_valide).length,
      suspended: this.users.filter(u => !u.est_actif).length
    };
  }

  valider(user: User): void {
    this.actionLoading[user.id] = 'valider';
    this.adminService.validerEnseignant(user.id).subscribe({
      next: (updated) => {
        this.updateUser(updated);
        this.showSuccess(`${user.prenom} ${user.nom} a été validé(e).`);
        delete this.actionLoading[user.id];
      },
      error: () => {
        this.showError('Erreur lors de la validation.');
        delete this.actionLoading[user.id];
      }
    });
  }

  toggleStatus(user: User): void {
    this.actionLoading[user.id] = 'status';
    const obs = user.est_actif
      ? this.adminService.suspendre(user.id)
      : this.adminService.activer(user.id);

    obs.subscribe({
      next: (updated) => {
        this.updateUser(updated);
        const action = updated.est_actif ? 'activé(e)' : 'suspendu(e)';
        this.showSuccess(`${user.prenom} ${user.nom} a été ${action}.`);
        delete this.actionLoading[user.id];
      },
      error: () => {
        this.showError('Erreur lors du changement de statut.');
        delete this.actionLoading[user.id];
      }
    });
  }

  confirmDelete(id: number): void {
    this.deleteConfirmId = id;
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  deleteConfirmed(): void {
    if (this.deleteConfirmId === null) return;
    const user = this.users.find(u => u.id === this.deleteConfirmId);
    if (user) this.deleteUser(user);
  }

  deleteUser(user: User): void {
    this.actionLoading[user.id] = 'delete';
    this.deleteConfirmId = null;
    this.adminService.delete(user.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.applyFilters();
        this.showSuccess(`${user.prenom} ${user.nom} a été supprimé(e).`);
        delete this.actionLoading[user.id];
      },
      error: () => {
        this.showError('Erreur lors de la suppression.');
        delete this.actionLoading[user.id];
      }
    });
  }

  private updateUser(updated: User): void {
    const idx = this.users.findIndex(u => u.id === updated.id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...updated };
      this.applyFilters();
      this.cdr.detectChanges();
    }
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    this.errorMessage = '';
    setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 4000);
  }

  private showError(msg: string): void {
    this.errorMessage = msg;
    setTimeout(() => { this.errorMessage = ''; this.cdr.detectChanges(); }, 4000);
  }

  getInitials(user: User): string {
    if (user.prenom && user.nom) return (user.prenom[0] + user.nom[0]).toUpperCase();
    if (user.email) return user.email.substring(0, 2).toUpperCase();
    return '??';
  }

  getRoleClass(role: string): string {
    switch (role?.toLowerCase()) {
      case 'apprenant': return 'badge-apprenant';
      case 'enseignant': return 'badge-enseignant';
      case 'admin': return 'badge-admin';
      default: return 'badge-default';
    }
  }

  logout(): void {
    this.logoutLoading = true;
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.post(`/api/auth/logout`, {}, { headers, responseType: 'text' as const }).subscribe({
      next: () => { this.tokenService.removeToken(); this.router.navigate(['/login']); },
      error: () => { this.tokenService.removeToken(); this.router.navigate(['/login']); }
    });
  }
}
