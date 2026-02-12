# Password reset link not going to your app

If the Supabase reset-password email sends users to the wrong page (or Supabase’s default), do both of the following.

## 1. Allow the redirect URL in Supabase

Supabase only redirects to URLs that are in the allow list.

1. Open **Supabase Dashboard** → **Authentication** → **URL Configuration**.
2. Under **Redirect URLs**, add:
   - **Production:** `https://YOUR_DOMAIN/reset-password`
   - **Local:** `http://localhost:3000/reset-password`
3. Save.

You can use wildcards if needed (e.g. `https://*.vercel.app/reset-password` for Vercel previews).

## 2. Use `{{ .RedirectTo }}` in the email template

The reset email is built from the **Reset Password** email template. If that template uses `{{ .SiteURL }}` for the link, the link will go to the Site URL instead of your `redirectTo` (e.g. `/reset-password`).

1. Open **Supabase Dashboard** → **Authentication** → **Email Templates**.
2. Select **Reset Password**.
3. In the template, make sure the reset link uses **`{{ .RedirectTo }}`** (and not `{{ .SiteURL }}`).

Example: the link should look like:

```html
<a href="{{ .ConfirmationURL }}">Reset password</a>
```

Supabase sets `ConfirmationURL` from your `redirectTo` when you call `resetPasswordForEmail(email, { redirectTo })`. If your template instead builds the URL from `{{ .SiteURL }}` and a path, change it so the link uses the confirmation URL provided by Supabase (which respects `redirectTo`).

After that, ensure **Site URL** in URL Configuration matches your app (e.g. `https://yourdomain.com` or `http://localhost:3000` for local).

## Env

- `NEXT_PUBLIC_BASE_URL` must match the environment (e.g. `https://yourdomain.com` in production, `http://localhost:3000` locally). The API uses it to build `redirectTo` for `resetPasswordForEmail`.
