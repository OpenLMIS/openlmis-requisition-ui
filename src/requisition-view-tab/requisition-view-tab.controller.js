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
     * @ngdoc controller
     * @name requisition-view-tab.controller:ViewTabController
     *
     * @description
     * Responsible for managing product grid for non full supply products.
     */
    angular
        .module('requisition-view-tab')
        .controller('ViewTabController', ViewTabController);

    ViewTabController.$inject = [
        '$filter', '$state', 'selectProductsModalService', 'requisitionValidator', 'requisition', 'columns', 'messageService',
        'lineItems', 'alertService', 'canSubmit', 'canAuthorize', 'fullSupply', 'TEMPLATE_COLUMNS', '$q',
        'OpenlmisArrayDecorator', 'canApproveAndReject', '$stateParams',
        'requisitionCacheService', 'canUnskipRequisitionItemWhenApproving', 'program', 'TB_MONTHLY_PROGRAM',
        'homeFacility', '$scope', 'paginationFactory', 'PAGE_SIZE'
    ];

    function ViewTabController($filter, $state, selectProductsModalService, requisitionValidator, requisition, columns,
                               messageService, lineItems, alertService, canSubmit, canAuthorize, fullSupply,
                               TEMPLATE_COLUMNS, $q, OpenlmisArrayDecorator, canApproveAndReject,
                               $stateParams, requisitionCacheService,
                               canUnskipRequisitionItemWhenApproving, program, TB_MONTHLY_PROGRAM, homeFacility, $scope,
                               paginationFactory, PAGE_SIZE) {
        var vm = this;
        vm.$onInit = onInit;
        vm.deleteLineItem = deleteLineItem;
        vm.addFullSupplyProducts = addFullSupplyProducts;
        vm.addNonFullSupplyProducts = addNonFullSupplyProducts;
        vm.unskipFullSupplyProducts = unskipFullSupplyProducts;
        vm.showDeleteColumn = showDeleteColumn;
        vm.skipCurrentPageFullSupplyLineItems = skipCurrentPageFullSupplyLineItems;
        vm.isLineItemValid = requisitionValidator.isLineItemValid;
        vm.getDescriptionForColumn = getDescriptionForColumn;
        vm.skippedFullSupplyProductCountMessage = skippedFullSupplyProductCountMessage;
        vm.cacheRequisition = cacheRequisition;
        vm.userCanEditColumn = userCanEditColumn;
        vm.monthlyTBColumns = TEMPLATE_COLUMNS.getTbMonthlyColumns();
        vm.search = search;
        // vm.showSkippedLineItems = true;

        /**
         * @ngdoc property
         * @propertyOf requisition-view-tab.controller:ViewTabController
         * @name lineItems
         * @type {Array}
         *
         * @description
         * Holds all requisition line items.
         */
        vm.lineItems = undefined;
        vm.searchKeyword = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-view-tab.controller:ViewTabController
         * @name items
         * @type {Array}
         *
         * @description
         * Holds all items that will be displayed.
         */
        vm.items = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-view-tab.controller:ViewTabController
         * @name requisition
         * @type {Object}
         *
         * @description
         * Holds requisition. This object is shared with the parent and fullSupply states.
         */
        vm.requisition = undefined;

        /**
         * @ngdoc property
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name showAddFullSupplyProductsButton
         * @type {Boolean}
         *
         * @description
         * Flag defining whether to show or hide the Add Product button for the full supply products for emergency
         * requisition.
         */
        vm.showAddFullSupplyProductsButton = undefined;

        /**
         * @ngdoc property
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name showAddNonFullSupplyProductsButton
         * @type {Boolean}
         *
         * @description
         * Flag defining whether to show or hide the Add Product button for non-full supply products.
         */
        vm.showAddNonFullSupplyProductsButton = undefined;

        /**
         * @ngdoc property
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name showUnskipFullSupplyProductsButton
         * @type {Boolean}
         *
         * @description
         * Flag defining whether to show or hide the Add Product button for un-skipping full supply products.
         */
        vm.showUnskipFullSupplyProductsButton = undefined;

        /**
         * @ngdoc property
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name showAddFullSupplyProductControls
         * @type {Boolean}
         *
         * @description
         * Flag defining whether to show or hide the Add Product button based on the requisition
         * status and user rights and requisition template configuration.
         */
        vm.showAddFullSupplyProductControls = undefined;
        vm.showSkippedLineItemsVisibility = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-view-tab.controller:ViewTabController
         * @name columns
         * @type {Array}
         *
         * @description
         * Holds the list of columns visible on this screen.
         */
        vm.columns = undefined;

        vm.orderableFilterProperties = {
            name: ''
        };

        vm.filteredItems = undefined;

        vm.showSkippedLineItems = true;

        vm.fullSupply = undefined;

        vm.isWarehouseView = false;
        vm.canEditApprovalColumns = false;

        /**
         * @ngdoc property
         * @propertyOf requisition-view-tab.controller:ViewTabController
         * @name program
         * @type {Object}
         *
         * @description
         * Holds the current program
         */
        vm.program = undefined;

        function onInit() {
            angular.forEach(columns, function(column) {
                angular.forEach(lineItems, function(lineItem) {
                    lineItem.updateFieldValue(column, requisition);
                });
            });

            vm.requisition = requisition;
            vm.homeFacility = homeFacility;
            vm.isWarehouseView = isWarehouseFacility(vm.homeFacility);
            autoSkipBlankWarehouseLineItems();
            vm.showSkippedLineItems = !vm.isWarehouseView;
            vm.lineItems = vm.isWarehouseView ? getLineItemsForCurrentTab() : lineItems;
            vm.columns = columns;
            vm.program = program;
            vm.userCanEdit = !vm.isWarehouseView &&
                (canAuthorize || canSubmit || canUnskipRequisitionItemWhenApproving || canApproveAndReject);
            vm.canEditApprovalColumns = !vm.isWarehouseView && canApproveAndReject;
            vm.showAddFullSupplyProductsButton = showAddFullSupplyProductsButton();
            vm.showAddNonFullSupplyProductsButton = showAddNonFullSupplyProductsButton();
            vm.showUnskipFullSupplyProductsButton = showUnskipFullSupplyProductsButton();
            vm.showSkipControls = showSkipControls();
            vm.showSkippedLineItemsVisibility = showSkippedLineItemsVisibility();
            vm.showOrderableFilter = showOrderableFilter();
            vm.noProductsMessage = getNoProductsMessage();
            vm.canApproveAndReject = canApproveAndReject;
            vm.paginationId = fullSupply ? 'fullSupplyList' : 'nonFullSupplyList';
            vm.filterByOrderableParams();
            registerSkippedItemsWatcher();
        }

        function registerSkippedItemsWatcher() {
            $scope.$watchCollection(function() {
                return vm.items ? vm.items.map(function(item) {
                    return item.skipped;
                }) : [];
            }, function(newValues, oldValues) {
                if (!angular.equals(newValues, oldValues) && !vm.showSkippedLineItems) {
                    for (var i = 0; i < newValues.length; i++) {
                        if (newValues[i] !== oldValues[i]) {
                            vm.filterByOrderableParams();
                            break;
                        }
                    }
                }
            });
        }

        function search() {
            console.log("Keyword", vm.searchKeyword);
            $stateParams.searchKeyword = vm.searchKeyword;
            $state.go('openlmis.requisitions.requisition.fullSupply', $stateParams, {
                reload: true
                //inherit: false,
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name deleteLineItem
         *
         * @description
         * Deletes the given line item, removing it from the grid and returning the product to the
         * list of approved products.
         *
         * @param {Object} lineItem the line item to be deleted
         */
        function deleteLineItem(lineItem) {
            vm.requisition.deleteLineItem(lineItem);
            refreshLineItems();
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name showDeleteColumn
         *
         * @description
         * Checks whether the delete column should be displayed. The column is visible only if any
         * of the line items is deletable.
         *
         * @return {Boolean} true if the delete column should be displayed, false otherwise
         */
        function showDeleteColumn() {
            return !fullSupply &&
                vm.userCanEdit &&
                hasDeletableLineItems();
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name cacheRequisition
         *
         * @description
         * Caches given requisition in the local storage.
         *
         * @return {Promise} the promise resolved after adding requisition to the local storage
         */
        function cacheRequisition() {
            requisitionCacheService.cacheRequisition(vm.requisition);
            return $q.resolve();
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name getDescriptionForColumn
         *
         * @description
         * Returns a translated description for the given column.
         *
         * @param  {RequisitionColumn} column  the column of the requisition template
         * @return {string}                    the translated description of the column
         */
        function getDescriptionForColumn(column) {
            if (requisition.template.populateStockOnHandFromStockCards &&
                column.name === TEMPLATE_COLUMNS.TOTAL_LOSSES_AND_ADJUSTMENTS) {
                return column.definition + ' ' +
                    messageService.get('requisitionViewTab.totalLossesAndAdjustment.disabled');
            }
            return column.definition;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name addFullSupplyProducts
         *
         * @description
         * Opens modal that lets the user add new full supply products to the grid. If there are no products to be added
         * an alert will be shown.
         */
        function addFullSupplyProducts() {
            addProducts(vm.requisition.getAvailableFullSupplyProducts());
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name addNonFullSupplyProducts
         *
         * @description
         * Opens modal that lets the user add new non-full supply products to the grid. If there are no products to be
         * added an alert will be shown.
         */
        function addNonFullSupplyProducts() {
            addProducts(vm.requisition.getAvailableNonFullSupplyProducts());
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name unskipFullSupplyProducts
         *
         * @description
         * Opens modal that lets the user unskip full supply products and add them back to the grid.. If there are no
         * products to be added an alert will be shown.
         */
        function unskipFullSupplyProducts() {
            selectProducts({
                products: vm.requisition.getSkippedFullSupplyProducts()
            })
                .then(function(selectedProducts) {
                    vm.requisition.unskipFullSupplyProducts(selectedProducts);
                    refreshLineItems();
                });
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name skippedFullSupplyProductCountMessage
         *
         * @description
         * Returns a translated message that contains the number of line items that were skipped
         * from full supply requisition.
         */
        function skippedFullSupplyProductCountMessage() {
            return messageService.get('requisitionViewTab.fullSupplyProductsSkipped', {
                skippedProductCount: getCountOfSkippedFullSupplyProducts()
            });
        }

        function addProducts(availableProducts) {
            selectProducts({
                products: availableProducts
            })
                .then(function(selectedProducts) {
                    vm.requisition.addLineItems(selectedProducts);
                    refreshLineItems();
                });
        }

        function selectProducts(availableProducts) {
            refreshLineItems();

            var decoratedAvailableProducts = new OpenlmisArrayDecorator(availableProducts.products);
            decoratedAvailableProducts.sortBy('fullProductName');

            if (!availableProducts.products.length) {
                alertService.error(
                    'requisitionViewTab.noProductsToAdd.label',
                    'requisitionViewTab.noProductsToAdd.message'
                );
                return $q.reject();
            }

            return selectProductsModalService.show({
                products: decoratedAvailableProducts
            });
        }

        function refreshLineItems() {
            var filterObject = (fullSupply &&
                vm.requisition.template.hasSkipColumn() &&
                vm.requisition.template.hideSkippedLineItems()) ?
                {
                    skipped: '!true',
                    $program: {
                        fullSupply: fullSupply
                    }
                } : {
                    $program: {
                        fullSupply: fullSupply
                    }
                };

            var lineItems = $filter('filter')(vm.requisition.requisitionLineItems, filterObject);
            vm.lineItems = lineItems;
            vm.filterByOrderableParams();
        }

        function showOrderableFilter() {
            var isAuthorizedOrApproving = requisition.$isAuthorized() ||
                requisition.$isInApproval();

            if (isAuthorizedOrApproving) {
                return fullSupply;
            }

            return (vm.userCanEdit || canApproveAndReject) &&
                fullSupply;
        }

        function showSkipControls() {
            if (vm.isWarehouseView) {
                return false;
            }

            var isAuthorizedOrApproving = requisition.$isAuthorized() ||
                requisition.$isInApproval();

            if (isAuthorizedOrApproving) {
                return fullSupply && requisition.template.hasSkipColumn();
            }

            return (vm.userCanEdit || canApproveAndReject) &&
                fullSupply &&
                !requisition.emergency &&
                requisition.template.hasSkipColumn();
        }

        function showSkippedLineItemsVisibility() {
            return vm.showSkipControls ||
                (vm.isWarehouseView && fullSupply && requisition.template.hasSkipColumn());
        }

        function showAddFullSupplyProductsButton() {
            return vm.userCanEdit && fullSupply && requisition.emergency;
        }

        function showAddNonFullSupplyProductsButton() {
            return vm.userCanEdit && !fullSupply;
        }

        function showUnskipFullSupplyProductsButton() {
            return vm.userCanEdit &&
                fullSupply &&
                !requisition.emergency &&
                requisition.template.hideSkippedLineItems();
        }

        function hasDeletableLineItems() {
            var hasDeletableLineItems = false;

            vm.requisition.requisitionLineItems.forEach(function(lineItem) {
                hasDeletableLineItems = hasDeletableLineItems || lineItem.$deletable;
            });

            return hasDeletableLineItems;
        }

        function isSkippedFullSupply(item) {
            return (item.skipped === true && item.$program.fullSupply === true);
        }

        function getCountOfSkippedFullSupplyProducts() {
            return vm.requisition.requisitionLineItems.filter(isSkippedFullSupply).length;
        }

        function getNoProductsMessage() {
            return fullSupply ?
                'requisitionViewTab.noFullSupplyProducts' :
                'requisitionViewTab.noNonFullSupplyProducts';
        }

        function skipCurrentPageFullSupplyLineItems() {
            if (vm.isWarehouseView) {
                return;
            }

            vm.items.forEach(function(lineItem) {
                if (lineItem.canBeSkipped(requisition)) {
                    lineItem.skipped = true;
                }
            });
            vm.filterByOrderableParams();
        }

        function userCanEditColumn(column) {
            if (vm.isWarehouseView) {
                return false;
            }

            if (program.name === TB_MONTHLY_PROGRAM && vm.monthlyTBColumns.includes(column.name)) {
                return vm.canApproveAndReject;
            }
            return vm.userCanEdit;
        }

        function isWarehouseFacility(facility) {
            var type = facility && facility.type,
                code = type && type.code ? type.code.toLowerCase() : undefined,
                name = type && type.name ? type.name.toLowerCase() : undefined;

            return code === 'warehouse' || name === 'warehouse';
        }

        function autoSkipBlankWarehouseLineItems() {
            if (!vm.isWarehouseView) {
                return;
            }

            vm.requisition.requisitionLineItems.forEach(function(lineItem) {
                if (hasNonNegativeQuantity(lineItem)) {
                    lineItem.skipped = false;
                } else {
                    lineItem.skipped = true;
                }
            });
        }

        function hasNonNegativeQuantity(lineItem) {
            return isNonNegativeNumber(lineItem.requestedQuantity) ||
                isNonNegativeNumber(lineItem.approvedQuantity);
        }

        function isNonNegativeNumber(value) {
            var numberValue = Number(value);

            return value !== null &&
                value !== undefined &&
                value.toString().trim() !== '' &&
                isFinite(numberValue) &&
                numberValue >= 0;
        }

        function getLineItemsForCurrentTab() {
            var currentTabLineItems = $filter('filter')(vm.requisition.requisitionLineItems, {
                $program: {
                    fullSupply: fullSupply
                }
            });

            if (fullSupply && $stateParams.searchKeyword) {
                currentTabLineItems = $filter('filter')(currentTabLineItems, $stateParams.searchKeyword);
            }

            return $filter('orderBy')(currentTabLineItems, [
                '$program.orderableCategoryDisplayOrder',
                '$program.orderableCategoryDisplayName',
                '$program.displayOrder',
                'orderable.fullProductName'
            ]);
        }

        function orderableHasMatchingName(orderableName, filterValue) {
            return orderableName.toLowerCase().includes(filterValue.toLowerCase());
        }

        function getFilteredLineItems() {
            return vm.lineItems.filter(function(item) {
                return orderableHasMatchingName(item.orderable.fullProductName, vm.orderableFilterProperties.name) &&
                    (vm.showSkippedLineItems ? true : !item.skipped);
            });
        }

        vm.filterByOrderableParams = function() {
            vm.filteredItems = getFilteredLineItems();
            vm.items = getPagedLineItems(vm.filteredItems);
        };

        vm.skipAllFullSupplyLineItems = function() {
            if (vm.isWarehouseView) {
                return;
            }

            vm.requisition.skipAllFullSupplyLineItems();
            vm.filterByOrderableParams();
        };

        vm.unskipAllFullSupplyLineItems = function() {
            if (vm.isWarehouseView) {
                return;
            }

            vm.requisition.unskipAllFullSupplyLineItems();
            vm.filterByOrderableParams();
        };

        function getPagedLineItems(lineItems) {
            var page = parseInt($stateParams[vm.paginationId + 'Page']),
                size = parseInt($stateParams[vm.paginationId + 'Size']);

            return paginationFactory.getPage(
                lineItems,
                isNaN(page) ? 0 : page,
                isNaN(size) ? PAGE_SIZE : size
            );
        }
    }

})();
