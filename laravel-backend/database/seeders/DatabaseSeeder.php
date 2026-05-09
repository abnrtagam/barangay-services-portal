<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Complaint Categories ────────────────────────────────
        $categories = [
            ['name' => 'Noise Complaint',         'description' => 'Excessive noise from neighbors, events, or establishments.'],
            ['name' => 'Garbage / Sanitation',    'description' => 'Improper garbage disposal, clogged drainage, sanitation issues.'],
            ['name' => 'Illegal Construction',    'description' => 'Unauthorized building or construction activities.'],
            ['name' => 'Public Safety',           'description' => 'Threats to public safety, accidents, hazardous conditions.'],
            ['name' => 'Street / Road Issues',    'description' => 'Pothole, broken streetlights, road damage.'],
            ['name' => 'Flooding',                'description' => 'Flooding in residential or public areas.'],
            ['name' => 'Animal Nuisance',         'description' => 'Stray animals, animal cruelty, or other animal-related issues.'],
            ['name' => 'Business / Vendor Issue', 'description' => 'Unlicensed businesses, vendor disputes, market issues.'],
            ['name' => 'Domestic Dispute',        'description' => 'Family or neighbor disputes requiring barangay mediation.'],
            ['name' => 'Others',                  'description' => 'Other complaints not covered by the listed categories.'],
        ];

        foreach ($categories as $cat) {
            DB::table('complaint_categories')->insertOrIgnore(array_merge($cat, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // ── Admin User ──────────────────────────────────────────
        $adminExists = DB::table('users')->where('email', 'admin@barangay.gov.ph')->exists();
        if (!$adminExists) {
            $adminId = DB::table('users')->insertGetId([
                'first_name' => 'Barangay',
                'last_name'  => 'Admin',
                'email'      => 'admin@barangay.gov.ph',
                'phone'      => '09000000000',
                'address'    => 'Barangay Hall',
                'password'   => Hash::make('admin1234'),
                'role'       => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            DB::table('admins')->insert([
                'user_id'    => $adminId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ── Sample Announcement ─────────────────────────────────
        $adminUser = DB::table('users')->where('email', 'admin@barangay.gov.ph')->first();
        if ($adminUser) {
            $hasAnn = DB::table('announcements')->exists();
            if (!$hasAnn) {
                DB::table('announcements')->insert([
                    [
                        'title'      => 'Welcome to the Barangay Online Portal',
                        'content'    => 'We are pleased to launch our new online complaint and appointment booking system. Residents can now file complaints and schedule visits to the barangay hall from the comfort of their homes. For assistance, please visit the barangay office during office hours.',
                        'priority'   => 'High',
                        'created_by' => $adminUser->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'title'      => 'Office Hours Reminder',
                        'content'    => 'The barangay hall is open Monday to Friday, 8:00 AM to 5:00 PM. Walk-in appointments are available, but we encourage residents to book online for faster service. The office is closed on weekends and public holidays.',
                        'priority'   => 'Normal',
                        'created_by' => $adminUser->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                ]);
            }
        }

        $this->command->info('✅ Seeding complete!');
        $this->command->info('   Admin login: admin@barangay.gov.ph / admin1234');
    }
}
