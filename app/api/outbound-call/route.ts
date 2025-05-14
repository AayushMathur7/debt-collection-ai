import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  console.log('body', body);
  const response = await fetch('https://bee7-2601-645-c600-d5b0-540f-315c-df3b-944a.ngrok-free.app/outbound-call', {
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