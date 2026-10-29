import { NextResponse, type NextRequest } from 'next/server';

/** Fast redirect for signed-out visitors; role checks happen in the area layouts. */
export function middleware(req: NextRequest) {
  if (!req.cookies.get('castlab_token')) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*', '/agency/:path*'] };
