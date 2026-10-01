import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  try {
    revalidateTag('institution-settings');
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    return NextResponse.json(
      { revalidated: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
