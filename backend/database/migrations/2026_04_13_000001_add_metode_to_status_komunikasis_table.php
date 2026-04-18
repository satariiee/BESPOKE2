<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('status_komunikasis', function (Blueprint $table) {
            $table->string('metode')->nullable()->after('jadwal_follow_up_id');
        });

        DB::table('status_komunikasis')
            ->orderBy('id')
            ->chunkById(100, function ($rows) {
                foreach ($rows as $row) {
                    $metode = DB::table('jadwal_follow_ups')
                        ->where('id', $row->jadwal_follow_up_id)
                        ->value('metode');

                    DB::table('status_komunikasis')
                        ->where('id', $row->id)
                        ->update(['metode' => $metode]);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('status_komunikasis', function (Blueprint $table) {
            $table->dropColumn('metode');
        });
    }
};