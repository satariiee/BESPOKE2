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
        Schema::create('jadwal_follow_ups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calon_jemaah_id')->constrained('calon_jemaahs')->cascadeOnDelete();
            $table->foreignId('staff_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('tanggal');
            $table->string('metode');
            $table->enum('status', ['Pending', 'In Progress', 'Done'])->default('Pending');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jadwal_follow_ups');
    }
};
