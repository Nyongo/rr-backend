# Koyeb Deployment Guide

This guide covers deploying the NestJS application to Koyeb.

## Prerequisites

1. A Koyeb account
2. Your application pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. A PostgreSQL database (can use Koyeb's managed database or external)

## Environment Variables

Set these in your Koyeb app settings:

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=your-jwt-secret-key-here

# Node Environment
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
```

### Optional Variables

```bash
# Email Service (if using)
POSTMARK_API_KEY=your-postmark-key
EMAIL_FROM=noreply@yourdomain.com

# Google Services (if using)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Deployment Steps

### 1. Connect Repository

1. Go to your Koyeb dashboard
2. Click "Create App"
3. Select your Git provider and repository
4. Choose the branch (usually `main` or `master`)

### 2. Configure Build Settings

Koyeb will automatically detect the Dockerfile. Ensure:

- **Build Command**: (leave empty, Docker handles it)
- **Run Command**: (leave empty, Docker CMD handles it)
- **Dockerfile Path**: `Dockerfile` (or leave empty if in root)

### 3. Set Environment Variables

Add all required environment variables in the Koyeb app settings.

### 4. Database Setup

If using Koyeb's managed PostgreSQL:

1. Create a PostgreSQL database in Koyeb
2. Copy the connection string
3. Set `DATABASE_URL` in your app's environment variables

### 5. Deploy

Click "Deploy" and Koyeb will:

1. Build your Docker image
2. Run database migrations (via `start:prod` script)
3. Start your application

## Troubleshooting

### Deprecation Warnings

The npm deprecation warnings (npmlog, google-p12-pem, etc.) are harmless and won't affect functionality. They come from transitive dependencies and are automatically suppressed in the Dockerfile.

### Database Connection Issues

- Verify `DATABASE_URL` is correctly set
- Check if your database allows connections from Koyeb's IPs
- Ensure the database exists and is accessible

### Port Configuration

Koyeb automatically sets the `PORT` environment variable. Your app should read from `process.env.PORT` (which it does in `main.ts`).

**Important**: Configure the health check port in Koyeb:

1. Go to your app settings in Koyeb dashboard
2. Navigate to **Settings** → **Health Checks**
3. Set **Health Check Port** to `3000` (or whatever PORT you're using)
4. Ensure **Health Check Path** is set correctly (e.g., `/` or a health endpoint if you have one)

### Build Failures

If the build fails:

1. Check the build logs in Koyeb dashboard
2. Ensure all dependencies are in `package.json`
3. Verify the Dockerfile is correct
4. Check if Prisma schema is present

### SSL/TLS

Koyeb handles SSL termination automatically. Your app runs on HTTP internally, and Koyeb provides HTTPS to external users.

## Monitoring

After deployment:

1. Check application logs in Koyeb dashboard
2. Verify health endpoints (if configured)
3. Test your API endpoints

## Updates

To update your application:

1. Push changes to your Git repository
2. Koyeb will automatically rebuild and redeploy
3. Database migrations run automatically on startup

## Build Optimization

The Dockerfile uses multi-stage builds to:

- Keep the final image small
- Cache dependencies efficiently
- Separate build and runtime concerns

## Notes

- The `.dockerignore` file excludes unnecessary files from the build context
- Prisma migrations run automatically via the `start:prod` script
- SSL certificates are optional (Koyeb handles SSL)
- The app listens on `0.0.0.0` to accept connections from Koyeb's load balancer
