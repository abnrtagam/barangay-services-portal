<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resident_id')->constrained('residents')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('complaint_categories')->onDelete('restrict');
            $table->string('subject', 200);
            $table->text('details');
            $table->string('attachment_path')->nullable();
            $table->enum('status', ['Pending', 'Approved', 'Scheduled', 'Resolved', 'Rejected'])
                  ->default('Pending');
            $table->text('admin_remarks')->nullable();
            $table->timestamps();

            $table->index('resident_id');
            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};
