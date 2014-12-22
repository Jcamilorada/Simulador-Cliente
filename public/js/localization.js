// Support Localization
App.config(function($translateProvider) {
    $translateProvider.translations('es', {

    license_accept: 'Aceptar',
    license_accept_quick: 'Aceptar (ir a Inicio Rapido)',
    check_list_error: 'Todas las recomendaciones deben ser validadas.',
    home_title : 'Simulador Tacan',
    license_title :'Licencia de Uso',

    choose_procedure: 'Seleccionar',


    // Patient Information
    information_title: 'Información',
    patient_name: 'Nombre',
    patient_height: 'Altura (cms)',
    patient_weight: 'Peso (Kg)',
    patient_genre: 'Género',
    patient_age: 'Edad',
  });

  $translateProvider.preferredLanguage('es');
});