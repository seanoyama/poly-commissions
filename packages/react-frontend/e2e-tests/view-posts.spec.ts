import { test, expect } from '@playwright/test';
// import {API_URL, react_url} from "../src/constants";

test('check posts heading', async ({ page }) => {
  await page.goto(`localhost:5173/posts`);

  // expect heading to have "Posts"
  await expect(page.getByRole('heading', { name: 'Posts' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Create a listing' })).toBeVisible();
});

test('messages link', async ({ page }) => {
  await page.goto(`localhost:5173/`);

  await page.getByRole('link', { name: 'Messages' }).click();

  await expect(page.getByRole('heading', { name: 'Messages' })).toBeVisible();
});

test('login and profile page', async ({page})=> {
  
  // navigate to login page
  await page.goto('localhost:5173/login')

  //fill email and password with usertest credentials
  await page.getByLabel('Email').fill('usertest@calpoly.edu');
  await page.getByLabel('Password').fill('usertest');
  // submit credentials
  await page.getByRole('button', { name: 'Log in' }).click();

  // switch to posts page to refresh page
  await page.goto('localhost:5173/posts');
  // navigate to personalized profile page
  await page.getByRole('link', { name: 'Profile' }).click();

  // expect profile page to display name
  await expect(page.getByRole('heading', { name: 'Name: usertest' })).toBeVisible();

})

test('usertest chat with Test User', async ({page})=>{
  // 
  //NOTE: login sequence is identical to test "login and profile page"
  // 
  // navigate to login page
  await page.goto('localhost:5173/login')
  await page.getByLabel('Email').fill('usertest@calpoly.edu');
  await page.getByLabel('Password').fill('usertest');
  await page.getByRole('button', { name: 'Log in' }).click();

  // refresh page by navigating to posts
  await page.goto('localhost:5173/posts')

  // check if usertest already has messages with Test User
  await page.goto('localhost:5173/messages')

  await expect(page.getByRole('link', {name: 'Chat with Test User and usertest'}).first()).toBeVisible();

    // // navigate into the chat
    // await page.getByRole('link', { name: 'Chat with usertest and Test User' }).click();

    // // type in message form and send with button
    // await page.getByLabel('Message').fill("usertest's message");
    // await page.getByRole('button', { name: 'Send' }).click();

    // await expect(page.getByText("usertest's message")).toBeVisible();

})