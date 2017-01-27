(function() {

	'use strict';

	/**
     * @ngdoc directive
     * @name openlmis-pagination.openlmisPagination
     *
     * @description
     * Provides pagination for table. Allows to add method for validating pages.
     */
	angular
		.module('openlmis-pagination')
		.directive('openlmisPagination', directive);

	function directive() {
		return {
			restrict: 'E',
			scope: {
				isItemValid: '=?',
				changePage: '=?',
				items: '=',
				currentPage: '='
			},
			templateUrl: 'openlmis-pagination/openlmis-pagination.html',
			controller: 'PaginationController',
			controllerAs: 'vm'
		};
	}

})();