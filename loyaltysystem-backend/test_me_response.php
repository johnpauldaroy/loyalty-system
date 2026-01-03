<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Http\Controllers\Api\V1\AuthController;
use Illuminate\Http\Request;

$email = 'cybercattribez@gmail.com';
$user = User::where('email', $email)->first();

if ($user) {
    auth('api')->login($user);
    $controller = new AuthController();
    $response = $controller->me();
    echo json_encode(json_decode($response->getContent()), JSON_PRETTY_PRINT);
} else {
    echo "User NOT found";
}
