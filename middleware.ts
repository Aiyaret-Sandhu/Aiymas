import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    
    console.log('Token in middleware:', req.nextauth.token);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log('Checking authorization for token:', token);
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/',
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ]
};