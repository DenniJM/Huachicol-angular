import {Component, EventEmitter, OnInit, Output, ViewEncapsulation} from '@angular/core';
import { NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { LoginService } from './login.service';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class LoginComponent implements OnInit {
  data;
  rolUser: string;
  rolAdmin: string;
  cargando: boolean;
  modalReference: NgbModalRef;
  opcion1: string;
  opcion2: string;
  opcion3: string;
  sesion: boolean;
  @Output() cerrar: EventEmitter<boolean> = new EventEmitter<boolean>();


  constructor(private modalService: NgbModal, private loginService: LoginService, private router: Router) {
    this.rolAdmin = environment.adminRole;
    this.rolUser = environment.userRole;
    this.cargando = false;
    this.opcion1 = 'Iniciar sesión';
    this.opcion2 = 'Registrarse';
    this.opcion3 = 'Finalizar sesión';
    this.sesion = false;
  }

  ngOnInit() {
    if (this.loginService.obtenerToken() === null) {
      this.sesion = false;
    } else {
      this.sesion = true;
    }
  }

  logIn(username: string, password: string, event: Event) {
    event.preventDefault();
    this.cargando = true;
    (document.getElementById('logButton') as HTMLInputElement).disabled = true;
    this.loginService.log(username, password).subscribe(datos => {
      this.data = datos;
      const datosString = JSON.stringify(this.data);
      const datosJSON = JSON.parse(datosString);
      const token = datosJSON.access_token;
      const datosAPI = token.toString().split( '.', 3);
      const usuario = JSON.stringify(JSON.parse(atob(datosAPI[1])).authorities[0]);
      localStorage.setItem( 'userAuth', datosString);
      localStorage.setItem( 'token', token);
      localStorage.setItem( 'user', usuario);
      if (usuario.match(this.rolAdmin) !== null) {
        this.cargando = false;
        (document.getElementById('logButton') as HTMLInputElement).disabled = false;
        this.loginService.setAccount(true);
        this.router.navigate(['admin']);
      } else if ((usuario.match(this.rolUser) !== null)) {
        this.router.navigate(['user']);
        this.sesion = true;
      } else {
        this.router.navigate(['']);
        this.sesion = false;
      }
    }, err => {
      this.cargando = false;
      (document.getElementById('logButton') as HTMLInputElement).disabled = false;
      console.log(err);
    }, () => {
      console.log('Finalizado inicio de sesion');
    });
  }

  logOut() {
    this.loginService.finalizarSesion();
    this.sesion = false;
    this.router.navigate(['']);
  }

  miPagina() {
    const usuario = localStorage.getItem('user');
    if (!usuario) {
      this.logOut();
    } else {
      this.loginService.setAccount(true);
      if (usuario.match(environment.adminRole) !== null) {
        this.router.navigate(['admin']);
      } else if (usuario.match(environment.userRole) !== null) {
        this.router.navigate(['user']);
      } else {
        this.router.navigate(['']);
      }
    }
  }

  cerrarLogin() {
    console.log('Mandando señal true para cerrar');
    this.cerrar.emit(true);
  }
}
