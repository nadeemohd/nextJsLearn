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

```javascript

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

### Making the dashboard dynamic

By default, ´@vercel/postgres´ doesn't set its own caching semantics. This allows the framework to set its own static and dynamic behavior
You can use a Next.js API called ´unstable_noStore´ inside your Server Components or data fetching functions to opt out of static rendering.

#### Simulating a Slow Data Fetch

Making the dashboard dynamic is a good first step. However... there is still one problem we mentioned in the previous chapter. What happens if one data request is slower than all the others?
With dynamic rendering, your application is only as fast as your slowest data fetch.

## Chapter 8 - Streaming

Slow data fetches can impact the performance of your application. Let's look at how you can improve the user experience when there are slow data requests.

### What is streaming?

Streaming is a data transfer technique that allows you to break down a route into smaller "chunks" and progressively stream them from the server to the client as they become ready. By streaming, you can prevent slow data requests from blocking your whole page.

Streaming works well with React's component model, as each component can be considered a chunk.

There are two ways you implement streaming in Next.js:

1. At the page level, with the `loading.tsx` file.
2. Markup : For specific components, with `<Suspense>`.

#### Streaming a whole page with `loading.tsx`

In the `/app/dashboard` folder, create a new file called `loading.tsx`:

A few things are happening here:

1. `loading.tsx` is a special Next.js file built on top of Suspense, it allows you to create fallback UI to show as a replacement while page content loads.
2. Since <SideNav> is static, it's shown immediately. The user can interact with <SideNav> while the dynamic content is loading.
3. The user doesn't have to wait for the page to finish loading before navigating away (this is called interruptable navigation).
   Congratulations! You've just implemented streaming.

#### Fixing the loading skeleton bug with route groups

Right now, your loading skeleton will apply to the invoices and customers pages as well.

Since `loading.tsx` is a level higher than `/invoices/page.tsx` and `/customers/page.tsx` in the file system, it's also applied to those pages.

We can change this with [Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups). Create a new folder called `/(overview)` inside the dashboard folder. Then, move your `loading.tsx` and `page.tsx` files inside the folder:
Now, the `loading.tsx` file will only apply to your dashboard overview page.
Route groups allow you to organize files into logical groups without affecting the URL path structure. When you create a new folder using parentheses `()`, the name won't be included in the URL path. So `/dashboard/(overview)/page.tsx` becomes `/dashboard`.

## Chapter 9 - What is streaming?

Streaming is a data transfer technique that allows you to break down a route into smaller "chunks" and progressively stream them from the server to the client as they become ready.

Streaming works well with React's component model, as each component can be considered a chunk.

There are two ways you implement streaming in Next.js:

1. At the page level, with the `loading.tsx` file.
2. For specific components, with `<Suspense>`.

## Chapter 10 - Partial Prerendering (Optional)

### Combining Static and Dynamic Content

Currently, if you call a dynamic function inside your route (e.g. `noStore()`, `cookies()`, etc), your entire route becomes dynamic.
However, most routes are not fully static or dynamic. You may have a route that has both static and dynamic content.

### What is Partial Prerendering?

Next.js 14 contains a preview of Partial Prerendering – an experimental feature that allows you to render a route with a static loading shell, while keeping some parts dynamic. In other words, you can isolate the dynamic parts of a route. For example:
When a user visits a route:

- A static route shell is served, ensuring a fast initial load.
- The shell leaves holes where dynamic content will load in asynchronous.
- The async holes are streamed in parallel, reducing the overall load time of the page.
  This approach allows for faster rendering of certain parts.

## Chapter 11 - Adding Search and Pagination

When a user searches for an invoice on the client, the URL params will be updated, data will be fetched on the server, and the table will re-render on the server with the new data.

### Why use URL search params?

We will be using URL search params to manage the search state. This pattern may be new if you're used to doing it with client side state.
There are a couple of benefits of implementing search with URL params:

- **Bookmarkable and Shareable URLs:** Since the search parameters are in the URL, users can bookmark the current state of the application, including their search queries and filters, for future reference or sharing.
- **Server-Side Rendering and Initial Load:** URL parameters can be directly consumed on the server to render the initial state, making it easier to handle server rendering.
- **Analytics and Tracking:** Having search queries and filters directly in the URL makes it easier to track user behavior without requiring additional client-side logic.

### Adding the search functionality

These are the Next.js client hooks that you'll use to implement the search functionality:

- `useSearchParams`- Allows you to access the parameters of the current URL. For example, the search params for this URL `/dashboard/invoices?page=1&query=pending` would look like this: `{page: '1', query: 'pending'}`.
- `usePathname` - Lets you read the current URL's pathname. For example, for the route `/dashboard/invoices`, `usePathname` would return `'/dashboard/invoices'`.
- `useRouter` - Enables navigation between routes within client components programmatically. There are [multiple methods](https://nextjs.org/docs/app/api-reference/functions/use-router#userouter) you can use.

Here's a quick overview of the implementation steps:

1. Capture the user's input.
2. Update the URL with the search params.
3. Keep the URL in sync with the input field.
4. Update the table to reflect the search query.

##### 1. Capture the user's input

Go into the `<Search>` Component (`/app/ui/search.tsx`), and you'll notice:

- `"use client"` - This is a Client Component, which means you can use event listeners and hooks.
- `<input>` - This is the search input.

Create a new `handleSearch` function, and add an `onChange` listener to the `<input>` element. `onChange` will invoke `handleSearch` whenever the input value changes.
The URL is updated without reloading the page, thanks to Next.js's client-side navigation (which you learned about in the chapter on navigating between pages.

#### Best practice: Debouncing

**Debouncing** is a programming practice that limits the rate at which a function can fire. In our case, you only want to query the database when the user has stopped typing.

##### How Debouncing Works:

1. **Trigger Event:** When an event that should be debounced (like a keystroke in the search box) occurs, a timer starts.
2. **Wait:** If a new event occurs before the timer expires, the timer is reset.
3. **Execution:** If the timer reaches the end of its countdown, the debounced function is executed.
   You can implement debouncing in a few ways, including manually creating your own debounce function. To keep things simple, we'll use a library called [use-debounce](https://www.npmjs.com/package/use-debounce).
   Install `use-debounce`:

```bash
npm i use-debounce
```

## Chapter 12 - Mutating Data

### What are Server Actions?

React Server Actions allow you to run asynchronous code directly on the server. They eliminate the need to create API endpoints to mutate your data. Instead, you write asynchronous functions that execute on the server and can be invoked from your Client or Server Components.

Security is a top priority for web applications, as they can be vulnerable to various threats. This is where Server Actions come in. They offer an effective security solution, protecting against different types of attacks, securing your data, and ensuring authorized access. Server Actions achieve this through techniques like POST requests, encrypted closures, strict input checks, error message hashing, and host restrictions, all working together to significantly enhance your app's safety.

### Using forms with Server Actions

In React, you can use the `action` attribute in the `<form>` element to invoke actions. The action will automatically receive the native [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) object, containing the captured data.

```Javascript
// Server Component
export default function Page() {
  // Action
  async function create(formData: FormData) {
    'use server';

    // Logic to mutate data...
  }

  // Invoke the action using the "action" attribute
  return <form action={create}>...</form>;
}
```
An advantage of invoking a Server Action within a Server Component is progressive enhancement - forms work even if JavaScript is disabled on the client.

### Next.js with Server Actions
Server Actions are also deeply integrated with Next.js [caching](https://nextjs.org/docs/app/building-your-application/caching). When a form is submitted through a Server Action, not only can you use the action to mutate data, but you can also revalidate the associated cache using APIs like `revalidatePath` and `revalidateTag`.

Next.js has a [Client-side Router Cache](https://nextjs.org/docs/app/building-your-application/caching#router-cache) that stores the route segments in the user's browser for a time. Along with [prefetching](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#1-prefetching), this cache ensures that users can quickly navigate between routes while reducing the number of requests made to the server.

#### Dynamic Routes
When you don't know the exact segment names ahead of time and want to create routes from dynamic data, you can use Dynamic Segments that are filled in at request time or [prerendered](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes#generating-static-params) at build time.

## Chapter 13 - Handling Errors

### Adding try/catch to Server Actions
Seeing these errors are helpful while developing as you can catch any potential problems early. However, you also want to show errors to the user to avoid an abrupt failure and allow your application to continue running.

This is where Next.js [error.tsx](https://nextjs.org/docs/app/api-reference/file-conventions/error) file comes in.

### Handling all errors with `error.tsx`
The `error.tsx` file can be used to define a UI boundary for a route segment. It serves as a **catch-all** for unexpected errors and allows you to display a fallback UI to your users.

There are a few things you'll notice after implementing the errror.tsx error to your project:

- **"use client"** - `error.tsx` needs to be a Client Component.
- It accepts two props:
  - `error`: This object is an instance of JavaScript's native [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) object.
  - `reset`: This is a function to reset the error boundary. When executed, the function will try to re-render the route segment.

### Handling 404 errors with the `notFound` function
Another way you can handle errors gracefully is by using the `notFound` function. While `error.tsx` is useful for catching **all** errors,  notFound` can be used when you try to fetch a resource that doesn't exist.

Use a fake UUID that doesn't exist in your database.
You'll immediately see `error.tsx` kicks in because this is a child route of `/invoices` where `error.tsx` is defined.

However, if you want to be more specific, you can show a 404 error to tell the user the resource they're trying to access hasn't been found.

You can confirm that the resource hasn't been found by going into your `fetchInvoiceById` function in `data.ts`, and console logging the returned `invoice`:
>**Note**: `notFound` will take precedence over `error.tsx`,so you can reach out for it when you want to handle more specific errors!

### Further reading
To learn more about error handling in Next.js, check out the following documentation:

- [Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [`error.js` API Reference](https://nextjs.org/docs/app/api-reference/file-conventions/error)
- [`notFound()` API Reference](https://nextjs.org/docs/app/api-reference/functions/not-found)
- [`not-found.js` API Reference](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)