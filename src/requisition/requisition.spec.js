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


describe('Requisition', function() {

    var $rootScope, httpBackend, q, REQUISITION_STATUS, requisitionUrlFactory, openlmisUrl,
        LineItemSpy, offlineRequisitions;

    var requisition,
        facility = {
            id: '1',
            name: 'facility'
        },
        program = {
            id: '1',
            name: 'program'
        },
        lineItem1 = {
            calculatedOrderQuantity: 100,
            requestedQuantity: 90,
            approvedQuantity: null,
            skipped: false
        },
        lineItem2 = {
            calculatedOrderQuantity: 100,
            requestedQuantity: null,
            approvedQuantity: null,
            skipped: false
        },
        sourceRequisition = {
            id: '1',
            modifiedDate: [2016, 4, 30, 16, 21, 33],
            name: 'requisition',
            status: 'INITIATED',
            facility: facility,
            program: program,
            supplyingFacility: facility,
            requisitionLineItems: [lineItem1, lineItem2],
            template: {
                id: '1',
                programId: '1',
                columnsMap : {
                beginningBalance : beginningBalance,
                calculatedOrderQuantity: calculatedOrderQuantity
                }},
            processingPeriod: {
                startDate: new Date(2017, 0, 1),
                endDate: new Date(2017, 0, 31)
            }
        },
        stockAdjustmentReason = {
            program: program,
            id: '1'
        },
        columnDefinition = {
            id: '1',
            name: 'beginningBalance',
            label: 'BG',
            sources: ['USER_INPUT'],
            columnType: 'NUMERIC',
            mandatory: true
        },
        beginningBalance = {
            name: 'beginningBalance',
            label: 'BG',
            source: 'USER_INPUT',
            columnDefinition: columnDefinition
        },
        calculatedOrderQuantity = {
            isDisplayed: true
        };

    beforeEach(module('requisition'));

    beforeEach(module(function($provide){
        var template = jasmine.createSpyObj('template', ['getColumns', 'getColumn']),
            TemplateSpy = jasmine.createSpy('RequisitionTemplate').andReturn(template);

        template.getColumns.andCallFake(function(nonFullSupply) {
            return nonFullSupply ? nonFullSupplyColumns() : fullSupplyColumns();
        });

        template.getColumn.andReturn(calculatedOrderQuantity);

        offlineRequisitions = jasmine.createSpyObj('offlineRequisitions', ['put', 'remove', 'removeBy']);
        var offlineFlag = jasmine.createSpyObj('offlineRequisitions', ['getAll']);
        offlineFlag.getAll.andReturn([false]);

    	$provide.service('RequisitionTemplate', function(){
    		return TemplateSpy;
    	});
        $provide.factory('localStorageFactory', function() {
            return function(name) {
                if(name === 'offlineFlag') return offlineFlag;
                return offlineRequisitions;
            };
        });
    }));

    beforeEach(module(function($provide){
        LineItemSpy = jasmine.createSpy().andCallFake(function(lineItem) {
            return lineItem;
        });

        $provide.service('LineItem', function(){
            return LineItemSpy;
        });
    }));

    beforeEach(inject(function(_$httpBackend_, _$rootScope_, Requisition, _requisitionUrlFactory_,
                               openlmisUrlFactory, _REQUISITION_STATUS_, $q) {

        httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        requisitionUrlFactory = _requisitionUrlFactory_;
        openlmisUrl = openlmisUrlFactory;
        REQUISITION_STATUS = _REQUISITION_STATUS_;
        q = $q;

        requisition = new Requisition(sourceRequisition, {});
    }));

    it('should submit requisition that is available offline', function() {
        var storedRequisition;

        offlineRequisitions.put.andCallFake(function(argument) {
            storedRequisition = argument;
        });

        expect(requisition.$isSubmitted()).toBe(false);

        requisition.status = REQUISITION_STATUS.SUBMITTED;

        httpBackend.when('POST', requisitionUrlFactory('/api/requisitions/' + requisition.id + '/submit'))
        .respond(200, requisition);

        requisition.$availableOffline = true;
        requisition.$submit();

        httpBackend.flush();
        $rootScope.$apply();

        expect(requisition.$isSubmitted()).toBe(true);
        expect(offlineRequisitions.put).toHaveBeenCalled();
        expect(storedRequisition.$modified).toBe(false);
        expect(storedRequisition.$availableOffline).toBe(true);
        expect(storedRequisition.id).toEqual(requisition.id);
    });

    it('should update modifiedDate, status and statusChanges of a requisition', function() {
        var storedRequisition, updatedRequisition;

        offlineRequisitions.put.andCallFake(function(argument) {
            storedRequisition = argument;
        });

        updatedRequisition = angular.copy(requisition);
        updatedRequisition.status = REQUISITION_STATUS.SUBMITTED;
        updatedRequisition.modifiedDate = [2016, 4, 31, 16, 25, 33];
        updatedRequisition.statusChanges = 'statusChanges';

        httpBackend.when('POST', requisitionUrlFactory('/api/requisitions/' + requisition.id + '/submit'))
            .respond(200, updatedRequisition);

        requisition.$availableOffline = true;
        requisition.$submit();

        httpBackend.flush();
        $rootScope.$apply();

        expect(offlineRequisitions.put).toHaveBeenCalled();
        expect(storedRequisition.modifiedDate).toEqual(updatedRequisition.modifiedDate);
        expect(storedRequisition.status).toEqual(updatedRequisition.status);
        expect(storedRequisition.statusChanges).toEqual(updatedRequisition.statusChanges);
    });

    it('should save requisition to local storage after updating it', function() {
        var storedRequisition, updatedRequisition;

        offlineRequisitions.put.andCallFake(function(argument) {
            storedRequisition = argument;
        });

        updatedRequisition = angular.copy(requisition);

        httpBackend.when('POST', requisitionUrlFactory('/api/requisitions/' + requisition.id + '/submit'))
            .respond(200, updatedRequisition);

        requisition.$availableOffline = true;
        requisition.$submit();

        httpBackend.flush();
        $rootScope.$apply();

        expect(offlineRequisitions.put).toHaveBeenCalled();
        expect(storedRequisition.id).toEqual(updatedRequisition.id);
    });

    it('should authorize requisition that is available offline', function() {
        var storedRequisition;
        offlineRequisitions.put.andCallFake(function(argument) {
            storedRequisition = argument;
        });

        expect(requisition.$isAuthorized()).toBe(false);

        requisition.status = REQUISITION_STATUS.AUTHORIZED;

        httpBackend.when('POST', requisitionUrlFactory('/api/requisitions/' + requisition.id + '/authorize'))
        .respond(200, requisition);

        requisition.$availableOffline = true;
        requisition.$authorize();

        httpBackend.flush();
        $rootScope.$apply();

        expect(requisition.$isAuthorized()).toBe(true);
        expect(offlineRequisitions.put).toHaveBeenCalled();
        expect(storedRequisition.$modified).toBe(false);
        expect(storedRequisition.$availableOffline).toBe(true);
        expect(storedRequisition.id).toEqual(requisition.id);
    });

    it('should approve requisition that is available offline', function() {
        var storedRequisition;
        offlineRequisitions.put.andCallFake(function(argument) {
            storedRequisition = argument;
        });

        expect(requisition.$isApproved()).toBe(false);

        requisition.status = REQUISITION_STATUS.APPROVED;

        httpBackend.when('POST', requisitionUrlFactory('/api/requisitions/' + requisition.id + '/approve'))
        .respond(200, requisition);

        requisition.$availableOffline = true;
        requisition.$approve();

        httpBackend.flush();
        $rootScope.$apply();

        expect(requisition.$isApproved()).toBe(true);
        expect(offlineRequisitions.put).toHaveBeenCalled();
        expect(storedRequisition.$modified).toBe(false);
        expect(storedRequisition.$availableOffline).toBe(true);
        expect(storedRequisition.id).toEqual(requisition.id);
    });

    it('should submit requisition that is not available offline', function() {
        var storedRequisition;
        offlineRequisitions.put.andCallFake(function(argument) {
            storedRequisition = argument;
        });

        expect(requisition.$isSubmitted()).toBe(false);

        requisition.status = REQUISITION_STATUS.SUBMITTED;

        httpBackend.when('POST', requisitionUrlFactory('/api/requisitions/' + requisition.id + '/submit'))
        .respond(200, requisition);

        requisition.$availableOffline = false;
        requisition.$submit();

        httpBackend.flush();
        $rootScope.$apply();

        expect(requisition.$isSubmitted()).toBe(true);
        expect(offlineRequisitions.put).not.toHaveBeenCalled();
    });

    it('should authorize requisition that is not available offline', function() {
        var storedRequisition;
        offlineRequisitions.put.andCallFake(function(argument) {
            storedRequisition = argument;
        });

        expect(requisition.$isAuthorized()).toBe(false);

        requisition.status = REQUISITION_STATUS.AUTHORIZED;

        httpBackend.when('POST', requisitionUrlFactory('/api/requisitions/' + requisition.id + '/authorize'))
        .respond(200, requisition);

        requisition.$availableOffline = false;
        requisition.$authorize();

        httpBackend.flush();
        $rootScope.$apply();

        expect(requisition.$isAuthorized()).toBe(true);
        expect(offlineRequisitions.put).not.toHaveBeenCalled();
    });

    it('should set approved quantity to requested quantity when requested quantity is not empty', function() {
        var storedRequisition;
        offlineRequisitions.put.andCallFake(function(argument) {
            storedRequisition = argument;
        });

        requisition.status = REQUISITION_STATUS.AUTHORIZED;
        requisition.template.getColumn('calculatedOrderQuantity').isDisplayed = true;
        requisition.requisitionLineItems[0].requestedQuantity = 10;
        requisition.requisitionLineItems[1].requestedQuantity = 15;

        httpBackend.when('POST', requisitionUrlFactory('/api/requisitions/' + requisition.id + '/authorize'))
            .respond(200, requisition);

        requisition.$availableOffline = false;
        requisition.$authorize();

        httpBackend.flush();
        $rootScope.$apply();

        expect(requisition.$isAuthorized()).toBe(true);
        expect(requisition.requisitionLineItems[0].approvedQuantity).toBe(requisition.requisitionLineItems[0].requestedQuantity);
        expect(requisition.requisitionLineItems[1].approvedQuantity).toBe(requisition.requisitionLineItems[1].requestedQuantity);
    });

    it('should set approved quantity to calculated quantity when calculated quantity is displayed and requested quantity is empty', function() {
        var storedRequisition;
        offlineRequisitions.put.andCallFake(function(argument) {
            storedRequisition = argument;
        });

        requisition.status = REQUISITION_STATUS.AUTHORIZED;
        requisition.template.getColumn('calculatedOrderQuantity').isDisplayed = true;
        requisition.requisitionLineItems[0].requestedQuantity = null;
        requisition.requisitionLineItems[1].requestedQuantity = null;

        httpBackend.when('POST', requisitionUrlFactory('/api/requisitions/' + requisition.id + '/authorize'))
            .respond(200, requisition);

        requisition.$availableOffline = false;
        requisition.$authorize();

        httpBackend.flush();
        $rootScope.$apply();

        expect(requisition.$isAuthorized()).toBe(true);
        expect(requisition.requisitionLineItems[0].approvedQuantity).toBe(requisition.requisitionLineItems[0].calculatedOrderQuantity);
        expect(requisition.requisitionLineItems[1].approvedQuantity).toBe(requisition.requisitionLineItems[1].calculatedOrderQuantity);
    });

    it('should set approved quantity to requested quantity when calculated quantity is not displayed', function() {
        var storedRequisition;
        offlineRequisitions.put.andCallFake(function(argument) {
            storedRequisition = argument;
        });

        requisition.status = REQUISITION_STATUS.AUTHORIZED;
        requisition.template.getColumn('calculatedOrderQuantity').isDisplayed = false;
        requisition.requisitionLineItems[0].requestedQuantity = 15;
        requisition.requisitionLineItems[1].requestedQuantity = null;

        httpBackend.when('POST', requisitionUrlFactory('/api/requisitions/' + requisition.id + '/authorize'))
            .respond(200, requisition);

        requisition.$availableOffline = false;
        requisition.$authorize();

        httpBackend.flush();
        $rootScope.$apply();

        expect(requisition.$isAuthorized()).toBe(true);
        expect(requisition.requisitionLineItems[0].approvedQuantity).toBe(requisition.requisitionLineItems[0].requestedQuantity);
        expect(requisition.requisitionLineItems[1].approvedQuantity).toBe(requisition.requisitionLineItems[1].requestedQuantity);
    });


    it('should approve requisition that is not available offline', function() {
        var storedRequisition;
        offlineRequisitions.put.andCallFake(function(argument) {
            storedRequisition = argument;
        });

        expect(requisition.$isApproved()).toBe(false);

        requisition.status = REQUISITION_STATUS.APPROVED;

        httpBackend.when('POST', requisitionUrlFactory('/api/requisitions/' + requisition.id + '/approve'))
        .respond(200, requisition);

        requisition.$availableOffline = false;
        requisition.$approve();

        httpBackend.flush();
        $rootScope.$apply();

        expect(requisition.$isApproved()).toBe(true);
        expect(offlineRequisitions.put).not.toHaveBeenCalled();
    });

    it('should reject requisition', function() {
        var data;

        httpBackend.when('PUT', requisitionUrlFactory('/api/requisitions/' + requisition.id + '/reject'))
        .respond(200, requisition);

        requisition.$reject().then(function(response) {
            data = response;
        });

        httpBackend.flush();
        $rootScope.$apply();

        expect(angular.toJson(data)).toEqual(angular.toJson(requisition));
    });

    it('should skip requisition', function() {
        var data;

        httpBackend.when('PUT', requisitionUrlFactory('/api/requisitions/' + requisition.id + '/skip'))
        .respond(200, requisition);

        requisition.$skip().then(function(response) {
            data = response;
        });

        httpBackend.flush();
        $rootScope.$apply();

        expect(angular.toJson(data)).toEqual(angular.toJson(requisition));
    });

    it('should save requisition', function() {
        var data;

        httpBackend.when('PUT', requisitionUrlFactory('/api/requisitions/' + requisition.id))
          .respond(200, requisition);

        requisition.name = 'Saved requisition';

        requisition.$save().then(function(response) {
            data = response;
        });

        httpBackend.flush();
        $rootScope.$apply();

        expect(angular.toJson(data)).toEqual(angular.toJson(requisition));
    });

    it('should remove offline when 403', function() {
        httpBackend.when('PUT', requisitionUrlFactory('/api/requisitions/' + requisition.id))
          .respond(403, requisition);

        requisition.$save();

        httpBackend.flush();
        $rootScope.$apply();

        expect(offlineRequisitions.removeBy).toHaveBeenCalledWith('id', '1');
    });

    it('should remove offline when 409', function() {
        httpBackend.when('PUT', requisitionUrlFactory('/api/requisitions/' + requisition.id))
          .respond(403, requisition);

        requisition.$save();

        httpBackend.flush();
        $rootScope.$apply();

        expect(offlineRequisitions.removeBy).toHaveBeenCalledWith('id', '1');
    });

    it('should return true if requisition status is initiated', function() {
        requisition.status = REQUISITION_STATUS.INITIATED;

        var isInitiated = requisition.$isInitiated();

        expect(isInitiated).toBe(true);
    });

    it('should return false if requisition status is not initiated', function() {
        requisition.status = REQUISITION_STATUS.SUBMITTED;

        var isInitiated = requisition.$isInitiated();

        expect(isInitiated).toBe(false);
    });

    it('should return true if requisition status is submitted', function() {
        requisition.status = REQUISITION_STATUS.SUBMITTED;

        var isSubmitted = requisition.$isSubmitted();

        expect(isSubmitted).toBe(true);
    });

    it('should return false if requisition status is not submitted', function() {
        requisition.status = REQUISITION_STATUS.INITIATED;

        var isSubmitted = requisition.$isSubmitted();

        expect(isSubmitted).toBe(false);
    });

    it('should return true if requisition status is authorized', function() {
        requisition.status = REQUISITION_STATUS.AUTHORIZED;

        var isAuthorized = requisition.$isAuthorized();

        expect(isAuthorized).toBe(true);
    });

    it('should return false if requisition status is not authorized', function() {
        requisition.status = REQUISITION_STATUS.INITIATED;

        var isAuthorized = requisition.$isAuthorized();

        expect(isAuthorized).toBe(false);
    });

    it('should return true if requisition status is approved', function() {
        requisition.status = REQUISITION_STATUS.APPROVED;

        var isApproved = requisition.$isApproved();

        expect(isApproved).toBe(true);
    });

    it('should return false if requisition status is not approved', function() {
        requisition.status = REQUISITION_STATUS.INITIATED;

        var isApproved = requisition.$isApproved();

        expect(isApproved).toBe(false);
    });

    it('should return true if requisition status is released', function() {
        requisition.status = REQUISITION_STATUS.RELEASED;

        var isReleased = requisition.$isReleased();

        expect(isReleased).toBe(true);
    });

    it('should return false if requisition status is not released', function() {
        requisition.status = REQUISITION_STATUS.INITIATED;

        var isReleased = requisition.$isReleased();

        expect(isReleased).toBe(false);
    });

    it('should return true if requisition status is rejected', function() {
        requisition.status = REQUISITION_STATUS.REJECTED;

        var isRejected = requisition.$isRejected();

        expect(isRejected).toBe(true);
    });

    it('should return false if requisition status is not rejected', function() {
        requisition.status = REQUISITION_STATUS.INITIATED;

        var isRejected = requisition.$isRejected();

        expect(isRejected).toBe(false);
    });

    describe('isAfterAuthorize', function() {
        it('should return false for requisition status INITIATED', function() {
            requisition.status = REQUISITION_STATUS.INITIATED;
            expect(requisition.$isAfterAuthorize()).toBe(false);
        });

        it('should return false for requisition status SUBMITTED', function() {
            requisition.status = REQUISITION_STATUS.SUBMITTED;
            expect(requisition.$isAfterAuthorize()).toBe(false);
        });

        it('should return true for requisition status AUTHORIZED', function() {
            requisition.status = REQUISITION_STATUS.AUTHORIZED;
            expect(requisition.$isAfterAuthorize()).toBe(true);
        });

        it('should return true for requisition status IN_APPROVAL', function() {
            requisition.status = REQUISITION_STATUS.IN_APPROVAL;
            expect(requisition.$isAfterAuthorize()).toBe(true);
        });

        it('should return true requisition status APPROVED', function() {
            requisition.status = REQUISITION_STATUS.APPROVED;
            expect(requisition.$isAfterAuthorize()).toBe(true);
        });

        it('should return true requisition status RELEASED', function() {
            requisition.status = REQUISITION_STATUS.RELEASED;
            expect(requisition.$isAfterAuthorize()).toBe(true);
        });
    });

    function fullSupplyCategories() {
        return [
            category('CategoryOne', [lineItemSpy('One'), lineItemSpy('Two')]),
            category('CategoryTwo', [lineItemSpy('Three'), lineItemSpy('Four')])
        ];
    }

    function nonFullSupplyCategories() {
        return [
            category('CategoryThree', [lineItemSpy('Five'), lineItemSpy('Six')]),
            category('CategoryFour', [lineItemSpy('Seven'), lineItemSpy('Eight')])
        ];
    }

    function nonFullSupplyColumns() {
        return [
            column('Three'),
            column('Four')
        ];
    }

    function fullSupplyColumns() {
        return [
            column('One'),
            column('Two')
        ];
    }

    function column(suffix) {
        return {
            name: 'Column' + suffix
        };
    }

    function category(name, lineItems) {
        return {
            name: name,
            lineItems: lineItems
        };
    }

    function lineItemSpy(suffix) {
        var lineItemSpy = jasmine.createSpyObj('lineItem' + suffix, ['areColumnsValid']);
        lineItemSpy.areColumnsValid.andReturn(true);
        return lineItemSpy;
    }
});
