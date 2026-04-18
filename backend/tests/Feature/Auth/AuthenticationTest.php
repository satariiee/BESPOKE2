<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test users
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => bcrypt('password123'),
            'phone' => '081234567890',
            'role' => 'admin',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Staff User',
            'email' => 'staff@test.com',
            'password' => bcrypt('password123'),
            'phone' => '081234567891',
            'role' => 'staff',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Inactive User',
            'email' => 'inactive@test.com',
            'password' => bcrypt('password123'),
            'phone' => '081234567892',
            'role' => 'staff',
            'is_active' => false,
        ]);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@test.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Login berhasil',
            ])
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email', 'role'],
                    'token',
                ]
            ]);
    }

    public function test_user_cannot_login_with_invalid_email(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'nonexistent@test.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Email atau password salah',
            ]);
    }

    public function test_user_cannot_login_with_invalid_password(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@test.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Email atau password salah',
            ]);
    }

    public function test_inactive_user_cannot_login(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'inactive@test.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Akun Anda tidak aktif',
            ]);
    }

    public function test_user_can_logout(): void
    {
        // Login first
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'admin@test.com',
            'password' => 'password123',
        ]);

        $token = $loginResponse->json('data.token');

        // Logout
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Logout berhasil',
            ]);
    }

    public function test_user_can_get_profile(): void
    {
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'admin@test.com',
            'password' => 'password123',
        ]);

        $token = $loginResponse->json('data.token');

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/profile');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['id', 'name', 'email', 'role', 'is_active'],
            ]);
    }

    public function test_user_cannot_access_protected_route_without_token(): void
    {
        $response = $this->getJson('/api/profile');

        $response->assertStatus(401);
    }

    public function test_admin_can_access_user_management(): void
    {
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'admin@test.com',
            'password' => 'password123',
        ]);

        $token = $loginResponse->json('data.token');

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/users');

        $response->assertStatus(200);
    }

    public function test_staff_cannot_access_user_management(): void
    {
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'staff@test.com',
            'password' => 'password123',
        ]);

        $token = $loginResponse->json('data.token');

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/users');

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Akses ditolak. Hanya admin yang dapat mengakses resource ini.',
            ]);
    }

    public function test_user_can_refresh_token(): void
    {
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'admin@test.com',
            'password' => 'password123',
        ]);

        $oldToken = $loginResponse->json('data.token');

        $response = $this->withHeader('Authorization', "Bearer $oldToken")
            ->postJson('/api/refresh-token');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email', 'role'],
                    'token',
                ]
            ]);

        $newToken = $response->json('data.token');

        // New token should work
        $this->withHeader('Authorization', "Bearer $newToken")
            ->getJson('/api/profile')
            ->assertStatus(200);
    }

    public function test_user_can_update_profile(): void
    {
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'admin@test.com',
            'password' => 'password123',
        ]);

        $token = $loginResponse->json('data.token');

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/profile', [
                'name' => 'Admin Updated',
                'email' => 'admin.updated@test.com',
                'phone' => '081200000000',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Profil berhasil diperbarui',
                'data' => [
                    'name' => 'Admin Updated',
                    'email' => 'admin.updated@test.com',
                    'phone' => '081200000000',
                ],
            ]);
    }

    public function test_user_can_change_password(): void
    {
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'admin@test.com',
            'password' => 'password123',
        ]);

        $token = $loginResponse->json('data.token');

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/change-password', [
                'current_password' => 'password123',
                'new_password' => 'newpassword123',
                'new_password_confirmation' => 'newpassword123',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Password berhasil diperbarui',
            ]);

        $this->postJson('/api/login', [
            'email' => 'admin@test.com',
            'password' => 'newpassword123',
        ])->assertStatus(200);
    }

    public function test_user_cannot_change_password_with_invalid_current_password(): void
    {
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'admin@test.com',
            'password' => 'password123',
        ]);

        $token = $loginResponse->json('data.token');

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/change-password', [
                'current_password' => 'wrongpassword',
                'new_password' => 'newpassword123',
                'new_password_confirmation' => 'newpassword123',
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Password saat ini tidak sesuai',
            ]);
    }
}
