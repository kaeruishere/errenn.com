import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
  
  if (authHeader === `Bearer ${adminPassword}`) {
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
