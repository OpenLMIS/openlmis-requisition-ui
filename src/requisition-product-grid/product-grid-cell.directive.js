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
     * @ngdoc directive
     * @restrict A
     * @name requisition-product-grid.productGridCell
     *
     * @description
     * Responsible for rendering the product grid cell based on the column source and requisitions type.
     * It also keeps track of the validation as well as changes made to the related cells.
     *
     * @example
     * Here we extend our product grid cell with the directive.
     * ```
     * <td ng-repeat="column in visibleColumns | orderBy : 'displayOrder'" product-grid-cell></td>
     * ```
     */
    angular
        .module('requisition-product-grid')
        .directive('productGridCell', productGridCell);

    productGridCell.$inject = [
        '$templateRequest', '$compile', 'requisitionValidator', 'TEMPLATE_COLUMNS', 'COLUMN_TYPES', 'COLUMN_SOURCES',
        'TB_MONTHLY_PROGRAM'
    ];

    function productGridCell($templateRequest, $compile, requisitionValidator, TEMPLATE_COLUMNS, COLUMN_TYPES,
                             COLUMN_SOURCES, TB_MONTHLY_PROGRAM) {
        return {
            restrict: 'A',
            link: link,
            scope: {
                requisition: '=',
                column: '=',
                lineItem: '=',
                userCanEdit: '=',
                canApprove: '=',
                program: '='
            }
        };

        function link(scope, element) {
            var requisition = scope.requisition,
                column = scope.column,
                lineItem = scope.lineItem,
                program = scope.program;

            scope.lineItem = lineItem;
            scope.column = column;
            scope.validate = validate;
            scope.update = update;
            scope.isReadOnly = isReadOnly(requisition, column);
            scope.canSkip = canSkip;
            scope.showInDoses = showInDoses;

            if (!scope.isReadOnly) {
                setupValueWatcher(scope);
            }

            setupErrorWatcher(scope);

            scope.$on('openlmisInvalid.update', validate);

            updateCellContents();

            function updateCellContents() {
                var templateUrl = '';
                if (column.name === TEMPLATE_COLUMNS.SKIPPED) {
                    templateUrl = 'requisition-product-grid/product-grid-cell-skip.html';
                } else if (column.name === TEMPLATE_COLUMNS.TOTAL_LOSSES_AND_ADJUSTMENTS &&
                    !requisition.template.populateStockOnHandFromStockCards) {
                    templateUrl = 'requisition-product-grid/product-grid-cell-total-losses-and-adjustments.html';
                } else if (column.$type === COLUMN_TYPES.NUMERIC && !scope.isReadOnly) {
                    templateUrl = 'requisition-product-grid/product-grid-cell-input-numeric.html';
                    column.isNumericInput = true;
                } else if (!scope.isReadOnly) {
                    templateUrl = 'requisition-product-grid/product-grid-cell-input-text.html';
                } else if (column.$type === COLUMN_TYPES.CURRENCY) {
                    templateUrl = 'requisition-product-grid/product-grid-cell-currency.html';
                } else {
                    templateUrl = 'requisition-product-grid/product-grid-cell-text.html';
                }
                $templateRequest(templateUrl).then(replaceCell);
            }

            function replaceCell(newTemplate) {
                var cellWrapperPath = 'requisition-product-grid/product-grid-cell.html';
                $templateRequest(cellWrapperPath).then(function(template) {
                    template = angular.element(template);
                    template.html(newTemplate);

                    var cell = $compile(template)(scope);
                    element.replaceWith(cell);

                    element = cell;
                });
            }

            function update() {
                lineItem[column.name] = lineItem.quantities[column.name].quantity;
                lineItem.updateDependentFields(column, requisition);
                validate();
            }

            function validate() {
                return requisitionValidator.validateLineItem(
                    scope.lineItem,
                    requisition.template.getColumns(!scope.lineItem.$program.fullSupply),
                    requisition
                );
            }

            function showInDoses() {
                return requisition.showInDoses();
            }

            function isReadOnly(requisition, column) {
                if (requisition.$isApproved() || requisition.$isReleased()) {
                    return true;
                }
                if (scope.canApprove && isApprovalColumn(requisition, column)) {
                    return false;
                }
                if (canEditColumn(column)) {
                    return false;
                }
                // If we don't know that the field is editable, its read only
                return true;
            }

            function canEditColumn(column) {
                var TBMonthlyColumns = TEMPLATE_COLUMNS.getTbMonthlyColumns();

                if (program.name === TB_MONTHLY_PROGRAM && column.name === TEMPLATE_COLUMNS.TOTAL_RECEIVED_QUANTITY) {
                    return true;
                }

                return (column.source === COLUMN_SOURCES.USER_INPUT ||
                    TBMonthlyColumns.includes(column.name)) && scope.userCanEdit;
            }

            function canSkip() {
                return scope.userCanEdit && lineItem.canBeSkipped(scope.requisition);
            }

        }

        function setupValueWatcher(scope) {
            scope.$watch(function() {
                return scope.lineItem[scope.column.name];
            }, function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    scope.lineItem.updateDependentFields(scope.column, scope.requisition);
                }
            });
        }

        function setupErrorWatcher(scope) {
            scope.$watch(function() {
                if (scope.lineItem.skipped) {
                    return false;
                }
                return scope.lineItem.$errors[scope.column.name];
            }, function(error) {
                scope.invalidMessage = error ? error : undefined;
            });
        }

        function isApprovalColumn(requisition, column) {
            var approvalColumns = requisition.template.patientsTabEnabled ?
                [TEMPLATE_COLUMNS.TOTAL_RECEIVED_QUANTITY, TEMPLATE_COLUMNS.REMARKS] :
                [TEMPLATE_COLUMNS.APPROVED_QUANTITY];

            return approvalColumns.indexOf(column.name) !== -1;
        }
    }

})();
