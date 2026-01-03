<?php
$envContent = <<<'EOT'
APP_NAME=LoyaltySystem
APP_ENV=local
APP_KEY=base64:XyZzQ7w9f8xJ+5qW2l3n4o5p6q7r8s9t0u1v2w3x4y=
APP_DEBUG=true
APP_URL=http://localhost:8000
APP_QR_SECRET=loyalty_qr_secret_key_change_me_in_prod

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=loyalty_system
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

JWT_SECRET=
EOT;

file_put_contents('.env', $envContent);
echo ".env file updated to MySQL configuration.";
