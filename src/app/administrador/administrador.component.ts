import {Component, OnInit, ViewChild} from '@angular/core';
import {LoginService} from '../login/login.service';
import {Router} from '@angular/router';
import { NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { getDistance } from 'ol/sphere';

import { MapaComponent } from '../mapa/mapa.component';



@Component({
  selector: 'app-administrador',
  templateUrl: './administrador.component.html',
  styleUrls: ['./administrador.component.css']
})
export class AdministradorComponent implements OnInit {
  denuncias;
  tecnicos;
  sedena;
  wId: string;
  wCoord: string;
  wDescription: string;
  wStatus: string;
  wDistance: string;
  wAction: string;
  modalReference: NgbModalRef;
  puntoActual;
  respuesta;
  tituloSuccess: string;
  mensaje: string;
  success: boolean;
  @ViewChild('mapa') mapa: MapaComponent;

  constructor(private loginService: LoginService, private router: Router, private modalService: NgbModal) {
    // Se espera que los datos esten en formato GeoJSON
    this.denuncias = this.loginService.getDenuncias();
    this.wId = 'col-1';
    this.wCoord = 'col-md-2';
    this.wDescription = 'col-md-3';
    this.wStatus = 'col-md-2';
    this.wDistance = 'col-md-2';
    this.wAction = 'col-md-2';
  }

  ngOnInit() {
    this.iniciarVariables();
    this.actualizarTablaDenuncias();
  }

  openVerticallyCentered(content) {
    console.log(content);
    this.modalReference = this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'lg' });
  }

  iniciarVariables() {
    const token = this.loginService.obtenerToken();
    this.loginService.setAccount(true);
    if (!token) {
      this.loginService.setAccount(false);
      console.log('No fue posible obtener token, redirigiendo');
      this.router.navigate(['']);
    }
  }

  distancia(pt1, pt2) {
    let dis = 0;
    dis += getDistance(pt1, pt2, null);
    let output;
    if (dis > 1000) {
      output = (Math.round(dis / 1000 * 100) / 100) +
        ' ' + 'km';
    } else {
      output = (Math.round(dis * 100) / 100) +
        ' ' + 'm';
    }
    return output;
  }

  actualizarMapa(): void {
    this.mapa.actualizar();
  }

  verPunto(punto) {
    this.mapa.flyTo(punto, () => {});
  }

  actualizarTablaDenuncias() {
  this.loginService.pedirDenuncias((status) => {
    if (status) {
      this.denuncias = this.loginService.getDenuncias2();
      console.log(this.denuncias);
      this.actualizarMapa();
    }
  });
  }

  tablaTecnicos(id, punto) {
    this.loginService.pedirTecnicos((status) => {
      if (status === true) {
        this.tecnicos = this.loginService.getTecnicos();
        this.puntoActual = punto;
        this.openVerticallyCentered(id);
      }
    });
  }

  tablaSedena(id, punto) {
    this.loginService.pedirSedena((status) => {
      if (status === true) {
        this.sedena = this.loginService.getSedena();
        this.puntoActual = punto;
        this.openVerticallyCentered(id);
      }
    });
  }

  enviarAsignacion(id, tipo, modal) {
    const respuesta = {
      type: 'Registro',
      datos: [
        {
          type: 'Punto',
          id: 'ID_CENTRO'
        },
        {
          type: 'Asignado',
          id: '(ID_PEMEX|ID_SEDENA)'
        }
      ],
      destino: '(PEMEX|SEDENA)'
    };
    const respuesta1 = JSON.stringify(respuesta);
    this.respuesta = JSON.parse(respuesta1);
    this.respuesta.datos[0].id = this.puntoActual.id;
    this.respuesta.datos[1].id = id.id;
    this.loginService.asignacion(this.respuesta).subscribe(status => {
      console.log(status);
      this.mostrarMensaje('Asignación completa', 'Asignación completada con exito', true, modal, () => {});
    }, error1 => {
        this.mostrarMensaje('Asignación cancelada', 'La asignación no fue posible, accion cancelada, intente más tarde',
          false, modal, () => {});
        console.log(error1);
      }
      );
  }

  mostrarMensaje(titulo, cuerpo, estado, modal, callback) {
    this.mensaje = cuerpo;
    this.tituloSuccess = titulo;
    this.success = estado;
    if (estado) {
      this.modalReference.close();
      this.actualizarTablaDenuncias();
    }
    this.openVerticallyCentered(modal);
    callback(true);
  }

}


