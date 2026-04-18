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
        Schema::create('calon_jemaahs', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('kontak', 30);
            $table->text('alamat')->nullable();
            $table->string('sumber')->nullable();
            $table->string('paket')->nullable();
            $table->foreignId('staff_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status_komunikasi')->default('Prospek Baru');
            $table->timestamp('last_follow_up_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calon_jemaahs');
    }
};
