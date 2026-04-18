<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\CalonJemaah;
use App\Models\JadwalFollowUp;
use App\Models\LaporanClosing;
use App\Models\StatusKomunikasi;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin CRM',
            'email' => 'admin@example.com',
            'phone' => '081200000001',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $staffA = User::create([
            'name' => 'Ahmad Fauzi',
            'email' => 'ahmad@example.com',
            'phone' => '081200000002',
            'password' => Hash::make('password'),
            'role' => 'staff',
            'is_active' => true,
        ]);

        $staffB = User::create([
            'name' => 'Fatimah Zahra',
            'email' => 'fatimah@example.com',
            'phone' => '081200000003',
            'password' => Hash::make('password'),
            'role' => 'staff',
            'is_active' => true,
        ]);

        $jemaah = CalonJemaah::create([
            'nama' => 'Ibu Siti Aminah',
            'kontak' => '081234567890',
            'alamat' => 'Jakarta Selatan',
            'sumber' => 'Instagram',
            'paket' => 'Umrah Reguler',
            'staff_id' => $staffA->id,
            'status_komunikasi' => 'Tertarik',
            'last_follow_up_at' => now()->subDay(),
            'notes' => 'Menunggu follow up lanjutan.',
        ]);

        $jemaah2 = CalonJemaah::create([
            'nama' => 'Bapak Abdullah Rahman',
            'kontak' => '081234567891',
            'alamat' => 'Bandung',
            'sumber' => 'Referral',
            'paket' => 'Umrah Plus Turki',
            'staff_id' => $staffB->id,
            'status_komunikasi' => 'Closing',
            'last_follow_up_at' => now()->subDays(2),
            'notes' => 'Siap DP bulan ini.',
        ]);

        $jadwal1 = JadwalFollowUp::create([
            'calon_jemaah_id' => $jemaah->id,
            'staff_id' => $staffA->id,
            'tanggal' => now()->toDateString(),
            'metode' => 'WhatsApp',
            'status' => 'In Progress',
            'catatan' => 'Kirim brochure dan harga paket.',
        ]);

        $jadwal2 = JadwalFollowUp::create([
            'calon_jemaah_id' => $jemaah2->id,
            'staff_id' => $staffB->id,
            'tanggal' => now()->subDay()->toDateString(),
            'metode' => 'Telepon',
            'status' => 'Done',
            'catatan' => 'Sudah setuju jadwal pembayaran.',
        ]);

        StatusKomunikasi::create([
            'jadwal_follow_up_id' => $jadwal1->id,
            'status' => 'Tertarik',
            'catatan' => 'Prospek bagus, tinggal follow up ulang.',
            'follow_up_at' => now()->subDay(),
        ]);

        $statusClosing = StatusKomunikasi::create([
            'jadwal_follow_up_id' => $jadwal2->id,
            'status' => 'Closing',
            'catatan' => 'Sudah deal dan menunggu pembayaran.',
            'follow_up_at' => now()->subDays(2),
        ]);

        LaporanClosing::create([
            'calon_jemaah_id' => $jemaah2->id,
            'staff_id' => $staffB->id,
            'tanggal_closing' => $statusClosing->follow_up_at?->toDateString() ?? now()->toDateString(),
            'nilai' => 45000000,
            'status_pembayaran' => 'DP 50%',
            'catatan' => 'Closing tercatat dari follow up telepon.',
        ]);

        ActivityLog::create([
            'user_id' => $admin->id,
            'aktivitas' => 'Menyiapkan data awal CRM',
            'metadata' => ['seed' => true],
        ]);

        $this->call(CalonJemaahProspekSeeder::class);
    }
}
