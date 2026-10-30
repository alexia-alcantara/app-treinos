<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('series_realizadas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sessao_id')->constrained('sessoes')->cascadeOnDelete();
            $table->foreignId('exercicio_id')->constrained('exercicios')->restrictOnDelete();
            $table->unsignedTinyInteger('numero_serie');
            $table->decimal('carga_kg', 6, 2)->nullable();
            $table->unsignedTinyInteger('repeticoes')->nullable();
            $table->unsignedSmallInteger('duracao_segundos')->nullable();
            $table->dateTime('concluida_em')->useCurrent();
            $table->timestamps();

            $table->index(['exercicio_id', 'concluida_em']);
        });

        DB::statement(
            'ALTER TABLE series_realizadas
             ADD CONSTRAINT chk_series_realizadas_repeticoes_ou_duracao
             CHECK (repeticoes IS NOT NULL OR duracao_segundos IS NOT NULL)'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('series_realizadas');
    }
};