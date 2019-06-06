import { Component, OnInit, Input } from '@angular/core';

import Map from 'ol/Map';
import OlTileLayer from 'ol/layer/Tile';
import Vector from 'ol/layer/Vector';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import OlView from 'ol/View';
import OSM from 'ol/source/OSM';
import FullScreen from 'ol/control/Fullscreen';
import OverviewMap from 'ol/control/OverviewMap';
import ScaleLine from 'ol/control/ScaleLine';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Icon from 'ol/style/Icon';
import Geolocation from 'ol/Geolocation';
import Feature from 'ol/Feature';
import Fill from 'ol/style/Fill';
import CircleStyle from 'ol/style/Circle';
import Point from 'ol/geom/Point';


import {LeerJSONService} from '../leer-json.service';

import {LoginService} from '../login/login.service';
import {environment} from '../../environments/environment';
import LineString from 'ol/geom/LineString';




@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})

export class MapaComponent implements OnInit {
  map: Map;
  source: OSM;
  layer: OlTileLayer;
  denunciaLayer: Vector;
  denunciasGeojson;
  ductosURL: Array<string>;
  ductosGeojson;
  ductosLayer: Vector;
  view: OlView;
  overviewView: OlView;
  private geolocation: Geolocation;
  geolocationerror: boolean;
  geolocationmsg;
  accuracyFeature: Feature;
  positionFeature: Feature;
  geolocsource: VectorSource;
  geoloclayer: VectorLayer;
  geolocLiveCoords;
  @Input() isChecked: boolean;

  constructor(private ljson: LeerJSONService, private loginService: LoginService) {
    this.ductosURL = ['ductos.json', 'sistemaGuaymas.json', 'sistemaHobbs-Mendez.json', 'sistemaNorte.json',
      'sistemaPetroquimico.json', 'sistemaProgreso.json', 'sistemaRosarito.json', 'sistemaSur-Golfo-Centro-Occidente.json',
        'sistemaTopolobampo.json'
    ];
    this.isChecked = false;
  }

  ngOnInit() {
    this.initMap();
    this.geoLocal();
  }

  initMap() {
    // No es necesaria la linea si se trabaja con EPSG: 4326 como proyeccion
    // var centro = ol.proj.fromLonLat([-100,21]);
    this.view = new OlView({center: [-100, 21], zoom: 4, minZoom: 4, projection: 'EPSG:4326'});
    this.overviewView = new OlView({projection: 'EPSG:4326'});
    this.source = new OSM();
    this.layer = new OlTileLayer({
      preload: 4,
      source: this.source,
    });
    this.map = new Map({
      target: 'mapa',
      layers: [this.layer],
      loadTilesWhileAnimating: true,
      view: this.view
    });
    this.map.addControl(new FullScreen());
    this.map.addControl(new OverviewMap({view: this.overviewView}));
    this.map.addControl(new ScaleLine());
    const user = localStorage.getItem('user');
    if (user.match(environment.adminRole) !== null) {
      this.cargarDuctos();
      this.denunciasGeojson = this.loginService.getDenuncias2();
      this.cargarDenuncias();
    }
  }

  cargarDenuncias() {
    const sourceDenuncia = new VectorSource({
      features: (new GeoJSON()).readFeatures(this.denunciasGeojson)
    });
    const iconsrc = '/assets/img/oil-drop.png';
    const sz = [.3, .4, .5, .8];
    const icon = new Icon({
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      opacity: 0.75,
      src: iconsrc,
      scale: sz[0]
    });
    const iconStyle = new Style({
      image: icon
    });
    this.denunciaLayer = new Vector({
      source: sourceDenuncia,
      style: (feature, resolution) => {
        const scale = this.tamano(resolution);
        icon.setScale(sz[scale]);
        return iconStyle;
      }
    });
    this.map.addLayer(this.denunciaLayer);
  }

