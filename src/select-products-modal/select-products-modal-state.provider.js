/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name select-products-modal.selectProductsModalState
     *
     * @description
     * Provider for defining states which should be displayed as modals.
     */
    angular
        .module('select-products-modal')
        .provider('selectProductsModalState', selectProductsModalStateProvider);

    selectProductsModalStateProvider.$inject = ['modalStateProvider', '$stateProvider'];

    function selectProductsModalStateProvider(modalStateProvider, $stateProvider) {
        this.stateWithAddOrderablesChildState = stateWithAddOrderablesChildState;
        this.$get = [function() {}];

        /**
         * @ngdoc method
         * @methodOf select-products-modal.selectProductsModalState
         * @name state
         *
         * @description
         * Defines a state which should be displayed as modal. Currently the resolves from parent
         * states are not available in the controller by default. To make them available please
         * include them in the parentResolves parameter line this
         *
         * ```
         * selectProductsModalStateProvider.state('some.state', {
         *     parentResolves: ['someParentResolve']
         * });
         * ```
         *
         * @param   {String}    stateName   the name of the state
         * @param   {Object}    state       the state definition
         */
        function stateWithAddOrderablesChildState(stateName, state) {

            if (state.display === 'modal') {
                modalStateProvider.state(stateName, state);
            } else {
                $stateProvider.state(stateName, state);
            }

            modalStateProvider
                .state(stateName + '.addOrderables', {
                    controller: 'SelectProductsModalController',
                    controllerAs: 'vm',
                    templateUrl: 'select-products-modal/select-products-modal.html',
                    label: 'adminOrderableEdit.kitUnpackList',
                    nonTrackable: true,
                    params: {
                        addOrderablesPage: undefined,
                        addOrderablesSize: undefined,
                        productName: undefined,
                        productCode: undefined,
                        search: undefined
                    },
                    resolve: {
                        external: function(selectProductsModalService) {
                            return !selectProductsModalService.getOrderables();
                        },
                        isUnpackKitState: function() {
                            return stateName === 'openlmis.administration.orderables.edit.kitUnpackList.edit';
                        },
                        orderables: function(OrderableResource, paginationService, $stateParams,
                            selectProductsModalService, isUnpackKitState) {
                            var orderables = selectProductsModalService.getOrderables();

                            if (orderables) {
                                return paginationService.registerList(undefined, $stateParams, function() {
                                    return orderables;
                                }, {
                                    paginationId: 'addOrderables'
                                });
                            }
                            return paginationService.registerUrl($stateParams, function(stateParams) {
                                var params;
                                if (isUnpackKitState) {
                                    params = {
                                        sort: 'fullProductName,asc',
                                        page: stateParams.page,
                                        size: stateParams.size,
                                        code: stateParams.productCode,
                                        name: stateParams.productName
                                    };
                                } else {
                                    params = {
                                        sort: 'fullProductName,asc',
                                        page: stateParams.page,
                                        size: stateParams.size,
                                        search: stateParams.search
                                    };
                                }
                                return new OrderableResource().query(params);
                            }, {
                                paginationId: 'addOrderables'
                            });
                        }
                    }
                });
        }
    }

})();
