var app = angular.module('unicornSiteManager', [
    'ngRoute',
    'ui.bootstrap',
    'kendo.directives'
]);

app.config(function ($routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'views/dashboard.html',
            controller: 'DashboardCtrl'
        }).
        when('/manager', {
            templateUrl: 'views/manager.html',
            controller: 'ManagerCtrl'
        }).
        when('/login', {templateUrl: 'views/login.html', controller: 'LoginCtrl'}).
        otherwise({redirectTo: '/'});
});

//-------------------------------------------------------------------------------------------------
// DEMO: Realtime
//-------------------------------------------------------------------------------------------------

app.controller('DashboardCtrl', function ($scope, UnicornSiteService) {
    $scope.unicornSites = UnicornSiteService.getUnicornSites();
});

app.controller('ManagerCtrl', function ($scope, UnicornSiteService) {
    $scope.currentUnicornSite = null;
    $scope.newUnicornSite = { name: '', status: '' };
    $scope.unicornSites = UnicornSiteService.getUnicornSites();

    $scope.setCurrentUnicornSite = function (id, unicorn) {
        unicorn.id = id;
        $scope.currentUnicornSite = unicorn;
    };

    $scope.addUnicornSite = function () {
        UnicornSiteService.addUnicornSite(angular.copy($scope.newUnicornSite));
        $scope.resetForm();
    };

    $scope.updateUnicornSite = function (id) {
        UnicornSiteService.updateUnicornSite(id);
    };

    $scope.removeUnicornSite = function (id) {
        UnicornSiteService.removeUnicornSite(id);
    };

    $scope.resetForm = function () {
        $scope.currentUnicornSite = null;
        $scope.newUnicornSite = { name: '', status: '' };
    };
});

app.factory('UnicornSiteService', function () {
    var unicornSites = {
        1 : {
            'name' : 'Eiffel Tower',
            'status' : '20'
        },
        2 : {
            'name' : 'Notre Dame',
            'status' : '30'
        }
    };

    var getUnicornSites = function () {
        return unicornSites;
    };

    var addUnicornSite = function (unicorn) {
        var id = new Date().getTime();
        unicornSites[id] = unicorn;
    };

    var updateUnicornSite = function (id) {
        // Already in memory
    };

    var removeUnicornSite = function (id) {
        delete unicornSites[id];
    };

    return {
        getUnicornSites: getUnicornSites,
        addUnicornSite: addUnicornSite,
        updateUnicornSite: updateUnicornSite,
        removeUnicornSite: removeUnicornSite
    }
});

//-------------------------------------------------------------------------------------------------
// DEMO: Authentication
//-------------------------------------------------------------------------------------------------

app.controller('MainCtrl', function ($scope, $location, AuthService) {
    $scope.logout = function () {
        AuthService.logout();
    };

    $scope.$on('onLogin', function () {
        $scope.currentUser = AuthService.getCurrentUser();
        $location.path('/');
    });

    $scope.$on('onLogout', function () {
        $scope.currentUser = null;
        $location.path('/login');
    });

    $scope.currentUser = AuthService.getCurrentUser();
});

app.controller('LoginCtrl', function ($scope, $location, AuthService) {
    $scope.user = { email: '', password: '' };

    $scope.login = function (email, password) {
        AuthService.login(email, password);
    };

    $scope.register = function (email, password) {
        AuthService.register(email, password);
    };

    $scope.reset = function () {
        $scope.user = { email: '', password: '' };
    };
});

app.factory('AuthService', function ($rootScope) {
    var currentUser = { id:1, email: 'user@email.com' };

    var getCurrentUser = function () {
        return currentUser;
    };

    var login = function (email, password) {
        $rootScope.$broadcast('onLogin');
    };

    var logout = function () {
        $rootScope.$broadcast('onLogout');
    };

    var register = function (email, password) {
        $rootScope.$broadcast('onLogin');
    };

    return {
        getCurrentUser: getCurrentUser,
        login: login,
        logout: logout,
        register: register
    }
});