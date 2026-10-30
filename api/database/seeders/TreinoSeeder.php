<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TreinoSeeder extends Seeder
{
    private const PLANO_DE_TREINOS = [
        'A' => [
            'nome' => 'Inferior quadríceps',
            'exercicios' => [
                ['nome' => 'Panturrilha banco sóleo', 'grupo_muscular' => 'Panturrilha', 'repeticoes' => 10],
                ['nome' => 'Banco extensor',          'grupo_muscular' => 'Quadríceps',  'repeticoes' => 10, 'carga_kg' => 23],
                ['nome' => 'Agachamento Smith',       'grupo_muscular' => 'Quadríceps',  'repeticoes' => 10],
                ['nome' => 'Banco adutor',            'grupo_muscular' => 'Adutores',    'repeticoes' => 10, 'carga_kg' => 32],
                ['nome' => 'Leg press 45°',           'grupo_muscular' => 'Quadríceps',  'repeticoes' => 10, 'carga_kg' => 20],
                ['nome' => 'Mesa flexora',            'grupo_muscular' => 'Posterior',   'repeticoes' => 10],
                ['nome' => 'Prancha ventral',         'grupo_muscular' => 'Abdômen',     'duracao_segundos' => 120],
            ],
        ],
        'B' => [
            'nome' => 'Superior máquinas',
            'exercicios' => [
                ['nome' => 'Puxada articulada',                 'grupo_muscular' => 'Costas',  'repeticoes' => 10],
                ['nome' => 'Remada máquina articulada pronada', 'grupo_muscular' => 'Costas',  'repeticoes' => 10],
                ['nome' => 'Supino articulado 45°',             'grupo_muscular' => 'Peito',   'repeticoes' => 10],
                ['nome' => 'Abdução de ombros',                 'grupo_muscular' => 'Ombros',  'repeticoes' => 10],
                ['nome' => 'Tríceps cross barra',               'grupo_muscular' => 'Tríceps', 'repeticoes' => 10],
                ['nome' => 'Crucifixo inverso pronado',         'grupo_muscular' => 'Ombros',  'repeticoes' => 10],
                ['nome' => 'Rosca direta halteres',             'grupo_muscular' => 'Bíceps',  'repeticoes' => 10],
            ],
        ],
        'C' => [
            'nome' => 'Superior cabos',
            'exercicios' => [
                ['nome' => 'Voador',                        'grupo_muscular' => 'Peito',   'repeticoes' => 10],
                ['nome' => 'Pulley triângulo',              'grupo_muscular' => 'Costas',  'repeticoes' => 10],
                ['nome' => 'Remada baixa neutra',           'grupo_muscular' => 'Costas',  'repeticoes' => 10],
                ['nome' => 'Flexão de ombros cross corda',  'grupo_muscular' => 'Ombros',  'repeticoes' => 10],
                ['nome' => 'Rosca direta cross',            'grupo_muscular' => 'Bíceps',  'repeticoes' => 10],
                ['nome' => 'Tríceps arremesso cross corda', 'grupo_muscular' => 'Tríceps', 'repeticoes' => 10],
                ['nome' => 'Rosca martelo cross corda',     'grupo_muscular' => 'Bíceps',  'repeticoes' => 10],
            ],
        ],
        'D' => [
            'nome' => 'Inferior glúteos',
            'exercicios' => [
                ['nome' => 'Banco abdutor',             'grupo_muscular' => 'Glúteos',     'repeticoes' => 10],
                ['nome' => 'Agachamento búlgaro',       'grupo_muscular' => 'Glúteos',     'repeticoes' => 10],
                ['nome' => 'Banco flexor',              'grupo_muscular' => 'Posterior',   'repeticoes' => 10],
                ['nome' => 'Elevação pélvica máquina',  'grupo_muscular' => 'Glúteos',     'repeticoes' => 10],
                ['nome' => 'Stiff',                     'grupo_muscular' => 'Posterior',   'repeticoes' => 10],
                ['nome' => 'Panturrilha máquina em pé', 'grupo_muscular' => 'Panturrilha', 'repeticoes' => 12],
                ['nome' => 'Abdominal supra solo',      'grupo_muscular' => 'Abdômen',     'repeticoes' => 15],
            ],
        ],
    ];

    public function run(): void
    {
        $agora = now();

        $userId = DB::table('users')->insertGetId([
            'name' => 'Alexia',
            'email' => 'alexia@exemplo.com',
            'password' => Hash::make('senha-provisoria'),
            'created_at' => $agora,
            'updated_at' => $agora,
        ]);

        foreach (self::PLANO_DE_TREINOS as $letra => $treino) {
            $treinoId = DB::table('treinos')->insertGetId([
                'user_id' => $userId,
                'letra' => $letra,
                'nome' => $treino['nome'],
                'created_at' => $agora,
                'updated_at' => $agora,
            ]);

            foreach ($treino['exercicios'] as $posicao => $exercicio) {
                $exercicioId = DB::table('exercicios')->insertGetId([
                    'user_id' => $userId,
                    'nome' => $exercicio['nome'],
                    'grupo_muscular' => $exercicio['grupo_muscular'],
                    'created_at' => $agora,
                    'updated_at' => $agora,
                ]);

                DB::table('treino_exercicios')->insert([
                    'treino_id' => $treinoId,
                    'exercicio_id' => $exercicioId,
                    'ordem' => $posicao + 1,
                    'repeticoes' => $exercicio['repeticoes'] ?? null,
                    'duracao_segundos' => $exercicio['duracao_segundos'] ?? null,
                    'carga_kg' => $exercicio['carga_kg'] ?? null,
                    'created_at' => $agora,
                    'updated_at' => $agora,
                ]);
            }
        }
    }
}