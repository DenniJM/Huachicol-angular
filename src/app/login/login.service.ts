import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {environment} from '../../environments/environment';
import { map } from 'rxjs/operators';
import {Router} from '@angular/router';


@Injectable()
export class LoginService {
  httpOptions: {};
  httpOptionsAuth: {};
  token;
  myAccount: boolean;
  denuncias;
  tecnicos;
  sedena;

  constructor(private http: HttpClient, private router: Router) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa(environment.userAuth + ':' + environment.passAuth),
      })
    };
    this.token = this.obtenerToken();
  }

  log(logUsuario, logContrasena) {
    const data = new URLSearchParams()
    data.set('username', logUsuario);
    data.set('password', logContrasena);
    data.set('grant_type', 'password');
    return this.http.post(environment.loginPoint, data.toString(), this.httpOptions).pipe(
      map(datos => {
        return datos;
      })
    );
  }


  obtenerToken() {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    return token;
  }

  obtenerDatos() {
    this.token = this.obtenerToken();
    if (!this.token) {
      return null;
    }
    this.httpOptionsAuth = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Bearer ' + this.token,
      })
    };
    return this.http.get(environment.reportPoint, this.httpOptionsAuth).pipe(
      map( datos => {
        return datos;
      })
    );
  }

  obtenerDuctos() {
    this.token = this.obtenerToken();
    if (!this.token) {
      return null;
    }
    this.httpOptionsAuth = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Bearer ' + this.token,
      })
    };
    return this.http.get(environment.ductosPoint, this.httpOptionsAuth).pipe(
      map( datos => {
        return datos;
      })
    );
  }

  setAccount(estado) {
    // Guarda el estado de la página mi cuenta
    this.myAccount = estado;
  }

  getAccount() {
    // Indica si se esta en la página de mi cuenta o no
    return this.myAccount;
  }

  finalizarSesion() {
    localStorage.removeItem('userAuth');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.setAccount(false);
    this.router.navigate(['']);
  }

  pedirDenuncias(callback) {
    return this.obtenerDatos().subscribe( datos => {
      this.denuncias = {
        "type": "FeatureCollection",
        "features": []
      };
      const json = JSON.parse(JSON.stringify(datos));
      for (const punto of json.complain_centers) {
        if (punto.hasOwnProperty('center')) {
          this.denuncias.features.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [punto.center.coordinates[0].toFixed(5), punto.center.coordinates[1].toFixed(5)]
            },
            properties: {Fecha: punto.fecha, Status: punto.estado, Distancia: punto.radio.toFixed(4), Pemex: false, SEDENA: false}
          });
        }
      }
      callback(true);
    }, (err: any) => {
      const messageError = JSON.stringify(err.error.error);
      console.log(messageError + ' = ' + environment.invalidToken + ' : ');
      console.log(messageError.match(environment.invalidToken));
      if (messageError.match(environment.invalidToken) !== null) {
        this.finalizarSesion();
        return null;
      }
    });
  }

  getDenuncias2() {
    return this.denuncias;
  }

  getDenuncias() {
    this.denuncias = {
      type: 'FeatureCollection',
      features: [
        {type: 'Feature', id: '15', properties: { Fecha: '', Status: 'En proceso', Distancia: 1000, Pemex: true, SEDENA: false},
          geometry: {type: 'Point', coordinates: [-99.1418708, 19.4440685]}},
        {type: 'Feature', id: '17', properties: { Fecha: '', Status: 'En proceso', Distancia: 700, Pemex: true, SEDENA: false},
          geometry: {type: 'Point', coordinates: [-99.0500927, 19.559797]}},
        {type: 'Feature', id: '21', properties: { Fecha: '', Status: 'En espera', Distancia: 1500, Pemex: false, SEDENA: true},
          geometry: {type: 'Point', coordinates: [-98.9352197, 19.835556]}},
        {type: 'Feature', id: '30', properties: { Fecha: '', Status: 'En espera', Distancia: 600, Pemex: true, SEDENA: false},
          geometry: {type: 'Point', coordinates: [-105.364325, 28.060944]}},
        {type: 'Feature', id: '42', properties: { Fecha: '', Status: 'Sin asignar', Distancia: 1800, Pemex: false, SEDENA: false},
          geometry: {type: 'Point', coordinates: [-104.950253, 27.278238]}},
        {type: 'Feature', id: '43', properties: { Fecha: '', Status: 'En proceso', Distancia: 300, Pemex: true, SEDENA: true},
          geometry: {type: 'Point', coordinates: [-108.814288, 25.761545]}}
      ]};
    return this.denuncias;
  }

  pedirTecnicos(callback) {
    this.tecnicos = {
      type: 'FeatureCollection',
      features: [
        {type: 'Feature', id: '2014', properties: { Nombre: 'Marisol Rodriguez', Status: 'Disponible'},
          geometry: {type: 'Point', coordinates: [-99.1418708, 19.4440685]}},
        {type: 'Feature', id: '0048', properties: { Nombre: 'Carlos Cortes', Status: 'Ocupado'},
          geometry: {type: 'Point', coordinates: [-99.0500927, 19.559797]}},
        {type: 'Feature', id: '4582', properties: { Nombre: 'Jorge Trejo', Status: 'Ocupado'},
          geometry: {type: 'Point', coordinates: [-98.9352197, 19.835556]}},
        {type: 'Feature', id: '5548', properties: { Nombre: 'Gilberto Rosas', Status: 'Disponible'},
          geometry: {type: 'Point', coordinates: [-105.364325, 28.060944]}},
      ]};
    callback(true);
  }

  getTecnicos() {
    return this.tecnicos;
  }

  pedirSedena(callback) {
    this.sedena = {
      type: 'FeatureCollection',
      features: [
        {type: 'Feature', id: '666', properties: { Status: 'Disponible'},
          geometry: {type: 'Point', coordinates: [-99.1418708, 19.4440685]}},
        {type: 'Feature', id: '999', properties: { Status: 'Ocupado'},
          geometry: {type: 'Point', coordinates: [-99.0500927, 19.559797]}},
        {type: 'Feature', id: '696', properties: { Status: 'Ocupado'},
          geometry: {type: 'Point', coordinates: [-98.9352197, 19.835556]}},
        {type: 'Feature', id: '911', properties: { Status: 'Disponible'},
          geometry: {type: 'Point', coordinates: [-105.364325, 28.060944]}},
      ]};
    callback(true);
  }

  getSedena() {
    return this.sedena;
  }

  asignacion(content) {
    this.token = this.obtenerToken();
    if (!this.token) {
      return null;
    }
    this.httpOptionsAuth = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Bearer ' + this.token,
      })
    };
    /*
    return this.http.post(environment.assignPoint, JSON.stringify(content), this.httpOptionsAuth).pipe(
      map( datos => {
        return datos;
      })
    );*/

    return this.http.get(environment.ductosPoint, this.httpOptionsAuth).pipe(
      map( datos => {
        return datos;
      })
    );
  }
}
