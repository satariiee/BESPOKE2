<?php

namespace Database\Seeders;

use App\Models\CalonJemaah;
use App\Models\User;
use Illuminate\Database\Seeder;

class CalonJemaahProspekSeeder extends Seeder
{
    /**
     * Seed 5 calon jemaah dengan status Prospek Baru.
     */
    public function run(): void
    {

        $rows = [
            [
                'nama' => 'Muhammad Rizky Pratama',
                'kontak' => '081321000101',
                'alamat' => 'Bekasi',
                'sumber' => 'Instagram Ads',
                'paket' => 'Umrah Reguler',
                'staff_id' => null,
                'status_komunikasi' => 'Prospek Baru',
                'notes' => 'Lead baru dari campaign Ramadhan.',
            ],
            [
                'nama' => 'Nur Aisyah Putri',
                'kontak' => '081321000102',
                'alamat' => 'Depok',
                'sumber' => 'TikTok',
                'paket' => 'Umrah Plus Turki',
                'staff_id' => null,
                'status_komunikasi' => 'Prospek Baru',
                'notes' => 'Tertarik keberangkatan akhir tahun.',
            ],
            [
                'nama' => 'Abdul Karim Maulana',
                'kontak' => '081321000103',
                'alamat' => 'Bogor',
                'sumber' => 'Referral',
                'paket' => 'Umrah VIP',
                'staff_id' => null,
                'status_komunikasi' => 'Prospek Baru',
                'notes' => 'Direferensikan oleh alumni jamaah.',
            ],
            [
                'nama' => 'Siti Rahmawati',
                'kontak' => '081321000104',
                'alamat' => 'Tangerang',
                'sumber' => 'Facebook',
                'paket' => 'Umrah Reguler',
                'staff_id' => null,
                'status_komunikasi' => 'Prospek Baru',
                'notes' => 'Meminta info cicilan pembayaran.',
            ],
            [
                'nama' => 'Fajar Hidayatullah',
                'kontak' => '081321000105',
                'alamat' => 'Jakarta Timur',
                'sumber' => 'Website',
                'paket' => 'Umrah Plus Aqsa',
                'staff_id' => null,
                'status_komunikasi' => 'Prospek Baru',
                'notes' => 'Isi form konsultasi di website.',
            ],
        ];

        foreach ($rows as $row) {
            CalonJemaah::updateOrCreate(
                ['kontak' => $row['kontak']],
                [
                    ...$row,
                    'last_follow_up_at' => null,
                ],
            );
        }
    }
}
