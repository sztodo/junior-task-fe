import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { AiRequest, AiResponse } from '../models/ai.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Ai {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/Ai';
  private readonly _loading = signal(false);

  constructor() {}

  getAiDescription(request: AiRequest): Observable<AiResponse> {
    this._loading.set(true);
    return this.http.post<AiResponse>(`${this.baseUrl}/generate-description`, request).pipe(
      tap({
        next: () => {
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }
}
