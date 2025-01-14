(() => {
  'use strict';

  /**
   * @name SimpaWallet Navigation Bar
   * @desc Navigation bar located at the top of each page
   * @example <dag-nav-bar title="Language" invert goBack="preferencesSystem"></dag-nav-bar>
   */
  angular
    .module('copayApp.directives')
    .directive('dagNavBar', dagNavBar);

  dagNavBar.$inject = ['$state', '$rootScope', '$stateParams', 'notification'];

  function dagNavBar($state, $rootScope, $stateParams, notification) {
    return {
      restrict: 'E',
      templateUrl: 'directives/dagNavBar/dagNavBar.template.html',
      transclude: true,
      replace: true,
      scope: {
        title: '@',
        goBack: '@',
        goBackParams: '@',
        goBackTransition: '@',
        invert: '&'
      },
      link: ($scope, elem, attr) => {
        $scope.invert = ('invert' in attr);
        $scope.showBack = (!!$stateParams.backTo || !!$scope.goBack);
        $scope.goStateBack = () => {
          if ($scope.goBackParams) {
            $state.go($stateParams.backTo || $scope.goBack || 'wallet', JSON.parse($scope.goBackParams));
          } else {
            $state.go($stateParams.backTo || $scope.goBack || 'wallet');
          }
        };

        const eventBus = require('core/event_bus.js');

        $scope.showNotificationIcon = () => (!$stateParams.backTo || !$scope.goBack) && $rootScope.tab === 'wallet.home';

        $scope.checkUnreadNotifications = () => {
          notification.unreadNotifications((notifications) => {
            $scope.hasUnreadNotifications = notifications.length > 0;
          });
        };

        $scope.openMenu = () => $rootScope.openMenu();
        $scope.openNotifications = () => $rootScope.openNotifications();

        eventBus.on('notifications_updated', () => {
          $scope.checkUnreadNotifications();
        });

        $scope.checkUnreadNotifications();
        /* document.addEventListener('backbutton', () => {
          back();
        }, false); */
      }
    };
  }
})();
