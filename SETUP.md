# Setup Guide for Piggies with Clerk Authentication

This guide will help you set up Clerk authentication for the Piggies app.

## Prerequisites

1. A Clerk account (sign up at [clerk.com](https://clerk.com))
2. A Convex account and deployment

## Step 1: Create a Clerk Application

1. Go to the [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Choose your preferred sign-in methods (email, social providers, etc.)

## Step 2: Configure JWT Template

1. In the Clerk Dashboard, navigate to **JWT Templates**
2. Click **New template** and select **Convex**
3. **Important**: Do NOT rename the JWT token. It must be called `convex`
4. Copy the **Issuer URL** (your Clerk Frontend API URL)

## Step 3: Set Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_FRONTEND_API_URL=your_clerk_frontend_api_url_here
```

### Getting the values:

1. **NEXT_PUBLIC_CONVEX_URL**: Get this from your Convex dashboard
2. **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**: Found in Clerk Dashboard → API Keys → Quick Copy section
3. **CLERK_FRONTEND_API_URL**: This is the Issuer URL you copied in Step 2

## Step 4: Deploy Convex Configuration

Run the following command to sync your auth configuration to Convex:

```bash
npx convex dev
```

## Step 5: Configure Production (Optional)

If you want different Clerk instances for development and production:

1. In the Convex Dashboard, switch to your production deployment
2. Set the production environment variables
3. Run `npx convex deploy` to update the production configuration

## Step 6: Start the Development Server

```bash
npm run dev
```

## Troubleshooting

- Make sure all environment variables are set correctly
- Ensure the JWT template is named exactly `convex`
- Check that you've run `npx convex dev` after updating the auth configuration
- Verify that your Clerk application is properly configured with the desired sign-in methods

## Next Steps

Once authentication is working, you can:

1. Customize the sign-in UI in the Clerk Dashboard
2. Add additional authentication methods
3. Configure user management features
4. Set up webhooks for user events
