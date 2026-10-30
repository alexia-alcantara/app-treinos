<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SerieRealizada extends Model
{
    protected $table = 'series_realizadas';

    protected $fillable = [
        'sessao_id',
        'exercicio_id',
        'numero_serie',
        'carga_kg',
        'repeticoes',
        'duracao_segundos',
        'concluida_em',
    ];

    protected $casts = [
        'carga_kg' => 'float',
        'concluida_em' => 'datetime',
    ];

    public function sessao(): BelongsTo
    {
        return $this->belongsTo(Sessao::class);
    }

    public function exercicio(): BelongsTo
    {
        return $this->belongsTo(Exercicio::class);
    }
}