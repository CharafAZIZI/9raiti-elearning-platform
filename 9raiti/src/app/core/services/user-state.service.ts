import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { StoredUser, TokenService } from './token.service';
import { ProfileService, ProfileResponse } from './profile.service';

@Injectable({ providedIn: 'root' })
export class UserStateService {

  private _user$ = new BehaviorSubject<StoredUser | null>(null);
  readonly user$ = this._user$.asObservable();

  constructor(
    private tokenService: TokenService,
    private profileService: ProfileService,
  ) {
    this._user$.next(this.tokenService.getUser());
  }

  updateUser(user: StoredUser): void {
    this.tokenService.setUser(user);
    this._user$.next(user);
    this._loadProfileSilently();
  }

  loadProfileFromBackend(): Observable<ProfileResponse | null> {
    if (!this.tokenService.isLoggedIn()) return of(null);
    return this.profileService.getMyProfile().pipe(
      tap((profile) => {
        const current = this._user$.getValue();
        const enriched: StoredUser = {
          email:       profile.email  ?? current?.email  ?? '',
          role:        profile.role   ?? current?.role   ?? '',
          expiration:  current?.expiration ?? '',
          nom:         profile.nom    ?? current?.nom,
          prenom:      profile.prenom ?? current?.prenom,
          displayName: current?.displayName,
        };
        this.tokenService.setUser(enriched);
        this._user$.next(enriched);
      }),
      catchError(() => of(null))
    );
  }

  clearUser(): void {
    this.tokenService.removeToken();
    this._user$.next(null);
  }

  getDisplayName(): string { return this.tokenService.getDisplayName(); }
  getUser(): StoredUser | null { return this._user$.getValue(); }
  isLoggedIn(): boolean { return this.tokenService.isLoggedIn(); }

  private _loadProfileSilently(): void { this.loadProfileFromBackend().subscribe(); }
}
