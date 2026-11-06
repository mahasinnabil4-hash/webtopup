import { NextResponse } from 'next/server'
import { getActiveGames } from '@/lib/db/queries/games'

export async function GET() {
  try {
    const games = await getActiveGames()
    return NextResponse.json({ games })
  } catch (error) {
    console.error('Get games error:', error)
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
  }
}