  geoLocal() {
    this.geolocation = new Geolocation({
      projection: 'EPSG: 4326',
      tracking: true,
      trackingOptions: {
        enableHighAccuracy: true,
        maximumAge: 2000
      }
    });

    this.geolocation.on('error', (error) => {
      this.geolocationerror = true;
      this.geolocationmsg = error;
    });

    this.accuracyFeature = new Feature();
    this.geolocation.on('change:accuracyGeometry', () => {
      this.accuracyFeature.setGeometry(this.geolocation.getAccuracyGeometry());
    });

    this.positionFeature = new Feature();
    this.positionFeature.setStyle(new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({
          color: '#3399CC'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 2
        })
      })
    }));
    this.geolocation.on('change:position', () => {
      const coordinates = this.geolocation.getPosition();
      this.positionFeature.setGeometry(coordinates ?
        new Point(coordinates) : null);
    });

    this.geolocsource = new VectorSource({});
    this.geoloclayer = new VectorLayer({
      source: this.geolocsource,
    });
  }

  toggleGeolocation(checked) {
    // erase any previous errors
    this.geolocationmsg = '';
    this.geolocationerror = false;
    //// toggled on
    if (checked) {
      this.geolocation.setTracking(checked); // set on
      this.geolocsource.addFeatures([this.accuracyFeature, this.positionFeature]) ;
      const centerGeo = this.geolocation.getPosition();
      // zoom there
      if (centerGeo) {
        this.map.addLayer(this.geoloclayer);
        this.map.getView().animate({
          center: centerGeo,
          duration: 2000,
          zoom: 16
        });
      }
      // show the geolocation coords in html all the time
      this.geolocLiveCoords = this.geolocation.getPosition();
    } else { // geolocation off
      this.geolocation.setTracking(checked);
      this.geolocsource.clear();
      this.geolocLiveCoords = '';
      this.map.removeLayer(this.geoloclayer);
    }
  }

  tamano(resolusion) {
    let sz;
    // console.log(resolusion);
    if (resolusion > .01) {
      sz = 0;
    } else if (resolusion > .0005) {
      sz = 1;
    } else if (resolusion > .00005) {
      sz = 2;
    } else {
      sz = 3;
    }
    return sz;
  }

  cargarDuctos() {
    let estilo;
    const img = new Image();
    img.src = '/assets/img/oil-pipe128.png';
    img.onload = () => {
      const tCnv = document.createElement('canvas');
      const tCtx = tCnv.getContext('2d') as CanvasRenderingContext2D;
      const cnv = document.createElement('canvas');
      const ctx = cnv.getContext('2d') as CanvasRenderingContext2D;
      const size = 5;
      tCnv.width = size;
      tCnv.height = size;
      tCtx.rect(0, 0, size, size);
      tCtx.fillStyle = 'rgba(200,200,200,0.3)';
      tCtx.fill();
      tCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, size, size);
      const pattern = ctx.createPattern(tCnv, 'repeat');
      const str = new Stroke();
      str.setWidth(size);
      // str.setColor(pattern);
      estilo = new Style({
        stroke: str,
      });
    };
    let sourceDuctos;
    this.loginService.obtenerDuctos().subscribe(data => {
      const datos = JSON.stringify(data);
      const datosJSON = JSON.parse(datos);
      const vector = new VectorSource();
      let line;
      let points;
      datosJSON.content.forEach(item => {
        points = [];
        for (const i of item.location.coordinates) {
          points.push(i.coordinates);
        }
        line = new Feature({
          geometry: new LineString(points)
        });
        vector.addFeature(line);
      });
      sourceDuctos = vector;
      this.ductosLayer = new Vector({
        source: sourceDuctos,
        style: estilo
      });
      this.ductosLayer = new Vector({
        source: sourceDuctos,
        style: estilo
      });
      this.map.addLayer(this.ductosLayer);
    }, () => {
      console.log('Ductos locales');
      this.ductosURL.forEach(url => {
        this.ljson.getJSON('/ductos/' + url).subscribe(data => {
          this.ductosGeojson = data;
          sourceDuctos = new VectorSource({
            features: (new GeoJSON()).readFeatures(this.ductosGeojson)
          });
          this.ductosLayer = new Vector({
            source: sourceDuctos,
            style: estilo
          });
          this.map.addLayer(this.ductosLayer);
        });
      });
    });
  }

  actualizar() {
    this.denunciasGeojson = this.loginService.getDenuncias2();
    this.map.removeLayer(this.denunciaLayer);
    this.cargarDenuncias();
  }

  flyTo(location, done) {
     let durationAnimation = 2000;
     const view = this.map.getView();
     let zoomMap = view.getZoom();
     let zoom2 = view.getMinZoom();
     if (zoomMap === 4) {
       zoom2 = zoomMap;
       zoomMap = 7;
     } else if (zoomMap < 8) {
       zoom2 = zoomMap - 1;
     } else if (zoomMap < 14) {
       zoom2 = zoomMap - 2;
     } else if (zoomMap < 18) {
       zoom2 = zoomMap - 6;
     } else {
       durationAnimation = 6000;
       zoom2 = zoomMap - 10;
     }
     let parts = 2;
     let called = false;
     function callback(complete) {
       -- parts;
       if (called) {
         return;
       }
       if (parts === 0 || !complete) {
         called = true;
         done(complete);
       }
     }
     view.animate({
       center: location,
       duration: durationAnimation
     }, callback);
     view.animate({
       zoom: zoom2,
       duration: durationAnimation / 2
     }, {
       zoom: zoomMap,
       duration: durationAnimation / 2
     }, callback);
   }
}
