export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pelanggan/:path*',
    '/tickets/:path*',
    '/sites/:path*',
    '/teknisi/:path*',
    '/sla/:path*',
    '/settings/:path*',
    '/laporan/:path*',
  ],
};
