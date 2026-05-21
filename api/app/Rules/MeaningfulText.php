<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Rejects obvious junk input (keyboard mashing, a single repeated character,
 * symbol-only strings) for human-facing text like project titles/descriptions.
 *
 * Not a spam oracle — it blocks the clearly-garbage cases while letting any
 * genuine sentence through.
 */
class MeaningfulText implements ValidationRule
{
    public function __construct(
        private int $minLength = 3,
        private bool $requireMultipleWords = false,
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $text = trim((string) $value);

        if (mb_strlen($text) < $this->minLength) {
            $fail("النص قصير جداً (الحد الأدنى {$this->minLength} حروف).");
            return;
        }

        // Must contain real letters (Arabic or Latin), not just digits/symbols.
        if (! preg_match('/[\p{Arabic}A-Za-z]/u', $text)) {
            $fail('اكتب نصاً واضحاً يحتوي على حروف.');
            return;
        }

        // Reject a single character repeated (e.g. "aaaa", "كككك", "....").
        $distinct = collect(preg_split('//u', preg_replace('/\s+/u', '', $text), -1, PREG_SPLIT_NO_EMPTY))->unique();
        if ($distinct->count() <= 1) {
            $fail('النص يبدو غير صحيح، اكتب وصفاً حقيقياً.');
            return;
        }

        // Reject 4+ of the same character in a row (e.g. "aaaab", "هههههه").
        if (preg_match('/(.)\1{3,}/u', $text)) {
            $fail('النص يحتوي على حروف مكررة بشكل غير طبيعي.');
            return;
        }

        if ($this->requireMultipleWords && count(preg_split('/\s+/u', $text, -1, PREG_SPLIT_NO_EMPTY)) < 2) {
            $fail('اكتب عنواناً وصفياً (أكثر من كلمة).');
            return;
        }
    }
}
