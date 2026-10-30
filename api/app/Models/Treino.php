<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Treino extends Model
{
    protected $table = 'treinos';

    protected $fillable = ['user_id', 'letra', 'nome', 'ativo'];

    protected $casts = [
        'ativo' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function exerciciosPlanejados(): HasMany
    {
        return $this->hasMany(TreinoExercicio::class)->orderBy('ordem');
    }

    public function sessoes(): HasMany
    {
        return $this->hasMany(Sessao::class);
    }
}