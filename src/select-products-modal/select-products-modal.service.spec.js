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

describe('selectProductsModalService', function() {

    beforeEach(function() {
        module('select-products-modal');

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.$state = $injector.get('$state');
            this.selectProductsModalService = $injector.get('selectProductsModalService');
            this.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
        });

        this.orderables = [
            new this.OrderableDataBuilder().buildJson(),
            new this.OrderableDataBuilder().buildJson(),
            new this.OrderableDataBuilder().buildJson(),
            new this.OrderableDataBuilder().buildJson(),
            new this.OrderableDataBuilder().buildJson()
        ];

        this.config = {};
        this.config.products = this.orderables;

        spyOn(this.$state, 'go');
    });

    describe('show', function() {

        it('it should redirect to .addOrderables state', function() {
            this.selectProductsModalService.show(this.config);

            expect(this.$state.go).toHaveBeenCalledWith('.addOrderables', {
                code: undefined,
                name: undefined
            }, {
                notify: false
            });
        });

        it('it should return selections if any product is selected', function() {
            this.config.selections = [this.orderables[0], this.orderables[2], this.orderables[4]];
            this.selectProductsModalService.show(this.config);

            expect(this.selectProductsModalService.getSelections()).toEqual(this.config.selections);
        });

        it('it should return empty object if none of the products is selected', function() {
            this.selectProductsModalService.show(this.config);

            expect(this.selectProductsModalService.getSelections()).toEqual({});
        });

        it('it should return products if any product is selected', function() {
            this.selectProductsModalService.show(this.config);

            expect(this.selectProductsModalService.getOrderables()).toEqual(this.config.products);
        });

        it('it should return undefined if none of the products is selected', function() {
            this.config.products = undefined;
            this.selectProductsModalService.show(this.config);

            expect(this.selectProductsModalService.getOrderables()).toBeUndefined();
        });

    });

    describe('resolve', function() {

        it('it should resolve selected products', function() {
            this.config.selections = [this.orderables[0], this.orderables[2], this.orderables[4]];
            this.selectProductsModalService.show(this.config);

            this.selectProductsModalService.resolve();
            this.$rootScope.$apply();

            expect(this.$state.go).toHaveBeenCalledWith('^', {
                code: undefined,
                name: undefined
            }, {
                notify: false
            });
        });

    });

    describe('reject', function() {

        it('it should reject selected products', function() {
            this.config.selections = [this.orderables[0], this.orderables[2], this.orderables[4]];
            this.selectProductsModalService.show(this.config);

            this.selectProductsModalService.reject();
            this.$rootScope.$apply();

            expect(this.$state.go).toHaveBeenCalledWith('^', {
                code: undefined,
                name: undefined
            }, {
                notify: false
            });
        });

    });

});
