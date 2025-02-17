// Import utils
import testContext from '@utils/testContext';

// Import commonTests
import loginCommon from '@commonTests/BO/loginBO';
import {deleteProductTest} from '@commonTests/BO/catalog/product';
import {enableHummingbird, disableHummingbird} from '@commonTests/BO/design/hummingbird';

// Import BO pages
import addProductPage from '@pages/BO/catalog/products/add';
import productsPage from '@pages/BO/catalog/products';

// Import FO pages
import productPage from '@pages/FO/hummingbird/product';

import {expect} from 'chai';
import type {BrowserContext, Page} from 'playwright';
import {
  boDashboardPage,
  FakerProduct,
  utilsFile,
  utilsPlaywright,
} from '@prestashop-core/ui-testing';

const baseContext: string = 'functional_FO_hummingbird_menuAndNavigation_navigationAndDisplay_displayOnSaleFlag';

/*
Pre-condition:
- Create new product with enable 'On sale' flag
- Install the theme hummingbird
Scenario:
- Preview product on check 'On sale' flag
Post-condition:
- Delete created product
- Uninstall the theme hummingbird
 */
describe('FO - Navigation and display : Display \'On sale\' flag', async () => {
  let browserContext: BrowserContext;
  let page: Page;

  const onSaleProductData: FakerProduct = new FakerProduct({
    name: 'On sale product',
    type: 'standard',
    coverImage: 'image.jpg',
    onSale: true,
  });

  // Pre-condition : Install Hummingbird
  enableHummingbird(`${baseContext}_preTest`);

  // before and after functions
  before(async function () {
    browserContext = await utilsPlaywright.createBrowserContext(this.browser);
    page = await utilsPlaywright.newTab(browserContext);
    await utilsFile.generateImage(onSaleProductData.coverImage!);
  });

  after(async () => {
    await utilsPlaywright.closeBrowserContext(browserContext);

    await utilsFile.deleteFile(onSaleProductData.coverImage!);
  });

  // Pre-condition : Create product with on sale flag
  describe('BO - Create product with enabled flag \'On sale\'', async () => {
    it('should login in BO', async function () {
      await loginCommon.loginBO(this, page);
    });

    it('should go to \'Catalog > Products\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToProductsPage3', baseContext);

      await boDashboardPage.goToSubMenu(page, boDashboardPage.catalogParentLink, boDashboardPage.productsLink);
      await productsPage.closeSfToolBar(page);

      const pageTitle = await productsPage.getPageTitle(page);
      expect(pageTitle).to.contains(productsPage.pageTitle);
    });

    it('should click on new product button and go to new product page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'clickOnNewProductPage', baseContext);

      const isModalVisible = await productsPage.clickOnNewProductButton(page);
      expect(isModalVisible).to.be.eq(true);

      await productsPage.selectProductType(page, onSaleProductData.type);

      await productsPage.clickOnAddNewProduct(page);

      const pageTitle = await addProductPage.getPageTitle(page);
      expect(pageTitle).to.contains(addProductPage.pageTitle);
    });

    it('should create standard product', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'createStandardProduct', baseContext);

      const createProductMessage = await addProductPage.setProduct(page, onSaleProductData);
      expect(createProductMessage).to.equal(addProductPage.successfulUpdateMessage);
    });
  });

  describe('FO - Check \'On sale\' flag', async () => {
    it('should preview product', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToShopFO2', baseContext);

      page = await addProductPage.previewProduct(page);

      const pageTitle = await productPage.getPageTitle(page);
      expect(pageTitle).to.contains(onSaleProductData.name);
    });

    it('should check the discount flag', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkDiscountTag', baseContext);

      const flagText = await productPage.getProductTag(page);
      expect(flagText).to.contains('On sale!');
    });
  });

  // Post-condition: Delete created product
  deleteProductTest(onSaleProductData, `${baseContext}_postTest_1`);

  // Post-condition : Uninstall Hummingbird
  disableHummingbird(`${baseContext}_postTest_2`);
});
