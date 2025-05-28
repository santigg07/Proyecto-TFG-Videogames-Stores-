<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Agregar índices a la tabla orders
        Schema::table('orders', function (Blueprint $table) {
            // Agregar auto increment si no existe
            $table->id()->change();
            
            // Índices
            $table->index('user_id');
            $table->index('status');
            $table->index('payment_method');
            $table->index('created_at');
        });

        // Agregar índices a la tabla order_items
        Schema::table('order_items', function (Blueprint $table) {
            // Agregar auto increment si no existe
            $table->id()->change();
            
            // Índices
            $table->index('order_id');
            $table->index('game_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['payment_method']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex(['order_id']);
            $table->dropIndex(['game_id']);
        });
    }
};