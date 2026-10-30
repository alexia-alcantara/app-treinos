<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('treino_exercicios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('treino_id')->constrained('treinos')->cascadeOnDelete();
            $table->foreignId('exercicio_id')->constrained('exercicios')->restrictOnDelete();
            $table->unsignedTinyInteger('ordem');
            $table->unsignedTinyInteger('series')->default(4);
            $table->unsignedTinyInteger('repeticoes')->nullable();
            $table->unsignedSmallInteger('duracao_segundos')->nullable();
            $table->decimal('carga_kg', 6, 2)->nullable();
            $table->unsignedSmallInteger('descanso_segundos')->default(90);
            $table->timestamps();

            $table->unique(['treino_id', 'ordem']);
        });

        DB::statement(
            'ALTER TABLE treino_exercicios
             ADD CONSTRAINT chk_treino_exercicios_repeticoes_ou_duracao
             CHECK (repeticoes IS NOT NULL OR duracao_segundos IS NOT NULL)'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('treino_exercicios');
    }
};