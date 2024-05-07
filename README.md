## Next.js App Router Course - Starter

This is the starter template for the Next.js App Router Course. It contains the starting code for the dashboard application.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

## Chapter 6

### Database Creation

#### Create a Vercel account

- https://vercel.com/signup

- Create a Postgres database
- Once connected, navigate to the `.env.local` tab, click <b>Show secret</b> and <b>Copy Snippet</b>. Make sure you reveal the secrets before copying them
- Navigate to your code editor and rename the .env.example file to .env. Paste in the copied contents from Vercel.

<strong>Important:</strong> Go to your `.gitignore` file and make sure `.env` is in the ignored files to prevent your database secrets from being exposed when you push to GitHub.

Finally, run in your terminal to install the Vercel Postgres SDK.

```bash
npm i @vercel/postgres
```

#### Seed your database

Now let's seed it with some initial data. This will allow you to have some data to work with as you build the dashboard.

In the `/scripts` folder of your project, there's a file called `seed.js`. This script contains the instructions for creating and seeding the `invoices`, `customers`, `user`, `revenue` tables.

The script uses SQL to create the tables, and the data from `placeholder-data.js` file to populate them after they've been created.

Next, in your `package.json` file, add the following line to your scripts section:

```bash

  "seed": "node -r dotenv/config ./scripts/seed.js"
```

This is the command that will execute `seed.js`.
Now, run `npm run seed`. You should see some `console.log` messages in your terminal to let you know the script is running.
If you run into any issues while seeding your database and want to run the script again, you can drop any existing tables by running `DROP TABLE tablename` in your database query interface.

## Chapter 7 - Fetching Data

### API layer

APIs are an intermediary layer between your application code and database.
In Next.js, you can create API endpoints using [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers).

#### Using Server Components to fetch data

React Server Components (fetching data on the server)
By default, Next.js applications use React Server Components. Fetching data with Server Components is a relatively new approach and there are a few benefits of using them:

- Server Components support promises, providing a simpler solution for asynchronous tasks like data fetching. You can use async/await syntax without reaching out for useEffect, useState or data fetching libraries.
- Server Components execute on the server, so you can keep expensive data fetches and logic on the server and only send the result to the client.
- As mentioned before, since Server Components execute on the server, you can query the database directly without an additional API layer.

#### Using SQL

For your dashboard project, you'll write database queries using the [Vercel Postgres SDK](https://vercel.com/docs/storage/vercel-postgres/sdk) and SQL.
Go to `/app/lib/data.ts`, here you'll see that we're importing the [sql](https://vercel.com/docs/storage/vercel-postgres/sdk#sql) function from `@vercel/postgres`.
You can call `sql` inside any Server Component. But to allow you to navigate the components more easily, we've kept all the data queries in the `data.ts` file, and you can import them into the components.

#### Parallel data fetching

A common way to avoid waterfalls is to initiate all data requests at the same time - in parallel.

In JavaScript, you can use the [Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) or [Promise.allSettled()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled) functions to initiate all promises at the same time. For example, in `data.ts`, we're using `Promise.all()` in the `fetchCardData()` function:

By using this pattern, you can:

- Start executing all data fetches at the same time, which can lead to performance gains.
- Use a native JavaScript pattern that can be applied to any library or framework.

However, there is one disadvantage of relying only on this JavaScript pattern: what happens if one data request is slower than all the others?

## Chapter 8 - Static and Dynamic Rendering
