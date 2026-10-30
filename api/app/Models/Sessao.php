<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sessao extends Model
{
    protected $table = 'sessoes';

    protected $fillable = ['user_id', 'treino_id', 'iniciada_em', 'finalizada_em'];

    protected $casts = [
        'iniciada_em' => 'datetime',
        'finalizada_em' => 'datetime',
    ];

    protected $appends = ['duracao_minutos'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function treino(): BelongsTo
    {
        return $this->belongsTo(Treino::class);
    }

    public function seriesRealizadas(): HasMany
    {
        return $this->hasMany(SerieRealizada::class);
    }

    protected function duracaoMinutos(): Attribute
    {
        return Attribute::get(
            fn () => $this->finalizada_em === null
                ? null
                : (int) $this->iniciada_em->diffInMinutes($this->finalizada_em)
        );
    }
}