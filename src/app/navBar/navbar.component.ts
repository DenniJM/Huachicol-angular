import {Component, OnInit, Input} from '@angular/core';
import {LoginService} from '../login/login.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {
  public sesion: boolean;
  @Input() estado: boolean;
  cerrarLogin: boolean;
  public BotonPrincipal: string;

  constructor(private loginService: LoginService) {
    this.sesion = false;
    this.cerrarLogin = false;
  }

  ngOnInit(): void {
    this.iniciarVariables();
  }

  iniciarVariables() {
    if (this.loginService.obtenerToken() === null) {
      this.sesion = false;
      this.BotonPrincipal = 'Login';
    } else {
      this.BotonPrincipal = 'Mi cuenta';
      this.sesion = true;
    }
  }

  LoginForm(estado: boolean) {
    this.cerrarLogin = estado;
    console.log('Recibiendo estado: ' + estado);
  }
}
