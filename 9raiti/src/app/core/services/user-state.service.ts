import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StoredUser, TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class UserStateService {

  private _user$ = new BehaviorSubject<StoredUser | null>(null);
  user$ = this._user$.asObservable();

  constructor(private tokenService: TokenService) {
    // Initialize from localStorage on app start
    this._user$.next(this.tokenService.getUser());
  }

  /**
   * Call this after any login (normal or Google) to push the new user state.
   * This fixes the "refresh required" bug after Google Login.
   */
  updateUser(user: StoredUser): void {
    this.tokenService.setUser(user);
    this._user$.next(user);
  }

  clearUser(): void {
    this.tokenService.removeToken();
    this._user$.next(null);
  }

  getDisplayName(): string {
    return this.tokenService.getDisplayName();
  }

  getUser(): StoredUser | null {
    return this._user$.getValue();
  }
}
