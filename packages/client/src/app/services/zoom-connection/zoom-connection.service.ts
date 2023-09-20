import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MonoTypeOperatorFunction, Observable, firstValueFrom, from, pipe, retry, timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ZoomConnectionService {

  private apiToken?: string;
  private seq: number;
  constructor(private http: HttpClient) {
    this.seq = 0;
   }

  setApiToken(token: string | undefined): void {
    this.apiToken = token;
    if (this.apiToken) {
      console.log('set token', this.apiToken);
      this._setSeq()
    }
  }

  sendPayload(text: string): void {
    if (!this.apiToken) {
      throw new Error('No Zoom API token defined');
    }
    const url = `${this.apiToken}&seq=${this.seq++}`
    
    from(fetch(url, { method: 'POST', body: text, mode: 'no-cors', credentials: 'omit', headers: { 'content-type': 'text/plain' } })).pipe(this._expBackoff(3, 100)).subscribe((result) => {
      console.log('send caption result',  result);
    })
  }

  private _setSeq(): void {
    if (!this.apiToken) {
      throw new Error('No Zoom API token defined');
    }
    const urlParts = this.apiToken.split('?');
    const url = `${urlParts[0]}/seq?${urlParts[1]}`;

    this.http.get(url, { withCredentials: false }).subscribe((result) => {
      console.log('httpclient seq result', result);
    })

    from(fetch(url, { method: 'get', mode: 'no-cors' })).pipe(this._expBackoff(3,100)).subscribe((result) => {
      console.log('httpclient get seq result', result);
    })
  }

  private _expBackoff(maxTries: number, ms: number): MonoTypeOperatorFunction<unknown> {
    let attempts = 0;
    return pipe(
      retry({ count: maxTries, delay: (err) => {
        console.log('retry err', err);
        attempts++;
        return timer(Math.pow(ms, attempts))
      }})
    )
  }
}
