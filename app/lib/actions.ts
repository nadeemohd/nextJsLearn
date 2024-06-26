/**All the exported functions within 
 * the file are marked as server functions.
 * 
 * These server functions can then be imported 
 * into Client and Server components,
 * making them extremely versatile.
 * 
 * You can also write Server Actions directly 
 * inside Server Components by adding "use server" inside the action.
 * 
 * Let's keep them all organized in a separate file.
 */
'use server';

import { z } from 'zod'; // validation library
import { sql } from '@vercel/postgres';
/**Since you're updating the data displayed in
 * the invoices route, you want to clear this 
 * cache and trigger a new request to the server */
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

// This is temporary until @types/react-dom is updated
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const CreateInvoice = FormSchema.omit({ id: true, date: true });

/**prevState - contains the state passed from the useFormState hook.
 * You won't be using it in the action in this example,
 * but it's a required prop. */
export async function createInvoice(prevState: State, formData: FormData) {
  /**Tip: If you're working with forms that have many fields,
   * you may want to consider using the entries() method 
   * with JavaScript's Object.fromEntries(). For example:
   * const rawFormData = Object.fromEntries(formData.entries())
  */
  // safeParse() will return an object containing 
  // either a success or error field.
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
    
  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;
    
  // New date with the format "YYYY-MM-DD" 
  const date = new Date().toISOString().split('T')[0];
    
  try {
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  /** /dashboard/invoices path will be revalidated
   * and fresh data will be fetched from the server.*/
  revalidatePath('/dashboard/invoices');

    
  redirect('/dashboard/invoices');
  // Test it out:
    
  console.log(
    `@customerId: ${customerId}, \namount: ${amount}, \nstatus: ${status}`);
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, 
        amount = ${amountInCents}, 
        status = ${status}
    WHERE id = ${id}`;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  
  throw new Error('Failed to Delete Invoice');

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}