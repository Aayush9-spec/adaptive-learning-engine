export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © 2024 Adaptive Learning Engine. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="/privacy" className="hover:text-primary-600 min-h-tap-target flex items-center">
              Privacy
            </a>
            <a href="/terms" className="hover:text-primary-600 min-h-tap-target flex items-center">
              Terms
            </a>
            <a href="/help" className="hover:text-primary-600 min-h-tap-target flex items-center">
              Help
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
