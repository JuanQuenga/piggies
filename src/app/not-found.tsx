export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-4">Page not found</p>
        <a href="/" className="text-purple-400 hover:text-purple-300 underline">
          Go back home
        </a>
      </div>
    </div>
  );
}
