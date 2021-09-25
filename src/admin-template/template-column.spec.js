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

describe('TemplateColumn', function() {

    var templateColumn, templateColumnJson, TemplateColumn, TEMPLATE_COLUMNS;

    beforeEach(function() {
        module('admin-template');

        inject(function($injector) {
            TemplateColumn = $injector.get('TemplateColumn');
            TEMPLATE_COLUMNS = $injector.get('TEMPLATE_COLUMNS');
        });

        templateColumnJson = {
            name: 'columnName',
            option: {
                id: 'A'
            },
            columnDefinition: {
                options: [{
                    id: 'B'
                }, {
                    id: 'A'
                }],
                sources: jasmine.createSpyObj('sources', ['includes'])
            }
        };
    });

    describe('constructor', function() {

        it('option should be one of the available options', function() {
            templateColumn = new TemplateColumn(templateColumnJson);

            expect(templateColumn.option).toBe(templateColumn.columnDefinition.options[1]);
        });

        it('should leave option undefined if it was undefined in JSON', function() {
            templateColumnJson.option = undefined;

            templateColumn = new TemplateColumn(templateColumnJson);

            expect(templateColumn.option).toBeUndefined();
        });

    });

    describe('isStockBasedColumn', function() {

        var columnsSpy;

        beforeEach(function() {
            templateColumn = new TemplateColumn(templateColumnJson);

            columnsSpy = jasmine.createSpyObj('columns', ['includes']);
            spyOn(TEMPLATE_COLUMNS, 'getStockBasedColumns').andReturn(columnsSpy);
        });

        it('should return true if column is stock based', function() {
            columnsSpy.includes.andReturn(true);

            expect(templateColumn.isStockBasedColumn()).toBe(true);
            expect(columnsSpy.includes).toHaveBeenCalledWith(templateColumn.name);
        });

        it('should return false if column is not stock based', function() {
            columnsSpy.includes.andReturn(false);

            expect(templateColumn.isStockBasedColumn()).toBe(false);
            expect(columnsSpy.includes).toHaveBeenCalledWith(templateColumn.name);
        });

    });

});
