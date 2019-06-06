import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders , HttpErrorResponse} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import { map, catchError } from 'rxjs/operators';
import {Router} from '@angular/router';
import {Denuncia} from '../../denuncia';
import { Observable, throwError } from 'rxjs';



@Injectable()
export class RealizarDenunciaService {
  private httpHeaders = new HttpHeaders().set('Content-Type', 'application/json');
  token;
  public url: string;

  constructor(private http: HttpClient, private router: Router) {
    this.url = environment.crearDenuncia;
  }

  getToken(){
    this.token = localStorage.getItem('token');
    if (!this.token) {
      return null;
    }
    return this.token;
  }


  setDenuncia(denuncia: Denuncia): Observable<any>{
    console.log('denuncias insertar');
    this.token = this.getToken();
    if (!this.token) {
      return null;
    }
    this.httpHeaders.set('Authorization', 'Bearer ' + this.token );
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.token,
      })
    };
    console.log('denuncia ' + JSON.stringify(denuncia));
    console.log(httpOptions);
    console.log({headers: this.httpHeaders});
    // const jsonDenuncia = JSON.stringify(denuncia);
    // console.log("DENUNCIA "+ jsonDenuncia+ "token"+this.httpHeaders);
    return this.http.post(this.url, JSON.stringify(denuncia), httpOptions).pipe(
      map(datos => {
        console.log('datos post ' , datos);
        return datos;
      }),
      catchError(e => {
        console.log('post');
        return throwError(e);
      })
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    const messageError = JSON.stringify(error.error.error);
    console.log('Error: ' + messageError);
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }

}
