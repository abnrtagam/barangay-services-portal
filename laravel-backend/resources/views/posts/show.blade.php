@extends('layouts.app')

@section('content')

<div style="
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 10px rgba(0,0,0,.08);
    overflow: hidden;
    max-width: 600px;
    margin: 0 auto;
">
    {{-- Blue top bar --}}
    <div style="height: 5px; background: linear-gradient(90deg, #1e4db7, #60a5fa);"></div>

    <div style="padding: 32px 36px;">

        {{-- Title: Dave's Posts style --}}
        <h2 style="
            font-size: 1.6rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 24px;
            text-transform: capitalize;
        ">
            {{ $name }}'s Posts
        </h2>

        {{-- Posts as bullet list --}}
        <ul style="
            list-style: disc;
            padding-left: 22px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        ">
            @foreach($posts as $post)
                <li style="
                    font-size: .98rem;
                    color: #1e293b;
                    line-height: 1.5;
                ">
                    {{ $post['title'] }}
                </li>
            @endforeach
        </ul>

    </div>
</div>

@endsection