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

## TRUSTED DEVICE APPROACH

This is a crucial cornerstone for setting up a 2-Factor-Authentication System.

- Improvised appraoch : (foundational)

  I. At Client -> DeviceFingerprintObject::Hash + Timestamp(ms) => 4aazdsdq58cx.125
  II. At Server -> add A server Timestamp + ipHash => 4aazdsdq58cx.125.32.4easdeXs
  II. Persistance -> Save The created deviceId inside the created session + user.Devices

- Application of the method
  
  on : Login -> after checking user existance, 
                we compare the deviceHash with the client BrowserPreferencesHash
                if (found) // provided device is under user.devices
                   A trusted device, will short circuit 2fa,
                Else
                   Proceed to 2fa pipeline -> generate OTP, send OTP with email (verification link)
THE HACK HERE, is to provide necessary data (userAgent, platform and maybe a location), For a device management UI
