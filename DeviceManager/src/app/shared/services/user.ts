import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { UpsertUserRequest, User as UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class User {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/User';

  private readonly _users = signal<UserModel[]>([]);
  private readonly _loading = signal(false);
  // selectors
  readonly users = this._users.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor() {}

  loadAll(): Observable<UserModel[]> {
    this._loading.set(true);
    return this.http.get<UserModel[]>(this.baseUrl).pipe(
      tap({
        next: (users) => {
          this._users.set(users);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  create(request: UpsertUserRequest): Observable<UserModel> {
    return this.http
      .post<UserModel>(this.baseUrl, request)
      .pipe(tap((user) => this._users.update((list) => [...list, user])));
  }

  update(id: number, request: UpsertUserRequest): Observable<UserModel> {
    return this.http
      .put<UserModel>(`${this.baseUrl}/${id}`, request)
      .pipe(
        tap((updated) =>
          this._users.update((list) => list.map((u) => (u.id === id ? updated : u))),
        ),
      );
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(tap(() => this._users.update((list) => list.filter((u) => u.id !== id))));
  }
}
