var app = angular.module('unicornSiteManager', [
    'ngRoute',
    'ui.bootstrap',
    'kendo.directives',
    'firebase'
]);

app.constant('FIREBASE_URI', 'PUT YOUR FIREBASE ENDPOINT HERE');

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

    $scope.setCurrentUnicornSite = function (id, unicornSite) {
        unicornSite.id = id;
        $scope.currentUnicornSite = unicornSite ;
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

app.factory('UnicornSiteService', function ($firebase, FIREBASE_URI) {
    var ref = new Firebase(FIREBASE_URI + 'sites');
    var unicornSites = $firebase(ref).$asArray();

    var getUnicornSites = function () {
        return unicornSites;
    };

    var addUnicornSite = function (unicorn) {
        unicornSites.$add(unicorn);
    };

    var updateUnicornSite = function (id) {
        unicornSites.$save(id);
    };

    var removeUnicornSite = function (id) {
        unicornSites.$remove(id);
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

app.factory('AuthService', function ($rootScope, $firebaseSimpleLogin, FIREBASE_URI) {
    var currentUser = null;
    var loginService = $firebaseSimpleLogin(new Firebase(FIREBASE_URI));

    var getCurrentUser = function () {
        return currentUser || loginService.$getCurrentUser();
    };

    var login = function (email, password) {
        loginService.$login('password', { email: email, password: password });
    };

    var logout = function () {
        loginService.$logout();
    };

    var register = function (email, password) {
        loginService.$createUser(email, password);
    };

    $rootScope.$on('$firebaseSimpleLogin:login', function (e, user) {
        currentUser = user;
        $rootScope.$broadcast('onLogin');
    });

    $rootScope.$on('$firebaseSimpleLogin:logout', function (e) {
        currentUser = null;
        $rootScope.$broadcast('onLogout');
    });

    $rootScope.$on('$firebaseSimpleLogin:error', function (e, err) {
        currentUser = null;
        $rootScope.$broadcast('onLogout');
    });

    return {
        getCurrentUser: getCurrentUser,
        login: login,
        logout: logout,
        register: register
    }
});