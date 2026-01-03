<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Member;

$id = 2; // From previous check
$member = Member::with(['loyaltyPoint', 'branch'])->find($id);

if ($member) {
    echo "Member: " . $member->name . "\n";
    echo "Status: " . ($member->status ?? 'NULL') . "\n";
    echo "Loyalty Point Record: " . ($member->loyaltyPoint ? "Exists (Balance: " . $member->loyaltyPoint->balance . ")" : "MISSING") . "\n";
    echo "JSON representation:\n";
    echo json_encode($member, JSON_PRETTY_PRINT);
} else {
    echo "Member ID $id not found";
}
