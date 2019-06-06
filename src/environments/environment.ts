// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  loginPoint: 'https://auth-service-huachicol.herokuapp.com/oauth/token',
  reportPoint: 'https://damp-ocean-98658.herokuapp.com/api/v1/user/center/coordinates',
  ductosPoint: 'https://complain-service-huachicol.herokuapp.com/api/v1/user/ductos/page/',
  assignPoint: 'https://complain-service-huachicol.herokuapp.com/api/v1/user/center/coordinates',
  userAuth: 'angularjwtclientid',
  passAuth: '12345',
  userRole: 'CIUDADANO_ROLE',
  adminRole: 'ADMINISTRADOR_ROLE',
  invalidToken: 'invalid_token',
  crearDenuncia: 'https://complain-service-huachicol.herokuapp.com/api/v1/user/complain/',
  mostrarDenuncia: 'https://complain-service-huachicol.herokuapp.com/api/v1/user/complains/1'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
