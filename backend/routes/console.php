<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('accounts:manage', function () {
    $this->components->info('Manajemen akun admin/staff');

    while (true) {
        $action = $this->choice(
            'Pilih aksi',
            ['Buat akun baru', 'Lihat daftar akun', 'Hapus akun', 'Keluar'],
            0
        );

        if ($action === 'Keluar') {
            $this->components->info('Selesai.');
            return;
        }

        if ($action === 'Buat akun baru') {
            $name = '';
            while ($name === '') {
                $name = trim((string) $this->ask('Nama lengkap'));
                if ($name === '') {
                    $this->components->error('Nama tidak boleh kosong.');
                }
            }

            $email = '';
            while ($email === '') {
                $emailInput = trim((string) $this->ask('Email'));
                $validator = Validator::make(['email' => $emailInput], [
                    'email' => ['required', 'email', 'unique:users,email'],
                ]);

                if ($validator->fails()) {
                    $this->components->error($validator->errors()->first('email'));
                    continue;
                }

                $email = $emailInput;
            }

            $phone = trim((string) $this->ask('Nomor telepon (opsional)'));
            $role = $this->choice('Pilih role', ['admin', 'staff'], 1);

            $password = '';
            while (strlen($password) < 8) {
                $passwordInput = (string) $this->secret('Password (minimal 8 karakter)');
                $confirmPassword = (string) $this->secret('Konfirmasi password');

                if (strlen($passwordInput) < 8) {
                    $this->components->error('Password minimal 8 karakter.');
                    continue;
                }

                if ($passwordInput !== $confirmPassword) {
                    $this->components->error('Konfirmasi password tidak sama.');
                    continue;
                }

                $password = $passwordInput;
            }

            $isActive = $this->confirm('Aktifkan akun ini?', true);

            $user = User::create([
                'name' => $name,
                'email' => $email,
                'phone' => $phone !== '' ? $phone : null,
                'password' => Hash::make($password),
                'role' => $role,
                'is_active' => $isActive,
            ]);

            $this->components->info("Akun berhasil dibuat: {$user->name} ({$user->role})");
            continue;
        }

        if ($action === 'Lihat daftar akun') {
            $users = User::query()
                ->orderBy('role')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'phone', 'role', 'is_active', 'last_login_at']);

            if ($users->isEmpty()) {
                $this->components->warn('Belum ada akun yang terdaftar.');
                continue;
            }

            $rows = $users->map(function (User $user, int $index) {
                return [
                    $index + 1,
                    $user->id,
                    $user->name,
                    $user->email,
                    $user->phone ?? '-',
                    $user->role,
                    $user->is_active ? 'Aktif' : 'Nonaktif',
                    $user->last_login_at?->format('d M Y H:i') ?? '-',
                ];
            })->all();

            $this->table(
                ['No', 'ID', 'Nama', 'Email', 'Telepon', 'Role', 'Status', 'Last Login'],
                $rows
            );
            continue;
        }

        if ($action === 'Hapus akun') {
            $users = User::query()
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'role', 'is_active']);

            if ($users->isEmpty()) {
                $this->components->warn('Belum ada akun yang bisa dihapus.');
                continue;
            }

            $options = $users
                ->map(fn (User $user) => "{$user->id} | {$user->name} ({$user->role}) - {$user->email}")
                ->push('Batal')
                ->all();

            $selected = $this->choice('Pilih akun yang akan dihapus', $options, count($options) - 1);

            if ($selected === 'Batal') {
                $this->components->info('Penghapusan dibatalkan.');
                continue;
            }

            $userId = (int) trim(Str::before($selected, '|'));
            $user = User::find($userId);

            if (!$user) {
                $this->components->error('Akun tidak ditemukan.');
                continue;
            }

            if ($user->role === 'admin' && User::where('role', 'admin')->where('id', '!=', $user->id)->count() === 0) {
                $this->components->error('Tidak bisa menghapus admin terakhir.');
                continue;
            }

            if (!$this->confirm("Yakin hapus akun {$user->name} ({$user->email})?", false)) {
                $this->components->info('Penghapusan dibatalkan.');
                continue;
            }

            $user->delete();
            $this->components->info('Akun berhasil dihapus.');
        }
    }
})->purpose('Manajemen interaktif akun admin/staff (create, list, delete)');
