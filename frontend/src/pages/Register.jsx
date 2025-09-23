import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { toast } from 'react-toastify'

const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!username || !email || !password) {
      setError('Please fill all fields')
      return
    }

    setLoading(true)
    try {
      const form = new FormData()
      form.append('username', username)
      form.append('email', email)
      form.append('password', password)
      if (image) form.append('profilePicture', image)

      await axios.post('/auth/register', form, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Registered successfully')
      setTimeout(() => {
        navigate('/')
      }, 1000)
      setUsername('')
      setEmail('')
      setPassword('')
      setImage(null)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <section className="w-full max-w-md bg-gray-900/90 border border-gray-800 rounded-2xl p-6 shadow-xl text-white">
        <h1 className="text-2xl font-semibold mb-4">Create account</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="flex items-center gap-4 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="sr-only"
            />
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-700 bg-gray-800 overflow-hidden flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 7h4l2-3h6l2 3h4v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 11a3 3 0 100 6 3 3 0 000-6z"
                  />
                </svg>
              </div>
              <div className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-black text-xs font-semibold shadow-md">
                +
              </div>
            </div>
            <div className="text-sm text-gray-400">Profile picture (optional)</div>
          </label>

          <div className="grid gap-3">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent border border-gray-800 px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 outline-none"
            />
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

          {error && (
            <div className="px-3 py-2 rounded-md text-sm text-red-300 bg-red-900/30">
              {error}
            </div>
          )}
          {success && (
            <div className="px-3 py-2 rounded-md text-sm text-green-300 bg-green-900/30">
              {success}
            </div>
          )}

          <button
            className="w-full bg-blue-500 text-black font-semibold py-3 rounded-lg hover:bg-blue-600 disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>

          <div className="mt-3">
            <div className="w-full flex items-center gap-3">
              <hr className="flex-grow border-gray-800" />
              <span className="text-xs text-gray-500">
                Already have an account?
              </span>
              <hr className="flex-grow border-gray-800" />
            </div>
            <Link
              to="/login"
              className="mt-3 block w-full text-center bg-transparent border border-blue-600 text-blue-400 py-2 rounded-lg hover:bg-blue-600 hover:text-black transition"
            >
              Log in
            </Link>
          </div>
        </form>
      </section>
    </main>
  )
}
export default Register
