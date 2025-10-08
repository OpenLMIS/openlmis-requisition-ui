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

describe('TemplateRepository', function() {

    var TemplateRepository, OpenlmisRepositoryMock, templateResourceMock, Template;

    beforeEach(function() {
        module('admin-template', function($provide) {
            OpenlmisRepositoryMock = jasmine.createSpy('OpenlmisRepository');
            $provide.factory('OpenlmisRepository', function() {
                return OpenlmisRepositoryMock;
            });

            templateResourceMock = jasmine.createSpy('TemplateResource');
            $provide.factory('TemplateResource', function() {
                return function() {
                    return templateResourceMock;
                };
            });

            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            TemplateRepository = $injector.get('TemplateRepository');
            Template = $injector.get('Template');
        });
    });

    describe('constructor', function() {

        it('should extend OpenlmisRepository', function() {
            new TemplateRepository();

            expect(OpenlmisRepositoryMock).toHaveBeenCalledWith(Template, templateResourceMock);
        });

        it('should pass the given implementation', function() {
            var implMock = jasmine.createSpyObj('impl', ['create']);

            new TemplateRepository(implMock);

            expect(OpenlmisRepositoryMock).toHaveBeenCalledWith(Template, implMock);
        });

    });

});