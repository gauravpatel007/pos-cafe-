# 🚀 Deployment Guide — Cafe POS Management System

This guide outlines the step-by-step process to deploy your **Point of Sale (POS) Cafe Management System** to production. Since the application is built with **Next.js** (Frontend & API) and **PostgreSQL** (Database), the most modern, robust, and cost-effective stack for deployment is:

*   **Database:** [Neon](https://neon.tech/) (Serverless PostgreSQL with a generous free tier)
*   **Web Hosting & Serverless APIs:** [Vercel](https://vercel.com/) (Created by the makers of Next.js, automatically builds and deploys from GitHub)

---

## 🎨 Overview of Deployment Workflow

```mermaid
graph TD
    A[Local Codebase] -->|1. Push to GitHub| B(GitHub Repository)
    B -->|4. Auto-Deploy| C(Vercel Production App)
    D[Neon Cloud Postgres] -->|2. Run schema.sql| E[(Production DB)]
    E -->|3. Seed Products| E
    C -->|5. Connect via Environment Variables| E
```

---

## 📍 Step 1: Set Up Your Cloud Database (Neon Postgres)

We recommend **Neon** because it provides a serverless PostgreSQL database that scales down to zero when not in use, making it free and perfect for Next.js.

1.  **Sign Up / Sign In:** Go to [Neon.tech](https://neon.tech/) and sign up for a free account.
2.  **Create a New Project:**
    *   **Project Name:** `pos-cafe`
    *   **Database Name:** `odoo_pos_cafe` (or use the default `neondb`)
    *   **Region:** Select the region closest to your Vercel deployment (e.g., *US East* or *Frankfurt*).
3.  **Get Your Connection String:**
    *   Once the project is created, you will see a connection string in your Neon dashboard (looks like `postgresql://neondb_owner:password@ep-host-name.pooler.neon.tech/neondb?sslmode=require`).
    *   Copy this **Connection String**! This is your **`DATABASE_URL`**.

---

## 📍 Step 2: Initialize Database Schema

Now we need to create the database tables in your cloud database using the `schema.sql` file.

1.  In your **Neon Dashboard**, click on **SQL Editor** in the left sidebar.
2.  Open the [schema.sql](file:///g:/cafe-odoo%28anti%29/new2/schema.sql) file in your codebase, copy its entire contents.
3.  Paste the SQL commands into the Neon **SQL Editor**.
4.  Click **Run** to execute the queries.
5.  *Verify:* Click on **Tables** in the Neon sidebar to confirm that the tables (`products`, `categories`, `orders`, `users`, etc.) have been successfully created.

---

## 📍 Step 3: Seed Initial Data (Products & Categories)

Now let's populate your production database with your customized Indian Cafe menu items using the improved `reseed-products.js` script.

Open your local terminal (PowerShell, Command Prompt, or Git Bash) inside the project directory and run the seed script pointing to your cloud database.

### For Windows (PowerShell)
```powershell
$env:DATABASE_URL="your_copied_neon_connection_string_here"
node frontend/reseed-products.js
```

### For macOS / Linux / Git Bash
```bash
DATABASE_URL="your_copied_neon_connection_string_here" node frontend/reseed-products.js
```

---

## 📍 Step 4: Deploy Next.js App to Vercel

Vercel will build your Next.js application, optimize the bundle, and host your serverless API endpoints.

1.  **Commit and Push Code:**
    Ensure all your latest changes are pushed to your GitHub repository:
    ```bash
    git add .
    git commit -m "Configure deployment and database-url pooling"
    git push origin main
    ```
2.  **Import to Vercel:**
    *   Go to [Vercel](https://vercel.com/) and log in with your GitHub account.
    *   Click **Add New** > **Project**.
    *   Find your repository `pos-cafe-` and click **Import**.
3.  **Configure Project Settings:**
    > [!IMPORTANT]
    > **Root Directory:** Since your Next.js app is inside the `frontend` folder, you **MUST** click the **Edit** button next to *Root Directory* and select/type **`frontend`**.
4.  **Environment Variables:**
    Expand the **Environment Variables** section and add the following two keys:
    *   `DATABASE_URL` ➡️ *Paste your Neon Connection String*
    *   `PAYMENT_APIKEY` ➡️ *Paste your Stripe secret key* (e.g. `rk_test_...` or your production Stripe key)
5.  **Click Deploy! 🚀**
    *   Vercel will automatically build the Next.js site.
    *   Once finished, you will get a **Live URL** (e.g., `https://pos-cafe-nine.vercel.app`)!

---

## 🛡️ Production Best Practices & Verification

### 1. Security Check
*   Ensure that your Vercel URL is running on HTTPS (Vercel manages SSL certificates automatically).
*   Keep your `PAYMENT_APIKEY` secret and never commit it directly to GitHub.

### 2. Stripe Payment Redirects
The Stripe checkout session code in this app is fully dynamic:
```typescript
success_url: `${req.nextUrl.origin}/pos/order?payment=success&session_id={CHECKOUT_SESSION_ID}`
```
This means it automatically detects whether it's running on `localhost` or your Vercel domain, and redirects back to the correct website automatically! No config changes required.

### 3. Continuous Integration
Whenever you push new changes to your GitHub repository `https://github.com/gauravpatel007/pos-cafe-.git`, Vercel will automatically trigger a new deployment, build your code, test it, and update the live website with zero downtime!

---

💡 *If you run into any issues during deployment, let me know and I will help you debug immediately!*
