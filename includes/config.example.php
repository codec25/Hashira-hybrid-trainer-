<?php
/**
 * Copy this file to config.php and replace every CHANGE_ME value.
 * Never include the real config.php in a ZIP, repository, or public download.
 */
return [
    'app_base' => '/hashira',
    'db' => [
        'host' => 'localhost',
        'name' => 'CHANGE_ME_HASHIRA_DATABASE',
        'user' => 'CHANGE_ME_HASHIRA_USER',
        'pass' => 'CHANGE_ME_HASHIRA_PASSWORD',
    ],
    // Generate a long random value. It protects setup.php.
    'setup_key' => 'CHANGE_ME_WITH_A_LONG_RANDOM_SETUP_KEY',
    // Turn on only after HTTPS is active.
    'secure_cookies' => true,
];
