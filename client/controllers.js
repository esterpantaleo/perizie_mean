angular.module('perizieApp').controller('loginController',
  ['$scope', '$location', 'AuthService',
  function ($scope, $location, AuthService) {

    $scope.login = function () {

      // initial values
      $scope.error = false;
      $scope.disabled = true;

      // call login from service
      AuthService.login($scope.loginForm.username, $scope.loginForm.password)
        // handle success
        .then(function () {
          $location.path('/');
          $scope.disabled = false;
          $scope.loginForm = {};
        })
        // handle error
        .catch(function () {
          $scope.error = true;
          $scope.errorMessage = "Invalid username and/or password";
          $scope.disabled = false;
          $scope.loginForm = {};
        });

    };

}]);

angular.module('perizieApp').controller('logoutController',
  ['$scope', '$location', 'AuthService',
  function ($scope, $location, AuthService) {

    $scope.logout = function () {

      // call logout from service
      AuthService.logout()
        .then(function () {
          $location.path('/login');
        });

    };

}]);

angular.module('perizieApp').controller('registerController',
  ['$scope', '$location', 'AuthService',
  function ($scope, $location, AuthService) {

    $scope.register = function () {

      // initial values
      $scope.error = false;
      $scope.disabled = true;

      // call register from service
      AuthService.register($scope.registerForm.username, $scope.registerForm.password)
        // handle success
        .then(function () {
          $location.path('/login');
          $scope.disabled = false;
          $scope.registerForm = {};
        })
        // handle error
        .catch(function () {
          $scope.error = true;
          $scope.errorMessage = "Something went wrong!";
          $scope.disabled = false;
          $scope.registerForm = {};
        });

    };

  }]);

angular.module('perizieApp').controller('homeController', ['$scope', '$location', function($scope, $location){
    var vm = this;  
    $scope.go = function (path) {
	$location.path(path);
    };
}]);

angular.module('perizieApp').controller('ricercaController', ['$scope', function($scope){  
    var vm = this;   
    vm.parola = /^\s*\w*\.pdf\s*$/;
    vm.submitted = false;
    vm.perizia = {
	CRIF: "000534567.05424",
	Data: new Date(2016, 4, 29),
	Indirizzo: "p.zza Umberto",
	N_civico: 87,
	Piano:2,
	Particella:1217,
	Categoria:"A/3",
	Consistenza:6.5,
	RC:386.05,
	Foglio:107,
	Tipologia_edilizia:"appartamento",
	SUPERFICIE_COMMERCIALE_MQ:96.35,
	Anno_di_costruzione:1968,
	Impianto_elettrico_Vetusta_anni:15,
	Impianto_idraulico_Vetusta_anni:15,
	Provincia: "BA",
	Comune: "Bari",
	CAP: "70131",
	SUPERFICIE_COMMERCIALE_MQ: "150",
	Valore_di_mercato_del_lotto: "200000",
	balcone:"6",
	cantina:"22",
	portico:"3"
    }
    vm.visualizzaPerizia = function(){
	vm.visPerizia = true;
    }
}]);
							      
angular.module('perizieApp').controller('uploadController', ['$scope', '$sce', 'AuthService', 'Upload', '$window', '$location', function($scope, $sce, AuthService, Upload, $window, $location){

    var vm = this;

    vm.DATA_MIN = new Date(2010, 0, 1);
    vm.DISTANZA = 5;

    vm.parte1 = true;
    vm.parte2 = false;
    vm.submitted = false;
    vm.tabella = false;
    
    vm.cercata = false;
    vm.cercate = false;
    vm.parola = /^\s*\w*\.pdf\s*$/;
    vm.perizia = {
	CRIF: "000534567.05424",
	Data: new Date(2016, 4, 29),
	Indirizzo: "p.zza Umberto",
	N_civico: 87,
	Piano:2,
	Particella:1217,
	Tipologia_edilizia:"appartamento",
	Categoria:"A/3",
	Consistenza:6.5,
	RC:386.05,
	Foglio:107,
	SUPERFICIE_COMMERCIALE_MQ:96.35,
	Anno_di_costruzione:1968,
	Impianto_elettrico_Vetusta_anni:15,
	Impianto_idraulico_Vetusta_anni:15,
	Provincia: "BA",
	Comune: "Bari",
	CAP: "70131",
	SUPERFICIE_COMMERCIALE_MQ: "150",
	Valore_di_mercato_del_lotto: "200000",
	balcone:"6",
	cantina:"22",
	portico:"3"
	};
    
    vm.submit = function(){ //function to call on form submit
	if (vm.upload_form.file.$valid && vm.file) { //check if form is valid
	    vm.upload(vm.file); //call upload function
	    vm.submitted = true;
	}	
    }

    vm.cerca = function(){
	vm.cercata = true;  
	document.getElementById('selectedFile').click();
    }
        
    vm.upload = function(file){
	Upload.upload({
	    url: '/user/upload', //webAPI exposed to upload the file
	    data: {file: file} //pass file as data, should be user ng-model
	}).then(function (resp) { //upload function returns a promise
	    if (resp.data.error_code != 0){
		$window.alert('Errore durante il caricamento del file.');
	    } 
	}, function (resp) { //catch error
	    console.log('Error status: ' + resp.status);
	    $window.alert('Error status: ' + resp.status);
	}, function (evt) {
	    console.log(evt);
	    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
	    console.log('percentuale: ' + progressPercentage + '% ' + evt.config.data.file.name);
	});
    };

    vm.perizie = null;
    
    vm.cercaPerizie = function(){
	vm.cercate = true;
	vm.perizie =[{
	    Data: new Date(2015, 3, 11),
	    Indirizzo: "c.so alcide de gasperi",
	    N_civico: 400,
	    Provincia: "BA",
	    Comune: "Bari",
	    CAP: "70131",
	    SUPERFICIE_COMMERCIALE_MQ: "70",
	    Tipologia_edilizia: "Casa indipendente 1 piano.",
	    Valore_di_mercato_del_lotto: "190000",
	    balcone:3,
	    Anno_di_costruzione:1950,
	    Impianto_elettrico_Vetusta_anni:13,
	    Impianto_idraulico_Vetusta_anni:13
	},{
	    Data: new Date(2012, 9, 9),
	    Indirizzo: "p.zza Umberto 830",
	    N_civico: 83,
	    Provincia: "BA",
	    Comune: "Bari",
	    CAP: "70131",
	    SUPERFICIE_COMMERCIALE_MQ: "180",
	    Tipologia_edilizia: "Casa indipendente 2 piani.",
	    Valore_di_mercato_del_lotto:"200000",
	    balcone:6,
	    giardino:20,
	    Impianto_elettrico_Vetusta_anni:2,
	    Impianto_idraulico_Vetusta_anni:2
	}];
    }
    
    vm.visualizzaPerizia = function(){
	vm.parte1 = false;
	vm.parte2 = true;
    }
    
    vm.carica = function(){
	vm.upload_form.file.name = '';
	document.getElementById('selectedFile').click();
    }


    vm.creaTabella = function(){
	vm.tabella = true;
    }

    vm.stampaPerizie = function(){	
	vm.printIt();
    }

    vm.printIt = function(){
	var table = document.getElementById('tabella').innerHTML;
	var myWindow = $window.open('', '', 'width=800, height=600');
	myWindow.document.write(table);
	myWindow.print();
    };
    
}]);



