<?php

namespace App\Http\Controllers;

use App\Models\User;

abstract class Controller
{
    protected function usuarioAtual(): User
    {
        return auth()->user();
    }
}