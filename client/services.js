angular.module('perizieApp').factory('AuthService',
				     ['$q', '$timeout', '$http',
				      function ($q, $timeout, $http) {
					     // create user variable
					     var user = null;
					     
					     // return available functions for use in the controllers
					     return ({
						     isLoggedIn: isLoggedIn,
							 getUserStatus: getUserStatus,
							 login: login,
							 logout: logout,
							 register: register
							 });
					     
					     function isLoggedIn() {
						 if(user) {
						     return true;
						 } else {
						     return false;
						 }
					     }
					     
					     function getUserStatus() {
						 return $http.get('/user/status')
						     // handle success
						     .success(function (data) {
							     if(data.status){
								 user = true;
							     } else {
								 user = false;
							     }
							 })
						     // handle error
						     .error(function (data) {
							     user = false;
							 });
					     }
					     
					     function login(username, password) {
						 // create a new instance of deferred
						 var deferred = $q.defer();
						 
						 // send a post request to the server
						 $http.post('/user/login',
							    {username: username, password: password})
						     // handle success
						     .success(function (data, status) {
							     if(status === 200 && data.status){
								 user = true;
								 deferred.resolve();
							     } else {
								 user = false;
								 deferred.reject();
							     }
							 })
						     // handle error
						     .error(function (data) {
							     user = false;
							     deferred.reject();
							 });
						 
						 // return promise object
						 return deferred.promise;
						 
					     }
					     
					     function logout() {
						 // create a new instance of deferred
						 var deferred = $q.defer();
						 
						 // send a get request to the server
						 $http.get('/user/logout')
						     // handle success
						     .success(function (data) {
							     user = false;
							     deferred.resolve();
							 })
						     // handle error
						     .error(function (data) {
							     user = false;
							     deferred.reject();
							 });
						 
						 // return promise object
						 return deferred.promise;
						 
					     }
					     
					     function register(username, password) {
						 // create a new instance of deferred
						 var deferred = $q.defer();
						 
						 // send a post request to the server
						 $http.post('/user/register',
							    {username: username, password: password})
						     // handle success
						     .success(function (data, status) {
							     if(status === 200 && data.status){
								 deferred.resolve();
							     } else {
								 deferred.reject();
							     }
							 })
						     // handle error
						     .error(function (data) {
							     deferred.reject();
							 });
						 
						 // return promise object
						 return deferred.promise;
						 
					     }
					     
					 }]);


angular.module('perizieApp')
    .factory('PerizieService', ['$http', '$scope',
				function($http, $scope) {
		     return ({ 
			     getById: getById,
				 //				 getByFileName : getByFileName,
				 getByLocation: getByLocation
				 });
		     
		     function getById(id){
			 return $http.get('/api/id/' + id)
			     .success(function (data, status) {
				     console.log("Perizia " + id + " trovata");
				     $scope.perizia = data; 
				 })
			     .error(function (data) {
				     console.log("Errore nel trovare la perizia " + id);
				 });  
		     }
		     /*
		     function getByFileName(fileName){
			 return $http.get('/api/file/' + fileName)
			     .success(function (data, status) {
				     console.log("Perizia del file " + fileName + " trovata");
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
				     console.log("Errore nel trovare la perizia del file " + fileName);     
				 });   
				 } */ 
		     
		     function getByLocation(posizione, distanza, limite){
			 return $http.get('api/posizione/' + posizione + '/distanza/' + distanza + '/limite/' + limite)
			     .success(function (data, status) {  
			console.log("Perizie trovate");
			$scope.perizie = data;  
				 })  
			     .error(function (data) {  
				     console.log("Errore nel trovare le perizie");     
				 });
		     }
		 }]);
