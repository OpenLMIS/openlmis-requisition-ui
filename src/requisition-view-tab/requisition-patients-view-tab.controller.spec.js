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

describe('PatientsViewTabController', function() {

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
            this.localStorageFactory = $injector.get('localStorageFactory');
            this.TB_STORAGE = $injector.get('TB_STORAGE');
            this.LEPROSY_STORAGE = $injector.get('LEPROSY_STORAGE');
        });

        this.localStorageFactory(this.TB_STORAGE).clearAll();
        this.localStorageFactory(this.LEPROSY_STORAGE).clearAll();

        this.vm = this.$controller('PatientsViewTabController', {
            canSubmit: true,
            canAuthorize: true,
            requisition: {}
        });

        // Helper: rows for a single field carrying the given value + isInvalid flag.
        this.rowsWith = function(value, isInvalid) {
            return [{
                key: 'someKey',
                title: 'someTitle',
                isSkipped: false,
                isSkipDisabled: false,
                data: [{
                    value: value,
                    disabled: false,
                    isInvalid: isInvalid,
                    isFocused: false
                }]
            }];
        };

        // Helper: true if any field in the stored array is flagged invalid.
        this.anyStoredInvalid = function(storageName) {
            var stored = this.localStorageFactory(storageName).getAll()[0] || [];
            return stored.some(function(row) {
                return row.data.some(function(field) {
                    return field.isInvalid === true;
                });
            });
        };
    });

    afterEach(function() {
        this.localStorageFactory(this.TB_STORAGE).clearAll();
        this.localStorageFactory(this.LEPROSY_STORAGE).clearAll();
    });

    // OLMIS-8128: validation state (isInvalid) is session-only and must never be
    // persisted, otherwise red highlights survive a page refresh.
    describe('handleSaveInLocalStorage', function() {

        it('persists field values but never the isInvalid flag', function() {
            this.vm.handleSaveInLocalStorage(this.vm.TBTitle, this.rowsWith('5', true));

            var stored = this.localStorageFactory(this.TB_STORAGE).getAll()[0];

            expect(stored[0].data[0].value).toBe('5');
            expect(stored[0].data[0].isInvalid).toBe(false);
        });

        it('does not mutate the in-memory rows so in-session highlighting is preserved', function() {
            var rows = this.rowsWith('', true);

            this.vm.handleSaveInLocalStorage(this.vm.TBTitle, rows);

            expect(rows[0].data[0].isInvalid).toBe(true);
        });

        it('strips the isInvalid flag for the Leprosy table as well', function() {
            this.vm.handleSaveInLocalStorage(this.vm.LeprosyTitle, this.rowsWith('', true));

            expect(this.anyStoredInvalid(this.LEPROSY_STORAGE)).toBe(false);
        });
    });

    describe('isSubmitInProgress handler', function() {

        it('marks empty fields red in memory but stores them clean, so a refresh shows no red', function() {
            this.vm.$onInit();

            this.$rootScope.$broadcast('isSubmitInProgress', true);

            var anyMemoryInvalid = this.vm.TBRowsNew.some(function(row) {
                return row.data.some(function(field) {
                    return field.isInvalid === true;
                });
            });

            expect(anyMemoryInvalid).toBe(true);
            expect(this.anyStoredInvalid(this.TB_STORAGE)).toBe(false);
        });
    });

    describe('$onInit', function() {

        it('does not flag the form invalid when restoring clean data after a refresh', function() {
            this.localStorageFactory(this.TB_STORAGE).clearAll();
            this.localStorageFactory(this.TB_STORAGE).put(this.rowsWith('', false));

            this.vm.$onInit();

            expect(this.vm.isFormInvalid).toBe(false);
        });
    });
});
