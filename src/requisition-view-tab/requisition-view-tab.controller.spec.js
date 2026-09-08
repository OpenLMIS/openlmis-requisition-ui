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

describe('ViewTabController', function() {

    beforeEach(function() {
        module('requisition-view-tab', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
            $provide.value('quantityUnitCalculateService', {
                recalculateInputQuantity: jasmine.createSpy('recalculateInputQuantity')
                    .andCallFake(function(item) {
                        return item;
                    })
            });
        });

        var RequisitionLineItemDataBuilder, RequisitionDataBuilder, RequisitionColumnDataBuilder, OrderableDataBuilder;
        inject(function($injector) {
            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            RequisitionColumnDataBuilder = $injector.get('RequisitionColumnDataBuilder');
            RequisitionLineItemDataBuilder = $injector.get('RequisitionLineItemDataBuilder');
            RequisitionDataBuilder = $injector.get('RequisitionDataBuilder');
            this.$controller = $injector.get('$controller');
            this.$rootScope = $injector.get('$rootScope');
            this.$q = $injector.get('$q');
            this.$state = $injector.get('$state');
            this.$scope = $injector.get('$rootScope').$new();
            this.alertService = $injector.get('alertService');
            this.messageService = $injector.get('messageService');
            this.requisitionValidator = $injector.get('requisitionValidator');
            this.selectProductsModalService = $injector.get('selectProductsModalService');
            this.requisitionCacheService = $injector.get('requisitionCacheService');
        });

        var requisitionDataBuilder = new RequisitionDataBuilder();
        this.requisition = requisitionDataBuilder
            .withRequisitionLineItems([
                new RequisitionLineItemDataBuilder()
                    .fullSupplyForProgram(requisitionDataBuilder.program)
                    .buildJson(),
                new RequisitionLineItemDataBuilder()
                    .fullSupplyForProgram(requisitionDataBuilder.program)
                    .buildJson(),
                new RequisitionLineItemDataBuilder()
                    .fullSupplyForProgram(requisitionDataBuilder.program)
                    .buildJson(),
                new RequisitionLineItemDataBuilder()
                    .fullSupplyForProgram(requisitionDataBuilder.program)
                    .buildJson(),
                new RequisitionLineItemDataBuilder()
                    .nonFullSupplyForProgram(requisitionDataBuilder.program)
                    .buildJson()
            ])
            .build();

        this.initController = initController;

        this.availableFullSupplyProducts = [
            new OrderableDataBuilder()
                .withFullProductName('C Product')
                .build(),
            new OrderableDataBuilder()
                .withFullProductName('A Product')
                .build(),
            new OrderableDataBuilder()
                .withFullProductName('B product')
                .build()
        ];

        this.availableNonFullSupplyProducts = [
            new OrderableDataBuilder()
                .withFullProductName('f Product')
                .build(),
            new OrderableDataBuilder()
                .withFullProductName('E Product')
                .build(),
            new OrderableDataBuilder()
                .withFullProductName('d product')
                .build()
        ];

        this.skippedFullSupplyProducts = [
            new OrderableDataBuilder()
                .withFullProductName('h Product')
                .build(),
            new OrderableDataBuilder()
                .withFullProductName('G Product')
                .build(),
            new OrderableDataBuilder()
                .withFullProductName('I product')
                .build()
        ];

        this.totalLossesAndAdjustmentsColumn = new RequisitionColumnDataBuilder()
            .buildTotalLossesAndAdjustmentsColumn(this.requisition);

        this.columns = [
            new RequisitionColumnDataBuilder().buildSkipColumn(false, this.requisition)
        ];

        this.fullSupply = false;
        this.canSubmit = false;
        this.canAuthorize = false;
        this.canApproveAndReject = true;
        this.canUnskipRequisitionItemWhenApproving = false;

        spyOn(this.alertService, 'error');
        spyOn(this.selectProductsModalService, 'show');
        spyOn(this.messageService, 'get').andCallFake(function(param) {
            return param;
        });
    });

    describe('$onInit', function() {

        beforeEach(function() {
            this.requisition.template.hideSkippedLineItems.andReturn(true);
            this.fullSupply = true;
        });

        it('should bind requisitionValidator.isLineItemValid method to vm', function() {
            this.initController();

            expect(this.vm.isLineItemValid).toBe(this.requisitionValidator.isLineItemValid);
        });

        it('should bind requisition property to vm', function() {
            this.initController();

            expect(this.vm.requisition).toBe(this.requisition);
        });

        it('should expose canApproveAndReject property', function() {
            this.initController();

            expect(this.vm.canApproveAndReject).toEqual(this.canApproveAndReject);
        });

        it('should expose paginationId property', function() {
            this.initController();

            expect(this.vm.paginationId).toEqual('fullSupplyList');
        });

        describe('Add (Full Supply) Products button', function() {

            beforeEach(function() {
                this.canSubmit = true;
                this.canAuthorize = true;
                this.fullSupply = true;
                this.requisition.emergency = true;
            });

            it('should be visible', function() {
                this.initController();

                expect(this.vm.showAddFullSupplyProductsButton).toBe(true);
            });

            it('should be visible if user can only submit', function() {
                this.canAuthorize = false;

                this.initController();

                expect(this.vm.showAddFullSupplyProductsButton).toBe(true);
            });

            it('should be visible if user can only authorize', function() {
                this.canSubmit = false;

                this.initController();

                expect(this.vm.showAddFullSupplyProductsButton).toBe(true);
            });

            it('should be hidden if user can\'t submit and authorize', function() {
                this.canSubmit = false;
                this.canAuthorize = false;

                this.initController();

                expect(this.vm.showAddFullSupplyProductsButton).toBe(false);
            });

            it('should be hidden if requisition is not emergency', function() {
                this.requisition.emergency = false;

                this.initController();

                expect(this.vm.showAddFullSupplyProductsButton).toBe(false);
            });

            it('should be hidden if showing non-full supply tab', function() {
                this.fullSupply = false;

                this.initController();

                expect(this.vm.showAddFullSupplyProductsButton).toBe(false);
            });

        });

        describe('Add (Non-Full Supply) Products button', function() {

            beforeEach(function() {
                this.canSubmit = true;
                this.canAuthorize = true;
                this.fullSupply = false;
            });

            it('should be visible', function() {
                this.initController();

                expect(this.vm.showAddNonFullSupplyProductsButton).toBe(true);
            });

            it('should be visible if user can only submit', function() {
                this.canAuthorize = false;

                this.initController();

                expect(this.vm.showAddNonFullSupplyProductsButton).toBe(true);
            });

            it('should be visible if user can only authorize', function() {
                this.canSubmit = false;

                this.initController();

                expect(this.vm.showAddNonFullSupplyProductsButton).toBe(true);
            });

            it('should be hidden if user can\'t submit and authorize', function() {
                this.canSubmit = false;
                this.canAuthorize = false;

                this.initController();

                expect(this.vm.showAddNonFullSupplyProductsButton).toBe(false);
            });

            it('should be hidden if showing full supply tab', function() {
                this.fullSupply = true;

                this.initController();

                expect(this.vm.showAddNonFullSupplyProductsButton).toBe(false);
            });

        });

        describe('Unskip (Full Supply) Products button', function() {

            beforeEach(function() {
                this.canSubmit = true;
                this.canAuthorize = true;
                this.fullSupply = true;
                this.requisition.emergency = false;
                this.requisition.template.hideSkippedLineItems.andReturn(true);
            });

            it('should be visible', function() {
                this.initController();

                expect(this.vm.showUnskipFullSupplyProductsButton).toBe(true);
            });

            it('should be visible if user can only submit', function() {
                this.canAuthorize = false;

                this.initController();

                expect(this.vm.showUnskipFullSupplyProductsButton).toBe(true);
            });

            it('should be visible if user can only authorize', function() {
                this.canSubmit = false;

                this.initController();

                expect(this.vm.showUnskipFullSupplyProductsButton).toBe(true);
            });

            it('should be hidden if user can\'t submit and authorize', function() {
                this.canSubmit = false;
                this.canAuthorize = false;

                this.initController();

                expect(this.vm.showUnskipFullSupplyProductsButton).toBe(false);
            });

            it('should be hidden if showing non-full supply tab', function() {
                this.fullSupply = false;

                this.initController();

                expect(this.vm.showUnskipFullSupplyProductsButton).toBe(false);
            });

            it('should be hidden if requisition is emergency', function() {
                this.requisition.emergency = true;

                this.initController();

                expect(this.vm.showUnskipFullSupplyProductsButton).toBe(false);
            });

            it('should be hidden if skipped line items are disabled', function() {
                this.requisition.template.hideSkippedLineItems.andReturn(false);

                this.initController();

                expect(this.vm.showUnskipFullSupplyProductsButton).toBe(false);
            });

        });

        describe('noProductMessage', function() {

            it('should set correct for full supply tab', function() {
                this.fullSupply = true;

                this.initController();

                expect(this.vm.noProductsMessage).toBe('requisitionViewTab.noFullSupplyProducts');
            });

            it('should set correct for non full supply tab', function() {
                this.fullSupply = false;

                this.initController();

                expect(this.vm.noProductsMessage).toBe('requisitionViewTab.noNonFullSupplyProducts');
            });

        });

        describe('userCanEdit', function() {

            it('should be true if canAuthorize is true', function() {
                this.canAuthorize = true;

                this.initController();

                expect(this.vm.userCanEdit).toBe(true);
            });

            it('should be true if canSubmit is true', function() {
                this.canSubmit = true;

                this.initController();

                expect(this.vm.userCanEdit).toBe(true);
            });

            it('should be false if canAuthorize and canSubmit are false', function() {
                this.initController();

                expect(this.vm.userCanEdit).toBe(false);
            });

        });

        describe('showSkipControls', function() {

            it('should be hidden', function() {
                this.initController();

                expect(this.vm.showSkipControls).toBe(false);
            });

            it('should be shown if the requisition status is INITIATED', function() {
                this.requisition.template.hasSkipColumn.andReturn(true);
                this.canSubmit = true;

                this.initController();

                expect(this.vm.showSkipControls).toBe(true);
            });

            it('should be hidden if requisition status is INITIATED but user does not have right to submit',
                function() {
                    this.requisition.template.hasSkipColumn.andReturn(true);

                    this.initController();

                    expect(this.vm.showSkipControls).toBe(false);
                });

            it('should be shown if the requisition status is SUBMITTED and user has authorize right', function() {
                this.canAuthorize = true;
                this.requisition.template.hasSkipColumn.andReturn(true);

                this.initController();

                expect(this.vm.showSkipControls).toBe(true);
            });

            it('should be shown if the requisition status is REJECTED', function() {
                this.requisition.template.hasSkipColumn.andReturn(true);
                this.canSubmit = true;

                this.initController();

                expect(this.vm.showSkipControls).toBe(true);
            });

            it('should be hidden if the requisition status is REJECTED and user can not submit', function() {
                this.requisition.template.hasSkipColumn.andReturn(true);

                this.initController();

                expect(this.vm.showSkipControls).toBe(false);
            });

            it('should be shown if the requisition template has a skip column', function() {
                this.requisition.template.hasSkipColumn.andReturn(true);
                this.canSubmit = true;
                this.columns[0].name = 'skipped';

                this.initController();

                expect(this.vm.showSkipControls).toBe(true);
            });

            it('should be hidden if the requisition template does not have a skip column', function() {
                this.requisition.template.hasSkipColumn.andReturn(false);
                this.columns[0].name = 'foo';
                this.canSubmit = true;

                this.initController();

                expect(this.vm.showSkipControls).toBe(false);
            });

            it('should be hidden if user does not authorize right and requisition is submitted', function() {
                this.canAuthorize = false;
                this.requisition.template.hasSkipColumn.andReturn(true);

                this.initController();

                expect(this.vm.showSkipControls).toBe(false);
            });

        });

        describe('quantities initialization', function() {

            it('should populate quantities with zero value from line item', function() {
                var column = this.totalLossesAndAdjustmentsColumn;
                var lineItem = {
                    totalLossesAndAdjustments: 0,
                    orderable: {
                        netContent: 10
                    },
                    updateFieldValue: jasmine.createSpy('updateFieldValue')
                };

                this.vm = this.$controller('ViewTabController', {
                    lineItems: [lineItem],
                    items: [lineItem],
                    columns: [column],
                    requisition: this.requisition,
                    canSubmit: this.canSubmit,
                    canAuthorize: this.canAuthorize,
                    fullSupply: this.fullSupply,
                    program: {},
                    $scope: this.$scope,
                    canApproveAndReject: this.canApproveAndReject,
                    canUnskipRequisitionItemWhenApproving: this.canUnskipRequisitionItemWhenApproving
                });
                this.vm.$onInit();

                expect(lineItem.quantities['totalLossesAndAdjustments'].quantity).toBe(0);
            });

        });

    });

    describe('deleteLineItem', function() {

        beforeEach(function() {
            this.initController();
            this.requisition.deleteLineItem.andReturn();
            spyOn(this.$state, 'go').andReturn();
        });

        it('should delete line item if it exist', function() {
            var lineItem = this.requisition.requisitionLineItems[2];

            this.vm.deleteLineItem(lineItem);

            expect(this.requisition.deleteLineItem).toHaveBeenCalledWith(lineItem);
        });

    });

    describe('cacheRequisition', function() {

        beforeEach(function() {
            this.initController();
            spyOn(this.requisitionCacheService, 'cacheRequisition');
        });

        it('should save requisition to the local storage', function() {
            this.vm.cacheRequisition();

            expect(this.requisitionCacheService.cacheRequisition).toHaveBeenCalledWith(this.requisition);
        });

    });

    describe('addFullSupplyProducts', function() {

        beforeEach(function() {
            this.requisition.getAvailableFullSupplyProducts.andReturn(angular.copy(this.availableFullSupplyProducts));
            this.selectProductsModalService.show.andReturn(this.$q.resolve([
                this.availableFullSupplyProducts[0],
                this.availableFullSupplyProducts[2]
            ]));
        });

        it('should show alert if there are no skipped full supply products', function() {
            this.requisition.getAvailableFullSupplyProducts.andReturn([]);

            this.initController();
            this.vm.addFullSupplyProducts();

            expect(this.alertService.error).toHaveBeenCalledWith(
                'requisitionViewTab.noProductsToAdd.label',
                'requisitionViewTab.noProductsToAdd.message'
            );
        });

        it('should not open modal if there no skipped full supply products to add', function() {
            this.requisition.getAvailableFullSupplyProducts.andReturn([]);

            this.initController();
            this.vm.addFullSupplyProducts();

            expect(this.selectProductsModalService.show).not.toHaveBeenCalled();
        });

        it('should do nothing if modal was dismissed', function() {
            this.selectProductsModalService.show.andReturn(this.$q.reject());

            this.initController();
            this.vm.addFullSupplyProducts();

            expect(this.requisition.addLineItems).not.toHaveBeenCalled();
            expect(this.requisition.addLineItems).not.toHaveBeenCalled();
        });

        it('should unskip full supply products', function() {
            this.initController();
            this.vm.addFullSupplyProducts();
            this.$rootScope.$apply();

            expect(this.requisition.addLineItems).toHaveBeenCalledWith([
                this.availableFullSupplyProducts[0],
                this.availableFullSupplyProducts[2]
            ]);
        });

        it('should show products in alphabetical order', function() {
            this.initController();
            this.vm.addFullSupplyProducts();

            var actualProducts = this.selectProductsModalService.show.calls[0].args[0];

            expect(actualProducts.products.length).toEqual(3);
            expect(actualProducts.products[0]).toEqual(this.availableFullSupplyProducts[1]);
            expect(actualProducts.products[1]).toEqual(this.availableFullSupplyProducts[2]);
            expect(actualProducts.products[2]).toEqual(this.availableFullSupplyProducts[0]);
        });

    });

    describe('addNonFullSupplyProducts', function() {

        beforeEach(function() {
            this.requisition.getAvailableNonFullSupplyProducts
                .andReturn(angular.copy(this.availableNonFullSupplyProducts));
            this.selectProductsModalService.show.andReturn(this.$q.resolve([
                this.availableNonFullSupplyProducts[0],
                this.availableNonFullSupplyProducts[2]
            ]));
        });

        it('should show alert if there are no available non-full supply products', function() {
            this.requisition.getAvailableNonFullSupplyProducts.andReturn([]);

            this.initController();
            this.vm.addNonFullSupplyProducts();

            expect(this.alertService.error).toHaveBeenCalledWith(
                'requisitionViewTab.noProductsToAdd.label',
                'requisitionViewTab.noProductsToAdd.message'
            );
        });

        it('should not open modal if there no available non-full supply products', function() {
            this.requisition.getAvailableNonFullSupplyProducts.andReturn([]);

            this.initController();
            this.vm.addNonFullSupplyProducts();

            expect(this.selectProductsModalService.show).not.toHaveBeenCalled();
        });

        it('should do nothing if modal was dismissed', function() {
            this.selectProductsModalService.show.andReturn(this.$q.reject());

            this.initController();
            this.vm.addNonFullSupplyProducts();

            expect(this.requisition.unskipFullSupplyProducts).not.toHaveBeenCalled();
            expect(this.requisition.addLineItems).not.toHaveBeenCalled();
        });

        it('should add non-full supply products', function() {
            this.initController();
            this.vm.addNonFullSupplyProducts();
            this.$rootScope.$apply();

            expect(this.requisition.addLineItems).toHaveBeenCalledWith([
                this.availableNonFullSupplyProducts[0],
                this.availableNonFullSupplyProducts[2]
            ]);
        });

        it('should show products in alphabetical order', function() {
            this.initController();
            this.vm.addNonFullSupplyProducts();

            var actualProducts = this.selectProductsModalService.show.calls[0].args[0];

            expect(actualProducts.products.length).toEqual(3);
            expect(actualProducts.products[0]).toEqual(this.availableNonFullSupplyProducts[2]);
            expect(actualProducts.products[1]).toEqual(this.availableNonFullSupplyProducts[1]);
            expect(actualProducts.products[2]).toEqual(this.availableNonFullSupplyProducts[0]);
        });

    });

    describe('unskipFullSupplyProducts', function() {

        beforeEach(function() {
            this.requisition.getSkippedFullSupplyProducts.andReturn(angular.copy(this.skippedFullSupplyProducts));
            this.selectProductsModalService.show.andReturn(this.$q.resolve([
                this.skippedFullSupplyProducts[0],
                this.skippedFullSupplyProducts[2]
            ]));
            this.fullSupply = true;
        });

        it('should show alert if there are no skipped full supply products', function() {
            this.requisition.getSkippedFullSupplyProducts.andReturn([]);

            this.initController();
            this.vm.unskipFullSupplyProducts();

            expect(this.alertService.error).toHaveBeenCalledWith(
                'requisitionViewTab.noProductsToAdd.label',
                'requisitionViewTab.noProductsToAdd.message'
            );
        });

        it('should not open modal if there no skipped full supply products to add', function() {
            this.requisition.getSkippedFullSupplyProducts.andReturn([]);

            this.initController();
            this.vm.unskipFullSupplyProducts();

            expect(this.selectProductsModalService.show).not.toHaveBeenCalled();
        });

        it('should do nothing if modal was dismissed for skipped products', function() {
            this.selectProductsModalService.show.andReturn(this.$q.reject());

            this.initController();
            this.vm.unskipFullSupplyProducts();

            expect(this.requisition.unskipFullSupplyProducts).not.toHaveBeenCalled();
            expect(this.requisition.addLineItems).not.toHaveBeenCalled();
        });

        it('should unskip full supply products', function() {
            this.initController();
            this.vm.unskipFullSupplyProducts();
            this.$rootScope.$apply();

            expect(this.requisition.unskipFullSupplyProducts)
                .toHaveBeenCalledWith([
                    this.skippedFullSupplyProducts[0],
                    this.skippedFullSupplyProducts[2]
                ]);
        });

        it('should show products in alphabetical order', function() {
            this.initController();
            this.vm.unskipFullSupplyProducts();

            var actualProducts = this.selectProductsModalService.show.calls[0].args[0];

            expect(actualProducts.products.length).toEqual(3);
            expect(actualProducts.products[0]).toEqual(this.skippedFullSupplyProducts[1]);
            expect(actualProducts.products[1]).toEqual(this.skippedFullSupplyProducts[0]);
            expect(actualProducts.products[2]).toEqual(this.skippedFullSupplyProducts[2]);
        });

    });

    describe('showDeleteColumn', function() {

        beforeEach(function() {
            this.fullSupply = false;
            this.canSubmit = false;
            this.canAuthorize = false;
            this.requisition.requisitionLineItems[1].$deletable = true;
        });

        it('should return false if viewing full supply tab', function() {
            this.fullSupply = true;

            this.initController();

            expect(this.vm.showDeleteColumn()).toBe(false);
        });

        it('should return false if there is no deletable line items', function() {
            this.canSubmit = true;
            this.requisition.requisitionLineItems[1].$deletable = false;

            this.initController();

            expect(this.vm.showDeleteColumn()).toBeFalsy();
        });

        it('should return false if there is no line items', function() {
            this.requisition.requisitionLineItems = [];

            this.initController();

            expect(this.vm.showDeleteColumn()).toBe(false);
        });

        it('should return true if user has right to authorize submitted requisition', function() {
            this.canSubmit = true;

            this.initController();

            expect(this.vm.showDeleteColumn()).toBe(true);
        });

    });

    describe('skippedFullSupplyProductCountMessage', function() {

        it('should count the number of skipped line items and return the right message', function() {
            this.initController();
            this.messageService.get.isSpy = false;
            spyOn(this.messageService, 'get').andCallFake(function(p1, p2) {
                return p2;
            });
            this.requisition.requisitionLineItems[0].skipped = true;

            expect(this.vm.skippedFullSupplyProductCountMessage().skippedProductCount).toBe(1);
        });

        it('should not count the number of skipped line items that are not full supply', function() {
            this.initController();

            this.messageService.get.isSpy = false;
            spyOn(this.messageService, 'get').andCallFake(function(p1, p2) {
                return p2;
            });
            this.requisition.requisitionLineItems[0].skipped = true;
            this.requisition.requisitionLineItems[0].$program.fullSupply = false;

            expect(this.vm.skippedFullSupplyProductCountMessage().skippedProductCount).toBe(0);
        });
    });

    describe('getDescriptionForColumn', function() {

        it('should return column definition for regular columns', function() {
            this.initController();

            expect(this.vm.getDescriptionForColumn(this.columns[0])).toEqual(this.columns[0].definition);
        });

        it('should return info about disabled total losses and adjustments modal', function() {
            this.columns.push(this.totalLossesAndAdjustmentsColumn);
            this.requisition.template.populateStockOnHandFromStockCards = true;

            this.initController();

            expect(this.vm.getDescriptionForColumn(this.columns[1]))
                .toEqual(this.columns[1].definition + ' ' + 'requisitionViewTab.totalLossesAndAdjustment.disabled');
        });
    });

    describe('isProductNameColumn', function() {

        it('should return true for the product name column', function() {
            this.initController();

            var column = {
                name: 'orderable.fullProductName'
            };

            expect(this.vm.isProductNameColumn(column)).toBe(true);
        });

        it('should return false for other columns', function() {
            this.initController();

            var column = {
                name: 'orderable.productCode'
            };

            expect(this.vm.isProductNameColumn(column)).toBe(false);
        });
    });

    function initController() {
        this.vm = this.$controller('ViewTabController', {
            lineItems: [],
            items: [],
            columns: [],
            requisition: this.requisition,
            canSubmit: this.canSubmit,
            canAuthorize: this.canAuthorize,
            fullSupply: this.fullSupply,
            program: {},
            $scope: this.$scope,
            canApproveAndReject: this.canApproveAndReject,
            canUnskipRequisitionItemWhenApproving: this.canUnskipRequisitionItemWhenApproving
        });
        this.vm.$onInit();
    }

});

