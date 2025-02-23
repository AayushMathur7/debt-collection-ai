import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  console.log('body', body);
  const response = await fetch('https://aa60-2601-646-200-50e0-f471-f6bd-238b-b46c.ngrok-free.app/outbound-call', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  console.log('data', data);
  return NextResponse.json(data);
} 