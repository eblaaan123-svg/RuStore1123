import { NextResponse } from 'next/server'
import { getAppFull } from '@/lib/rustore'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pkg: string }> },
) {
  const { pkg } = await params
  const app = await getAppFull(pkg)
  if (!app) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  return NextResponse.json({ app })
}
