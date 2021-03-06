import { Component, OnInit, ViewEncapsulation} from '@angular/core';
import { NgbModal, NgbModalRef,ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { LoginService } from './login.service';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';
import decode from 'jwt-decode';


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
  rolSedena: string;
  cargando: boolean;
  modalReference: NgbModalRef;
  opcion1: string;
  opcion2: string;
  opcion3: string;
  sesion: boolean;
  closeResult: string;



  constructor(private modalService: NgbModal, private loginService: LoginService, private router: Router) {
    this.rolAdmin = environment.adminRole;
    this.rolUser = environment.userRole;
    this.rolSedena = environment.sedenaRole;
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
      localStorage.setItem( 'userName', username);
        if (usuario.match(this.rolAdmin) !== null) {
          this.cargando = false;
          (document.getElementById('logButton') as HTMLInputElement).disabled = false;
          this.loginService.setAccount(true);
          this.router.navigate(['admin']);
        } else if ((usuario.match(this.rolUser) !== null)) {
          document.getElementById("mensaje").innerHTML = "<div class='alert alert-success alert-dismissible fade show'><strong>Todo salio bien!</strong> Inicio de sesión exitoso.<button type='button' class='close' data-dismiss='alert'>&times;</button></div>";
          this.router.navigate(['user']);
          this.sesion = true;
        }else {
          this.router.navigate(['']);
          this.sesion = false;
        }
      }, err => {
        document.getElementById("mensaje").innerHTML = "<div class='alert alert-warning alert-dismissible fade show'><strong>ERROR!</strong>"+err +"<button type='button' class='close' data-dismiss='alert'>&times;</button></div>";
        this.cargando = false;
        (document.getElementById('logButton') as HTMLInputElement).disabled = false;
        console.log(err);
      }, () => {
        console.log('Finalizado inicio de sesion');
      }
    );
  }

  logOut() {
    this.loginService.finalizarSesion();
    //document.getElementById("mensaje").innerHTML = "<div class='alert alert-success alert-dismissible fade show'><strong>Todo salio bien!</strong> Se cerró la sesión exitosamente.<button type='button' class='close' data-dismiss='alert'>&times;</button></div>";
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

  open(login) {
    this.modalService.open(login, {ariaLabelledBy: 'modal-basic-title', size: 'lg', centered: true}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }
}
