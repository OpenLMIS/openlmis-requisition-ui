7.0.9-SNAPSHOT / WIP
==================

New functionality added in a backwards-compatible manner:
* [TZUP-274](https://openlmis.atlassian.net/browse/TZUP-274): Added UI for requisition report only flag in requisition template.

Bug fixes
* [OLMIS-7697](https://openlmis.atlassian.net/browse/OLMIS-7697): Added requisition report only when initializing the requisition template to fix save requisition Template properly.

7.0.8 / 2022-10-07
==================

Bug fixes:
* [OLMIS-6034](https://openlmis.atlassian.net/browse/OLMIS-6034): Fix error message for requisition released withour order
* [OLMIS-5900](https://openlmis.atlassian.net/browse/OLMIS-5900): Fix displaying programs in ascending alphabetical order

7.0.7 / 2022-04-21
==================

Bug fixes:
* [OLMIS-5491](https://openlmis.atlassian.net/browse/OLMIS-5491): Fix Approved Quantity and Cost columns are still red after revert on the Batch Approval screen
* [OLMIS-7479](https://openlmis.atlassian.net/browse/OLMIS-7479): Fix Requisitions cannot be converted to order multiple times in one session
* [OLMIS-7550](https://openlmis.atlassian.net/browse/OLMIS-7550): Fix null facility when creating requisition-less order
* [OLMIS-7559](https://openlmis.atlassian.net/browse/OLMIS-7559): Fix removing items in requisition-less order table.

New functionality added in a backwards-compatible manner:
* [OLMIS-7453](https://openlmis.atlassian.net/browse/OLMIS-7453): Added new page to create requisition-less order.
* [OLMIS-7454](https://openlmis.atlassian.net/browse/OLMIS-7454): Created requisition-less order edit page.
* [OLMIS-7455](https://openlmis.atlassian.net/browse/OLMIS-7455): Addition products to requisition-less order page enabled.
* [OLMIS-7506](https://openlmis.atlassian.net/browse/OLMIS-7506): Add notifications in Requisition-less Order feature.
* [OLMIS-7512](https://openlmis.atlassian.net/browse/OLMIS-7512): Add search select to order create form
* [OLMIS-7508](https://openlmis.atlassian.net/browse/OLMIS-7508): Add validation on product addition table.
* [OLMIS-7537](https://openlmis.atlassian.net/browse/OLMIS-7537): Configure redux-persist
* [OLMIS-7538](https://openlmis.atlassian.net/browse/OLMIS-7538): User can create requisition-less order while offline
* [OLMIS-7539](https://openlmis.atlassian.net/browse/OLMIS-7539): Offline created requisition-less orders are synchronised when user is back online

Improvements:
* [OLMIS-7515](https://openlmis.atlassian.net/browse/OLMIS-7515): Order create table uses numeric input
* [OLMIS-7518](https://openlmis.atlassian.net/browse/OLMIS-7518): Prevent user from adding duplicated product to Requisition-less Order table.
* [OLMIS-7516](https://openlmis.atlassian.net/browse/OLMIS-7516): Requisition-less Order styling improvements.
* [OLMIS-7543](https://openlmis.atlassian.net/browse/OLMIS-7543): Add configuration to switch on/off Requisition-less Order.

7.0.6 / 2021-10-29
==================

Improvements:
* Updated dev-ui version to 9.0.3.
* Updated ui-components version to 7.2.6.
* Updated auth-ui version to 6.2.7.
* Updated ui-layout version to 5.2.0.
* Updated stockmanagement-ui version to 2.1.0.
* Updated referencedata-ui version to 5.6.6.
* Updated fulfillment-ui version to 6.1.0.
* [OLMIS-7314](https://openlmis.atlassian.net/browse/OLMIS-7314): Update scss files to enable webpack build.

Bug fixes:
* [OLMIS-7421](https://openlmis.atlassian.net/browse/OLMIS-7421): The error modal "This action can't be completed while offline" is displaying in offline mode in view requisition screen.

7.0.5 / 2021-05-27
==================

Improvements:
* Updated dev-ui version to 9.0.2.
* Updated ui-components version to 7.2.5.
* Updated auth-ui version to 6.2.6.
* Updated ui-layout version to 5.1.9.
* Updated stockmanagement-ui version to 2.0.9.
* Updated referencedata-ui version to 5.6.5.
* Updated fulfillment-ui version to 6.0.9.
* [OLMIS-7354](https://openlmis.atlassian.net/browse/OLMIS-7354): Allow requisitions spanning multiple pages to be simultaneously converted to orders.

7.0.4 / 2020-11-17
==================

Improvements:
* Updated ui-components version to 7.2.4.
* Updated auth-ui version to 6.2.5.
* Updated ui-layout version to 5.1.8.
* Updated referencedata-ui version to 5.6.4.
* Updated stockmanagement-ui version to 2.0.8.
* Updated cce-ui version to 1.0.8.
* Updated fulfillment-ui version to 6.0.8.


TZ Upgrade:
* [TZUP-99](https://openlmis.atlassian.net/browse/TZUP-99): Rejection reason window.
* [TZUP-102](https://openlmis.atlassian.net/browse/TZUP-102): Configure R&R rejection reasons.
* [TZUP-138](https://openlmis.atlassian.net/browse/TZUP-138): Enable/Disable Reasons for rejection screen.
* [TZUP-101](https://openlmis.atlassian.net/browse/TZUP-101): View Reasons for rejection on rejected RnR.



7.0.3 / 2020-05-12
==================

Improvements:
* Updated ui-components version to 7.2.3.
* Updated auth-ui version to 6.2.4.
* Updated ui-layout version to 5.1.7.
* Updated referencedata-ui version to 5.6.3.
* Updated stockmanagement-ui version to 2.0.7.
* Updated cce-ui version to 1.0.7.
* Updated fulfillment-ui version to 6.0.7.

7.0.2 / 2020-04-14
==================

Improvements:
* [OLMIS-6793](https://openlmis.atlassian.net/browse/OLMIS-6793): Allowed Calculated Order Quantity ISA column to be used in non Stock Based Requisitions.

Bug fixes:
* [OLMIS-6698](https://openlmis.atlassian.net/browse/OLMIS-6698): Removed unnecessary call for supervisory nodes when there are no partner nodes assigned.

7.0.1 / 2019-12-19
==================

Improvements:
* [OLMIS-6684](https://openlmis.atlassian.net/browse/OLMIS-6684): Added requisition caching on page change on requisition grid.
* [OLMIS-6708](https://openlmis.atlassian.net/browse/OLMIS-6708): Refactored GET /requisitions to not fetch available products and ftaps if it's unnecessary.

Bug fixes:
* [OLMIS-6592](https://openlmis.atlassian.net/browse/OLMIS-6592): Fixed bug with user being able to see Requisitions tab despite not having a Home Facility or a proper role with a Supervisory Node.
* [OLMIS-6691](https://openlmis.atlassian.net/browse/OLMIS-6691): Fixed issue with disappering products in emergency requisition.

7.0.0 / 2019-10-17
==================

Breaking changes:
* [OLMIS-6416](https://openlmis.atlassian.net/browse/OLMIS-6416): Switched to v2 requisition endpoints.
* [OLMIS-6569](https://openlmis.atlassian.net/browse/OLMIS-6569): Refactored UI after merging availableFullSupplyProducts with availableNonFullSupplyProducts into availableProducts.

Improvements:
* [OLMIS-6315](https://openlmis.atlassian.net/browse/OLMIS-6315): Added filtering by requisition status on Requisitions View page.
* [OLMIS-4437](https://openlmis.atlassian.net/browse/OLMIS-4437): Blocked selecting Stock Cards when 'Enable Stock on Hand to populate from Stock Cards' checkbox is not selected in Requisition Templates.
* [OLMIS-6330](https://openlmis.atlassian.net/browse/OLMIS-6330): fixed trigerring reference-ui build.
* [OLMIS-6402](https://openlmis.atlassian.net/browse/OLMIS-6402): Renamed versionId field to versionNumber.
* [OLMIS-6222](https://openlmis.atlassian.net/browse/OLMIS-6222): Updated some pagination usages after changes in openlmis-pagination component.

Bug fixes:
* [OLMIS-6530](https://openlmis.atlassian.net/browse/OLMIS-6530): Fixed problem with clearing freshly initiated requisition form after printing it.

6.0.0 / 2019-05-27
==================

Breaking changes:
* [OLMIS-4373](https://openlmis.atlassian.net/browse/OLMIS-4373): Changed filtering on Convert to Order page to use facility and program dropdowns.

New functionality added in a backwards-compatible manner:
* [OLMIS-5837](https://openlmis.atlassian.net/browse/OLMIS-5837): Made View Requisitions screen accessible to partner users.
* [OLMIS-5724](https://openlmis.atlassian.net/browse/OLMIS-5724): Made View Requisition screen accessible to partner users.
* [OLMIS-6071](https://openlmis.atlassian.net/browse/OLMIS-6071): Made Approve Requisitions screen accessible to partner users.

Improvements:
* [OLMIS-6153](https://openlmis.atlassian.net/browse/OLMIS-6153): Made requisition statuses translateable.

Bug fixes:
* [OLMIS-5822](https://openlmis.atlassian.net/browse/OLMIS-5822): Fixed a bug with products not being sorted alphabetically on the product selection modal.
* [OLMIS-5525](https://openlmis.atlassian.net/browse/OLMIS-5525): Fixed a bug with source not being set appropriately when un-checking stock-based flag on the requisition template page.
* [OLMIS-5813](https://openlmis.atlassian.net/browse/OLMIS-5813): Fixed a bug with header changing when editing requisition template.
* [OLMIS-5514](https://openlmis.atlassian.net/browse/OLMIS-5514): Validate requisition template column labels support UTF-8, not just alphanumeric.
* [OLMIS-5848](https://openlmis.atlassian.net/browse/OLMIS-5848): Fixed a bug with facility type marked as required when creating a requisition template.
* [OLMIS-5959](https://openlmis.atlassian.net/browse/OLMIS-5959): Enable facility type button and set facility type input required.
* [OLMIS-5837](https://openlmis.atlassian.net/browse/OLMIS-5837): Fixed issue with endless loading when rejecting requisition fails.
* [OLMIS-6077](https://openlmis.atlassian.net/browse/OLMIS-6077): Fixed issue with additional call to retrieve requisition after initiate.
* [OLMIS-6234](https://openlmis.atlassian.net/browse/OLMIS-6234): Fixed issue with error indicator not working on the non full supply tab of the requisition screen.

5.5.0 / 2018-12-12
==================

New functionality added in a backwards-compatible manner:
* [OLMIS-5334](https://openlmis.atlassian.net/browse/OLMIS-5334): Enabled Total and Number of patients added columns for Stock Based Requisitions.
* [OLMIS-5335](https://openlmis.atlassian.net/browse/OLMIS-5335): Enabled Adjusted Consumption column for Stock Based Requisitions.
* [OLMIS-5366](https://openlmis.atlassian.net/browse/OLMIS-5366): Enabled Average Consumption column for Stock Based Requisitions.
* [OLMIS-5395](https://openlmis.atlassian.net/browse/OLMIS-5395): Enabled Maximum Stock Quantity and Calculated Order Quantity columns for Stock Based Requisitions.
* [OLMIS-5226](https://openlmis.atlassian.net/browse/OLMIS-5226): Added sort component on the Approve screen in Requisitions.
  * Added Authorized Date column on the screen
* [OLMIS-4968](https://openlmis.atlassian.net/browse/OLMIS-4968): Make packsToShip column to be seen only on Rnr approval screen or on all Rnr screens bases on admin template configuration

Improvements:
* [OLMIS-5409](https://openlmis.atlassian.net/browse/OLMIS-5409): Updated ui-components to version 7.0.0.
* [OLMIS-3696](https://openlmis.atlassian.net/browse/OLMIS-3696): Added dependency and development dependency locking.
* [OLMIS-4251](https://openlmis.atlassian.net/browse/OLMIS-4251): Reworked adding non full supply products to reuse selectProductsModal

Bug fixes:
* [OLMIS-4938](https://openlmis.atlassian.net/browse/OLMIS-4938): Moved locked requisition template columns to the top.
* [OLMIS-4555](https://openlmis.atlassian.net/browse/OLMIS-4555): Add reload flag to reflect changes on admin programs screen.
* [OLMIS-5134](https://openlmis.atlassian.net/browse/OLMIS-5134): The Approve button will not be visible if a user does not have a right to a supervisory node at which the user wants to approve the requisition.
* [OLMIS-5502](https://openlmis.atlassian.net/browse/OLMIS-5502): Fixed the issue with Update outdated requisition button not showing when appropriate.
* [OLMIS-5509](https://openlmis.atlassian.net/browse/OLMIS-5509): Fixed filtering offline requisitions.

Improvements:
* [OLMIS-5115](https://openlmis.atlassian.net/browse/OLMIS-5115): Made the requisition print button disabled when going offline

5.4.0 / 2018-08-16
==================

New functionality added in a backwards-compatible manner:
* [OLMIS-4792](https://openlmis.atlassian.net/browse/OLMIS-4792): Make additional options column of requisition template translatable.
* [OLMIS-4681](https://openlmis.atlassian.net/browse/OLMIS-4681): Added additional option and source option for skipped column.
* [OLMIS-4015](https://openlmis.atlassian.net/browse/OLMIS-4015): Added new screen for creating Requisition Templates.
* [OLMIS-4053](https://openlmis.atlassian.net/browse/OLMIS-4053): Enabled beginning balance column for stock based requisition templates
* [OLMIS-4708](https://openlmis.atlassian.net/browse/OLMIS-4708): Added selecting tags on Requisition Template Configure screen.
* [OLMIS-4748](https://openlmis.atlassian.net/browse/OLMIS-4748): Added disabling Total Losses and Adjustments modal for Stock Based Requisition.
* [OLMIS-4747](https://openlmis.atlassian.net/browse/OLMIS-4747): Added Total Received Quantity and Total Consumed Quantity to the stock based columns.
* [OLMIS-4760](https://openlmis.atlassian.net/browse/OLMIS-4760): Added Total Stockout Days to the stock based columns.
* [OLMIS-4684](https://openlmis.atlassian.net/browse/OLMIS-4684): Hide skipped full supply products from create requisition when template is configured to hide.
* [OLMIS-4685](https://openlmis.atlassian.net/browse/OLMIS-4685): Hide skipped full supply products from approve requisition when template is configured to hide.
* [OLMIS-4686](https://openlmis.atlassian.net/browse/OLMIS-4686): Added an add product button and modal window to un-skip products
* [OLMIS-4686](https://openlmis.atlassian.net/browse/OLMIS-4687): Allow users to search from skipped line items.
* [OLMIS-4813](https://openlmis.atlassian.net/browse/OLMIS-4813): Added feature flag for enabling Batch Approve screen.
* [OLMIS-4927](https://openlmis.atlassian.net/browse/OLMIS-4927): Added If-Match header to the requisition save request.
* [OLMIS-4935](https://openlmis.atlassian.net/browse/OLMIS-4935): Added Idempotency-Key header to the requisition submit, authorize, approve, reject and skip requests.
* [OLMIS-3162](https://openlmis.atlassian.net/browse/OLMIS-3162): _Initiate Requisition_ screen will now only use _periodsForInitiate_ endpoint to determine available periods and not additionally search for requisitions.
* [OLMIS-4865](https://openlmis.atlassian.net/browse/OLMIS-4865): Added new functionality on convert to order page to release requisitions without order.
* [OLMIS-4958](https://openlmis.atlassian.net/browse/OLMIS-4958): Convert requisition to order updated to use batchReleases resource.
* [OLMIS-4982](https://openlmis.atlassian.net/browse/OLMIS-4982): Give visual indicator that requisition is report-only.
* [OLMIS-4966](https://openlmis.atlassian.net/browse/OLMIS-4966): Added additionalQuantityRequired column on requisition template.

Bug fixes:
* [OLMIS-4509](https://openlmis.atlassian.net/browse/OLMIS-4509): Fixed redirect to 404 when clicking proceed for requisition while offline
* [OLMIS-4689](https://openlmis.atlassian.net/browse/OLMIS-4689): Fixed Total Cost was not updated based on Calc Order Qty ISA column
* [OLMIS-4415](https://openlmis.atlassian.net/browse/OLMIS-4415): Fixed a bug with stock count days validation not updating correctly after failing to submit the form
* [OLMIS-4719](https://openlmis.atlassian.net/browse/OLMIS-4719): Fix Requisition template definition field error when value exceeds max limit

Improvements:
* [OLMIS-4643](https://openlmis.atlassian.net/browse/OLMIS-4643): Added Jenkinsfile
* [OLMIS-4483](https://openlmis.atlassian.net/browse/OLMIS-4483): Show an error message when program is not supported
* [OLMIS-4795](https://openlmis.atlassian.net/browse/OLMIS-4795): Updated dev-ui to version 8.
* [OLMIS-4813](https://openlmis.atlassian.net/browse/OLMIS-4813): Updated datepickers to use the new syntax.
* [OLMIS-4813](https://openlmis.atlassian.net/browse/OLMIS-4813): Updated ui-components to version 6.0.0.

5.3.1 / 2018-04-27
==================

Improvements:
* Reduced payload size when synchronizing requisition.

5.3.0 / 2018-04-24
==================

New functionality added in a backwards-compatible manner:
* [OLMIS-3108:](https://openlmis.atlassian.net/browse/OLMIS-3108) Updated to use dev-ui v7 transifex build process
* [OLMIS-2666:](https://openlmis.atlassian.net/browse/OLMIS-2666) Added create program modal.
* [OLMIS-3917:](https://openlmis.atlassian.net/browse/OLMIS-3917) Added stock based configuration to template screen.
* [OLMIS-4087:](https://openlmis.atlassian.net/browse/OLMIS-4087) Moved template screen to separate tab and support multiple templates per program.
* [OLMIS-4161:](https://openlmis.atlassian.net/browse/OLMIS-4161) Added calculation and validations for calculated order quantity isa column.
* [OLMIS-4101:](https://openlmis.atlassian.net/browse/OLMIS-4101) Reworked emergency requisition screen

Improvements:
* [OLMIS-3876:](https://openlmis.atlassian.net/browse/OLMIS-3876) Split navigation and filter logic on requisition approve and view requisitions pages
* [OLMIS-3535:](https://openlmis.atlassian.net/browse/OLMIS-3535) Shortened column names on batch requisition screen.
* [OLMIS-3080:](https://openlmis.atlassian.net/browse/OLMIS-3080) Replaced warning with error modal when there are no more products to add to the non-full supply requisition page.
* [OLMIS-3782:](https://openlmis.atlassian.net/browse/OLMIS-3782) New option in the program settings to skip authorization step and button rename on the product grid if that setting is enabled.

Bug fixes:
* [OLMIS-3492:](https://openlmis.atlassian.net/browse/OLMIS-3492) Allow to save comment in requisition longer than 255 characters
* [OLMIS-4004:](https://openlmis.atlassian.net/browse/OLMIS-4004) Fix action button permission criteria to check by both program and facility.
* [OLMIS-3527:](https://openlmis.atlassian.net/browse/OLMIS-3527) Fix add comment button permission criteria, from certain statuses, to if requisition is editable.
* [OLMIS-4164:](https://openlmis.atlassian.net/browse/OLMIS-4164) Fix permission issues in skip controls, product grid inputs, and the add product button.
* [OLMIS-3983:](https://openlmis.atlassian.net/browse/OLMIS-3983) Fix problem with accessing offline requisitions
* [OLMIS-4126:](https://openlmis.atlassian.net/browse/OLMIS-4126) Fixed line item skipping on the requisition product grid
* [OLMIS-3182:](https://openlmis.atlassian.net/browse/OLMIS-3182) Added virtual scrolling to the requisition batch approval screen
* [OLMIS-4401](https://openlmis.atlassian.net/browse/OLMIS-4401): Fixed requisition sync before generating report
* [OLMIS-4395](https://openlmis.atlassian.net/browse/OLMIS-4395): Hide proceed button if the user has no permission to initiate.
* [OLMIS-4420](https://openlmis.atlassian.net/browse/OLMIS-4420): Requisitions View screen now displays initiated date from the createdDate property.
* [OLMIS-4530](https://openlmis.atlassian.net/browse/OLMIS-4530): Requested quantity is required for emergency requisitions.

5.2.2 / 2017-11-23
==================

Improvements:
* [OLMIS-3657:](https://openlmis.atlassian.net/browse/OLMIS-3657) Improved performance of the requisition view page.

5.2.0 / 2017-11-09
==================

Improvements:
* [OLMIS-2956:](https://openlmis.atlassian.net/browse/OLMIS-2956) Removed UserRightFactory from requisition-initiate module, and replaced with permissionService
* [OLMIS-3294:](https://openlmis.atlassian.net/browse/OLMIS-3294) Added loading modal after the approval is finished.
* [OLMIS-2700:](https://openlmis.atlassian.net/browse/OLMIS-2700) Added date initiated column and sorting to the View Requisitions table. Removed date authorized and date approved.
* [OLMIS-3181:](https://openlmis.atlassian.net/browse/OLMIS-3181) Added front-end validation to the requisition batch approval screen.
* [OLMIS-3233:](https://openlmis.atlassian.net/browse/OLMIS-3233) Added ability to delete requisitions with "skipped" status.
* [OLMIS-3246:](https://openlmis.atlassian.net/browse/OLMIS-3246) Added 'show' field to reason assignments
* [OLMIS-3471:](https://openlmis.atlassian.net/browse/OLMIS-3471) Explanation field on Non Full supply tab is no longer mandatory
* [OLMIS-3318:](https://openlmis.atlassian.net/browse/OLMIS-3318) Added requisitions caching to the Convert to Order screen.
* Updated dev-ui version to 6.

Bug fixes:
* [OLMIS-3151:](https://openlmis.atlassian.net/browse/OLMIS-3151) Fixed automatically resolving mathematical error with adjustments.
* [OLMIS-3255:](https://openlmis.atlassian.net/browse/OLMIS-3255) Fixed auto-select the "Supplying facility" on Requisition Convert to Order.
* [OLMIS-3296:](https://openlmis.atlassian.net/browse/OLMIS-3296) Reworked facility-program select component to use cached programs, minimal facilities and permission strings.
* [OLMIS-3322:](https://openlmis.atlassian.net/browse/OLMIS-3322) Added storing initiated requisition in offline cache.

5.1.1 / 2017-09-01
==================

* [OLMIS-2797::](https://openlmis.atlassian.net/browse/OLMIS-2797) Updated product-grid error messages to use openlmis-invalid.

New functionality that are not backwards-compatible:
* [OLMIS-2833:](https://openlmis.atlassian.net/browse/OLMIS-2833) Add date field to Requisition form
  * Date physical stock count completed is required for submit and authorize requisition.
* [OLMIS-3025:](https://openlmis.atlassian.net/browse/OLMIS-3025) Introduced frontend batch-approval functionality.
* [OLMIS-3023:](https://openlmis.atlassian.net/browse/OLMIS-3023) Added configurable physical stock date field to program settings.
* [OLMIS-2694:](https://openlmis.atlassian.net/browse/OLMIS-2694) Change Requisition adjustment reasons to come from Requisition object. OpenLMIS Stock Management UI is now connected to Requisition UI.

Improvements:
* [OLMIS-2969:](https://openlmis.atlassian.net/browse/OLMIS-2969) Requisitions show saving indicator only when requisition is editable.

Bug fixes:
* [OLMIS-2800:](https://openlmis.atlassian.net/browse/OLMIS-2800) Skip column will not be shown in submitted status when user has no authorize right.
* [OLMIS-2801:](https://openlmis.atlassian.net/browse/OLMIS-2801) Disabled the 'Add Product' button in the non-full supply screen for users without rights to edit the requisition. Right checks for create/initialize permissions were also fixed.
* [OLMIS-2906:](https://openlmis.atlassian.net/browse/OLMIS-2906) "Outdated offline form" error is not appearing in a product grid when requisition is up to date.
* [OLMIS-3017:](https://openlmis.atlassian.net/browse/OLMIS-3017) Fixed problem with outdated status messages after Authorize action.

5.1.0 / 2017-06-22
==================

New functionality added in a backwards-compatible manner:
* [MW-244:](https://openlmis.atlassian.net/browse/MW-244) Added support for requisition REJECTED status.
* [MW-245:](https://openlmis.atlassian.net/browse/MW-245) Added filter to convert to order page.
* [MW-306:](https://openlmis.atlassian.net/browse/MW-306) Allows UI to use more performant responses from Requisition Service.

Improvements:

* [OLMIS-2444:](https://openlmis.atlassian.net/browse/OLMIS-2444) Added new "add" button class.
* [OLMIS-2533:](https://openlmis.atlassian.net/browse/OLMIS-2533) Allowed for smaller requests from UI to server.
* [OLMIS-2572:](https://openlmis.atlassian.net/browse/OLMIS-2572) Column definition will now show when hovering over whole header instead of only the button.
* [OLMIS-2567:](https://openlmis.atlassian.net/browse/OLMIS-2567) Implements openlmis-facility-program-select.

Bug fixes:

* [OLMIS-2638:](https://openlmis.atlassian.net/browse/OLMIS-2638) Updated read-only check to make sure user right and requisition status match
* [OLMIS-2664:](https://openlmis.atlassian.net/browse/OLMIS-2664) Requisition will now be saved
  before getting rejected to preserve the status message.
* [OLMIS-2704:](https://openlmis.atlassian.net/browse/OLMIS-2704) Added warning if cached requistion is outdated.

5.0.1 / 2017-05-26
==================

Improvements:

* [OLMIS-2483:](https://openlmis.atlassian.net/browse/OLMIS-2483) Added a warning when trying to add non full supply product if there are no products available.

Bug fixes

* [OLMIS-2329:](https://openlmis.atlassian.net/browse/OLMIS-2329) Dependant fields will now only be recalculated if the value actually changed(instead of every digest cycle)
* [OLMIS-2224:](https://openlmis.atlassian.net/browse/OLMIS-2224) Requisition View screen is always available offline, even if no data is stored
* [OLMIS-2356:](https://openlmis.atlassian.net/browse/OLMIS-2356) Fixed a bug with non full supply screen displaying an error for valid product.
* [OLMIS-2525:](https://openlmis.atlassian.net/browse/OLMIS-2525) Errors will no longer appear in browser console when emptying requested quantity on one of the non full supply products.
* [OLMIS-2466:](https://openlmis.atlassian.net/browse/OLMIS-2466) Requested quantity will now be properly validated for being required on the non full supply screen.
* [OLMIS-2481:](https://openlmis.atlassian.net/browse/OLMIS-2481) Screen will no longer flash twice when syncing requisition.
* [OLMIS-2445:](https://openlmis.atlassian.net/browse/OLMIS-2445) Button and title capitalization are consistent.
* [OLMIS-2352:](https://openlmis.atlassian.net/browse/OLMIS-2352) Added missing validation for calculated order quantity column on the template administration screen.
* [OLMIS-2453:](https://openlmis.atlassian.net/browse/OLMIS-2453) Total losses and adjustments modal fields will now be cleared when closing/reopening the modal.
* [OLMIS-2436:](https://openlmis.atlassian.net/browse/OLMIS-2436) Aligned total cost and button.
* [OLMIS-2522:](https://openlmis.atlassian.net/browse/OLMIS-2522) Fixed select element placeholder on initialize/authorize screen.
* [OLMIS-2439:](https://openlmis.atlassian.net/browse/OLMIS-2439) Change skip all behavior to skip all line items, not only those visible on the current page.

5.0.0 / 2017-05-08
==================

Compatibility breaking changes:

* [OLMIS-2107:](https://openlmis.atlassian.net/browse/OLMIS-2107) Add breadcrumbs to top of page navigation
  * All states have been modified to be descendants of the main state.

New functionality added in a backwards-compatible manner:

* [OLMIS-2037:](https://openlmis.atlassian.net/browse/OLMIS-2037) Focused auto-saving behavior notifications
* [OLMIS-2164:](https://openlmis.atlassian.net/browse/OLMIS-2164) Change screen after requisition action
* [OLMIS-2165:](https://openlmis.atlassian.net/browse/OLMIS-2165) Search screens to preserve search values in URL

Bug fixes and performance improvements which are backwards-compatible:

* [OLMIS-2158:](https://openlmis.atlassian.net/browse/OLMIS-2158) Requisition print out not populating quantities nor display order
* [OLMIS-2218:](https://openlmis.atlassian.net/browse/OLMIS-2218) Requisition column Total Losses and Adjustments has no sanity validation
* [OLMIS-2223:](https://openlmis.atlassian.net/browse/OLMIS-2223) Offline requisition does not have a Remove button
* [OLMIS-2268:](https://openlmis.atlassian.net/browse/OLMIS-2268) Adjustment modal Quantity field becomes invalid immediately
* [OLMIS-2276:](https://openlmis.atlassian.net/browse/OLMIS-2276) Select drop down arrows and required fields missing
* [OLMIS-2288:](https://openlmis.atlassian.net/browse/OLMIS-2288) Can not initialize requisition for "My supervised facilities"
* [OLMIS-2289:](https://openlmis.atlassian.net/browse/OLMIS-2289) Incorrect values on the Approved/Released requisition view
* [OLMIS-2302:](https://openlmis.atlassian.net/browse/OLMIS-2302) Update Requisition template validations for Adjusted Consumption
* [OLMIS-2305:](https://openlmis.atlassian.net/browse/OLMIS-2305) Error message not displaying during authorization
* [OLMIS-2310:](https://openlmis.atlassian.net/browse/OLMIS-2310) Error icon does not have a message
* [OLMIS-2408:](https://openlmis.atlassian.net/browse/OLMIS-2408) SoH Incorrect and NaN Error
* [OLMIS-2410:](https://openlmis.atlassian.net/browse/OLMIS-2410) View Comments run off screen when comments are long
* [OLMIS-2420:](https://openlmis.atlassian.net/browse/OLMIS-2420) In_approval requisitions are not displayed on the Approve view

Dev and tooling updates made in a backwards-compatible manner:

* [OLMIS-1609:](https://openlmis.atlassian.net/browse/OLMIS-1609) UI i18N message strings are not standardized
* [OLMIS-1853:](https://openlmis.atlassian.net/browse/OLMIS-1853) Separate push and pull Transifex tasks in build
  * Migrated to dev-ui v3.
* [OLMIS-2204:](https://openlmis.atlassian.net/browse/OLMIS-2204) The administration menu item should always be the last menu item
  * Priority of all main navigation states have been changed to 10.
* [OLMIS-2406:](https://openlmis.atlassian.net/browse/OLMIS-206) State tracker service does not work if there is no previous state stored
  * Added support for state tracker.