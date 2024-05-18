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

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    /**Tip: If you're working with forms that have many fields,
     * you may want to consider using the entries() method 
     * with JavaScript's Object.fromEntries(). For example:
     * const rawFormData = Object.fromEntries(formData.entries())
    */
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
    
    const amountInCents = amount * 100;
    
    // New date with the format "YYYY-MM-DD" 
    const date = new Date().toISOString().split('T')[0];
    
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;
    
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

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, 
        amount = ${amountInCents}, 
        status = ${status}
    WHERE id = ${id}`;
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  
  revalidatePath('/dashboard/invoices');
}