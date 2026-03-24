"use client"
import { useState } from 'react'
import { auth } from '../../lib/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignup() {
    setError("")
    setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      router.push("/")
    } catch (e) {
      setError((e as Error).message)
    }
    setLoading(false)
  }

  return (
    <div className="auth-wrapper"><div className="auth-card"><Link href="/"><button className="auth-back">← Back to home</button></Link><div className="auth-header"><div className="auth-logo-icon"></div><h1 className="auth-title">Create account</h1><p className="auth-subtitle">Join FullSnack and discover new recipes</p></div><div className="auth-form"><input
            className="auth-input"
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {if (e.key === "Enter") handleSignup()}}
          /><input
            className="auth-input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSignup()}}
          />

          {error ? <p className="auth-error">{error}</p>: null}

          <button
            className="btn btn--primary btn--full"
            onClick={handleSignup}
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? "Creating account..." : "Sign up"}
          </button></div><p className="auth-footer">
          Already have an account? <Link href="/login">Log in</Link></p></div></div>
  )
}