describe('ViewTabController (supplying-facility stock)', function() {

    beforeEach(function() {
        module('requisition-view-tab', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.$rootScope = $injector.get('$rootScope');
            this.$q = $injector.get('$q');
            this.scope = this.$rootScope.$new();
        });

        this.messageService = {
            get: jasmine.createSpy('messageServiceGet').andCallFake(function(key) {
                return key;
            })
        };

        var spec = this;
        this.initController = function(requisition, lineItems, columns, canApproveAndReject) {
            var vm = spec.$controller('ViewTabController', {
                $filter: function() {
                    return function() {
                        return [];
                    };
                },
                selectProductsModalService: {},
                requisitionValidator: {
                    isLineItemValid: function() {}
                },
                requisition: requisition,
                columns: columns || [],
                messageService: spec.messageService,
                lineItems: lineItems,
                alertService: {},
                canSubmit: false,
                canAuthorize: false,
                fullSupply: false,
                TEMPLATE_COLUMNS: {
                    getTbMonthlyColumns: function() {
                        return [];
                    }
                },
                $q: spec.$q,
                OpenlmisArrayDecorator: function() {},
                canApproveAndReject: canApproveAndReject === undefined ? true : canApproveAndReject,
                items: lineItems,
                paginationService: {
                    registerList: function() {
                        return {
                            then: function() {}
                        };
                    }
                },
                $stateParams: {},
                requisitionCacheService: {},
                canUnskipRequisitionItemWhenApproving: false,
                program: {
                    name: 'family-planning'
                },
                TB_MONTHLY_PROGRAM: 'TB Monthly',
                quantityUnitCalculateService: {
                    recalculateInputQuantity: function(quantities) {
                        return quantities;
                    }
                },
                $scope: spec.scope
            });
            vm.$onInit();
            return vm;
        };

        this.requisition = function(overrides, columnDisplayed) {
            var requisition = angular.extend({
                emergency: false
            }, overrides);
            requisition.template = {
                hasSkipColumn: function() {
                    return false;
                },
                hideSkippedLineItems: function() {
                    return false;
                },
                columnsMap: {
                    supplyingFacilityStockOnHand: {
                        isDisplayed: columnDisplayed !== false
                    }
                },
                getColumn: function(name) {
                    return this.columnsMap[name];
                }
            };
            requisition.recalculateQuantity = function(quantity) {
                return quantity;
            };
            return requisition;
        };
    });

    describe('header', function() {

        it('should read "not configured" when there are no supplying facilities', function() {
            var vm = this.initController(
                this.requisition({
                    supplyingFacilities: null
                }),
                [{
                    supplyingFacilityStockOnHand: undefined,
                    approvedQuantity: 5
                }]
            );

            expect(vm.supplyingFacilityHasStock).toBe(false);
            expect(vm.supplyingFacilityHeader).toBe('requisitionViewTab.supplyingFacility.notConfigured');
        });

        it('should read "stock unavailable" when facilities exist but no line has stock on hand', function() {
            var vm = this.initController(
                this.requisition({
                    supplyingFacilities: [{
                        name: 'Central Medical Stores'
                    }]
                }),
                [{
                    supplyingFacilityStockOnHand: undefined,
                    approvedQuantity: 5
                }, {
                    supplyingFacilityStockOnHand: null,
                    approvedQuantity: 2
                }]
            );

            expect(vm.supplyingFacilityHasStock).toBe(false);
            expect(vm.supplyingFacilityHeader).toBe('requisitionViewTab.supplyingFacility.stockUnavailable');
        });

        it('should read the facility name when at least one line has stock on hand', function() {
            var vm = this.initController(
                this.requisition({
                    supplyingFacilities: [{
                        name: 'Central Medical Stores'
                    }, {
                        name: 'Regional Medical Stores'
                    }]
                }),
                [{
                    supplyingFacilityStockOnHand: 10,
                    approvedQuantity: 5
                }]
            );

            expect(vm.supplyingFacilityHasStock).toBe(true);
            expect(vm.supplyingFacilityHeader).toBe('requisitionViewTab.supplyingFacility.name');
            expect(this.messageService.get).toHaveBeenCalledWith(
                'requisitionViewTab.supplyingFacility.name',
                {
                    facilities: 'Central Medical Stores, Regional Medical Stores'
                }
            );
        });
    });

    describe('column and banner visibility', function() {

        it('should show the column when enabled for an approver with access', function() {
            var vm = this.initController(
                this.requisition({
                    supplyingFacilities: [{
                        name: 'Central Medical Stores'
                    }]
                }),
                [{
                    supplyingFacilityStockOnHand: 10,
                    approvedQuantity: 5
                }]
            );

            expect(vm.showSupplyingFacilitySoh).toBe(true);
            expect(vm.showSupplyingFacilityBanner).toBe(false);
        });

        it('should show the banner and hide the column when access is denied', function() {
            var vm = this.initController(
                this.requisition({
                    supplyingFacilityAccessDenied: true,
                    supplyingFacilities: null
                }),
                []
            );

            expect(vm.showSupplyingFacilitySoh).toBe(false);
            expect(vm.showSupplyingFacilityBanner).toBe(true);
        });

        it('should hide the column and banner when the template column is disabled', function() {
            var vm = this.initController(
                this.requisition({
                    supplyingFacilities: [{
                        name: 'Central Medical Stores'
                    }]
                }, false),
                [{
                    supplyingFacilityStockOnHand: 10,
                    approvedQuantity: 5
                }]
            );

            expect(vm.showSupplyingFacilitySoh).toBe(false);
            expect(vm.showSupplyingFacilityBanner).toBe(false);
        });

        it('should hide the column and banner for a user who cannot approve', function() {
            var vm = this.initController(
                this.requisition({
                    supplyingFacilities: [{
                        name: 'Central Medical Stores'
                    }]
                }),
                [{
                    supplyingFacilityStockOnHand: 10,
                    approvedQuantity: 5
                }],
                [],
                false
            );

            expect(vm.showSupplyingFacilitySoh).toBe(false);
            expect(vm.showSupplyingFacilityBanner).toBe(false);
        });

        it('should not show the banner when access is denied but the column is disabled', function() {
            var vm = this.initController(
                this.requisition({
                    supplyingFacilityAccessDenied: true,
                    supplyingFacilities: null
                }, false),
                []
            );

            expect(vm.showSupplyingFacilitySoh).toBe(false);
            expect(vm.showSupplyingFacilityBanner).toBe(false);
        });

        it('should drop the generic supplyingFacilityStockOnHand column from the rendered columns', function() {
            var columns = [{
                name: 'stockOnHand',
                isQuantityColumn: function() {
                    return false;
                }
            }, {
                name: 'supplyingFacilityStockOnHand',
                isQuantityColumn: function() {
                    return false;
                }
            }, {
                name: 'approvedQuantity',
                isQuantityColumn: function() {
                    return false;
                }
            }];
            var lineItems = [{
                supplyingFacilityStockOnHand: 10,
                approvedQuantity: 5,
                updateFieldValue: function() {}
            }];

            var vm = this.initController(
                this.requisition({
                    supplyingFacilities: [{
                        name: 'Central Medical Stores'
                    }]
                }),
                lineItems,
                columns
            );

            var names = vm.columns.map(function(column) {
                return column.name;
            });

            expect(names).toEqual(['stockOnHand', 'approvedQuantity']);
        });
    });

    describe('isSupplyingFacilityShortfall', function() {

        beforeEach(function() {
            this.lineItems = [{
                supplyingFacilityStockOnHand: 10,
                approvedQuantity: 5
            }, {
                supplyingFacilityStockOnHand: 3,
                approvedQuantity: 8
            }, {
                supplyingFacilityStockOnHand: 0,
                approvedQuantity: 1
            }, {
                supplyingFacilityStockOnHand: undefined,
                approvedQuantity: 2
            }];

            this.vm = this.initController(
                this.requisition({
                    supplyingFacilities: [{
                        name: 'Central Medical Stores'
                    }]
                }),
                this.lineItems
            );
        });

        it('should not highlight when approved quantity is within stock on hand', function() {
            expect(this.vm.isSupplyingFacilityShortfall(this.lineItems[0])).toBe(false);
        });

        it('should highlight when approved quantity exceeds stock on hand', function() {
            expect(this.vm.isSupplyingFacilityShortfall(this.lineItems[1])).toBe(true);
        });

        it('should highlight a positive approved quantity against zero stock on hand', function() {
            expect(this.vm.isSupplyingFacilityShortfall(this.lineItems[2])).toBe(true);
        });

        it('should treat an absent stock on hand as zero and highlight a positive approved quantity', function() {
            expect(this.vm.isSupplyingFacilityShortfall(this.lineItems[3])).toBe(true);
        });

        it('should not highlight any line when no line has stock on hand', function() {
            var lineItems = [{
                supplyingFacilityStockOnHand: undefined,
                approvedQuantity: 100
            }];
            var vm = this.initController(
                this.requisition({
                    supplyingFacilities: [{
                        name: 'Central Medical Stores'
                    }]
                }),
                lineItems
            );

            expect(vm.supplyingFacilityHasStock).toBe(false);
            expect(vm.isSupplyingFacilityShortfall(lineItems[0])).toBe(false);
        });

        it('should not highlight when approved quantity equals stock on hand', function() {
            expect(this.vm.isSupplyingFacilityShortfall({
                supplyingFacilityStockOnHand: 5,
                approvedQuantity: 5
            })).toBe(false);
        });

        it('should recompute the shortfall after the approved quantity changes', function() {
            var lineItem = {
                supplyingFacilityStockOnHand: 10,
                approvedQuantity: 5
            };
            var vm = this.initController(
                this.requisition({
                    supplyingFacilities: [{
                        name: 'Central Medical Stores'
                    }]
                }),
                [lineItem]
            );

            expect(vm.isSupplyingFacilityShortfall(lineItem)).toBe(false);

            lineItem.approvedQuantity = 20;

            expect(vm.isSupplyingFacilityShortfall(lineItem)).toBe(true);
        });

        it('should compare raw values regardless of the quantity-unit toggle', function() {
            var requisition = this.requisition({
                supplyingFacilities: [{
                    name: 'Central Medical Stores'
                }]
            });
            requisition.recalculateQuantity = function(quantity) {
                return quantity + ' packs';
            };
            var lineItem = {
                supplyingFacilityStockOnHand: 3,
                approvedQuantity: 8,
                orderable: {
                    netContent: 10
                }
            };
            var vm = this.initController(requisition, [lineItem]);

            expect(vm.isSupplyingFacilityShortfall(lineItem)).toBe(true);
        });
    });

    describe('getSupplyingFacilityStockOnHand', function() {

        beforeEach(function() {
            this.vm = this.initController(
                this.requisition({
                    supplyingFacilities: [{
                        name: 'Central Medical Stores'
                    }]
                }),
                [{
                    supplyingFacilityStockOnHand: 10,
                    approvedQuantity: 5
                }]
            );
        });

        it('should return the numeric value when present', function() {
            expect(this.vm.getSupplyingFacilityStockOnHand({
                supplyingFacilityStockOnHand: 7,
                orderable: {
                    netContent: 1
                }
            })).toBe(7);
        });

        it('should return zero as zero', function() {
            expect(this.vm.getSupplyingFacilityStockOnHand({
                supplyingFacilityStockOnHand: 0,
                orderable: {
                    netContent: 1
                }
            })).toBe(0);
        });

        it('should return the placeholder when the value is absent', function() {
            expect(this.vm.getSupplyingFacilityStockOnHand({
                supplyingFacilityStockOnHand: undefined
            })).toBe('requisitionViewTab.supplyingFacility.placeholder');
        });

        it('should return the placeholder when the value is null', function() {
            expect(this.vm.getSupplyingFacilityStockOnHand({
                supplyingFacilityStockOnHand: null
            })).toBe('requisitionViewTab.supplyingFacility.placeholder');
        });

        it('should convert the displayed value through the requisition quantity-unit toggle', function() {
            var requisition = this.requisition({
                supplyingFacilities: [{
                    name: 'Central Medical Stores'
                }]
            });
            requisition.recalculateQuantity = jasmine.createSpy('recalculateQuantity')
                .andCallFake(function(quantity) {
                    return quantity + ' packs';
                });
            var vm = this.initController(requisition, [{
                supplyingFacilityStockOnHand: 12,
                approvedQuantity: 1,
                orderable: {
                    netContent: 10
                }
            }]);

            var displayed = vm.getSupplyingFacilityStockOnHand({
                supplyingFacilityStockOnHand: 12,
                orderable: {
                    netContent: 10
                }
            });

            expect(displayed).toBe('12 packs');
            expect(requisition.recalculateQuantity).toHaveBeenCalledWith(12, 10);
        });
    });
});
