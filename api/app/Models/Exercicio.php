<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exercicio extends Model
{
    protected $table = 'exercicios';

    protected $fillable = ['user_id', 'nome', 'grupo_muscular'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function seriesRealizadas(): HasMany
    {
        return $this->hasMany(SerieRealizada::class);
    }
}