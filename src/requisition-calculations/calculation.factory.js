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
     * @name requisition-calculations.calculationFactory
     *
     * @description
     * Responsible for storing all the calculations related with the line item and product grid.
     */
    angular
        .module('requisition-calculations')
        .factory('calculationFactory', factory);

    factory.$inject = [
        'TEMPLATE_COLUMNS',
        'COLUMN_SOURCES',
        'ORDERABLE_CODES',
        'PATIENT_TYPES',
        'TB_STORAGE',
        'LEPROSY_STORAGE',
        'NOT_AVAILABLE',
        '$filter',
        'stockReasonsCalculations',
        'localStorageFactory'
    ];

    function factory(
        TEMPLATE_COLUMNS,
        COLUMN_SOURCES,
        ORDERABLE_CODES,
        PATIENT_TYPES,
        TB_STORAGE,
        LEPROSY_STORAGE,
        NOT_AVAILABLE,
        $filter,
        stockReasonsCalculations,
        localStorageFactory
    ) {
        var A = TEMPLATE_COLUMNS.BEGINNING_BALANCE,
            B = TEMPLATE_COLUMNS.TOTAL_RECEIVED_QUANTITY,
            C = TEMPLATE_COLUMNS.TOTAL_CONSUMED_QUANTITY,
            D = TEMPLATE_COLUMNS.TOTAL_LOSSES_AND_ADJUSTMENTS,
            E = TEMPLATE_COLUMNS.STOCK_ON_HAND,
            F = TEMPLATE_COLUMNS.NEXT_OF_PATIENTS_ON_TREATMENT_NEXT_MONTH,
            G = TEMPLATE_COLUMNS.IDEAL_STOCK_AMOUNT,
            H = TEMPLATE_COLUMNS.MAXIMUM_STOCK_QUANTITY,
            I = TEMPLATE_COLUMNS.PROGRAM_ORDERABLES_DOSES_PER_PATIENT,
            J = TEMPLATE_COLUMNS.REQUESTED_QUANTITY,
            K = TEMPLATE_COLUMNS.APPROVED_QUANTITY,
            L = TEMPLATE_COLUMNS.TOTAL_REQUIREMENT,
            M = TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY,
            O = TEMPLATE_COLUMNS.TOTAL_QUANTITY_NEEDED_BY_HF,
            P = TEMPLATE_COLUMNS.AVERAGE_CONSUMPTION,
            R = TEMPLATE_COLUMNS.QUANTITY_TO_ISSUE,
            S = TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY_ISA,
            T = TEMPLATE_COLUMNS.PRICE_PER_PACK,
            Z = TEMPLATE_COLUMNS.ADDITIONAL_QUANTITY_REQUIRED;

        var calculationFactory = {
            calculatedOrderQuantity: calculateOrderQuantity,
            totalConsumedQuantity: calculateTotalConsumedQuantity,
            numberOfPatientsOnTreatmentNextMonth: calculateNextMonthPatient,
            dosesPerPatient: calculateIndividualMonthlyRequirement,
            totalRequirement: calculateTotalRequirement,
            totalQuantityNeededByHf: calculateTotalQuantityNeededByHf,
            quantityToIssue: calculateQuantityToIssue,
            convertedQuantityToIssue: calculateQuantityToIssueToUnit,
            stockOnHand: calculateStockOnHand,
            totalLossesAndAdjustments: calculateTotalLossesAndAdjustments,
            packsToShip: calculatePacksToShip,
            totalCost: calculateTotalCost,
            adjustedConsumption: calculateAdjustedConsumption,
            maximumStockQuantity: calculateMaximumStockQuantity,
            averageConsumption: calculateAverageConsumption,
            calculatedOrderQuantityIsa: calculatedOrderQuantityIsa,
            getOrderQuantity: getOrderQuantity
        };
        return calculationFactory;

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name numberOfPatientsOnTreatmentNextMonth
         *
         * @description
         * Calculates the value of the Next Month Patient column.
         *
         * @param  {Object} lineItem the line item to calculate the value from
         * @return {Number}          the calculated Next Month Patient value
         */
        // eslint-disable-next-line complexity
        function calculateNextMonthPatient(lineItem, requisition) {
            var patientsData = null;

            if (typeof requisition.patientsData !== 'undefined') {
                patientsData = JSON.parse(requisition.patientsData);
            }

            var calculatedNextMonthPatient = calculateWithProperCalcFormula(lineItem, patientsData);
            var nextMonthPatientEditedOnApprovalStage =
                lineItem[TEMPLATE_COLUMNS.NEXT_OF_PATIENTS_ON_TREATMENT_NEXT_MONTH];

            if (requisition.status === 'AUTHORIZED' || requisition.status === 'IN_APPROVAL'
                || requisition.status === 'APPROVED') {
                if (calculatedNextMonthPatient === 0 && nextMonthPatientEditedOnApprovalStage === undefined) {
                    return calculatedNextMonthPatient;
                } else if (calculatedNextMonthPatient !== nextMonthPatientEditedOnApprovalStage &&
                    nextMonthPatientEditedOnApprovalStage !== undefined) {
                    return nextMonthPatientEditedOnApprovalStage;
                }
            }

            if (requisition.status !== 'AUTHORIZED' && requisition.status !== 'IN_APPROVAL'
                && requisition.status !== 'APPROVED') {
                return calculatedNextMonthPatient;
            }

            return calculatedNextMonthPatient;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name dosesPerPatient
         *
         * @description
         * Calculates the value of the Individual Monthly Requirement column.
         *
         * @param  {Object} lineItem the line item to calculate the value from
         * @return {Number}          the calculated Individual Monthly Requirement value
         */
        function calculateIndividualMonthlyRequirement(lineItem) {
            var currentLineItemProgram = getItem(lineItem, '$program');
            var dosesPerPatient = 0;
            if (currentLineItemProgram) {
                dosesPerPatient = currentLineItemProgram.dosesPerPatient;
            }
            return dosesPerPatient;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name totalRequirement
         *
         * @description
         * Calculates the value of the Total Requirement column.
         *
         * @param  {Object} lineItem the line item to calculate the value from
         * @param  {Object} requisition the requisition
         * @return {Number}          the calculated Total Requirement value
         */
        function calculateTotalRequirement(lineItem, requisition) {
            var dosesProvided = checkIfDosesProvided(lineItem, requisition);

            if (!dosesProvided) {
                return NOT_AVAILABLE;
            }

            var eColumn = requisition.template.getColumn(E);
            var numberOfStockOnHand = getColumnValue(lineItem, requisition, eColumn);
            if (numberOfStockOnHand === null || numberOfStockOnHand === undefined) {
                return 0;
            }

            var fColumn = requisition.template.getColumn(F);
            var iColumn = requisition.template.getColumn(I);

            var numberOfPatient = getColumnValue(lineItem, requisition, fColumn);
            var individualMonthlyReq = getColumnValue(lineItem, requisition, iColumn);

            return numberOfPatient * individualMonthlyReq;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name totalQuantityNeededByHf
         *
         * @description
         * Calculates the value of the Total Quantity Needed by HF column.
         *
         * @param  {Object} lineItem the line item to calculate the value from
         * @param  {Object} requisition the requisition
         * @return {Number}          the calculated Total Quantity Needed by HF value
         */
        function calculateTotalQuantityNeededByHf(lineItem, requisition) {
            var dosesProvided = checkIfDosesProvided(lineItem, requisition);

            if (!dosesProvided) {
                return NOT_AVAILABLE;
            }

            var eColumn = requisition.template.getColumn(E);
            var numberOfStockOnHand = getColumnValue(lineItem, requisition, eColumn);
            if (numberOfStockOnHand === null || numberOfStockOnHand === undefined) {
                return 0;
            }

            var lColumn = requisition.template.getColumn(L);

            var totalQuantityNeededByHf = getColumnValue(lineItem, requisition, lColumn);

            return 2 * totalQuantityNeededByHf;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name quantityToIssue
         *
         * @description
         * Calculates the value of the Quantity to Issue column.
         *
         * @param  {Object} lineItem the line item to calculate the value from
         * @param  {Object} requisition the requisition
         * @return {Number}          the calculated Quantity to Issue value
         */
        function calculateQuantityToIssue(lineItem, requisition) {
            var dosesProvided = checkIfDosesProvided(lineItem, requisition);

            if (!dosesProvided) {
                return NOT_AVAILABLE;
            }

            var oColumn = requisition.template.getColumn(O);
            var eColumn = requisition.template.getColumn(E);

            var totalNeededByHF = getColumnValue(lineItem, requisition, oColumn);
            var stockOnHand = getColumnValue(lineItem, requisition, eColumn);

            if (!isFilled(stockOnHand)) {
                stockOnHand = 0;
            }

            var calculatedQuantityToIssue = totalNeededByHF - stockOnHand;

            if (!calculatedQuantityToIssue || calculatedQuantityToIssue < 0) {
                return 0;
            }

            return calculatedQuantityToIssue;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name total
         *
         * @description
         * Calculates the value of the Total column based on the given line item.
         *
         * @param  {Object} lineItem the line item to calculate the value from
         * @return {Number}          the calculated Total value
         */
        function calculateQuantityToIssueToUnit(lineItem, requisition) {
            var dosesProvided = checkIfDosesProvided(lineItem, requisition);

            if (!dosesProvided) {
                return NOT_AVAILABLE;
            }

            var quantityToIssue = getItem(lineItem, R);
            var packSize = lineItem.orderable.netContent;

            if (!quantityToIssue || !packSize) {
                return 0;
            }

            return Math.floor(quantityToIssue / parseIntWithBaseTen(packSize));
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name totalConsumedQuantity
         *
         * @description
         * Calculates the value of the Total Consumed Quantity column based on the given line item.
         *
         * @param  {Object} lineItem the line item to calculate the value from
         * @return {Number}          the calculated Total Consumed Quantity value
         */
        function calculateTotalConsumedQuantity(lineItem) {
            return getItem(lineItem, A) + getItem(lineItem, B) + getItem(lineItem, D) - getItem(lineItem, E);
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name stockOnHand
         *
         * @description
         * Calculates the value of the Stock On Hand column based on the given line item.
         *
         * @param  {Object} lineItem the line item to calculate the value from
         * @return {Number}          the calculated Stock On Hand value
         */
        function calculateStockOnHand(lineItem) {
            return getItem(lineItem, A) + getItem(lineItem, B) - getItem(lineItem, C) + getItem(lineItem, D);
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name totalLossesAndAdjustments
         *
         * @description
         * Calculates the value of the Total Losses and Adjustments column based on the
         * given line item and adjustment reasons.
         *
         * @param  {Array}  adjustments     the list of adjustments to sum up
         * @param  {Array}  reasons         the list of stock adjustment reasons
         * @return {Number}                 the calculated Total Losses and Adjustments value
         */
        function calculateTotalLossesAndAdjustments(adjustments, reasons) {
            var adjustmentsForCalculations = angular.copy(adjustments);

            angular.forEach(adjustmentsForCalculations, function(adjustment) {
                var filteredReasons = $filter('filter')(reasons, {
                    id: adjustment.reasonId
                }, true);
                adjustment.reason = (filteredReasons) ? filteredReasons[0] : null;
            });

            return stockReasonsCalculations.calculateTotal(adjustmentsForCalculations);
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name packsToShip
         *
         * @description
         * Calculates the value of the Packs to Ship column based on the given line item and requisition status.
         *
         * @param  {Object} lineItem    the line item to calculate the value from
         * @param  {Object} requisition the requisition
         * @return {Number}             the calculated Packs to Ship value
         */
        function calculatePacksToShip(lineItem, requisition) {
            var orderQuantity = getOrderQuantity(lineItem, requisition),
                netContent = lineItem.orderable.netContent;

            if (!orderQuantity || !netContent) {
                return 0;
            }
            var remainderQuantity = orderQuantity % netContent,
                packsToShip = (orderQuantity - remainderQuantity) / netContent;

            if (remainderQuantity > 0 && remainderQuantity > lineItem.orderable.packRoundingThreshold) {
                packsToShip += 1;
            }

            if (packsToShip === 0 && !lineItem.orderable.roundToZero) {
                packsToShip = 1;
            }

            return packsToShip;

        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name calculateTotalCost
         *
         * @description
         * Calculates the total cost by multiplying price per pack and packs to ship.
         *
         * @param  {Object} lineItem the line item to get the values from
         * @param  {Object} requisition the requisition
         * @return {Number}          the total cost of this line item
         */
        function calculateTotalCost(lineItem, requisition) {
            var packsToShip = this.packsToShip(lineItem, requisition);
            var pricePerPack = lineItem.$program ? lineItem.$program[T] :
                getPricePerPackForV1Endpoints(lineItem.id, requisition);
            if (pricePerPack === undefined) {
                pricePerPack = 0;
            }

            return pricePerPack * packsToShip;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name adjustedConsumption
         *
         * @description
         * Calculates the value of the Adjusted Consumption column based on the given line item. If
         * consumed quantity is calculated, the calculated value will be used.
         *
         * @param  {Object} lineItem    the line item to calculate the value from
         * @param  {Object} requisition the requisition with required period
         * @return {Number}             the calculated Adjusted Consumption value
         */
        function calculateAdjustedConsumption(lineItem, requisition) {
            var cColumn = requisition.template.getColumn(C),
                aColumn = requisition.template.getColumn(Z),
                consumedQuantity = getColumnValue(lineItem, requisition, cColumn);

            if (consumedQuantity === undefined) {
                return 0;
            }

            var totalDays = 30 * requisition.processingPeriod.durationInMonths;
            var stockoutDays = lineItem.totalStockoutDays === undefined ? 0 : lineItem.totalStockoutDays;
            var nonStockoutDays = totalDays - stockoutDays;
            if (nonStockoutDays === 0) {
                return consumedQuantity;
            }

            var adjustedConsumption = Math.ceil(consumedQuantity * (totalDays / nonStockoutDays)),
                additionalQuantityRequired;
            if (aColumn && aColumn.isDisplayed) {
                additionalQuantityRequired = getColumnValue(lineItem, requisition, aColumn);
            }
            if (additionalQuantityRequired) {
                adjustedConsumption = adjustedConsumption + additionalQuantityRequired;
            }
            return adjustedConsumption;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name averageConsumption
         *
         * @description
         * Calculates the value of the Average Consumption column based on the given line item.
         *
         * @param  {Object} lineItem    the line item to calculate the value from
         * @param  {Object} requisition the requisition with required period
         * @return {Number}             the calculated Average Consumption value
         */
        function calculateAverageConsumption(lineItem, requisition) {
            var adjustedConsumptions = angular.copy(lineItem.previousAdjustedConsumptions);
            adjustedConsumptions.push(calculateAdjustedConsumption(lineItem, requisition));

            var numberOfPeriods = adjustedConsumptions.length;

            //if there is no previous adjusted consumption
            if (numberOfPeriods === 1) {
                return adjustedConsumptions[0];
                //if there is only one previous adjusted consumption
            } else if (numberOfPeriods === 2) {
                return Math.ceil((adjustedConsumptions[0] + adjustedConsumptions[1]) / 2);
            }
            //if more than one previous adjusted consumption

            var sum = 0;
            adjustedConsumptions.forEach(function(adjustedConsumption) {
                sum += adjustedConsumption;
            });
            return Math.ceil(sum / numberOfPeriods);

        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name getOrderQuantity
         * @private
         *
         * @description
         * Returns the value of the order quantity based on the requisition status.
         *
         * @param  {Object} lineItem    the line item to get the order quantity from
         * @param  {String} requisition the requisition with required status
         * @return {Number}             the value of the order quantity
         */
        function getOrderQuantity(lineItem, requisition) {
            var orderQuantity = null;

            if (requisition.$isAfterAuthorize()) {
                orderQuantity = lineItem[K];
            } else {
                var jColumn = requisition.template.getColumn(J),
                    mColumn = requisition.template.getColumn(M),
                    sColumn = requisition.template.getColumn(S);

                if (shouldReturnRequestedQuantity(lineItem, jColumn, requisition)) {
                    orderQuantity = lineItem[J];
                } else if (mColumn && mColumn.isDisplayed) {
                    orderQuantity = calculateOrderQuantity(lineItem, requisition);
                } else if (sColumn) {
                    orderQuantity = calculatedOrderQuantityIsa(lineItem, requisition);
                }
            }

            return orderQuantity;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name maximumStockQuantity
         *
         * @description
         * Calculates the value of the Maximum Stock Quantity column based on the given line item.
         *
         * @param  {Object} lineItem    the line item to get the order quantity from
         * @param  {String} requisition the requisition with template
         * @return {Number}             the calculated Maximum Stock Quantity value
         */
        function calculateMaximumStockQuantity(lineItem, requisition) {
            var hColumn = requisition.template.getColumn(H),
                pColumn = requisition.template.getColumn(P),
                pValue;

            if (pColumn) {
                pValue = getColumnValue(lineItem, requisition, pColumn);
                pValue = pValue === undefined ? 0 : pValue;
            }
            /*
            * This formula has changed based on Tanzania specific requirements
            * instead of maxPeriodsOfStock changed to minPeriodsOfStock.
            *
            */
            return hColumn && hColumn.option.optionName === 'default' ?
                Math.round(pValue * lineItem.approvedProduct.minPeriodsOfStock) : 0;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name calculatedOrderQuantity
         *
         * @description
         * Calculates the value of the Calculated Order Quantity column.
         *
         * @param  {Object} lineItem    the line item to calculate the value for
         * @param  {Object} requisition the requisition used with calculation
         * @return {Number}             the calculated order quantity
         */
        function calculateOrderQuantity(lineItem, requisition) {
            var eColumn = requisition.template.getColumn(E),
                hColumn = requisition.template.getColumn(H);

            if (!eColumn || !hColumn) {
                return null;
            }

            var stockOnHand = getColumnValue(lineItem, requisition, eColumn),
                maximumStockQuantity = getColumnValue(lineItem, requisition, hColumn);

            stockOnHand = stockOnHand === undefined ? 0 : stockOnHand;

            return Math.max(maximumStockQuantity - stockOnHand, 0);
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name calculatedOrderQuantityIsa
         *
         * @description
         * Calculates the value of the Calculated Order Quantity ISA column.
         *
         * @param  {Object} lineItem    the line item to calculate the value for
         * @param  {Object} requisition the requisition used with calculation
         * @return {Number}             the calculated order quantity
         */
        function calculatedOrderQuantityIsa(lineItem, requisition) {
            var eColumn = requisition.template.getColumn(E),
                gColumn = requisition.template.getColumn(G);

            if (!gColumn) {
                return null;
            }

            var isa = getColumnValue(lineItem, requisition, gColumn),
                stockOnHand = getColumnValue(lineItem, requisition, eColumn);

            if (!isa && isa !== 0) {
                return null;
            }

            stockOnHand = stockOnHand === undefined ? 0 : stockOnHand;

            return Math.max(0, isa - stockOnHand);
        }

        function getColumnValue(lineItem, requisition, column) {

            if (column.source === COLUMN_SOURCES.CALCULATED) {
                return calculationFactory[column.name](lineItem, requisition);
            }

            return lineItem[column.name];
        }

        function getItem(lineItem, name) {
            return lineItem[name] === undefined ? 0 : lineItem[name];
        }

        function shouldReturnRequestedQuantity(lineItem, jColumn, requisition) {
            return lineItem.isNonFullSupply() ||
                (isDisplayed(jColumn) && isFilled(lineItem[J])) ||
                requisition.emergency;
        }

        function isFilled(value) {
            //We want to treat 0 as a valid value thus not using return value
            return value !== null && value !== undefined;
        }

        function isDisplayed(column) {
            return column && column.$display;
        }

        function getPricePerPackForV1Endpoints(lineItemId, requisition) {
            var pricePerPack;
            requisition.requisitionLineItems.forEach(function(lineItem) {
                if (lineItem.id === lineItemId) {
                    pricePerPack = lineItem.pricePerPack;
                }
            });
            return pricePerPack;
        }

        function parseIntWithBaseTen(number) {
            return parseInt(number, 10);
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name parseIntOrDefault
         *
         * @description
         * Parses an input value as an integer and returns the parsed value or a default value if NaN.
         * @param {any} value - The value to parse as an integer.
         * @return {Number} - The parsed integer value or the default value.
         **/
        function parseIntOrDefault(value) {
            // The default value to return if NaN
            var defaultValue = 0;
            var parsedValue = parseInt(value);
            return isNaN(parsedValue) ? defaultValue : parsedValue;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name findProperPatients
         *
         * @description
         * Finds the specified item in the storage array based on the provided type.
         * @param {Array} storage - The storage to search for the item.
         * @param {String} type - The key to match the item in the array.
         * @return {Object | Boolean} - The found item object if it exists, otherwise false.
         **/
        function findProperPatients(storage, type) {
            if (Array.isArray(storage[0])) {
                return storage[0].find(function(item) {
                    return item.key === type;
                });
            }
            return false;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name checkIfDosesProvided
         *
         * @description
         * Checks if doses are provided for the specified item in the storage array based on the provided type.
         * @param {Object} lineItem - The line item to check for doses.
         * @param {Object} requisition - The requisition object containing template and other information.
         * @return {Boolean} - True if doses are provided, otherwise false.
         **/
        function checkIfDosesProvided(lineItem, requisition) {
            var iColumn = requisition.template.getColumn(I);
            var individualMonthlyReq = getColumnValue(lineItem, requisition, iColumn);

            if (individualMonthlyReq === 0 || !isFilled(individualMonthlyReq)) {
                return false;
            }

            return true;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name calculateNumberOfPatients
         *
         * @description
         * Calculates the total number of patients based on the specified row and indexes.
         * If no row specified, return 0.
         * @param {Array} row - The row or array containing patient data.
         * @param {Array} indexes - The indexes of the patient data to be considered.
         * @return {Number} - The total number of patients calculated from the specified data.
         **/
        function calculateNumberOfPatients(row, indexes) {
            var patients = 0;
            if (!row) {
                return patients;
            }

            indexes.forEach(function(index) {
                patients += parseIntOrDefault(row.data[index].value);
            });
            return patients;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name sumRow
         *
         * @description
         * Calculates the sum of patient data values in the specified row.
         * If no row is specified, it returns 0.
         * @param {Array} row - The row or array containing patient data.
         * @return {Number} - The sum of patient data values.
         **/
        function sumRow(row) {
            if (!row) {
                return 0;
            }

            return row.data.reduce(function(accumulator, currentValue) {
                return accumulator + parseIntOrDefault(currentValue.value);
            }, 0);
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name calculateWithProperCalcFormula
         *
         * @description
         * Calculates the number of patients on treatment next month based on assigned product.
         * If the productCode does not match any predefined cases, the function returns 0.
         * @param {Object} lineItem - The line item to calculate the value for.
         * @return {Number} - The calculated No of Patients on Treatment next month
         **/
        // eslint-disable-next-line complexity
        function calculateWithProperCalcFormula(lineItem, patientsData) {
            var product = getItem(lineItem, 'orderable');

            var storedLeprosyArray, storedTbArray;

            if (typeof patientsData === 'object' && patientsData !== null) {
                storedLeprosyArray = patientsData.leprosyData;
                storedTbArray = patientsData.TBData;
            } else {
                storedLeprosyArray = localStorageFactory(LEPROSY_STORAGE).getAll();
                storedTbArray = localStorageFactory(TB_STORAGE).getAll();
            }

            var numberOfPatients = 0;

            switch (product.productCode) {
                case ORDERABLE_CODES.RIFAMPICIN_INH_RHZE_TABLET_150_75_400_275_MG:
                    var noOfAdultsRHZE = findProperPatients(storedTbArray, PATIENT_TYPES.NUMBER_OF_ADULT_PATIENTS_NEW);
                    numberOfPatients = calculateNumberOfPatients(noOfAdultsRHZE, [0, 1]);

                    return numberOfPatients;
                case ORDERABLE_CODES.RIFAMPICIN_INH_RH_TABLET_150_75_MG_MG:
                    var noOfChildrenRH = findProperPatients(storedTbArray, PATIENT_TYPES.NUMBER_OF_CHILDREN_NEW);
                    numberOfPatients = calculateNumberOfPatients(noOfChildrenRH, [2, 3, 4, 5]);

                    return numberOfPatients;
                case ORDERABLE_CODES.MB_BLISTER_ADULT_TABLET:
                    var numberOfAdultsOnMB = findProperPatients(
                        storedLeprosyArray, PATIENT_TYPES.NUMBER_OF_ADULT_ON_MB_REGIMEN
                    );
                    var numberOfAdultsOnPB = findProperPatients(
                        storedLeprosyArray, PATIENT_TYPES.NUMBER_OF_ADULT_ON_PB_REGIMEN
                    );
                    var firstSixMonthsAdultsOnMB = calculateNumberOfPatients(numberOfAdultsOnMB, [0, 1, 2, 3, 4, 5]);
                    var adultsOnPB = sumRow(numberOfAdultsOnPB);
                    numberOfPatients =  adultsOnPB + firstSixMonthsAdultsOnMB;

                    return numberOfPatients;
                case ORDERABLE_CODES.RIFAMPICIN_INH_PYRAZ_RHZ_TABLET_75_50_150_MG:
                    var noOfChildrenOnIPTPyraz = findProperPatients(storedTbArray, PATIENT_TYPES.NUMBER_OF_CHILDREN_ON_IPT);
                    numberOfPatients = calculateNumberOfPatients(noOfChildrenOnIPTPyraz, [0, 1]);

                    return numberOfPatients;
                case ORDERABLE_CODES.ETHAMBUTOL_TABLET_100_MG:
                    var noOfChildrenOnIPTEthambutol = findProperPatients(
                        storedTbArray, PATIENT_TYPES.NUMBER_OF_CHILDREN_ON_IPT
                    );
                    numberOfPatients = calculateNumberOfPatients(noOfChildrenOnIPTEthambutol, [0, 1]);

                    return numberOfPatients;
                case ORDERABLE_CODES.RIFAMPICIN_INH_RH_TABLET_75_50_MG:
                    var noOfChildrenOnIPTRH = findProperPatients(storedTbArray, PATIENT_TYPES.NUMBER_OF_CHILDREN_ON_IPT);
                    numberOfPatients = calculateNumberOfPatients(noOfChildrenOnIPTRH, [2, 3, 4, 5]);

                    return numberOfPatients;
                case ORDERABLE_CODES.MB_BLISTER_CHILD_TABLET:
                    var numberOfChildrenOnMB = findProperPatients(
                        storedLeprosyArray, PATIENT_TYPES.NUMBER_OF_CHILDREN_ON_MB_REGIMEN
                    );
                    var numberOfChildrenOnPB = findProperPatients(
                        storedLeprosyArray, PATIENT_TYPES.NUMBER_OF_CHILDREN_ON_PB_REGIMEN
                    );
                    var firstSixMonthsChildrenOnMB = calculateNumberOfPatients(
                        numberOfChildrenOnMB, [0, 1, 2, 3, 4, 5]
                    );
                    var childrenOnPB = sumRow(numberOfChildrenOnPB);
                    numberOfPatients = childrenOnPB + firstSixMonthsChildrenOnMB;

                    return numberOfPatients;
                case ORDERABLE_CODES.ISONIAZID_BP_100MG_TABLETS_TABLET_100_MG:
                    var noOfChildrenOnIPT = findProperPatients(storedTbArray, PATIENT_TYPES.NUMBER_OF_CHILDREN_ON_IPT);
                    numberOfPatients = calculateNumberOfPatients(noOfChildrenOnIPT, [0, 1, 2, 3, 4, 5]);

                    return numberOfPatients;
                case ORDERABLE_CODES.ISONIAZID_TABLET_300_MG:
                    var noOfAdultsOnIPT = findProperPatients(storedTbArray, PATIENT_TYPES.NUMBER_OF_ADULTS_ON_IPT);
                    numberOfPatients = calculateNumberOfPatients(noOfAdultsOnIPT, [0, 1, 2, 3, 4, 5]);

                    return numberOfPatients;
                default:
                    return numberOfPatients;
            }
        }
    }
})();
