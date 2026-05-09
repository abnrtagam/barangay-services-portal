<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('type', 50);           // e.g. 'complaint_status', 'appointment_status'
            $table->string('title', 200);
            $table->text('message');
            $table->unsignedBigInteger('reference_id')->nullable();   // complaint_id or appointment_id
            $table->string('reference_type', 50)->nullable();         // 'complaint' or 'appointment'
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->index('user_id');
            $table->index('is_read');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
