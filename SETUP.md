
# AI Driver Alert System - Setup Guide

## Environment Variables

Create a `.env.local` file in your project root with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# n8n Webhook (for notifications)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/notify

# Optional: For production
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Run the SQL migration script in `supabase-schema.sql` in your Supabase SQL editor
3. Enable Authentication (Email/Password)
4. Copy your project URL and anon key to the environment variables

## n8n Webhook Setup

1. Create an n8n workflow with a webhook trigger
2. Add WhatsApp/Twilio integration nodes
3. Configure the webhook URL in your environment variables

## Testing the Demo

1. Visit `http://localhost:3000/?token=demo` to test the scan page
2. Use the sticker generator to create new QR codes
3. Test the driver dashboard with mock data

## Production Deployment

1. Set up proper authentication
2. Configure real WhatsApp Business API credentials
3. Set up n8n automation workflows
4. Enable RLS policies and proper security
