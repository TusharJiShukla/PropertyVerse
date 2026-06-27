import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // 1. Get the Authorization header sent by the browser
  const basicAuth = req.headers.get('authorization');

  // 2. If the user hasn't logged in yet, prompt them with the native browser popup
  if (!basicAuth) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Secure Area"',
      },
    });
  }

  // 3. The browser sends the credentials in Base64 format: "Basic dHVzaGFyOmFkbWluMTIz"
  // We split by space to get just the base64 string, then decode it.
  const authValue = basicAuth.split(' ')[1];
  
  // Convert Base64 back to plain text (e.g. "tushar:admin123")
  const decodedValue = Buffer.from(authValue, 'base64').toString();
  
  // Split the plain text into username and password
  const [user, pwd] = decodedValue.split(':');

  // 4. Check credentials against our secure .env file
  const validUser = process.env.ADMIN_USERNAME || 'admin';
  const validPass = process.env.ADMIN_PASSWORD || 'secret123';

  // 5. If they match, let them into the Admin Dashboard!
  if (user === validUser && pwd === validPass) {
    return NextResponse.next(); 
  }

  // 6. If they type the wrong password, reject them and show the popup again
  return new NextResponse('Invalid credentials', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin Secure Area"',
    },
  });
}

// 7. CONFIGURATION: Tell Next.js EXACTLY which routes this middleware should protect.
// We only want to lock the /AdminDashboard and anything inside it. 
// The rest of the website (/properties, /about, etc.) stays completely public!
export const config = {
  matcher: ['/AdminDashboard/:path*'],
};
