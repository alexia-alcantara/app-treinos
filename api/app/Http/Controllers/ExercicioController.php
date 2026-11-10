<?php

namespace App\Http\Controllers;

use App\Models\Exercicio;
use Illuminate\Http\JsonResponse;

class ExercicioController extends Controller
{
    public function index(): JsonResponse
    {
        $exercicios = $this->usuarioAtual()
            ->exercicios()
            ->select('id', 'nome', 'grupo_muscular')
            ->withExists('seriesRealizadas as tem_historico')
            ->orderBy('nome')
            ->get();

        return response()->json($exercicios);
    }

    public function ultimaVez(Exercicio $exercicio): JsonResponse
    {
        if ($exercicio->user_id !== $this->usuarioAtual()->id) {
            return response()->json(['erro' => 'Exercício não encontrado'], 404);
        }

        $ultimaSerie = $exercicio->seriesRealizadas()
            ->whereHas('sessao', fn ($sessao) => $sessao->whereNotNull('finalizada_em'))
            ->latest('concluida_em')
            ->with('sessao:id,iniciada_em')
            ->first();

        if ($ultimaSerie === null) {
            return response()->json(['data' => null, 'series' => []]);
        }

        $series = $exercicio->seriesRealizadas()
            ->where('sessao_id', $ultimaSerie->sessao_id)
            ->orderBy('numero_serie')
            ->get(['numero_serie', 'carga_kg', 'repeticoes', 'duracao_segundos']);

        return response()->json([
            'data' => $ultimaSerie->sessao->iniciada_em,
            'series' => $series,
        ]);
    }

    public function evolucao(Exercicio $exercicio): JsonResponse
    {
        if ($exercicio->user_id !== $this->usuarioAtual()->id) {
            return response()->json(['erro' => 'Exercício não encontrado'], 404);
        }

        $cargaMaximaPorDia = $exercicio->seriesRealizadas()
            ->join('sessoes', 'sessoes.id', '=', 'series_realizadas.sessao_id')
            ->selectRaw('DATE(sessoes.iniciada_em) AS dia, MAX(series_realizadas.carga_kg) AS carga_maxima')
            ->whereNotNull('series_realizadas.carga_kg')
            ->groupBy('dia')
            ->orderBy('dia')
            ->withCasts(['carga_maxima' => 'float'])
            ->get();

        return response()->json($cargaMaximaPorDia);
    }
}