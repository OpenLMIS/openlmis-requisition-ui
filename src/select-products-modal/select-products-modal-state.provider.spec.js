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

describe('selectProductsModalStateProvider', function() {

    beforeEach(function() {
        var context = this;
        module('openlmis-modal-state', function(modalStateProvider, $stateProvider) {
            context.modalStateProvider = modalStateProvider;
            context.$stateProvider = $stateProvider;
        });

        module('select-products-modal', function(selectProductsModalStateProvider) {
            context.selectProductsModalStateProvider = selectProductsModalStateProvider;
        });

        module('openlmis-pagination');

        inject(function($injector) {
            this.selectProductsModalService = $injector.get('selectProductsModalService');
            this.OrderableResource = $injector.get('OrderableResource');
            this.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            this.PageDataBuilder = $injector.get('PageDataBuilder');
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.$state = $injector.get('$state');
            this.$controller = $injector.get('$controller');
            this.paginationService = $injector.get('paginationService');
        });

        this.orderables = [
            new this.OrderableDataBuilder().build(),
            new this.OrderableDataBuilder().build()
        ];

        this.orderablesPage = new this.PageDataBuilder()
            .withContent(this.orderables)
            .build();

        this.$scope = this.$rootScope.$new();

        this.paginationController = this.$controller('PaginationController', {
            $scope: this.$scope,
            paginationService: this.paginationService
        });

        spyOn(this.OrderableResource.prototype, 'query').andReturn(this.$q.resolve(this.orderablesPage));
        spyOn(this.selectProductsModalService, 'getOrderables').andReturn();
        spyOn(this.selectProductsModalService, 'getSelections').andReturn({});

        spyOn(this.modalStateProvider, 'state').andCallFake(function(stateName, config) {
            context.config = config;
            context.stateName = stateName;
            return context;
        });

        this.goToState = function() {
            this.$state.go.apply(this, arguments);
            this.$rootScope.$apply();
        };

        this.getResolvedValue = function(name) {
            return this.$state.$current.locals.globals[name];
        };
    });

    describe('stateWithAddOrderablesChildState', function() {

        beforeEach(function() {
            spyOn(this.$stateProvider, 'state').andReturn();
        });

        it('should register the state as page if no display is defined', function() {
            this.selectProductsModalStateProvider.stateWithAddOrderablesChildState('main', {
                url: '/main'
            });

            expect(this.$stateProvider.state).toHaveBeenCalledWith('main', {
                url: '/main'
            });
        });

        it('should register the state as modal if display is set to modal', function() {
            this.selectProductsModalStateProvider.stateWithAddOrderablesChildState('mainModal', {
                url: '/mainModal',
                display: 'modal'
            });

            expect(this.modalStateProvider.state).toHaveBeenCalledWith('mainModal', {
                url: '/mainModal',
                display: 'modal'
            });
        });

    });

    describe('.addOrderables', function() {

        beforeEach(function() {
            this.selectProductsModalStateProvider.stateWithAddOrderablesChildState('main', {
                url: '/main'
            });

        });

        it('should set controller', function() {
            expect(this.config.controller).toBe('SelectProductsModalController');
        });

        it('should set controllerAs', function() {
            expect(this.config.controllerAs).toBe('vm');
        });

        it('should set templateUrl', function() {
            expect(this.config.templateUrl).toBe('select-products-modal/select-products-modal.html');
        });

        it('should set label', function() {
            expect(this.config.label).toBe('adminOrderableEdit.kitUnpackList');
        });

        it('should set nonTrackable', function() {
            expect(this.config.nonTrackable).toBeTruthy();
        });

        it('should set params', function() {
            expect(this.config.params.addOrderablesPage).toBeUndefined();
            expect(this.config.params.addOrderablesSize).toBeUndefined();
            expect(this.config.params.productName).toBeUndefined();
            expect(this.config.params.productCode).toBeUndefined();
        });

        it('should resolve external as false if no orderables provided', function() {
            this.selectProductsModalService.getOrderables.andReturn(this.orderables);

            var result = this.config.resolve.external(this.selectProductsModalService);

            expect(result).toBeFalsy();
            expect(this.selectProductsModalService.getOrderables).toHaveBeenCalled();
        });

        it('should resolve external as true if any orderable provided', function() {
            this.selectProductsModalService.getOrderables.andReturn();

            var result = this.config.resolve.external(this.selectProductsModalService);

            expect(result).toBeTruthy();
            expect(this.selectProductsModalService.getOrderables).toHaveBeenCalled();
        });

        it('should resolve orderables for external pagination', function() {
            this.selectProductsModalService.getOrderables.andReturn(this.orderables);

            this.config.resolve.orderables(this.OrderableResource, this.paginationService,
                this.$state.params, this.selectProductsModalService);

            expect(this.selectProductsModalService.getOrderables).toHaveBeenCalled();
        });

        it('should resolve matching orderables on unpack kit screen', function() {
            this.nameParam = 'Product';
            this.codeParam = 'C100';
            this.$state.params = {
                page: 0,
                size: 10,
                productName: this.nameParam,
                productCode: this.codeParam
            };

            this.selectProductsModalService.getOrderables.andReturn();

            this.config.resolve.orderables(this.OrderableResource, this.paginationService,
                this.$state.params, this.selectProductsModalService, true);

            expect(this.selectProductsModalService.getOrderables).toHaveBeenCalled();

            expect(this.OrderableResource.prototype.query).toHaveBeenCalledWith({
                sort: 'fullProductName,asc',
                page: 0,
                size: 10,
                name: this.nameParam,
                code: this.codeParam
            });
        });

        it('should resolve matching orderables on any screen except unpack kit', function() {
            this.search = 'search text';
            this.$state.params = {
                page: 0,
                size: 10,
                search: this.search
            };

            this.selectProductsModalService.getOrderables.andReturn();

            this.config.resolve.orderables(this.OrderableResource, this.paginationService,
                this.$state.params, this.selectProductsModalService, false);

            expect(this.selectProductsModalService.getOrderables).toHaveBeenCalled();

            expect(this.OrderableResource.prototype.query).toHaveBeenCalledWith({
                sort: 'fullProductName,asc',
                page: 0,
                size: 10,
                search: this.search
            });
        });

    });

});
