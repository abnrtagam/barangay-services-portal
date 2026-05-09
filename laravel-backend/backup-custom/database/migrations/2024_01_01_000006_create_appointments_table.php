<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resident_id')->constrained('residents')->onDelete('cascade');
            $table->date('appointment_date');
            $table->string('time_slot', 20);
            $table->string('purpose', 300);
            $table->text('notes')->nullable();
            $table->enum('status', ['Pending', 'Approved', 'Completed', 'Cancelled', 'Rejected'])
                  ->default('Pending');
            $table->text('admin_remarks')->nullable();
            $table->timestamps();

            $table->index('resident_id');
            $table->index('appointment_date');
            $table->index('status');
            // Prevent double-booking same slot
            $table->unique(['appointment_date', 'time_slot'], 'unique_slot');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
