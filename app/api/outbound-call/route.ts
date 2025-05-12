import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  console.log('body', body);
  const response = await fetch('https://4323-2601-646-200-50e0-7983-d885-2ac6-8ffb.ngrok-free.app/outbound-call', {
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