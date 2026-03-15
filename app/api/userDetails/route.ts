// app/api/userDetails/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: "Hello from userDetails GET" })
}

export async function POST(req: Request) {
  const data = await req.json()
  return NextResponse.json({ received: data })
}