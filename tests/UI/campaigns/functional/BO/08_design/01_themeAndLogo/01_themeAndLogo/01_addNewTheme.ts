// Import utils
import testContext from '@utils/testContext';

// Import common tests
import loginCommon from '@commonTests/BO/loginBO';

// Import BO pages
import themeAndLogoPage from '@pages/BO/design/themeAndLogo/themeAndLogo';
import themeImportPage from '@pages/BO/design/themeAndLogo/themeAndLogo/import';

import {expect} from 'chai';
import type {BrowserContext, Page} from 'playwright';
import {
  boDashboardPage,
  utilsFile,
  utilsPlaywright,
} from '@prestashop-core/ui-testing';

const baseContext: string = 'functional_BO_design_themeAndLogo_themeAndLogo_addNewTheme';

describe('BO - Design - Theme & Logo : Add new theme', async () => {
  let browserContext: BrowserContext;
  let page: Page;

  const urlTheme: string = 'https://github.com/prestarocket-agence/classic-rocket/releases/download/3.1.0/classic-rocket.zip';

  // before and after functions
  before(async function () {
    browserContext = await utilsPlaywright.createBrowserContext(this.browser);
    page = await utilsPlaywright.newTab(browserContext);
  });

  after(async () => {
    await utilsPlaywright.closeBrowserContext(browserContext);

    await Promise.all([
      utilsFile.deleteFile('theme.zip'),
      utilsFile.deleteFile('../../themes/theme.zip'),
      utilsFile.deleteFile('../../admin-dev/classic-rocket.zip'),
    ]);
  });

  it('should login in BO', async function () {
    await loginCommon.loginBO(this, page);
  });

  it('should go to \'Design > Theme & Logo\' page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToThemeAndLogoPage', baseContext);

    await boDashboardPage.goToSubMenu(
      page,
      boDashboardPage.designParentLink,
      boDashboardPage.themeAndLogoParentLink,
    );
    await themeAndLogoPage.closeSfToolBar(page);

    const pageTitle = await themeAndLogoPage.getPageTitle(page);
    expect(pageTitle).to.contains(themeAndLogoPage.pageTitle);
  });

  it('should go to \'Add new theme\' page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToAddNewTheme1', baseContext);

    await themeAndLogoPage.goToNewThemePage(page);

    const pageTitle = await themeImportPage.getPageTitle(page);
    expect(pageTitle).to.contains(themeImportPage.pageTitle);
  });

  describe('Import from your computer', async () => {
    it('should download theme from the web', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'downloadTheme', baseContext);

      await utilsFile.downloadFile(urlTheme, 'theme.zip');

      const found = await utilsFile.doesFileExist('theme.zip');
      expect(found).to.eq(true);
    });

    it('should import theme from your computer', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'importThemeFromComputer', baseContext);

      await themeImportPage.importFromYourComputer(page, 'theme.zip');

      const pageTitle = await themeAndLogoPage.getPageTitle(page);
      expect(pageTitle).to.contains(themeAndLogoPage.pageTitle);

      const numThemes = await themeAndLogoPage.getNumberOfThemes(page);
      expect(numThemes).to.eq(3);
    });

    it('should remove the theme classic-rocket', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'removeThemeClassicrocket1', baseContext);

      const result = await themeAndLogoPage.removeTheme(page, 'classic-rocket');
      expect(result).to.eq(themeAndLogoPage.successfulDeleteMessage);

      const numThemes = await themeAndLogoPage.getNumberOfThemes(page);
      expect(numThemes).to.eq(2);
    });
  });

  describe('Import from the web', async () => {
    it('should go to \'Add new theme\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToAddNewTheme2', baseContext);

      await themeAndLogoPage.goToNewThemePage(page);

      const pageTitle = await themeImportPage.getPageTitle(page);
      expect(pageTitle).to.contains(themeImportPage.pageTitle);
    });

    it('should import from the web the classic-rocket theme', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'importThemeFromWeb', baseContext);

      await themeImportPage.importFromWeb(page, urlTheme);

      const pageTitle = await themeAndLogoPage.getPageTitle(page);
      expect(pageTitle).to.contains(themeAndLogoPage.pageTitle);

      const numThemes = await themeAndLogoPage.getNumberOfThemes(page);
      expect(numThemes).to.eq(3);
    });

    it('should remove the theme classic-rocket', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'removeThemeClassicrocket2', baseContext);

      const result = await themeAndLogoPage.removeTheme(page, 'classic-rocket');
      expect(result).to.eq(themeAndLogoPage.successfulDeleteMessage);

      const numThemes = await themeAndLogoPage.getNumberOfThemes(page);
      expect(numThemes).to.eq(2);
    });
  });

  describe('Import from FTP', async () => {
    it('should go to \'Add new theme\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToAddNewTheme3', baseContext);

      await utilsFile.downloadFile(urlTheme, '../../themes/theme.zip');

      await themeAndLogoPage.goToNewThemePage(page);

      const pageTitle = await themeImportPage.getPageTitle(page);
      expect(pageTitle).to.contains(themeImportPage.pageTitle);
    });

    it('should import from FTP', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'importFromFTP', baseContext);

      await themeImportPage.importFromFTP(page, 'theme.zip');

      const pageTitle = await themeAndLogoPage.getPageTitle(page);
      expect(pageTitle).to.contains(themeAndLogoPage.pageTitle);

      const numThemes = await themeAndLogoPage.getNumberOfThemes(page);
      expect(numThemes).to.eq(3);
    });

    it('should remove the theme classic-rocket', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'removeThemeClassicrocket3', baseContext);

      const result = await themeAndLogoPage.removeTheme(page, 'classic-rocket');
      expect(result).to.eq(themeAndLogoPage.successfulDeleteMessage);

      const numThemes = await themeAndLogoPage.getNumberOfThemes(page);
      expect(numThemes).to.eq(2);
    });
  });
});
