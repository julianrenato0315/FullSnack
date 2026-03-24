"use client"
import { useState } from 'react'
import { auth } from '../../lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setError("")
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/")
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="auth-wrapper"><div className="auth-card"><Link href="/"><button className="auth-back">← Back to home</button></Link><div className="auth-header"><div className="auth-logo-icon"></div><h1 className="auth-title">Welcome back</h1><p className="auth-subtitle">Log in to your FullSnack account</p></div><div className="auth-form"><input
            className="auth-input"
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          /><input
            className="auth-input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          {error && <p className="auth-error">{error}</p>}

          <button
            className="btn btn--primary btn--full"
            onClick={handleLogin}
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? "Logging in..." : "Log in"}
          </button></div><p className="auth-footer">
          Don't have an account? <Link href="/signup">Sign up</Link></p></div></div>
  )
}