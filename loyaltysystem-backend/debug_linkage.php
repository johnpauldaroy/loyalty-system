<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Member;

$email = 'cybercattribez@gmail.com';
$user = User::where('email', $email)->first();

if ($user) {
    echo "User found: " . $user->name . " (ID: " . $user->id . ")\n";
    echo "Role: " . $user->role . "\n";

    $member = Member::where('user_id', $user->id)->first();
    if ($member) {
        echo "Linked Member found: " . $member->name . " (ID: " . $member->id . ")\n";
        echo "Member Code: " . $member->member_code . "\n";
    } else {
        echo "NO Linked Member found for User ID: " . $user->id . "\n";
        // Check if there's a member with the same email but NO user_id
        $memberByEmail = Member::where('email', $email)->first();
        if ($memberByEmail) {
            echo "A Member profile exists with this email (ID: " . $memberByEmail->id . ") but user_id is: " . ($memberByEmail->user_id ?? 'NULL') . "\n";
        }
    }
} else {
    echo "User NOT found for email: $email\n";
}
