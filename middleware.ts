export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/admin/hero/:path*",
    "/admin/services/:path*",
    "/admin/team/:path*",
    "/admin/about/:path*",
    "/admin/contact/:path*",
    "/admin/testimonials/:path*",
    "/admin/blog/:path*",
    "/admin/settings/:path*"
  ]
}
