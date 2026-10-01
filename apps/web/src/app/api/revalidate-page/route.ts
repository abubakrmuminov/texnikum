import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    revalidateTag('pages');
    if (body?.slug) {
      revalidatePath(`/${body.slug}`);
      revalidatePath(`/info/${body.slug}`);
    }
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    return NextResponse.json(
      { revalidated: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
