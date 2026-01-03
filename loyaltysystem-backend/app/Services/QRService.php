<?php

namespace App\Services;

use App\Models\Member;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Exception;

class QRService
{
    /**
     * Generate a signed QR payload for a member.
     *
     *Payload structure:
     * {
     *   "member_id": "BMPC-000123",
     *   "issued_at": 1704240000,
     *   "expires_at": 1704326400,
     *   "checksum": "hmac_signature"
     * }
     *
     * @param Member $member
     * @param int $validitySeconds Default 24 hours
     * @return array
     */
    public function generateQRPayload(Member $member, int $validitySeconds = 86400): array
    {
        $issuedAt = time();
        $expiresAt = $issuedAt + $validitySeconds;

        $data = [
            'member_id' => $member->member_code,
            'issued_at' => $issuedAt,
            'expires_at' => $expiresAt,
        ];

        $data['checksum'] = $this->generateChecksum($data);

        return $data;
    }

    /**
     * Validate a QR payload.
     *
     * Checks:
     * 1. Checksum integrity
     * 2. Expiration time
     * 3. Member existence (optional, can be done by caller)
     *
     * @param array $payload
     * @return array Returns ['valid' => bool, 'member_code' => string|null, 'error' => string|null]
     */
    public function validateQRPayload(array $payload): array
    {
        try {
            // 1. Basic structure check
            if (!isset($payload['member_id'], $payload['issued_at'], $payload['expires_at'], $payload['checksum'])) {
                return ['valid' => false, 'error' => 'Invalid QR payload structure'];
            }

            // 2. Extracts data for hashing
            $dataToHash = [
                'member_id' => $payload['member_id'],
                'issued_at' => $payload['issued_at'],
                'expires_at' => $payload['expires_at'],
            ];

            // 3. Verify checksum
            $expectedChecksum = $this->generateChecksum($dataToHash);
            if (!hash_equals($expectedChecksum, $payload['checksum'])) {
                Log::warning('QR integrity check failed', ['payload' => $payload]);
                return ['valid' => false, 'error' => 'Integrity check failed'];
            }

            // 4. Verify expiration
            if (time() > $payload['expires_at']) {
                return ['valid' => false, 'error' => 'QR code expired'];
            }

            // 5. Verify issued time (sanity check)
            // Allow 5 minutes clock drift for future dates
            if ($payload['issued_at'] > time() + 300) {
                return ['valid' => false, 'error' => 'Invalid issue time (Future date)'];
            }

            return ['valid' => true, 'member_code' => $payload['member_id'], 'error' => null];

        } catch (Exception $e) {
            Log::error('QR Validation Exception: ' . $e->getMessage());
            return ['valid' => false, 'error' => 'Validation error occurrred'];
        }
    }

    /**
     * Generate HMAC SHA256 checksum.
     *
     * @param array $data
     * @return string
     */
    private function generateChecksum(array $data): string
    {
        // Sort keys to ensure consistent JSON serialization
        ksort($data);

        $secret = Config::get('app.qr_secret');

        if (empty($secret)) {
            // Fallback for development, should throw in production
            if (app()->environment('production')) {
                throw new Exception('QR Secret not configured in production');
            }
            $secret = 'default_insecure_secret';
        }

        return hash_hmac('sha256', json_encode($data), $secret);
    }
}
