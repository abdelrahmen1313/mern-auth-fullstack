# AUTHENTICATION CAPABILITY AS A SERVICE

## ROLE

This capability is responsible for authenticating client requests,
handling accessing and getting out safely from/to the api, through something called session.

This capability will allow interacting users to securely create accounts, access the api via a secure session,
logout with safety implementations to avoid stolen tokens attacks.

## THEORY

We give the accessing user an access token, and the server will create for it a session
with a virtual device id, and other attributes.

we do not rotate tokens for now, but by logging out, the user will destroy his current session
the user can also destroy all active sessions if authenticated from a trusted device.

## IMPROVEMENTS

We think of creating a physical device id, which is pratically doable (with caution),
so we can mark the client trusted device instead of creating a virtual device everytime he access the api.
or we can mix them in a hybrid approach.
