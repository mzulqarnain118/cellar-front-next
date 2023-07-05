import { test } from '@playwright/test'

test.describe('Checkout', () => {
  test('should place order successfully', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto('/')
    await page.getByRole('button', { name: 'Yes, I am 21 years of age or older' }).click()
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.getByLabel('Email').click()
    await page.getByLabel('Email').fill('chris@test.com')
    await page.getByLabel('Email').press('Tab')
    await page.getByLabel('Password').fill('Password1')
    await page.getByTestId('signInButton').click()
    await page.waitForURL('/')
    await page.getByRole('link', { exact: true, name: 'Wine' }).first().click()
    await page
      .locator('div')
      .getByRole('button', { exact: true, name: 'Add to Cart' })
      .first()
      .click()
    await page.getByRole('button', { name: 'Checkout' }).click()
    await page.getByTestId('cvv').click()
    await page.getByTestId('cvv').fill('123')
    await page.getByText('I have read and agree to the Terms of Use*').click()
    await page.getByRole('button', { name: 'Place my order' }).click()
    await page.getByText('Placing your order...').isVisible()
    await page.getByText('Your order has been placed successfully!').isVisible()
    await page
      .getByRole('heading', { name: 'Your Clean-Crafted™ product is on the way' })
      .isVisible()
    await context.close()
  })
})
