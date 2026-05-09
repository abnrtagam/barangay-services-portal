<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Barangay Complaint & Appointment System</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: Arial, sans-serif;
            background: #f0f4ff;
            color: #1e293b;
            min-height: 100vh;
        }
        header {
            background: #1e4db7;
            color: white;
            padding: 18px 32px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        header h1 { font-size: 1.2rem; font-weight: 800; }
        header p  { font-size: .8rem; color: #bfdbfe; }
        footer {
            background: #0c2461;
            color: #93c5fd;
            text-align: center;
            padding: 18px;
            font-size: .82rem;
            margin-top: 60px;
        }
        main {
            max-width: 860px;
            margin: 40px auto;
            padding: 0 20px;
        }
    </style>
</head>
<body>

    <header>
        <div style="font-size:1.5rem;">🏛️</div>
        <div>
            <h1>Barangay Portal</h1>
            <p>Complaint &amp; Appointment System</p>
        </div>
    </header>

    <main>
        @yield('content')
    </main>

    <footer>
        &copy; {{ date('Y') }} Barangay Complaint &amp; Appointment System — All rights reserved.
    </footer>

</body>
</html>