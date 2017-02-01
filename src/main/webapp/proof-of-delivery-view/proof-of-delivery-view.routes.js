(function() {

    'use strict';

    angular
        .module('proof-of-delivery-view')
        .config(routes);

    routes.$inject = ['$stateProvider'];

    function routes($stateProvider) {

        $stateProvider.state('orders.podView', {
            url: '^/pod/:podId/:page',
            templateUrl: 'proof-of-delivery-view/proof-of-delivery-view.html',
            controller: 'ProofOfDeliveryViewController',
            controllerAs: 'vm',
            resolve: {
                pod: function($stateParams, proofOfDeliveryFactory) {
                    return proofOfDeliveryFactory.get($stateParams.podId);
                }
            }
        });
    }

})();
