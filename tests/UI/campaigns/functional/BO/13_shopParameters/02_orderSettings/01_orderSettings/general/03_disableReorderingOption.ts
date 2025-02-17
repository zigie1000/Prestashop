// Import utils
import testContext from '@utils/testContext';

// Import commonTests
import loginCommon from '@commonTests/BO/loginBO';

// Import pages
// Import BO pages
import orderSettingsPage from '@pages/BO/shopParameters/orderSettings';
// Import FO pages
import {homePage} from '@pages/FO/classic/home';
import {orderHistoryPage} from '@pages/FO/classic/myAccount/orderHistory';

import {
  boDashboardPage,
  dataCustomers,
  foClassicLoginPage,
  foClassicMyAccountPage,
  utilsPlaywright,
} from '@prestashop-core/ui-testing';

import {expect} from 'chai';
import type {BrowserContext, Page} from 'playwright';

const baseContext: string = 'functional_BO_shopParameters_orderSettings_orderSettings_general_disableReorderingOption';

/*
Enable/disable reordering option
Check reordering option in FO (Go to history page and check reordering link)
 */
describe('BO - Shop Parameters - Order Settings : Enable/Disable reordering option', async () => {
  let browserContext: BrowserContext;
  let page: Page;

  // before and after functions
  before(async function () {
    browserContext = await utilsPlaywright.createBrowserContext(this.browser);
    page = await utilsPlaywright.newTab(browserContext);
  });

  after(async () => {
    await utilsPlaywright.closeBrowserContext(browserContext);
  });

  it('should login in BO', async function () {
    await loginCommon.loginBO(this, page);
  });

  it('should go to \'Shop Parameters > Order Settings\' page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToOrderSettingsPage', baseContext);

    await boDashboardPage.goToSubMenu(
      page,
      boDashboardPage.shopParametersParentLink,
      boDashboardPage.orderSettingsLink,
    );
    await orderSettingsPage.closeSfToolBar(page);

    const pageTitle = await orderSettingsPage.getPageTitle(page);
    expect(pageTitle).to.contains(orderSettingsPage.pageTitle);
  });

  const tests = [
    {args: {action: 'enable', status: true, reorderOption: false}},
    {args: {action: 'disable', status: false, reorderOption: true}},
  ];

  tests.forEach((test, index: number) => {
    it(`should ${test.args.action} reordering option`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', `setReorderingOption${index}`, baseContext);

      const result = await orderSettingsPage.setReorderOptionStatus(page, test.args.status);
      expect(result).to.contains(orderSettingsPage.successfulUpdateMessage);
    });

    it('should view my shop', async function () {
      await testContext.addContextItem(this, 'testIdentifier', `viewMyShop${index}`, baseContext);

      // Click on view my shop
      page = await orderSettingsPage.viewMyShop(page);
      // Change language
      await homePage.changeLanguage(page, 'en');

      const isHomePage = await homePage.isHomePage(page);
      expect(isHomePage, 'Home page is not displayed').to.eq(true);
    });

    it('should verify the reordering option', async function () {
      await testContext.addContextItem(this, 'testIdentifier', `checkReorderingOption${index}`, baseContext);

      // Login FO
      await homePage.goToLoginPage(page);
      await foClassicLoginPage.customerLogin(page, dataCustomers.johnDoe);

      const isCustomerConnected = await foClassicLoginPage.isCustomerConnected(page);
      expect(isCustomerConnected).to.eq(true);

      // Go to order history page
      await homePage.goToMyAccountPage(page);
      await foClassicMyAccountPage.goToHistoryAndDetailsPage(page);

      // Check reorder link
      const isReorderLinkVisible = await orderHistoryPage.isReorderLinkVisible(page);
      expect(isReorderLinkVisible).to.be.equal(test.args.reorderOption);
    });

    it('should go back to BO', async function () {
      await testContext.addContextItem(this, 'testIdentifier', `goBackToBO${index}`, baseContext);

      // Logout FO
      await orderHistoryPage.logout(page);
      page = await orderHistoryPage.closePage(browserContext, page, 0);

      const pageTitle = await orderSettingsPage.getPageTitle(page);
      expect(pageTitle).to.contains(orderSettingsPage.pageTitle);
    });
  });
});
