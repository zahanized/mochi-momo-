function HomePage({ onNavigate }) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-2 text-4xl font-bold text-purple-600">
            Mochi Momo
          </h1>
          <p className="mb-8 text-gray-600">
            Study together, stay focused, get things done.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => onNavigate('login')}
              className="rounded bg-purple-600 py-2 font-semibold text-white hover:bg-purple-700"
            >
              Log In
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="rounded border border-purple-600 py-2 font-semibold text-purple-600 hover:bg-purple-50"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  export default HomePage;