<?php

namespace App\RequestHandler;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

interface RequestHandler
{
    public function handleRequest(Request $request): Response;
}