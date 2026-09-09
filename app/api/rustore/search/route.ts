import { NextResponse } from 'next/server'
import { searchApps } from '@/lib/rustore'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') ?? ''
  const pageSize = Number(searchParams.get('pageSize')) || 30
  const apps = await searchApps(query, pageSize)
  return NextResponse.json({ apps })
}
