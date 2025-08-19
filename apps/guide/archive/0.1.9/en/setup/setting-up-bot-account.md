---
title: Setting up a bot application
editLink: true
sidebar: true
---

# Setting up a Bot Application

Creating a bot account is a crucial step in your yurba.js development journey. This guide will walk you through the process of setting up your bot account and obtaining the necessary authentication tokens.

## Understanding Bot Accounts on Yurba.one

> [!NOTE] Important Information
> Currently, Yurba.one does not provide dedicated bot application endpoints. Instead, you'll need to create a regular user account that will serve as your bot. This approach is temporary and may change in future API versions.

### Why Use a Separate Account?

While you could technically use your personal account for bot development, we **strongly recommend** creating a dedicated account for several reasons:

- **Security**: Keeps your personal account separate from bot activities
- **Organization**: Makes it easier to manage bot-specific settings and data
- **Safety**: Reduces risk to your main account during development and testing
- **Professionalism**: Provides a clean, dedicated identity for your bot

## Creating Your Bot Account

### Step 1: Account Registration

Choose one of these registration methods:

#### Option A: Direct Registration
1. Navigate to [yurba.one/register](https://yurba.one/register/)
2. Fill out the registration form with your bot's information
3. Use a any email address for your bot (e.g., `mybot@domain.com`)
- You can also use temporary email, but then it's recommended to add your real email as a `reserve email` in [settings](https://yurba.one/settings/?page=profile)
4. Choose a username that clearly identifies it as a bot
5. Complete the registration process

<img src="/images/register.png" width="800" alt="Yurba.one registration page" />

#### Option B: Google OAuth Registration
1. Visit [yurba.one/login](https://yurba.one/login/)
2. Click "Sign in with Google"
3. Use a Google account dedicated to your bot
4. Complete the OAuth flow

> [!TIP] Best Practices for Bot Accounts
> - Use descriptive usernames (e.g., `WeatherBot`, `ModeratorBot`)
> - Set a clear profile picture that represents your bot's function
> - Write a bio that explains what your bot does

### Step 2: Account Configuration

After registration, configure your bot account:

- **Profile Setup**
   - Write a clear description of your bot's purpose

## Obtaining Your Authentication Token

The authentication token is your bot's key to accessing the Yurba API. Handle it with extreme care.

### Accessing Token Settings

1. **Navigate to Security Settings**
   - Go to [Settings → Security](https://yurba.one/settings/?page=security)
   - Copy the token from sessions
   - Store it securely

<img src="/images/tokens.png" width="800" alt="Token generation interface" />

> [!DANGER] Critical Security Warning
> **Never share your token with anyone!** Your token provides complete access to your bot account. Treat it like a password and store it securely using environment variables or secure configuration files.

## Understanding Yurba Tokens

### Token Format

Yurba tokens follow a specific format:
- **Prefix**: Always start with `y.`
- **Length**: Typically 32-34 characters total
- **Characters**: Alphanumeric characters

**Example formats:**
```y.token
y.RT0ZALrC4tUwU7WmEGvq5XdlsRjpMlrL
y.lSRjyiajBHC3EoZ8lLbYDnBpwXiPN9u3
```

> [!NOTE] Example Tokens
> The tokens shown above are examples only and were invalidated before publication. 

## What If Your Token Is Compromised?

If you suspect your token has been compromised:

### Immediate Actions

1. **Revoke the Token**
   - Go to [Settings → Security](https://yurba.one/settings/?page=security)
   - Click "Stop sessions" 
   - This immediately invalidates the compromised token
   ::: warning
    Also, when logging into the account, a new token will be created. It's recommended `to delete it as well`, since there might be a script running that copies all tokens. Log into your account again - this token will definitely not be accessible to anyone but you
   :::

## Account Recovery

If you lose access to your bot account:

1. **Password Reset**
   - Use the standard password reset process
   - Check the email associated with your bot account

2. **Contact Support**
   - If password reset fails, contact Yurba.one support
   - Provide proof of account ownership
   - Explain that this is a bot account

