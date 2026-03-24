"use client"

import { useEffect, useState, useRef } from "react"
import { db, auth } from "@/lib/firebase"
import { collection, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import Link from "next/link"

type PantryItem = {
  id: string
  name: string
  amount: number
  unit: string
  normalizedAmount: number
  normalizedUnit: string
}

type Suggestion = { name: string }

export default function PantryPage() {
  const [user, setUser] = useState<User | null>(null)
  const [pantry, setPantry] = useState<PantryItem[]>([])
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [unit, setUnit] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsubAuth()
  }, [])

  useEffect(() => {
    if (!user) return
    const ref = collection(db, "users", user.uid, "pantry")
    const unsubSnap = onSnapshot(ref, (snapshot) => {
      setPantry(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PantryItem, "id">) })))
    })
    return () => unsubSnap()
  }, [user])

  function handleNameChange(value: string) {
    if (value.length > 0) value = value.charAt(0).toUpperCase() + value.slice(1)
    setName(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim()) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/ingredients/autocomplete?query=${encodeURIComponent(value)}`)
      const data = await res.json()
      setSuggestions(data)
    }, 300)
  }

  function pickSuggestion(suggestion: Suggestion) {
    const name = suggestion.name.charAt(0).toUpperCase() + suggestion.name.slice(1)
    setName(name)
    setSuggestions([])
  }

  async function handleAdd() {
    if (!user || !name || !amount || !unit) return
    setLoading(true)

    let normalizedAmount = parseFloat(amount)
    let normalizedUnit = unit

    try {
      const res = await fetch(
        `/api/ingredients/convert?ingredientName=${encodeURIComponent(name)}&sourceAmount=${amount}&sourceUnit=${encodeURIComponent(unit)}&targetUnit=grams`
      )
      const data = await res.json()
      if (data.targetAmount) {
        normalizedAmount = data.targetAmount
        normalizedUnit = "grams"
      }
    } catch {}

    await addDoc(collection(db, "users", user.uid, "pantry"), {
      name,
      amount: parseFloat(amount),
      unit,
      normalizedAmount,
      normalizedUnit,
    })

    setName("")
    setAmount("")
    setUnit("")
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!user) return
    await deleteDoc(doc(db, "users", user.uid, "pantry", id))
  }

    return (
    <div className="page-wrapper">
      <header className="header">
        <Link href="/" className="header__logo">
          <span className="header__logo-text">Full<span>Snack</span></span>
        </Link>
        <div className="header__user">
          {user ? (
            <>
              <span className="header__email">{user.email}</span>
              <button className="btn btn--link" onClick={() => signOut(auth)}>Sign out</button>
              <div className="header__avatar">{user.email!.slice(0, 2).toUpperCase()}</div>
            </>
          ) : (
            <>
              <Link href="/login"><button className="btn btn--outline" style={{ padding: "7px 16px", fontSize: 13 }}>Log in</button></Link>
              <Link href="/signup"><button className="btn btn--primary" style={{ padding: "7px 16px", fontSize: 13 }}>Sign up</button></Link>
            </>
          )}
        </div>
      </header>

      <main className="main-content">
        {!user ? (
          <div className="empty-state">
            <p className="empty-state__title">Sign in to manage your pantry</p>
            <p className="empty-state__text">Track your ingredients and get personalized recipe suggestions.</p>
            <Link href="/login"><button className="btn btn--primary">Log in</button></Link>
          </div>
        ) : (
          <>
            <div className="hero">
              <h1 className="hero__title">My Pantry</h1>
              <p className="hero__subtitle">Add your ingredients and we'll find recipes you can make.</p>
            </div>

            <div className="card" style={{ marginBottom: "1.5rem" }}>
              <span className="section-label">Add ingredient</span>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 2, minWidth: 160 }}>
                  <input
                    className="auth-input"
                    placeholder="Ingredient name"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                  {suggestions.length > 0 && (
                    <ul style={{
                      position: "absolute", top: "100%", left: 0, right: 0,
                      background: "#fff", border: "1px solid var(--border)",
                      borderRadius: 10, marginTop: 4, padding: "4px 0",
                      listStyle: "none", zIndex: 10,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}>
                      {suggestions.map((s) => (
                        <li key={s.name} onClick={() => pickSuggestion(s)}
                          style={{ padding: "8px 14px", cursor: "pointer", fontSize: 14 }}>
                          {s.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <input
                  className="auth-input"
                  placeholder="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ flex: 1, minWidth: 80 }}
                />
                <input
                  className="auth-input"
                  placeholder="Unit (lbs, cups, whole...)"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  style={{ flex: 1, minWidth: 100 }}
                />
                <button
                  className="btn btn--primary"
                  onClick={handleAdd}
                  disabled={loading || !name || !amount || !unit}
                >
                  {loading ? "Adding..." : "Add"}
                </button>
              </div>
            </div>

            <span className="section-label">
              {pantry.length} ingredient{pantry.length !== 1 ? "s" : ""} in your pantry
            </span>

            {pantry.length === 0 ? (
              <div className="card card--empty">
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No ingredients yet. Add some above!</p>
              </div>
            ) : (
              <div className="chip-list">
                {pantry.map((item) => (
                  <div key={item.id} className="chip">
                    <span>{item.amount} {item.unit} {item.name}</span>
                    <button className="chip__remove" onClick={() => handleDelete(item.id)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
