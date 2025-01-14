(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('NewVersionIsAvailableCtrl', NewVersionIsAvailableCtrl);

  NewVersionIsAvailableCtrl.$inject = ['$scope', '$modalInstance', 'go', 'newVersion'];

  function NewVersionIsAvailableCtrl($scope, $modalInstance, go, newVersion) {
    $scope.version = newVersion.version;

    $scope.openDownloadLink = function () {
      let link = `https://github.com/simpa-wallet/simpa-wallet/releases/tag/v${newVersion.version}`;
      if (navigator && navigator.app) {
        link = 'https://play.google.com/store/apps/details?id=org.simpa-wallet.client';
      }
      go.openExternalLink(link);
      $modalInstance.close('closed result');
    };

    $scope.later = function () {
      $modalInstance.close('closed result');
    };
  }
})();
