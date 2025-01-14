/* eslint-disable no-shadow */
(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('HomeCtrl', HomeCtrl);

  HomeCtrl.$inject = ['$scope', '$rootScope', 'animationService', '$timeout', 'profileService', 'correspondentListService', '$modal', 'lodash', 'go'];

  function HomeCtrl($scope, $rootScope, animationService, $timeout, profileService, correspondentListService, $modal, lodash, go) {
    const vm = this;
    const breadcrumbs = require('core/breadcrumbs.js');
    const indexScope = $scope.index;
    vm.balanceIsHidden = $rootScope.balanceIsHidden;
    vm.balanceInited = false;
    vm.hasBalanceHistory = false;
    const viewContentLoaded = function () {
      console.log('HomeCtrl initialized');
      // $scope.randomPictures();
      $rootScope.randPic = `img/back_abstract.png`;
      go.redirectToTabIfNeeded();
    };
    vm.initBalanceVisibility = function () {
      $scope.index.setOngoingProcess('init-home', true);

      const hasBalance = !!indexScope.baseBalance && indexScope.baseBalance.total !== 0;
      vm.balanceInited = hasBalance || !!indexScope.txHistory;
      vm.noBalanceHistory = !(hasBalance || (!!indexScope.txHistory && indexScope.txHistory.length > 0));

      $scope.index.setOngoingProcess('init-home', !vm.balanceInited);
    };

    vm.buySimpaWallet = function () {
      const buySimpaWalletUrl = 'https://my.simpa.gb.net';
      go.openExternalLink(buySimpaWalletUrl);
    };

    vm.showAddress = function () {
      go.receive();
    };

    vm.openSharedAddressDefinitionModal = function (address) {
      $rootScope.modalOpened = true;
      // todo: refactor me
      const fc = profileService.focusedClient;

      const ModalInstanceCtrl = function ($scope, $modalInstance) {
        $scope.color = fc.backgroundColor;
        $scope.address = address;

        const walletGeneral = require('core/wallet_general.js');
        const walletDefinedByAddresses = require('core/wallet_defined_by_addresses.js');
        walletGeneral.readMyAddresses((arrMyAddresses) => {
          walletDefinedByAddresses.readSharedAddressDefinition(address, (arrDefinition, creationTs) => {
            $scope.humanReadableDefinition = correspondentListService.getHumanReadableDefinition(arrDefinition, arrMyAddresses, [], true);
            $scope.creation_ts = creationTs;
            walletDefinedByAddresses.readSharedAddressCosigners(address, (cosigners) => {
              $scope.cosigners = cosigners.map(cosigner => cosigner.name).join(', ');
              $scope.$apply();
            });
          });
        });

        // clicked a link in the definition
        $scope.sendPayment = function (receiverAddress, amount) {
          $modalInstance.dismiss('done');
          return $timeout(() => {
            indexScope.shared_address = null;
            indexScope.updateAll();
            indexScope.updateTxHistory();
            $rootScope.$emit('paymentRequest', receiverAddress, amount, 'base');
          });
        };

        // $scope.randomPictures = function () {

          // return $rootScope.randPic;
        // };


        $scope.cancel = function () {
          breadcrumbs.add('openSharedAddressDefinitionModal cancel');
          $modalInstance.dismiss('cancel');
        };
      };

      const modalInstance = $modal.open({
        templateUrl: 'views/modals/address-definition.html',
        windowClass: animationService.modalAnimated.slideUp,
        controller: ModalInstanceCtrl,
      });

      const disableCloseModal = $rootScope.$on('closeModal', () => {
        breadcrumbs.add('openSharedAddressDefinitionModal on closeModal');
        modalInstance.dismiss('cancel');
      });

      modalInstance.result.finally(() => {
        $rootScope.modalOpened = false;
        disableCloseModal();
        const m = angular.element(document.getElementsByClassName('reveal-modal'));
        m.addClass(animationService.modalAnimated.slideOutDown);
      });
    };

    vm.openSubwalletModal = function () {
      $rootScope.modalOpened = true;
      const fc = profileService.focusedClient;

      const ModalInstanceCtrl = function ($scope, $modalInstance) {
        $scope.color = fc.backgroundColor;
        $scope.indexCtl = $scope.index;
        const arrSharedWallets = [];
        $scope.mainWalletBalanceInfo = lodash.find(self.arrMainWalletBalances, { asset: 'base' });
        $scope.asset = 'base';
        const assocSharedByAddress = $scope.mainWalletBalanceInfo.assocSharedByAddress;

        if (assocSharedByAddress) {
          Object.keys(assocSharedByAddress).forEach((sa) => {
            const objSharedWallet = {};
            objSharedWallet.shared_address = sa;
            objSharedWallet.total = assocSharedByAddress[sa];
            objSharedWallet.totalStr = `${profileService.formatAmount(assocSharedByAddress[sa], 'dag')}`;

            arrSharedWallets.push(objSharedWallet);
          });
          $scope.arrSharedWallets = arrSharedWallets;
        }

        $scope.cancel = function () {
          breadcrumbs.add('openSubwalletModal cancel');
          $modalInstance.dismiss('cancel');
        };

        $scope.selectSubwallet = function (sharedAddress) {
          $scope.indexCtl.shared_address = sharedAddress;
          if (sharedAddress) {
            const walletDefinedByAddresses = require('core/wallet_defined_by_addresses.js');
            walletDefinedByAddresses.determineIfHasMerkle(sharedAddress, (bHasMerkle) => {
              $scope.indexCtl.bHasMerkle = bHasMerkle;
              $rootScope.$apply();
            });
          } else {
            $scope.indexCtl.bHasMerkle = false;
          }
          $scope.indexCtl.updateAll();
          $scope.indexCtl.updateTxHistory();
          $modalInstance.close();
        };
      };

      const modalInstance = $modal.open({
        templateUrl: 'views/modals/select-subwallet.html',
        windowClass: animationService.modalAnimated.slideUp,
        controller: ModalInstanceCtrl
      });

      const disableCloseModal = $rootScope.$on('closeModal', () => {
        breadcrumbs.add('openSubwalletModal on closeModal');
        modalInstance.dismiss('cancel');
      });

      modalInstance.result.finally(() => {
        $rootScope.modalOpened = false;
        disableCloseModal();
        const m = angular.element(document.getElementsByClassName('reveal-modal'));
        m.addClass(animationService.modalAnimated.slideOutDown);
      });
    };

    vm.getFontSizeForWalletNumber = (value, type) => {
      if (value) {
        const visibleWidth = window.innerWidth - 50;
        const str = value.toString().split('.');

        const length = str[0].length + ((str[1] || 0).length / 2)+6;
        const size = ((visibleWidth / length) < 70 ? ((visibleWidth / length) + 0) : 80);

        return { 'font-size': `${(!type ? size : size / 2)}px` };
      }
      return { 'font-size': '25px' };
    };

    vm.showBalance = () => {
      $rootScope.balanceIsHidden = false;
      vm.balanceIsHidden = false;
    };

    vm.hideBalance = () => {
      $rootScope.balanceIsHidden = true;
      vm.balanceIsHidden = true;
    };

    // for light clients only
    vm.updateHistoryFromNetwork = lodash.throttle(() => {
      setTimeout(() => {
        if (self.assetIndex !== self.oldAssetIndex) {
          // it was a swipe
          console.log('== swipe');
          return;
        }
        console.log('== updateHistoryFromNetwork');
        const lightWallet = require('core/light_wallet.js');
        lightWallet.refreshLightClientHistory();
      }, 500);
    }, 5000);

    $scope.$on('$viewContentLoaded', viewContentLoaded);
    $rootScope.$on('Local/UpdateHistoryEnd', vm.initBalanceVisibility);
    $rootScope.$on('Local/BalanceUpdated', vm.initBalanceVisibility);

    vm.initBalanceVisibility();
  }
})();
