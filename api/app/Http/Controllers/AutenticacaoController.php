<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AutenticacaoController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credenciais = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $usuario = User::where('email', $credenciais['email'])->first();

        if ($usuario === null || !Hash::check($credenciais['password'], $usuario->password)) {
            return response()->json(['erro' => 'E-mail ou senha incorretos'], 401);
        }

        $token = $usuario->createToken('app-treino')->plainTextToken;

        return response()->json([
            'token' => $token,
            'usuario' => $usuario->only('id', 'name', 'email'),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(null, 204);
    }
}