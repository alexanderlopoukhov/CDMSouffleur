import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FakeDataParams } from '../../scan-data/model/fake-data-params';
import { Observable } from 'rxjs';
import { whiteRabbitApiUrl } from '../../app.constants';

@Injectable({
  providedIn: 'root'
})
export class FakeDataService {

  constructor(private http: HttpClient) {
  }

  generateFakeData(fakeDataSettings: FakeDataParams, userId: string, scanReport: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', scanReport)
    formData.append('settings', JSON.stringify(fakeDataSettings))
    return this.http.post<void>(`${whiteRabbitApiUrl}/fake-data/${userId}`, formData)
  }

  abort(userId: string): Observable<void> {
    return this.http.get<void>(`${whiteRabbitApiUrl}/fake-data/${userId}`)
  }
}