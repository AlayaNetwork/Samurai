const assert = require('assert')
const webdriver = require('selenium-webdriver')

const { By, Key, until } = webdriver
const {
  regularDelayMs,
  largeDelayMs,
} = require('./helpers')
const { buildWebDriver } = require('./webdriver')
const Ganache = require('./ganache')
const enLocaleMessages = require('../../app/_locales/en/messages.json')

const ganacheServer = new Ganache()

describe('Using MetaMask with an existing account', function () {
  let driver

  const testSeedPhrase = 'forum vessel pink push lonely enact gentle tail admit parrot grunt dress'
  const testAddress = '0x0Cc5261AB8cE458dc977078A3623E2BaDD27afD3'
  const testPrivateKey2 = '14abe6f4aab7f9f626fe981c864d0adeb5685f289ac9270c27b8fd790b4235d6'
  const testPrivateKey3 = 'F4EC2590A0C10DE95FBF4547845178910E40F5035320C516A18C117DE02B5669'

  this.timeout(0)
  this.bail(true)

  before(async function () {
    await ganacheServer.start({
      accounts: [
        {
          secretKey: '0x53CB0AB5226EEBF4D872113D98332C1555DC304443BEE1CF759D15798D3C55A9',
          balance: 25000000000000000000,
        },
      ],
    })
    const result = await buildWebDriver()
    driver = result.driver
  })

  afterEach(async function () {
    if (process.env.SELENIUM_BROWSER === 'chrome') {
      const errors = await driver.checkBrowserForConsoleErrors(driver)
      if (errors.length) {
        const errorReports = errors.map((err) => err.message)
        const errorMessage = `Errors found in browser console:\n${errorReports.join('\n')}`
        console.error(new Error(errorMessage))
      }
    }
    if (this.currentTest.state === 'failed') {
      await driver.verboseReportOnFailure(this.currentTest.title)
    }
  })

  after(async function () {
    await ganacheServer.quit()
    await driver.quit()
  })

  describe('First time flow starting from an existing seed phrase', function () {
    it('clicks the continue button on the welcome screen', async function () {
      await driver.findElement(By.css('.welcome-page__header'))
      await driver.clickElement(By.xpath(`//button[contains(text(), '${enLocaleMessages.getStarted.message}')]`))
      await driver.delay(largeDelayMs)
    })

    it('clicks the "Import Wallet" option', async function () {
      await driver.clickElement(By.xpath(`//button[contains(text(), 'Import wallet')]`))
      await driver.delay(largeDelayMs)
    })

    it('clicks the "No thanks" option on the metametrics opt-in screen', async function () {
      await driver.clickElement(By.css('.btn-default'))
      await driver.delay(largeDelayMs)
    })

    it('imports a seed phrase', async function () {
      const [seedTextArea] = await driver.findElements(By.css('input[placeholder="Paste seed phrase from clipboard"]'))
      await seedTextArea.sendKeys(testSeedPhrase)
      await driver.delay(regularDelayMs)

      const [password] = await driver.findElements(By.id('password'))
      await password.sendKeys('correct horse battery staple')
      const [confirmPassword] = await driver.findElements(By.id('confirm-password'))
      confirmPassword.sendKeys('correct horse battery staple')

      await driver.clickElement(By.css('.first-time-flow__terms'))

      await driver.clickElement(By.xpath(`//button[contains(text(), 'Import')]`))
      await driver.delay(regularDelayMs)
    })

    it('clicks through the success screen', async function () {
      await driver.findElement(By.xpath(`//div[contains(text(), 'Congratulations')]`))
      await driver.clickElement(By.xpath(`//button[contains(text(), '${enLocaleMessages.endOfFlowMessage10.message}')]`))
      await driver.delay(regularDelayMs)
    })
  })

  describe('Show account information', function () {
    it('shows the correct account address', async function () {
      await driver.clickElement(By.css('[data-testid="account-options-menu-button"]'))
      await driver.clickElement(By.css('[data-testid="account-options-menu__account-details"]'))
      await driver.findVisibleElement(By.css('.qr-wrapper'))
      await driver.delay(regularDelayMs)

      const [address] = await driver.findElements(By.css('input.qr-ellip-address'))
      assert.equal(await address.getAttribute('value'), testAddress)

      await driver.clickElement(By.css('.account-modal-close'))
      await driver.delay(largeDelayMs)
    })

    it('shows a QR code for the account', async function () {
      await driver.clickElement(By.css('[data-testid="account-options-menu-button"]'))
      await driver.clickElement(By.css('[data-testid="account-options-menu__account-details"]'))
      await driver.findVisibleElement(By.css('.qr-wrapper'))
      const detailModal = await driver.findElement(By.css('span .modal'))
      await driver.delay(regularDelayMs)

      await driver.clickElement(By.css('.account-modal-close'))
      await driver.wait(until.stalenessOf(detailModal))
      await driver.delay(regularDelayMs)
    })
  })

  describe('Lock and unlock', function () {
    it('logs out of the account', async function () {
      await driver.clickElement(By.css('.account-menu__icon .identicon'))
      await driver.delay(regularDelayMs)

      const lockButton = await driver.findClickableElement(By.css('.account-menu__lock-button'))
      assert.equal(await lockButton.getText(), 'Lock')
      await lockButton.click()
      await driver.delay(regularDelayMs)
    })

    it('accepts the account password after lock', async function () {
      const passwordField = await driver.findElement(By.id('password'))
      await passwordField.sendKeys('correct horse battery staple')
      await passwordField.sendKeys(Key.ENTER)
      await driver.delay(largeDelayMs)
    })
  })

  describe('Add an account', function () {
    it('switches to localhost', async function () {
      await driver.clickElement(By.css('.network-name'))
      await driver.delay(regularDelayMs)

      await driver.clickElement(By.xpath(`//span[contains(text(), 'Localhost')]`))
      await driver.delay(largeDelayMs)
    })

    it('choose Create Account from the account menu', async function () {
      await driver.clickElement(By.css('.account-menu__icon'))
      await driver.delay(regularDelayMs)

      await driver.clickElement(By.xpath(`//div[contains(text(), 'Create Account')]`))
      await driver.delay(regularDelayMs)
    })

    it('set account name', async function () {
      const [accountName] = await driver.findElements(By.css('.new-account-create-form input'))
      await accountName.sendKeys('2nd account')
      await driver.delay(regularDelayMs)

      await driver.clickElement(By.xpath(`//button[contains(text(), 'Create')]`))
      await driver.delay(regularDelayMs)
    })

    it('should show the correct account name', async function () {
      const accountName = await driver.findElement(By.css('.selected-account__name'))
      assert.equal(await accountName.getText(), '2nd account')
      await driver.delay(regularDelayMs)
    })
  })

  describe('Switch back to original account', function () {
    it('chooses the original account from the account menu', async function () {
      await driver.clickElement(By.css('.account-menu__icon'))
      await driver.delay(regularDelayMs)

      await driver.clickElement(By.css('.account-menu__name'))
      await driver.delay(regularDelayMs)
    })
  })

  describe('Send ETH from inside MetaMask', function () {
    it('starts a send transaction', async function () {
      await driver.clickElement(By.xpath(`//button[contains(text(), 'Send')]`))
      await driver.delay(regularDelayMs)

      const inputAddress = await driver.findElement(By.css('input[placeholder="Search, public address (0x), or ENS"]'))
      await inputAddress.sendKeys('0x2f318C334780961FB129D2a6c30D0763d9a5C970')

      const inputAmount = await driver.findElement(By.css('.unit-input__input'))
      await inputAmount.sendKeys('1')

      // Set the gas limit
      await driver.clickElement(By.css('.advanced-gas-options-btn'))
      await driver.delay(regularDelayMs)

      const gasModal = await driver.findElement(By.css('span .modal'))
      await driver.clickElement(By.xpath(`//button[contains(text(), 'Save')]`))
      await driver.wait(until.stalenessOf(gasModal))
      await driver.delay(regularDelayMs)

      // Continue to next screen
      await driver.clickElement(By.xpath(`//button[contains(text(), 'Next')]`))
      await driver.delay(regularDelayMs)
    })

    it('confirms the transaction', async function () {
      await driver.clickElement(By.xpath(`//button[contains(text(), 'Confirm')]`))
      await driver.delay(regularDelayMs)
    })

    it('finds the transaction in the transactions list', async function () {
      await driver.clickElement(By.css('[data-testid="home__activity-tab"]'))
      await driver.wait(async () => {
        const confirmedTxes = await driver.findElements(By.css('.transaction-list__completed-transactions .transaction-list-item'))
        return confirmedTxes.length === 1
      }, 10000)

      const txValues = await driver.findElements(By.css('.transaction-list-item__primary-currency'))
      assert.equal(txValues.length, 1)
      assert.ok(/-1\s*ETH/.test(await txValues[0].getText()))
    })
  })

  describe('Imports an account with private key', function () {
    it('choose Create Account from the account menu', async function () {
      await driver.clickElement(By.css('.account-menu__icon'))
      await driver.delay(regularDelayMs)

      await driver.clickElement(By.xpath(`//div[contains(text(), 'Import Account')]`))
      await driver.delay(regularDelayMs)
    })

    it('enter private key', async function () {
      const privateKeyInput = await driver.findElement(By.css('#private-key-box'))
      await privateKeyInput.sendKeys(testPrivateKey2)
      await driver.delay(regularDelayMs)
      await driver.clickElement(By.xpath(`//button[contains(text(), 'Import')]`))
      await driver.delay(regularDelayMs)
    })

    it('should show the correct account name', async function () {
      const accountName = await driver.findElement(By.css('.selected-account__name'))
      assert.equal(await accountName.getText(), 'Account 4')
      await driver.delay(regularDelayMs)
    })

    it('should show the imported label', async function () {
      await driver.clickElement(By.css('.account-menu__icon'))

      // confirm 4th account is account 4, as expected
      const accountMenuItemSelector = '.account-menu__account:nth-child(4)'
      const accountName = await driver.findElement(By.css(`${accountMenuItemSelector} .account-menu__name`))
      assert.equal(await accountName.getText(), 'Account 4')
      // confirm label is present on the same menu item
      const importedLabel = await driver.findElement(By.css(`${accountMenuItemSelector} .keyring-label`))
      assert.equal(await importedLabel.getText(), 'IMPORTED')
    })
  })

  describe('Imports and removes an account', function () {
    it('choose Create Account from the account menu', async function () {
      await driver.clickElement(By.xpath(`//div[contains(text(), 'Import Account')]`))
      await driver.delay(regularDelayMs)
    })

    it('enter private key', async function () {
      const privateKeyInput = await driver.findElement(By.css('#private-key-box'))
      await privateKeyInput.sendKeys(testPrivateKey3)
      await driver.delay(regularDelayMs)
      await driver.clickElement(By.xpath(`//button[contains(text(), 'Import')]`))
      await driver.delay(regularDelayMs)
    })

    it('should see new account in account menu', async function () {
      const accountName = await driver.findElement(By.css('.selected-account__name'))
      assert.equal(await accountName.getText(), 'Account 5')
      await driver.delay(regularDelayMs)

      await driver.clickElement(By.css('.account-menu__icon'))
      await driver.delay(regularDelayMs)

      const accountListItems = await driver.findElements(By.css('.account-menu__account'))
      assert.equal(accountListItems.length, 5)

      await driver.clickPoint(By.css('.account-menu__icon'), 0, 0)
    })

    it('should open the remove account modal', async function () {
      await driver.clickElement(By.css('[data-testid="account-options-menu-button"]'))

      await driver.clickElement(By.css('[data-testid="account-options-menu__remove-account"]'))

      await driver.findElement(By.css('.confirm-remove-account__account'))
    })

    it('should remove the account', async function () {
      await driver.clickElement(By.xpath(`//button[contains(text(), 'Remove')]`))

      await driver.delay(regularDelayMs)

      const accountName = await driver.findElement(By.css('.selected-account__name'))
      assert.equal(await accountName.getText(), 'Account 1')
      await driver.delay(regularDelayMs)

      await driver.clickElement(By.css('.account-menu__icon'))

      const accountListItems = await driver.findElements(By.css('.account-menu__account'))
      assert.equal(accountListItems.length, 4)
    })
  })

  describe('Connects to a Hardware wallet', function () {
    it('choose Connect Hardware Wallet from the account menu', async function () {
      await driver.clickElement(By.xpath(`//div[contains(text(), 'Connect Hardware Wallet')]`))
      await driver.delay(regularDelayMs)
    })

    it('should open the TREZOR Connect popup', async function () {
      await driver.clickElement(By.css('.hw-connect__btn:nth-of-type(2)'))
      await driver.delay(regularDelayMs)
      await driver.clickElement(By.xpath(`//button[contains(text(), 'Connect')]`))
      await driver.delay(regularDelayMs)
      const allWindows = await driver.getAllWindowHandles()
      assert.equal(allWindows.length, 2)
    })
  })
})
