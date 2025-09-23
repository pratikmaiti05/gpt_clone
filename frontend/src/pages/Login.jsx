import axios from '../api/axios'
import  { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
const Login = () => {
  const navigate=useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!email || !password) {
      setError('Please fill all fields')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post(
        "/auth/login",
        { email, password },
        { withCredentials: true }
      );
      toast.success(res.data.message || "Login successful!");
      setTimeout(() => {
        navigate("/");
      }, 1000);
      setEmail('');
      setPassword('');
    } catch (err) {
      toast.error("Login failed");
    }finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <section className="w-full max-w-md bg-gray-900/90 border border-gray-800 rounded-2xl p-6 shadow-xl text-white">
        <h1 className="text-2xl font-semibold mb-4">Login</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3">
            <input
              type="email"
              placeholder="you@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-gray-800 px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <input
              type="password"
              placeholder="*****"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border border-gray-800 px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          {error && <div className="px-3 py-2 rounded-md text-sm text-red-300 bg-red-900/30">{error}</div>}
          {success && <div className="px-3 py-2 rounded-md text-sm text-green-300 bg-green-900/30">{success}</div>}

          <button
            className="w-full bg-blue-500 text-black font-semibold py-3 rounded-lg hover:bg-blue-600 disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Login'}
          </button>

          <div className="mt-3">
            <div className="w-full flex items-center gap-3">
              <hr className="flex-grow border-gray-800" />
              <span className="text-xs text-gray-500">Don't have an account?</span>
              <hr className="flex-grow border-gray-800" />
            </div>
            <Link
              to="/register"
              className="mt-3 block w-full text-center bg-transparent border border-blue-600 text-blue-400 py-2 rounded-lg hover:bg-blue-600 hover:text-black transition"
            >
              Create Account
            </Link>
          </div>
        </form>
      </section>
    </main>
  )
}

export default Login