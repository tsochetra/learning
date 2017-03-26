var socket = io.connect();
var app = angular.module("App", ["ngRoute"]);

app.config(["$routeProvider", "$locationProvider", function($routeProvider,$locationProvider) {
	$locationProvider.html5Mode(true);
	$routeProvider
	.when("/", {
		templateUrl: "/templates/home.html",
		controller: "HomeController"
	})
	.when("/404", {
		templateUrl: "/templates/404.html",
		controller: "HomeController"
	})
	.when("/:lesson/:type/:num", {
		templateUrl: "/templates/watch.html",
		controller: "WatchController"
	}).otherwise({
		templateUrl: "/templates/404.html"
	})
	;
}]);
app.filter("Trust", ["$sce", function($sce) {
	return function(val) {
        return $sce.trustAsResourceUrl(val);
    };
}]);
app.controller("appTitle", ["$scope", "$http", "$location", function($scope, $http, $location) {
	$scope.title = "TSOCHETRA";
}]);

app.controller("HomeController", ["$scope", "$http", function($scope, $http) {

}]);

app.controller("WatchController", ["$scope", "$http","$routeParams", "$location", function($scope, $http, $routeParams, $location) {

	socket.emit("getData",$routeParams, function(data) {
		data = JSON.parse(data);

		if(data.status == 'OK') {
			$scope.title = data.title;
			$scope.navdata = data.navdata;
			$scope.navdata1 = data.navdata1;
			$scope.url = "https://www.youtube.com/embed/"+data.yt_id+"?modestbranding=1&controls=2&autohide=1&wmode=transparent&html5=1&autoplay=1";
			$scope.lesson = data.lesson;
			$scope.$apply();
		} else if(data.status == "NO"){
			$location.path('/404');
			$scope.$apply();
		}
		console.log(data.status);
	});
}]);