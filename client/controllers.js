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
				    $scope.errorMessage = "Nome utente e/o password invalidi";
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
				    $scope.errorMessage = "Errore!";
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
    .controller('georicercaController', ['$scope', '$window', '$http',    
					 function($scope, $window, $http){  
			$scope.DATA_MIN = new Date(2010, 0, 1);
			$scope.DISTANZA = 5;
			$scope.limite = 10;
						
			$scope.submit = function(){
			    if ($scope.form.input.$error.required){
				$scope.errorMessage = 'E\' necessario inserire un indirizzo!';
				return;
			    }
			    $scope.form.input.$error = false;
			    $scope.submitted = true;
			    console.log('distanza=' + $scope.DISTANZA); 
			    $http.get('/api/distanza/' + $scope.DISTANZA + '/limite/' + $scope.limite + '/DATA_MIN/' + $scope.DATA_MIN + '/indirizzo/' + $scope.indirizzo)
			    .success(function (data, status) { 
				    $scope.perizie = data;
				    console.log($scope.perizie);  
				})
			    .error(function (data) { 
				    console.log("Errore nel trovare le perizie"); 
				});
			    $scope.visPerizia = true;
			}

			$scope.table = function(){
			    $scope.printed = true;
			}

			$scope.print = function(){
			    var table = document.getElementById('tabella').innerHTML;   
			    var myWindow = $window.open('', '', 'width=800, height=600'); 
			    myWindow.document.write(table);  
			    myWindow.print();       
			}
		    }]);

angular.module('perizieApp')
    .controller('ricercaController', ['$scope', '$http',
				      function($scope, $http){
			$scope.submit = function(){
			    $scope.submitted = true;
			    console.log($scope.filePerizia);
                            if ($scope.form.input.$error.required){
				$scope.errorMessage = 'E\' necessario inserire il nome di un file!';
				return;
			    } 
                            if ($scope.form.input.$error.pattern){
				$scope.errorMessage = 'Il nome del file non è valido. Esempio di file valido: "05424.000100975400_0001_001.RiepilogoPerizia.pdf"';
				return;
			    }
                            $scope.form.input.$error = false;
			    $http.get('/api/file/' + $scope.filePerizia)
			    .success(function (data, status) {
				    console.log("Perizia del file " + $scope.filePerizia + " trovata");
				    $scope.perizia = data;
				}) 
				.error(function (data) {
					console.log("Errore nel trovare la perizia del file " + $scope.filePerizia.name);
				    });
                            $scope.visPerizia = true;
			}
		    }]);
							      
angular.module('perizieApp')
    .controller('uploadController', ['$scope', '$window', '$http', 'Upload',
				     function($scope, $window, $http, Upload){
			$scope.submitted = false;
			$scope.cercata = false;
			
			$scope.submit = function(){ //function to call on form submit
			    if ($scope.form.file.$valid && $scope.filePerizia) { 
				$scope.uploadFile($scope.filePerizia); //call upload function        
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
                                        $scope.error = false;
					if (resp.data.error_code != 0){
					    $window.alert('Errore durante il caricamento del file.');
					} 	
				    }, function (resp) { //catch error
					console.log(resp);
					console.log('Error status: ' + resp.status);
					$window.alert('Error status: ' + resp.status);
				    })
			    $scope.submitted = true; 
			};
			
			$scope.visualizza = function(){
			    console.log("visualizzo la perizia");
			    $http.get('/api/file/' + $scope.filePerizia.name)
			    .success(function (data, status) {
				    console.log("Perizia del file " + $scope.filePerizia.name + " trovata");
				    $scope.perizia = data;
				    if ($scope.perizia.loc == undefined){
					//visualizza "input form" per longitudine e latitudine
					$scope.erroreLonLat = true;
					//non visualizzare "il file e' stato salvato" 
					$scope.submitted = false;
					return;
				    }
				    $scope.submitted = true;
				})
			    .error(function (data) {
				    console.log("Errore nel trovare la perizia del file " + $scope.filePerizia.name);
				});
			   $scope.show = true;
			}
			
			$scope.carica = function(){
			    $scope.form.file.name = '';
			    document.getElementById('selectedFile').click();
			}

			$scope.submitLatLon = function(){
			    $scope.error = false;
			    if ($scope.form.input1.$error.required){
				$scope.error = true;
				$scope.errorMessage = "Inserire latitudine.";
				$scope.submitted = false;
				return;
			    }
			    if ($scope.form.input2.$error.required){
				$scope.error = true;
				$scope.errorMessage = "Inserire longitudine.";
				$scope.submitted = false;
				return;
			    }
			    if ($scope.form.input1.$error.min || $scope.form.input1.$error.max){
				$scope.error = true;
				$scope.errorMessage = "Il valore inserito per la latitudine non è valido.";
				$scope.submitted = false;
				return;
			    }
			    if ($scope.form.input2.$error.min || $scope.form.input2.$error.max){
				$scope.error = true;
				$scope.errorMessage = "Il valore inserito per la longitudine non è valido"
				$scope.submitted = false;
				return;
			    }

			    $scope.submitted = true;
			}
						
		    }]);



