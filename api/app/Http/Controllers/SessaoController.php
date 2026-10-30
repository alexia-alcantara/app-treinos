<?php

namespace App\Http\Controllers;

use App\Models\Sessao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SessaoController extends Controller
{
    public function index(): JsonResponse
    {
        $sessoesRecentes = $this->usuarioAtual()
            ->sessoes()
            ->whereNotNull('finalizada_em')
            ->with('treino:id,letra,nome')
            ->withCount('seriesRealizadas as total_series')
            ->latest('iniciada_em')
            ->limit(20)
            ->get();

        return response()->json($sessoesRecentes);
    }

    public function emAndamento(): JsonResponse
    {
        $sessao = $this->usuarioAtual()
            ->sessoes()
            ->whereNull('finalizada_em')
            ->latest('iniciada_em')
            ->first();

        return response()->json([
            'sessao' => $sessao === null ? null : $this->carregarDetalhes($sessao),
        ]);
    }

    public function show(Sessao $sessao): JsonResponse
    {
        if ($sessao->user_id !== $this->usuarioAtual()->id) {
            return response()->json(['erro' => 'Sessão não encontrada'], 404);
        }

        return response()->json($this->carregarDetalhes($sessao));
    }

    public function iniciar(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'letra' => ['required', 'string', 'size:1'],
        ]);

        $usuario = $this->usuarioAtual();

        $treino = $usuario->treinos()
            ->where('letra', strtoupper($dados['letra']))
            ->first();

        if ($treino === null) {
            return response()->json(['erro' => 'Treino não encontrado'], 404);
        }

        $sessao = $usuario->sessoes()->create([
            'treino_id' => $treino->id,
            'iniciada_em' => now(),
        ]);

        return response()->json($sessao->load('treino:id,letra,nome'), 201);
    }

    public function registrarSerie(Request $request, Sessao $sessao): JsonResponse
    {
        $usuario = $this->usuarioAtual();

        if ($sessao->user_id !== $usuario->id) {
            return response()->json(['erro' => 'Sessão não encontrada'], 404);
        }

        if ($sessao->finalizada_em !== null) {
            return response()->json(['erro' => 'Sessão já finalizada'], 409);
        }

        $dados = $request->validate([
            'exercicio_id' => [
                'required',
                'integer',
                Rule::exists('exercicios', 'id')->where('user_id', $usuario->id),
            ],
            'numero_serie' => ['required', 'integer', 'min:1', 'max:20'],
            'carga_kg' => ['nullable', 'numeric', 'min:0', 'max:999'],
            'repeticoes' => ['nullable', 'integer', 'min:1', 'max:200', 'required_without:duracao_segundos'],
            'duracao_segundos' => ['nullable', 'integer', 'min:1', 'max:3600', 'required_without:repeticoes'],
        ]);

        $serie = $sessao->seriesRealizadas()->create([
            ...$dados,
            'concluida_em' => now(),
        ]);

        return response()->json($serie, 201);
    }

    public function finalizar(Sessao $sessao): JsonResponse
    {
        if ($sessao->user_id !== $this->usuarioAtual()->id) {
            return response()->json(['erro' => 'Sessão não encontrada'], 404);
        }

        if ($sessao->finalizada_em !== null) {
            return response()->json(['erro' => 'Sessão já finalizada'], 409);
        }

        $sessao->update(['finalizada_em' => now()]);

        return response()->json($sessao->load('seriesRealizadas'));
    }

    private function carregarDetalhes(Sessao $sessao): Sessao
    {
        return $sessao->load([
            'treino:id,letra,nome',
            'treino.exerciciosPlanejados.exercicio:id,nome,grupo_muscular',
            'seriesRealizadas',
        ]);
    }
}