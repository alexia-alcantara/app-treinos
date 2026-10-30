<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TreinoExercicio extends Model
{
    protected $table = 'treino_exercicios';

    protected $fillable = [
        'treino_id',
        'exercicio_id',
        'ordem',
        'series',
        'repeticoes',
        'duracao_segundos',
        'carga_kg',
        'descanso_segundos',
    ];

    protected $casts = [
        'carga_kg' => 'float',
    ];

    public function treino(): BelongsTo
    {
        return $this->belongsTo(Treino::class);
    }

    public function exercicio(): BelongsTo
    {
        return $this->belongsTo(Exercicio::class);
    }
}