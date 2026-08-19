import { NextResponse } from 'next/server';

export async function POST(_request: Request) {
  return NextResponse.json({ error: 'Sender events are accepted only through the signed prospecting Resend webhook.' }, { status: 410 });
}
