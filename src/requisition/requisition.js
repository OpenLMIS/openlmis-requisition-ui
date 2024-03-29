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
     * @name requisition.Requisition
     *
     * @description
     * Responsible for supplying requisition with additional methods.
     */
    angular
        .module('requisition')
        .factory('Requisition', requisitionFactory);

    requisitionFactory.$inject = [
        '$q', '$resource', 'requisitionUrlFactory', 'RequisitionTemplate', 'LineItem', 'REQUISITION_STATUS',
        'COLUMN_SOURCES', 'localStorageFactory', 'dateUtils', '$filter', 'TEMPLATE_COLUMNS', 'authorizationService',
        'REQUISITION_RIGHTS', 'UuidGenerator', 'requisitionCacheService'
    ];

    function requisitionFactory($q, $resource, requisitionUrlFactory, RequisitionTemplate, LineItem, REQUISITION_STATUS,
                                COLUMN_SOURCES, localStorageFactory, dateUtils, $filter, TEMPLATE_COLUMNS,
                                authorizationService, REQUISITION_RIGHTS, UuidGenerator, requisitionCacheService) {

        var offlineRequisitions = localStorageFactory('requisitions'),
            resource = $resource(requisitionUrlFactory('/api/v2/requisitions/:id'), {}, {
                authorize: {
                    headers: {
                        'Idempotency-Key': getIdempotencyKey
                    },
                    url: requisitionUrlFactory('/api/requisitions/:id/authorize'),
                    method: 'POST'
                },
                save: {
                    method: 'PUT',
                    headers: {
                        'If-Match': getETag
                    },
                    transformRequest: transformRequisition
                },
                submit: {
                    headers: {
                        'Idempotency-Key': getIdempotencyKey
                    },
                    url: requisitionUrlFactory('/api/requisitions/:id/submit'),
                    method: 'POST'
                },
                approve: {
                    headers: {
                        'Idempotency-Key': getIdempotencyKey
                    },
                    url: requisitionUrlFactory('/api/requisitions/:id/approve'),
                    method: 'POST'
                },
                reject: {
                    headers: {
                        'Idempotency-Key': getIdempotencyKey
                    },
                    url: requisitionUrlFactory('/api/requisitions/:id/reject'),
                    method: 'PUT'
                },
                skip: {
                    headers: {
                        'Idempotency-Key': getIdempotencyKey
                    },
                    url: requisitionUrlFactory('/api/requisitions/:id/skip'),
                    method: 'PUT'
                },
                remove: {
                    headers: {
                        'Idempotency-Key': getIdempotencyKey
                    },
                    url: requisitionUrlFactory('/api/requisitions/:id'),
                    method: 'DELETE'
                },
                unskipRequisitionWhenApproving: {
                    url: requisitionUrlFactory('/api/requisitions/unSkipRequisition'),
                    method: 'GET',
                    forceHideOfflineModal: true
                }
            });

        Requisition.prototype.$authorize = authorize;
        Requisition.prototype.$save = save;
        Requisition.prototype.$submit = submit;
        Requisition.prototype.$remove = remove;
        Requisition.prototype.$approve = approve;
        Requisition.prototype.$reject = reject;
        Requisition.prototype.$skip = skip;
        Requisition.prototype.$isInitiated = isInitiated;
        Requisition.prototype.$isSubmitted = isSubmitted;
        Requisition.prototype.$isApproved = isApproved;
        Requisition.prototype.$isAuthorized = isAuthorized;
        Requisition.prototype.$isInApproval = isInApproval;
        Requisition.prototype.$isReleased = isReleased;
        Requisition.prototype.$isRejected = isRejected;
        Requisition.prototype.$isSkipped = isSkipped;
        Requisition.prototype.$isAfterAuthorize = isAfterAuthorize;
        Requisition.prototype.$getProducts = getProducts;
        Requisition.prototype.skipAllFullSupplyLineItems = skipAllFullSupplyLineItems;
        Requisition.prototype.unskipAllFullSupplyLineItems = unskipAllFullSupplyLineItems;
        Requisition.prototype.getAvailableNonFullSupplyProducts = getAvailableNonFullSupplyProducts;
        Requisition.prototype.getAvailableFullSupplyProducts = getAvailableFullSupplyProducts;
        Requisition.prototype.getSkippedFullSupplyProducts = getSkippedFullSupplyProducts;
        Requisition.prototype.addLineItem = addLineItem;
        Requisition.prototype.addLineItems = addLineItems;
        Requisition.prototype.deleteLineItem = deleteLineItem;
        Requisition.prototype.unskipFullSupplyProducts = unskipFullSupplyProducts;
        Requisition.prototype.unskipRequisitionWhenApproving = unskipRequisitionWhenApproving;

        return Requisition;

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name requisition
         *
         * @description
         * Adds all needed methods and information from template to given requisition.
         *
         * @param  {Resource} source           resource with requisition
         * @param  {Resource} statusMessages   resource with status messages
         * @return {Requisition}               requisition with methods
         */
        function Requisition(source, statusMessages) {
            var requisition = this;

            Object.assign(this, source);

            this.template = new RequisitionTemplate(this.template, this);
            this.$statusMessages = $filter('orderBy')(statusMessages, '-createdDate');

            this.requisitionLineItems = [];
            source.requisitionLineItems.forEach(function(lineItem) {
                requisition.requisitionLineItems.push(new LineItem(lineItem, requisition));
            });

            this.$isEditable = isEditable(this);

            if (!this.idempotencyKey) {
                generateIdempotencyKey(this);
            }
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name authorize
         *
         * @description
         * Authorizes requisition.
         *
         * @return {Promise} requisition promise
         */
        function authorize() {
            var requisition = this;
            return handlePromise(resource.authorize({
                id: requisition.id,
                idempotencyKey: this.idempotencyKey
            }, {}).$promise, function(authorized) {
                updateRequisition(requisition, authorized);
            }, function(data) {
                handleFailure(data, requisition);
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name remove
         *
         * @description
         * Removes requisition.
         *
         * @return {Promise} promise that resolves after requisition is deleted
         */
        function remove() {
            var requisition = this;
            return handlePromise(resource.remove({
                id: requisition.id,
                idempotencyKey: requisition.idempotencyKey
            }).$promise, function() {
                offlineRequisitions.removeBy('id', requisition.id);
            }, function(data) {
                handleFailure(data, requisition);
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name unskipRequisitionWhenApproving
         *
         * @description
         * allows user to unskip skipped requisition items when approving.
         *
         * @return {Promise} promise
         */
        function unskipRequisitionWhenApproving() {
            return handlePromise(resource.unskipRequisitionWhenApproving({}).$promise,
                function() {
                }, function(error) {
                    handleFailure(error, {});
                });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name save
         *
         * @description
         * Saves requisition.
         *
         * @return {Promise} requisition promise
         */
        function save() {
            var availableOffline = this.$availableOffline,
                id = this.id;
            return handlePromise(resource.save({
                id: this.id
            }, this).$promise, function(saved) {
                saveToStorage(saved, availableOffline);
            }, function(saved) {
                if (saved.status === 409 || saved.status === 403) {
                    // in case of conflict or unauthorized, remove requisition from storage
                    offlineRequisitions.removeBy('id', id);
                }
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name submit
         *
         * @description
         * Submits requisition.
         *
         * @return {Promise} requisition promise
         */
        function submit() {
            var requisition = this;
            return handlePromise(resource.submit({
                id: requisition.id,
                idempotencyKey: requisition.idempotencyKey
            }, {}).$promise, function(submitted) {
                updateRequisition(requisition, submitted);
            }, function(data) {
                handleFailure(data, requisition);
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name approve
         *
         * @description
         * Approves requisition.
         *
         * @return {Promise} promise that resolves when requisition is approved
         */
        function approve() {
            var requisition = this;
            return handlePromise(resource.approve({
                id: requisition.id,
                idempotencyKey: requisition.idempotencyKey
            }, {}).$promise, function(approved) {
                updateRequisition(requisition, approved);
            }, function(data) {
                handleFailure(data, requisition);
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name reject
         *
         * @description
         * Rejects requisition.
         *
         * @return {Promise} promise that resolves when requisition is rejected
         */
        function reject(rejectionReasons) {
            var requisition = this;
            return handlePromise(resource.reject({
                id: requisition.id,
                idempotencyKey: requisition.idempotencyKey
            }, rejectionReasons).$promise, function(rejected) {
                updateRequisition(requisition, rejected);
            }, function(data) {
                handleFailure(data, requisition);
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name skip
         *
         * @description
         * Skips requisition.
         *
         * @return {Promise} promise that resolves when requisition is skipped
         */
        function skip() {
            var requisition = this;
            return handlePromise(resource.skip({
                id: requisition.id,
                idempotencyKey: requisition.idempotencyKey
            }, {}).$promise, function(requisition) {
                offlineRequisitions.removeBy('id', requisition.id);
            }, function(data) {
                handleFailure(data, requisition);
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name isInitiated
         *
         * @description
         * Responsible for checking if requisition is initiated.
         * Returns true only if requisition status equals initiated.
         *
         * @return {Boolean} is requisition initiated
         */
        function isInitiated() {
            return this.status === REQUISITION_STATUS.INITIATED;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name isSubmitted
         *
         * @description
         * Responsible for checking if requisition is submitted.
         * Returns true only if requisition status equals submitted.
         *
         * @return {Boolean} is requisition submitted
         */
        function isSubmitted() {
            return this.status === REQUISITION_STATUS.SUBMITTED;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name isAuthorized
         *
         * @description
         * Responsible for checking if requisition is authorized.
         * Returns true only if requisition status equals authorized.
         *
         * @return {Boolean} is requisition authorized
         */
        function isAuthorized() {
            return this.status === REQUISITION_STATUS.AUTHORIZED;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name isApproved
         *
         * @description
         * Responsible for checking if requisition is approved.
         * Returns true only if requisition status equals approved.
         *
         * @return {Boolean} is requisition approved
         */
        function isApproved() {
            return this.status === REQUISITION_STATUS.APPROVED;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name isInApproval
         *
         * @description
         * Responsible for checking if requisition is in approval.
         * Returns true only if requisition status equals in approval.
         *
         * @return {Boolean} is requisition in approval
         */
        function isInApproval() {
            return this.status === REQUISITION_STATUS.IN_APPROVAL;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name isReleased
         *
         * @description
         * Responsible for checking if requisition is released.
         * Returns true only if requisition status equals released.
         *
         * @return {Boolean} is requisition released
         */
        function isReleased() {
            return this.status === REQUISITION_STATUS.RELEASED;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name isRejected
         *
         * @description
         * Responsible for checking if requisition is rejected.
         * Returns true only if requisition status equals rejected.
         *
         * @return {Boolean} is requisition rejected
         */
        function isRejected() {
            return this.status === REQUISITION_STATUS.REJECTED;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name isSkipped
         *
         * @description
         * Responsible for checking if requisition is skipped.
         * Returns true only if requisition status equals skipped.
         *
         * @return {Boolean} is requisition skipped
         */
        function isSkipped() {
            return this.status === REQUISITION_STATUS.SKIPPED;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name isAfterAuthorize
         *
         * @description
         * Checks if this requisition was authorized.
         * Will return true if this requisition has authorized status, or any later status.
         *
         * @return {Boolean} true if this requisition's status is an after authorize status
         */
        function isAfterAuthorize() {
            return [REQUISITION_STATUS.AUTHORIZED, REQUISITION_STATUS.IN_APPROVAL,
                REQUISITION_STATUS.APPROVED, REQUISITION_STATUS.RELEASED].indexOf(this.status) !== -1;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name isEditable
         *
         * @description
         * Checks if this requisition is editable based on its status and user rights.
         *
         * @return {boolean} true if this requisition is editable, false otherwise
         */
        function isEditable(requisition) {
            return canSubmit(requisition)
                || canAuthorize(requisition)
                || canApprove(requisition)
                || canDelete(requisition);
        }

        function canSubmit(requisition) {
            return hasRight(REQUISITION_RIGHTS.REQUISITION_CREATE, requisition)
                && (requisition.$isInitiated() || requisition.$isRejected());
        }

        function canAuthorize(requisition) {
            return hasRight(REQUISITION_RIGHTS.REQUISITION_AUTHORIZE, requisition)
                && (requisition.$isInitiated() || requisition.$isRejected() || requisition.$isSubmitted());
        }

        function canApprove(requisition) {
            return hasRight(REQUISITION_RIGHTS.REQUISITION_APPROVE, requisition)
                && (requisition.$isAuthorized() || requisition.$isInApproval());
        }

        function canDelete(requisition) {
            return hasRight(REQUISITION_RIGHTS.REQUISITION_DELETE, requisition)
                && hasRight(REQUISITION_RIGHTS.REQUISITION_AUTHORIZE, requisition)
                && requisition.$isSubmitted();
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name getAvailableNonFullSupplyProducts
         *
         * @description
         * Returns a list of available non full supply products that does not have a line item
         * added.
         *
         * @return  {Array} the array of available non full supply line items
         */
        function getAvailableNonFullSupplyProducts() {
            return filterOutOrderablesWithLineItems(
                this.availableNonFullSupplyProducts,
                this.requisitionLineItems
            );
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name getAvailableFullSupplyProducts
         *
         * @description
         * Returns a list of available full supply products that does not have a line item added.
         *
         * @return  {Array} the array of available full supply line items
         */
        function getAvailableFullSupplyProducts() {
            return filterOutOrderablesWithLineItems(
                this.availableFullSupplyProducts,
                this.requisitionLineItems
            );
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name getSkippedFullSupplyProducts
         *
         * @description
         * Returns a list of skipped full supply products that does not have a line item added.
         *
         * @return  {Array} the array of skipped full supply products
         */
        function getSkippedFullSupplyProducts() {
            return this.requisitionLineItems
                .filter(function(requisitionLineItem) {
                    return requisitionLineItem.$program.fullSupply && requisitionLineItem.skipped;
                })
                .map(function(lineItem) {
                    return lineItem.orderable;
                });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name addLineItem
         *
         * @description
         * Creates a new line item based on the given orderable, requested quantity and explanation.
         * If requisition status does not allow for adding line items an exception will be thrown.
         * If a line item for the given orderable exists an exception will be thrown.
         * If the given orderable is not on the list of available non full supply products an
         * exception will be thrown.
         *
         * @param   {Object}    orderable                       the orderable
         * @param   {integer}   requestedQuantity               the requested quantity
         * @param   {string}    requestedQuantityExplanation    the explanation
         */
        function addLineItem(orderable, requestedQuantity, requestedQuantityExplanation) {
            var orderableProgram = getOrderableProgramById(orderable.programs, this.program.id);

            this.requisitionLineItems.push(new LineItem({
                orderable: orderable,
                requestedQuantity: requestedQuantity,
                requestedQuantityExplanation: requestedQuantityExplanation,
                pricePerPack: orderableProgram.pricePerPack,
                $deletable: true
            }, this));
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name addLineItems
         *
         * @description
         * Creates new line items based on the given orderables.
         *
         * @param {Object} orderable  the orderables
         */
        function addLineItems(orderables) {
            var requisition = this;
            orderables.forEach(function(orderable) {
                requisition.addLineItem(orderable);
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name deleteLineItem
         *
         * @description
         * Removes the given line item from the requisition.
         * If requisition status does not allow for removing line items an exception will be thrown.
         * If line item is not part of the requisition an exception will be thrown.
         * If line item is full supply an exception will be thrown.
         *
         * @param   {LineItem}  lineItem    the line item to be deleted
         */
        function deleteLineItem(lineItem) {
            var lineItemIndex = this.requisitionLineItems.indexOf(lineItem);
            this.requisitionLineItems.splice(lineItemIndex, 1);
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name getProducts
         *
         * @description
         * Returns a list of products.
         *
         * @param   {Boolean} nonFullSupply the flag defining wether full supply or non full supply
         *                                  products should be returned
         * @return  {List}                  the list of products
         */
        function getProducts(nonFullSupply) {
            return $filter('filter')(this.requisitionLineItems, {
                $program: {
                    fullSupply: !nonFullSupply
                }
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name skipAllFullSupplyLineItems
         *
         * @description
         * Skips all full supply line items.
         */
        function skipAllFullSupplyLineItems() {
            var requisition = this,
                fullSupplyLineItems = getFullSupplyLineItems(this.requisitionLineItems);

            fullSupplyLineItems.forEach(function(lineItem) {
                if (lineItem.canBeSkipped(requisition)) {
                    lineItem.skipped = true;
                }
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name skipAllFullSupplyLineItems
         *
         * @description
         * Unskips all full supply line items.
         */
        function unskipAllFullSupplyLineItems() {
            getFullSupplyLineItems(this.requisitionLineItems).forEach(function(lineItem) {
                lineItem.skipped = false;
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name unskipFullSupplyProducts
         *
         * @description
         * Unskip line items for the passed full supply products.
         */
        function unskipFullSupplyProducts(products) {
            var productIds = products.map(function(product) {
                return product.id;
            });

            this.requisitionLineItems
                .filter(function(lineItem) {
                    return productIds.indexOf(lineItem.orderable.id) > -1;
                })
                .forEach(function(lineItem) {
                    lineItem.skipped = false;
                });
        }

        function getFullSupplyLineItems(lineItems) {
            return lineItems.filter(function(lineItem) {
                return lineItem.$program.fullSupply;
            });
        }

        function getOrderableProgramById(programs, programId) {
            return programs.filter(function(program) {
                return program.programId === programId;
            })[0];
        }

        function filterOutOrderablesWithLineItems(orderables, lineItems) {
            return orderables.filter(function(orderable) {
                var orderableLineItems = lineItems.filter(function(lineItem) {
                    return lineItem.orderable.id === orderable.id;
                });

                return orderableLineItems.length === 0;
            });
        }

        function handlePromise(promise, success, failure) {
            var deferred = $q.defer();

            promise
                .then(function(response) {
                    if (success) {
                        success(response);
                    }
                    deferred.resolve(response);
                })
                .catch(function(response) {
                    if (failure) {
                        failure(response);
                    }
                    deferred.reject(response);
                });

            return deferred.promise;
        }

        function updateRequisition(requisition, updated) {
            var availableOffline = requisition.$availableOffline;

            requisition.modifiedDate = updated.modifiedDate;
            requisition.status = updated.status;
            requisition.statusChanges = updated.statusChanges;

            if (requisition.$isAuthorized()) {
                populateApprovedQuantity(requisition);
            }

            generateIdempotencyKey(requisition);

            saveToStorage(requisition, availableOffline);
        }

        function saveToStorage(requisition, shouldSave) {
            if (shouldSave) {
                requisition.$modified = false;
                requisition.$availableOffline = true;
                requisitionCacheService.cacheRequisition(requisition);
            }
        }

        function populateApprovedQuantity(requisition) {
            if (requisition.template.getColumn(TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY).isDisplayed) {
                angular.forEach(requisition.requisitionLineItems, function(lineItem) {
                    if (!(lineItem.skipped)) {
                        if (lineItem.requestedQuantity === null) {
                            lineItem.approvedQuantity = lineItem.calculatedOrderQuantity;
                        } else {
                            lineItem.approvedQuantity = lineItem.requestedQuantity;
                        }
                    }
                });
            } else {
                angular.forEach(requisition.requisitionLineItems, function(lineItem) {
                    if (!(lineItem.skipped)) {
                        lineItem.approvedQuantity = lineItem.requestedQuantity;
                    }
                });
            }
        }

        function transformRequisition(requisition) {
            var columns = requisition.template.columnsMap,
                requestBody = angular.copy(requisition);

            angular.forEach(requestBody.requisitionLineItems, function(lineItem) {
                transformLineItem(lineItem, columns);
                delete lineItem.$program;
                delete lineItem.$errors;

                lineItem.orderable = {
                    id: lineItem.orderable.id,
                    versionNumber: lineItem.orderable.meta.versionNumber
                };
            });

            requestBody.processingPeriod.startDate = dateUtils.toStringDate(
                requestBody.processingPeriod.startDate
            );
            requestBody.processingPeriod.endDate = dateUtils.toStringDate(
                requestBody.processingPeriod.endDate
            );

            requestBody.program = {
                id: requestBody.program.id
            };

            requestBody.facility = {
                id: requestBody.facility.id
            };

            delete requestBody.availableNonFullSupplyProducts;
            delete requestBody.availableFullSupplyProducts;
            delete requestBody.availableProducts;
            delete requestBody.stockAdjustmentReasons;
            delete requestBody.template;

            return angular.toJson(requestBody);
        }

        function getETag(config) {
            return config.data.eTag;
        }

        function getIdempotencyKey(config) {
            var key = config.params.idempotencyKey;
            if (key) {
                delete config.params.idempotencyKey;
                return key;
            }
        }

        function handleFailure(data, requisition) {
            if (data.status !== 409) {
                generateIdempotencyKey(requisition);
            }
        }

        function transformLineItem(lineItem, columns) {
            angular.forEach(columns, function(column) {
                // TZUP-598 START HERE
                if (column.name === 'numberOfPatientsOnTreatmentNextMonth') {
                    return lineItem[column.name];
                    // TZUP-598 END HERE
                } else if (!column.$display || column.source === COLUMN_SOURCES.CALCULATED) {
                    lineItem[column.name] = null;
                }
            });
        }

        function hasRight(right, requisition) {
            return authorizationService.hasRight(right, {
                programId: requisition.program.id,
                facilityId: requisition.facility.id
            });
        }

        function generateIdempotencyKey(requisition) {
            var newId = new UuidGenerator().generate();
            requisition.idempotencyKey = newId;
        }
    }

})();
