5.1.1 / Current Snapshot
===========

* [OLMIS-2797:](https://openlmis.atlassian.net/browse/OLMIS-2797) Updated product-grid error messages to use openlmis-invalid.

Bug fixes:
* [OLMIS-2800](https://openlmis.atlassian.net/browse/OLMIS-2800): Skip column will not be shown in submitted status when user has no authorize right.
* [OLMIS-2801](https://openlmis.atlassian.net/browse/OLMIS-2801): Disabled the 'Add Product' button in the non-full supply screen for users without rights to edit the requisition. Right checks for create/initialize permissions were also fixed.
* [OLMIS-2906](https://openlmis.atlassian.net/browse/OLMIS-2906): "Outdated offline form" error is not appearing in a product grid when requisition is up to date.

5.1.0 / 2017-06-22
===========

New functionality added in a backwards-compatible manner:
* [MW-244](https://openlmis.atlassian.net/browse/MW-244): Added support for requisition REJECTED status.
* [MW-245](https://openlmis.atlassian.net/browse/MW-245): Added filter to convert to order page.
* [MW-306](https://openlmis.atlassian.net/browse/MW-306): Allows UI to use more performant responses from Requisition Service.

Improvements:

* [OLMIS-2444](https://openlmis.atlassian.net/browse/OLMIS-2444): Added new "add" button class.
* [OLMIS-2533](https://openlmis.atlassian.net/browse/OLMIS-2533): Allowed for smaller requests from UI to server.
* [OLMIS-2572](https://openlmis.atlassian.net/browse/OLMIS-2572): Column definition will now show when hovering over whole header instead of only the button.
* [OLMIS-2567](https://openlmis.atlassian.net/browse/OLMIS-2567): Implements openlmis-facility-program-select.

Bug fixes:

* [OLMIS-2638](https://openlmis.atlassian.net/browse/OLMIS-2638): Updated read-only check to make sure user right and requisition status match
* [OLMIS-2664](https://openlmis.atlassian.net/browse/OLMIS-2664): Requisition will now be saved
before getting rejected to preserve the status message.
* [OLMIS-2704](https://openlmis.atlassian.net/browse/OLMIS-2704): Added warning if cached requistion is outdated.

5.0.1 / 2017-05-26
==================

Improvements:

* [OLMIS-2483](https://openlmis.atlassian.net/browse/OLMIS-2483): Added a warning when trying to add non full supply product if there are no products available.

Bug fixes

* [OLMIS-2329](https://openlmis.atlassian.net/browse/OLMIS-2329): Dependant fields will now only be recalculated if the value actually changed(instead of every digest cycle)
* [OLMIS-2224](https://openlmis.atlassian.net/browse/OLMIS-2224): Requisition View screen is always available offline, even if no data is stored
* [OLMIS-2356](https://openlmis.atlassian.net/browse/OLMIS-2356): Fixed a bug with non full supply screen displaying an error for valid product.
* [OLMIS-2525](https://openlmis.atlassian.net/browse/OLMIS-2525): Errors will no longer appear in browser console when emptying requested quantity on one of the non full supply products.
* [OLMIS-2466](https://openlmis.atlassian.net/browse/OLMIS-2466): Requested quantity will now be properly validated for being required on the non full supply screen.
* [OLMIS-2481](https://openlmis.atlassian.net/browse/OLMIS-2481): Screen will no longer flash twice when syncing requisition.
* [OLMIS-2445](https://openlmis.atlassian.net/browse/OLMIS-2445): Button and title capitalization are consistent.
* [OLMIS-2352](https://openlmis.atlassian.net/browse/OLMIS-2352): Added missing validation for calculated order quantity column on the template administration screen.
* [OLMIS-2453](https://openlmis.atlassian.net/browse/OLMIS-2453): Total losses and adjustments modal fields will now be cleared when closing/reopening the modal.
* [OLMIS-2436](https://openlmis.atlassian.net/browse/OLMIS-2436): Aligned total cost and button.
* [OLMIS-2522](https://openlmis.atlassian.net/browse/OLMIS-2522): Fixed select element placeholder on initialize/authorize screen.
* [OLMIS-2439](https://openlmis.atlassian.net/browse/OLMIS-2439): Change skip all behavior to skip all line items, not only those visible on the current page.

5.0.0 / 2017-05-08
==================

Compatibility breaking changes:

* [OLMIS-2107](https://openlmis.atlassian.net/browse/OLMIS-2107): Add breadcrumbs to top of page navigation
  * All states have been modified to be descendants of the main state.

New functionality added in a backwards-compatible manner:

* [OLMIS-2037](https://openlmis.atlassian.net/browse/OLMIS-2037): Focused auto-saving behavior notifications
* [OLMIS-2164](https://openlmis.atlassian.net/browse/OLMIS-2164): Change screen after requisition action
* [OLMIS-2165](https://openlmis.atlassian.net/browse/OLMIS-2165): Search screens to preserve search values in URL

Bug fixes and performance improvements which are backwards-compatible:

* [OLMIS-2158](https://openlmis.atlassian.net/browse/OLMIS-2158): Requisition print out not populating quantities nor display order
* [OLMIS-2218](https://openlmis.atlassian.net/browse/OLMIS-2218): Requisition column Total Losses and Adjustments has no sanity validation
* [OLMIS-2223](https://openlmis.atlassian.net/browse/OLMIS-2223): Offline requisition does not have a Remove button
* [OLMIS-2268](https://openlmis.atlassian.net/browse/OLMIS-2268): Adjustment modal Quantity field becomes invalid immediately
* [OLMIS-2276](https://openlmis.atlassian.net/browse/OLMIS-2276): Select drop down arrows and required fields missing
* [OLMIS-2288](https://openlmis.atlassian.net/browse/OLMIS-2288): Can not initialize requisition for "My supervised facilities"
* [OLMIS-2289](https://openlmis.atlassian.net/browse/OLMIS-2289): Incorrect values on the Approved/Released requisition view
* [OLMIS-2302](https://openlmis.atlassian.net/browse/OLMIS-2302): Update Requisition template validations for Adjusted Consumption
* [OLMIS-2305](https://openlmis.atlassian.net/browse/OLMIS-2305): Error message not displaying during authorization
* [OLMIS-2310](https://openlmis.atlassian.net/browse/OLMIS-2310): Error icon does not have a message
* [OLMIS-2408](https://openlmis.atlassian.net/browse/OLMIS-2408): SoH Incorrect and NaN Error
* [OLMIS-2410](https://openlmis.atlassian.net/browse/OLMIS-2410): View Comments run off screen when comments are long
* [OLMIS-2420](https://openlmis.atlassian.net/browse/OLMIS-2420): In_approval requisitions are not displayed on the Approve view

Dev and tooling updates made in a backwards-compatible manner:

* [OLMIS-1609](https://openlmis.atlassian.net/browse/OLMIS-1609): UI i18N message strings are not standardized
* [OLMIS-1853](https://openlmis.atlassian.net/browse/OLMIS-1853): Separate push and pull Transifex tasks in build
  * Migrated to dev-ui v3.
* [OLMIS-2204](https://openlmis.atlassian.net/browse/OLMIS-2204): The administration menu item should always be the last menu item
  * Priority of all main navigation states have been changed to 10.
* [OLMIS-2406](https://openlmis.atlassian.net/browse/OLMIS-206): State tracker service does not work if there is no previous state stored
  * Added support for state tracker.
