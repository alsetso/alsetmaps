# Google OAuth Setup Guide

This guide explains how to configure Google OAuth for both localhost development and production environments.

## 🔧 **Supabase Configuration**

### **1. Enable Google Provider**
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Google** provider
4. Add your Google OAuth credentials

### **2. Configure Redirect URLs**

You need to add **both** localhost and production callback URLs to your Google OAuth configuration:

#### **Localhost (Development)**
```
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
http://localhost:3002/auth/callback
```

#### **Production**
```
https://yourdomain.com/auth/callback
https://www.yourdomain.com/auth/callback
```

### **3. Google Cloud Console Setup**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Edit your OAuth 2.0 Client ID
5. Add the redirect URIs above to **Authorized redirect URIs**

## 🌍 **Environment Variables**

### **Localhost (.env.local)**
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Production (.env.production)**
```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 🔄 **How It Works**

### **1. User Flow**
```
User clicks "Sign in with Google"
↓
Redirects to Google OAuth
↓
User authenticates with Google
↓
Google redirects to /auth/callback
↓
Auth callback page processes OAuth response
↓
User redirected to dashboard
```

### **2. Environment Detection**
The system automatically detects the environment:
- **Localhost**: Uses `http://localhost:3000/auth/callback`
- **Production**: Uses `https://yourdomain.com/auth/callback`

### **3. Callback Processing**
- Extracts OAuth code from URL
- Exchanges code for session with Supabase
- Creates user profile if needed
- Redirects to dashboard

## 🚨 **Common Issues**

### **1. "Invalid redirect_uri" Error**
- Ensure all redirect URIs are added to Google Cloud Console
- Check that `NEXT_PUBLIC_APP_URL` is set correctly
- Verify Supabase redirect URL matches

### **2. "No authorization code received"**
- Check if Google is redirecting to the correct callback URL
- Verify OAuth flow is completing properly

### **3. "Session exchange error"**
- Check Supabase configuration
- Verify Google OAuth credentials are correct

## 🧪 **Testing**

### **Localhost Testing**
1. Start your dev server: `npm run dev`
2. Navigate to `/register` or `/login`
3. Click "Sign in with Google"
4. Complete OAuth flow
5. Should redirect to `/auth/callback` then `/dashboard`

### **Production Testing**
1. Deploy your application
2. Test the same flow on production domain
3. Verify environment detection works correctly

## 📱 **Mobile Considerations**

For mobile apps or PWA, you may need additional redirect URIs:
```
com.yourapp://auth/callback
```

## 🔒 **Security Notes**

- Never expose OAuth secrets in client-side code
- Use environment variables for sensitive configuration
- Implement proper CSRF protection
- Consider rate limiting for OAuth endpoints

## 📚 **Additional Resources**

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
