export const environment = {
  production: true,
  loginPoint: 'https://auth-service-huachicol.herokuapp.com/oauth/token',
  reportPoint: 'https://complain-service-huachicol.herokuapp.com/api/v1/user/center/coordinates',
  ductosPoint: 'https://complain-service-huachicol.herokuapp.com/api/v1/user/ductos/page/0',
  assignPoint: '',
  userAuth: 'angularjwtclientid',
  passAuth: '12345',
  userRole: 'CIUDADANO_ROLE',
  adminRole: 'ADMINISTRADOR_ROLE',
  invalidToken: 'invalid_token',
  crearDenuncia: 'https://complain-service-huachicol.herokuapp.com/api/v1/user/complain/',
  mostrarDenuncia: 'https://complain-service-huachicol.herokuapp.com/api/v1/user/complains/1'
};
