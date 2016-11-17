var perizieApp = angular.module('perizieApp', ['ngFileUpload', 'ngRoute', 'ngSanitize']);

perizieApp.config(function ($routeProvider) {
    $routeProvider
	.when('/', {
	    templateUrl: 'partials/home.html',
	    access: {restricted: true}
	})
	.when('/login', {
	    templateUrl: 'partials/login.html',
	    controller: 'loginController',
	    access: {restricted: false}
	})
	.when('/logout', {
	    controller: 'logoutController',
	    access: {restricted: true}
	})
	.when('/register', {
	    templateUrl: 'partials/register.html',
	    controller: 'registerController',
	    access: {restricted: true}
	})
	.when('/one', {
	    template: '<h1>This is page one!</h1>',
	    access: {restricted: true}
	})
	.when('/two', {
	    template: '<h1>This is page two!</h1>',
	    access: {restricted: false}
	})
	.when('/upload', {
	    templateUrl: 'partials/upload.html',
	    controller: 'uploadController',
	    access: {restricted: true}
	})
	.when('/visualizza', {
	    templateUrl: 'partials/visualizza.html',
	    controller: 'uploadController',
	    access: {restricted: true}
	})
	.when('/ricerca', {
	    templateUrl: 'partials/ricerca.html',
	    controller: 'ricercaController',
	    access: {restricted: true}
	})
	.when('/upload', {
	    templateUrl: 'partials/upload.html',
	    controller: 'homeController',
	    access: {restricted: true}
	})
	.otherwise({
	    redirectTo: '/'
	});
});
		 
perizieApp.run(function ($rootScope, $location, $route, AuthService) {
    $rootScope.$on('$routeChangeStart',
		   function (event, next, current) {
		       AuthService.getUserStatus()
			   .then(function(){
			       if (next.access.restricted && !AuthService.isLoggedIn()){
				   $location.path('/login');
				   $route.reload();
			       }
			   });
		   });
});
