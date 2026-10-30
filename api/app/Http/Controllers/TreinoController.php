<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class TreinoController extends Controller
{
    public function index(): JsonResponse
    {
        $treinos = $this->usuarioAtual()
            ->treinos()
            ->select('id', 'letra', 'nome')
            ->where('ativo', true)
            ->withCount('exerciciosPlanejados as total_exercicios')
            ->orderBy('letra')
            ->get();

        return response()->json($treinos);
    }

    public function show(string $letra): JsonResponse
    {
        $treino = $this->usuarioAtual()
            ->treinos()
            ->where('letra', strtoupper($letra))
            ->with('exerciciosPlanejados.exercicio:id,nome,grupo_muscular')
            ->first();

        if ($treino === null) {
            return response()->json(['erro' => 'Treino não encontrado'], 404);
        }

        return response()->json($treino);
    }
}