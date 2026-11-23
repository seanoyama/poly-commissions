**TE6: Authentication**

We authenticate users by requiring a calpoly.edu domain and
using Supabase Auth.

- Users sign up and log in through SignupForm.tsx and
  LoginForm.tsx in our react-frontend
- LoginForm.tsx posts the user to our auth.js route in the
  express-backend
- auth.js checks credentials using Supabase Auth and
  signInWithPassword()
- supabase.js in the express-backend creates a client that
  auth.js then uses to create a token and time-limited session

**TE7: Testing**

- <u>Systems tests</u> use Vitest for comparing expected values
  and mocking db, and Supertest for request functionality.
  Systems tests focus on ensuring the system works as a whole
  and meets functional and nonfunctional requirements. At the
  moment, we chose to focus on functional requirements and
  tested our API endpoints.
  - To tun System Tests:
  - ```
    npm run test:run-backend
    ```
- <u>Unit tests</u> use Jest in both the frontend and backend
  (frontend Jest converts TypeScript to JavaScript for testing)
  - Dependencies:
    - "npm install -D vitest"
    - "npm install -D supertest"
    - "npm install --save-dev jest"
    - "npm.cmd install -D -w react-frontend jest ts-jest
      @jest/globals"
  - Run backend tests with "npm run tests:run-backend"
  - Run unit tests in both react-frontend folder and
    express-backend folder with "npm run unit-test"

- <u>End-to-End tests</u> utilize Playwright with Typescript and
  simulates the user experience, making sure frontend and
  backend elements are interacting in a functional way for a
  realistic user. Test files are located in
  `/packages/react-frontend/e2e-tests`.
  - Dependencies:
    - ```
      npm install -D @playwright/test@latest
      npx playwright install --with-deps
      ```
  - To run E2E Tests:
    - ```
      npx playwright test --ui
      ```
    - The command will open a Playwright window which will allow
      you to press the Run button to execute tests.

**Test-Driven Development (TDD) Example**

The TDD process was used in refining our date conversion function that inputs a string in ISO format, and outputs a string that is more readable. This is primarily used for displaying timestamps for individual messages in a chat.

**Red 1**: Wrote a failing test. A basic test that fails as the dateWithTime function is yet to exist in the project.

```
test("dateWithTime function", () => { 

  expect(dateWithTime("")).toBe(""); 

})
```

**Green 1**: Made basic test work; constructed the framework of the dateWithTime function that returns an empty string as expected.
```
export function dateWithTime(props: any){ 

    return ""; 

} 
```
 
**Red 2**: Wrote new failing test; specified an actual timestamp input that is more realistic than an empty string.
```
test("dateWithTime function", () => { 

  expect(dateWithTime("")).toBe(""); 
  expect(dateWithTime("2025-01-15T12:00:00Z")).toBe("01/15/2025 12:00 PM"); 

}) 
```
 
**Green 2**: Wrote a basic test that works specifically for the given input.
```
export function dateWithTime(props: any){ 
    if(props.iso_string){ 
        return "01/15/2025 12:00 PM"; 
    } 
    return ""; 
} 
```

**Red 3**: Write new failing tests using unique inputs to ensure function works not only case-by-case. Replaced previous unit tests with tests that have valid inputs and outputs for new expectations. 
```
test("dateWithTime function", () => { 

  expect(DateWithTime({ 
    iso_string: "2026-11-17 22:55:11.463782+00" 
    })) 
  .toBe("11/17/2026, 2:55 PM"); 

  expect(DateWithTime({ 
    iso_string: "2026-11-23T07:35:01.625Z" 
  }))
  .toBe("11/22/2026, 11:35 PM"); 
}) 
```
 
**Green/Blue 3**: Final working DateWithTime function. There was major refactoring since the last Red/Green cycle, as it now utilizes the ISO format and the Intl.DateTimeFormat functions. 
```
export function DateWithTime(props: any){ 

    const date = new Date(props.iso_string); 
    let formatted_date = new Intl.DateTimeFormat( 
        undefined, { 
            year: "numeric", month: "numeric",  
            day: "numeric", hour: "numeric",  
            minute: "numeric", hour12: true 
        } 
    ).format(date); 

    return formatted_date; 
}
```