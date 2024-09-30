import { NextRequest, NextResponse } from 'next/server'
import { getTeamComparison } from '@/lib/db'

type SearchParams = {
  ids: string | null;
};

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const { ids } = Object.fromEntries(searchParams) as SearchParams;

  if (!ids) {
    return NextResponse.json({ message: 'Invalid team IDs' }, { status: 400 });
  }

  const teamIds = ids.split(',')

  try {
    const comparisonData = await getTeamComparison(teamIds)
    return NextResponse.json(comparisonData)
  } catch (error) {
    console.error('Error fetching team comparison data:', error)
    return NextResponse.json({ message: 'Error fetching team comparison data' }, { status: 500 })
  }
}