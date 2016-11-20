angular.module('perizieApp')
    .controller('loginController', 
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

angular.module('perizieApp')
    .controller('logoutController', ['$scope', '$location', 'AuthService',
				     function ($scope, $location, AuthService) {
			$scope.logout = function () {

			    // call logout from service
			    AuthService.logout()
			    .then(function () {
				    $location.path('/login');
				});
			};
		    }]);

angular.module('perizieApp')
    .controller('registerController', ['$scope', '$location', 'AuthService',
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

angular.module('perizieApp')
    .controller('homeController', ['$scope', '$location', 
				   function($scope, $location){
			var vm = this;  
			$scope.go = function (path) {
			    $location.path(path);
			};
		    }]);
angular.module('perizieApp')
    .controller('georicercaController', ['$scope', '$window',    
					 function($scope, $window){  
			$scope.DATA_MIN = new Date(2010, 0, 1);
			$scope.DISTANZA = 5;
			$scope.perizie =[{
				Data_Evasione_Perizia: new Date(2015, 3, 11),
				Indirizzo: "c.so alcide de gasperi",
				N_civico: 400,
				Provincia: "BA",
				Comune: "Bari",
				CAP: "70131",
				SUPERFICIE_COMMERCIALE_MQ: "70",
				Tipologia_edilizia: "Casa indipendente 1 piano.",
				Valore_di_mercato_del_lotto: "190000",
				Anno_di_costruzione:1950,
				Impianto_elettrico_anni:13,
				Impianto_idraulico_anni:13
			    },{
				Data_Evasione_Perizia: new Date(2012, 9, 9),
				Indirizzo: "p.zza Umberto 830",
				N_civico: 83,
				Provincia: "BA",
				Comune: "Bari",
				CAP: "70131",
				SUPERFICIE_COMMERCIALE_MQ: "180",
				Tipologia_edilizia: "Casa indipendente 2 piani.",
				Valore_di_mercato_del_lotto:"200000",
				Impianto_elettrico_anni:2,
				Impianto_idraulico_anni:2
                                }];
			$scope.submit = function(){
			    $scope.submitted = true;
			    if ($scope.form.input.$error.required){
				$scope.errorMessage = 'E\' necessario inserire un indirizzo!';
				return;
			    }
			    $scope.form.input.$error = false;
			    $scope.visPerizia = true;
			}
			$scope.table = function(){
			    $scope.printed = true;
			}
			$scope.print = function(){
			    printIt();
			}
			printIt = function(){ 
			    var table = document.getElementById('tabella').innerHTML;   
			    var myWindow = $window.open('', '', 'width=800, height=600');   
			    myWindow.document.write(table);   
			    myWindow.print();  
			};

		    }]);

angular.module('perizieApp')
    .controller('ricercaController', ['$scope', 
		 function($scope){
			$scope.perizia = {
			    CRIF: "000534567.05424",
			    Data_Evasione_Perizia: new Date(2016, 4, 29),
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
			    Impianto_elettrico_anni:15,
			    Impianto_idraulico_anni:15,
			    Provincia: "BA",
			    Comune: "Bari",
			    CAP: "70131",
			    SUPERFICIE_COMMERCIALE_MQ: "150",
			    Valore_di_mercato_del_lotto: "200000",
			    SUPERFICI_SECONDARIE_ANNESSE_E_COLLEGATE: [
			{Descrizione: "balcone", Misura_mq: "6"},
			{Descrizione: "cantina", Misura_mq: "22"},
			{Descrizione: "portico", Misura_mq: "3"}
								       ]
			}
			$scope.submit = function(){
			    $scope.submitted = true;
                            if ($scope.form.input.$error.required){
				$scope.errorMessage = 'E\' necessario inserire il nome di un file!';
				return;
			    } 
                            if ($scope.form.input.$error.pattern){
				$scope.errorMessage = 'Il nome del file non è valido. Esempio di file valido: "05424.000100975400_0001_001.RiepilogoPerizia.pdf"';
				return;
			    }
                            $scope.form.input.$error = false;
                            $scope.visPerizia = true;
			}
		    }]);
							      
angular.module('perizieApp')
    .controller('uploadController', ['$scope', 'Upload', '$window', 
				     function($scope, Upload, $window){
			$scope.submitted = false;
			$scope.cercata = false;
			
			$scope.perizia = {
			    CRIF: "000534567.05424",
			    Data_Evasione_Perizia: new Date(2016, 4, 29),
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
			
			$scope.submit = function(){ //function to call on form submit
			    if ($scope.form.file.$valid && $scope.filePerizia) { //check if form is valid
				$scope.uploadFile($scope.filePerizia); //call upload function
				$scope.submitted = true;
			    }	
			}
			
			$scope.cerca = function(){
			    $scope.cercata = true;  
			    document.getElementById('selectedFile').click();
			}
			
			$scope.uploadFile = function(file){
			    Upload.upload({
				    url: '/api/upload', //webAPI exposed to upload the file
				    data: {file: file} //pass file as data, should be user ng-model
				}).then(function (resp) { //upload function returns a promise
					if (resp.data.error_code != 0){
					    $window.alert('Errore durante il caricamento del file.');
					} 
				    }, function (resp) { //catch error
					console.log('Error status: ' + resp.status);
					$window.alert('Error status: ' + resp.status);
				    
				    });
			};
						
			$scope.visualizza = function(){
			   $scope.show = true;
			}
			
			$scope.carica = function(){
			    $scope.form.file.name = '';
			    document.getElementById('selectedFile').click();
			}
						
		    }]);



