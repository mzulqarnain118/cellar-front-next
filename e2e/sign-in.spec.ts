import { test } from '@playwright/test'

test.describe('Sign in', () => {
  test('should sign in', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto('http://localhost:3000/')
    await page.getByRole('button', { name: 'Yes, I am 21 years of age or older' }).click()
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.getByLabel('Email').click()
    await page.getByLabel('Email').fill('chris@test.com')
    await page.getByLabel('Email').press('Tab')
    await page.getByLabel('Password').fill('Password1')
    await page.getByTestId('signInButton').click()
    await page.waitForURL('http://localhost:3000/')
    await context.close()
  })

  test('should show error message if incorrect password', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto('http://localhost:3000/')
    await page.getByRole('button', { name: 'Yes, I am 21 years of age or older' }).click()
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.getByLabel('Email').click()
    await page.getByLabel('Email').fill('chris@test.com')
    await page.getByLabel('Email').press('Tab')
    await page.getByLabel('Password').fill('Password123')
    await page.getByTestId('signInButton').click()
    await page.getByText('Invalid email or password.').isVisible()
    await context.close()
  })
})
