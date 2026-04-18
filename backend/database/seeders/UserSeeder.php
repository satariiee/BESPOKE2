<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::firstOrCreate(
            ['email' => 'admin@jemaah.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('admin123'),
                'phone' => '081234567890',
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        // Create staff user
        User::firstOrCreate(
            ['email' => 'staff@jemaah.com'],
            [
                'name' => 'Staff User',
                'password' => Hash::make('staff123'),
                'phone' => '081234567891',
                'role' => 'staff',
                'is_active' => true,
            ]
        );
    }
}
