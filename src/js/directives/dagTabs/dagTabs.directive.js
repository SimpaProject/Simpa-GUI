/* eslint-disable no-undef */
(() => {
  'use strict';

  angular
    .module('copayApp.directives')


    /**
     * @desc collection of tabs
     * @example <dag-tabset></dag-tabset>
     */
    .directive('dagTabset', dagTabset)

    /**
     * @desc single tab
     * @example <dag-tab heading="Header"></dag-tab>
     */
    .directive('dagTab', dagTab);
  dagTabset.$inject = ['gettextCatalog'];

  function dagTabset(gettextCatalog) {
    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: {},
      templateUrl: 'directives/dagTabs/dagTabs.template.html',
      controllerAs: 'tabset',
      link: ($scope) => {
        $scope.menu = [{
          title: gettextCatalog.getString('Plain Wallet'),
          icon: 'plain_wallet',
          link: 'wallet.home'
        }, {
          title: gettextCatalog.getString('Multiply Wallet'),
          icon: 'multiply_wallet',
          link: 'wallet.receive'
        }, {
          title: gettextCatalog.getString('Send'),
          icon: 'send_bottom',
          link: 'wallet.send'
        }, {
          title: gettextCatalog.getString('Paired Devices'),
          icon: 'paired_devices_bottom',
          link: 'wallet.correspondentDevices'
        }];
      },
      controller() {
        const self = this;
        self.tabs = [];
        self.activeTab = 0;

        self.addTab = (tab) => {
          self.tabs.push(tab);

          if (self.tabs.length === 1) {
            tab.active = true;
          }
        };

        self.select = (selectedTab, index) => {
          if (self.activeTab === index) {
            return false;
          }

          self.tabs = self.tabs.map((tab, i) => {
            tab.active = (i === index);
            return tab;
          });

          self.activeTab = index;
          selectedTab.active = true;
          return true;
        };
      }
    };
  }

  dagTab.$inject = [];

  function dagTab() {
    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      template: '<div class="dag_tabs_tabpanel" ng-show="active" ng-transclude></div>',
      require: '^dagTabset',
      scope: {
        heading: '@',
        tabClick: '&',
        selected: '=',
        onLeave: '&',
        onEnter: '&'
      },
      link: ($scope, element, attr, dagtabsetCtrl) => {
        $scope.active = false;
        dagtabsetCtrl.addTab($scope);
      }
    };
  }
})();
