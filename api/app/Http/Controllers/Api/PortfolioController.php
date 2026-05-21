<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PortfolioWork;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    /** GET /api/v1/portfolio — public, active works only. */
    public function index(Request $request)
    {
        $query = PortfolioWork::query()->where('is_active', true);

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $works = $query->orderBy('sort_order')->orderByDesc('id')->get();

        return response()->json(['data' => $works]);
    }
}
