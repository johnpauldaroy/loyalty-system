<?php

namespace App\Interfaces;

/**
 * Interface for external transaction sources (POS, Marketplace, Loan System).
 */
interface TransactionSourceInterface
{
    /**
     * Validate the incoming external request payload.
     *
     * @param array $payload
     * @return bool
     */
    public function validate(array $payload): bool;

    /**
     * Normalize the external payload into a standard internal transaction format.
     *
     * Expected return structure:
     * [
     *   'member_id' => int,
     *   'category_id' => int,
     *   'action' => string,
     *   'amount' => float,
     *   'notes' => string|null,
     *   'external_ref' => string,
     *   'source' => string
     * ]
     *
     * @param array $payload
     * @return array
     */
    public function normalize(array $payload): array;

    /**
     * Get the unique identifier for this source type.
     * e.g. "POS", "MARKETPLACE"
     *
     * @return string
     */
    public function getSourceIdentifier(): string;
}
