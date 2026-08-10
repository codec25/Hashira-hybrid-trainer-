# Hashira Accounts — Hostinger Setup

Hashira now has its own account, profile, circle, membership-request, and circle-chat system. It intentionally uses a separate database from VILLA so the two products can grow independently and be connected later through a shared identity layer.

## 1. Upload the application

Upload the contents of this package into your Hashira web directory, for example:

`public_html/hashira/`

If you are merging it into an existing Hashira installation, overwrite matching application files. Do not overwrite an existing `includes/config.php`.

## 2. Create a separate Hashira database

In Hostinger, create:

- A new MySQL database for Hashira
- A new MySQL user with access only to that database

Do not reuse the VILLA database credentials.

## 3. Configure Hashira

On the server:

1. Copy `includes/config.example.php` to `includes/config.php`.
2. Fill in the Hashira database host, name, username, and password.
3. Replace the setup key with a long random value.
4. Set `app_base` to the public Hashira path, such as `/hashira`.

The included `.htaccess` prevents the configuration file from being downloaded through the browser on compatible Apache hosting.

## 4. Initialize the database

Visit:

`https://YOUR-DOMAIN/hashira/setup.php`

Enter the setup key and initialize the schema. When setup succeeds, delete `setup.php` from the server.

## 5. Test the account journey

1. Open Hashira in a private browser window.
2. Select **Join Hashira**.
3. Create an athlete, coach, or hybrid account.
4. Complete the movement profile.
5. Create or request access to a circle.
6. Test circle chat with a second account.

## Security note

The previously supplied VILLA archive contained database credentials in its configuration. Rotate those credentials in Hostinger before using either application publicly.

