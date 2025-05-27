<?php

return [
    'paths' => ['api/*','storage/*', 'sanctum/csrf-cookie'],
    // 'allowed_origins' => ['http://localhost:4321', 'http://frontend:4321'], por si falla la conexión entre backend y frontend
    //'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:4321')], es la que estaba
    'allowed_origins' => ['http://localhost:3000', 'http://localhost:4321'],
    'allowed_methods' => ['*'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'allowed_origins_patterns' => [],
    'max_age' => 0,
    'supports_credentials' => true, // IMPORTANTE: debe ser true
];