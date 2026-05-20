<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

/**
 * Generates sequential, human-readable reference numbers like BSN-ORD-2026-0001.
 * The counter is per-prefix per-year, derived from the max existing number so
 * it survives without a dedicated counter table.
 */
class ReferenceNumber
{
    /**
     * @param  string  $table   table holding the column
     * @param  string  $column  unique reference column (e.g. order_number)
     * @param  string  $prefix  e.g. ORD, LEAD, QT
     */
    public static function next(string $table, string $column, string $prefix): string
    {
        $year = now()->year;
        $like = "BSN-{$prefix}-{$year}-%";

        // Lock the latest matching row to avoid two requests grabbing the same
        // sequence under concurrency.
        $latest = DB::table($table)
            ->where($column, 'like', $like)
            ->orderByDesc($column)
            ->lockForUpdate()
            ->value($column);

        $seq = $latest ? ((int) substr($latest, -4)) + 1 : 1;

        return sprintf('BSN-%s-%d-%04d', $prefix, $year, $seq);
    }
}
