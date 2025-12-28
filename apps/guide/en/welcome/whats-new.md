---
title: What's New in Yurba.js
editLink: true
sidebar: true
---

# What's New in Yurba.js <Badge type="tip" text="Next.15+" />

## Release - Next.15 (December 27, 2025)

### Architecture and Refactoring

Updates focused on simplifying the API, better encapsulation, and preparing the library for scaling.

- **Manager Refactoring**  
  All managers now work only with a reference to the client (`this`).  
  No need to pass `api` separately — the client is the single point of access to the context.

- **CommandManager as part of the client**  
  The command manager is integrated directly into the client and accessible via `client.commands`,  
  making the API more consistent and predictable.

- **Encapsulation of internal logic**  
  Internal command handlers are hidden using `Symbol`,  
  so they don't appear in autocomplete and are not accessible for accidental calls.

### Structures and Logic

- **New `User` structure**  
  Added a separate user structure with helper logic,  
  including checking if the user is a bot (based on `link`).

- **Redesigned `UserManager`**  
  - Returns `User` objects instead of raw data  
  - Added `link` caching tied to `id`  
  - Used as the single source for user resolution

- **Command arguments of type `user`**  
  Resolution of `user` type arguments is now done through `UserManager`,  
  which unifies behavior and reduces logic duplication.

### Configuration

- **Token is no longer required in `client.init()`**  
  The token can be specified in `.env`, which simplifies client initialization  
  and improves separation of configuration and code.


<p>From Devblog №1,2,3 -> <a href="https://t.me/justtealord">Source</a></p>


## Release - v0.1.9 (July 12, 2025)

### Major Improvements

The latest release focused on stability and preparing for the first stable beta version:

- **Stability Fixes**: Resolved all critical issues blocking the stable beta release
- **Enhanced Testing**: Improved Jest configuration and test coverage
- **Better Error Handling**: Fixed various bugs across all packages
