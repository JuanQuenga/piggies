# Setup Guide for Piggies with WorkOS AuthKit Authentication

This guide will help you set up WorkOS AuthKit authentication for the Piggies app.

## Prerequisites

1. A WorkOS account (sign up at [workos.com](https://workos.com))
2. A Convex account and deployment

## Step 1: Create a WorkOS Application

1. Go to the [WorkOS Dashboard](https://dashboard.workos.com)
2. Create a new application
3. Activate AuthKit in your WorkOS Dashboard if you haven't already
4. In the _Overview_ section, click the _Set up User Management_ button and follow the instructions

## Step 2: Configure Redirect URIs

1. In the WorkOS Dashboard, navigate to **Redirects**
2. Add your redirect URI: `http://localhost:3000/callback` (for development)
3. Add your initiate login URL: `http://localhost:3000/login`
4. Configure your logout redirect location

## Step 3: Set Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here

# WorkOS Authentication
WORKOS_API_KEY=your_workos_api_key_here
WORKOS_CLIENT_ID=your_workos_client_id_here
WORKOS_COOKIE_PASSWORD=your_secure_cookie_password_here
NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/callback
```

### Getting the values:

1. **NEXT_PUBLIC_CONVEX_URL**: Get this from your Convex dashboard
2. **WORKOS_API_KEY**: Found in WorkOS Dashboard → API Keys
3. **WORKOS_CLIENT_ID**: Found in WorkOS Dashboard → API Keys
4. **WORKOS_COOKIE_PASSWORD**: Generate a secure password (at least 32 characters)
5. **NEXT_PUBLIC_WORKOS_REDIRECT_URI**: Your callback URL

### Generate a secure cookie password:

```bash
openssl rand -base64 32
```

## Step 4: Deploy Convex Configuration

Run the following command to sync your auth configuration to Convex:

```bash
npx convex dev
```

## Step 5: Configure Production (Optional)

If you want different WorkOS instances for development and production:

1. In the Convex Dashboard, switch to your production deployment
2. Set the production environment variables
3. Run `npx convex deploy` to update the production configuration

## Step 6: Start the Development Server

```bash
npm run dev
```

## Troubleshooting

- Make sure all environment variables are set correctly
- Ensure the redirect URIs are configured in the WorkOS dashboard
- Check that you've run `npx convex dev` after updating the auth configuration
- Verify that your WorkOS application is properly configured with the desired sign-in methods

## Next Steps

Once authentication is working, you can:

1. Customize the sign-in UI in the WorkOS Dashboard
2. Add additional authentication methods
3. Configure user management features
4. Set up webhooks for user events
