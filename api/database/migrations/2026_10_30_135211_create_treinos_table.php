<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('treinos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->char('letra', 1);
            $table->string('nome', 100);
            $table->boolean('ativo')->default(true);
            $table->timestamps();

            $table->unique(['user_id', 'letra']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('treinos');
    }
};