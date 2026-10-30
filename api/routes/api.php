<?php

use App\Http\Controllers\AutenticacaoController;
use App\Http\Controllers\ExercicioController;
use App\Http\Controllers\SessaoController;
use App\Http\Controllers\TreinoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AutenticacaoController::class, 'login'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => $request->user());
    Route::post('/logout', [AutenticacaoController::class, 'logout']);

    Route::get('/treinos', [TreinoController::class, 'index']);
    Route::get('/treinos/{letra}', [TreinoController::class, 'show'])->where('letra', '[A-Za-z]');

    Route::get('/sessoes', [SessaoController::class, 'index']);
    Route::get('/sessoes/em-andamento', [SessaoController::class, 'emAndamento']);
    Route::get('/sessoes/{sessao}', [SessaoController::class, 'show'])->whereNumber('sessao');
    Route::post('/sessoes', [SessaoController::class, 'iniciar']);
    Route::post('/sessoes/{sessao}/series', [SessaoController::class, 'registrarSerie']);
    Route::patch('/sessoes/{sessao}/finalizar', [SessaoController::class, 'finalizar']);

    Route::get('/exercicios/{exercicio}/ultima-vez', [ExercicioController::class, 'ultimaVez']);
    Route::get('/exercicios/{exercicio}/evolucao', [ExercicioController::class, 'evolucao']);
});