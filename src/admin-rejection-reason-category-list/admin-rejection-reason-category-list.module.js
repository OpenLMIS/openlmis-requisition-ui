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
     * @module admin-rejection-reason-category-list
     *
     * @description
     * Provides list of rejection reason categories.
     */
    angular.module('admin-rejection-reason-category-list', [
        'openlmis-modal',
        'openlmis-pagination',
        'openlmis-rights',
        'openlmis-admin',
        'openlmis-templates',
        'openlmis-class-extender',
        'openlmis-state-tracker',
        'openlmis-i18n',
        'openlmis-repository',
        'ui.router'
    ]);
})();
