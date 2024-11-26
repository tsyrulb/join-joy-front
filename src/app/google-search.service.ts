import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GoogleSearchService {
  private apiUrl = 'https://www.googleapis.com/customsearch/v1';

  constructor(private http: HttpClient) {}

  searchImages(query: string): Observable<any> {
    const params = {
      key: environment.googleApiKey,
      cx: environment.cseId,
      q: query,
      searchType: 'image',
    };

    return this.http.get(this.apiUrl, { params });
  }
}
