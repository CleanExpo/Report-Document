export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-xl">Page not found</p>
      <a href="/" className="mt-8 text-blue-600 hover:underline">
        Return home
      </a>
    </div>
  )
}