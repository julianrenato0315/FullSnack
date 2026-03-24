"use client"
import { useState, useEffect } from 'react'
import { auth } from '../lib/firebase'
import { signOut, onAuthStateChanged, User } from 'firebase/auth'
import Link from 'next/link'

type Recipe = {
  id: number
  title: string
  image?: string
  usedIngredientCount?: number
  missedIngredientCount?: number
  readyInMinutes?: number
}

export default function Page() {
  const [ingredients, setIngredients] = useState("")
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  async function search() {
    setLoading(true)
    const response = await fetch("/api/recipes?ingredients=" + ingredients)
    const data = await response.json()
    setRecipes(data)
    setLoading(false)
  }

  return (
    <div className="page-wrapper">
      <header className="header">
        <Link href="/" className="header__logo">
          <span className="header__logo-text">Full<span>Snack</span></span>
        </Link>

        <div className="header__user">
          <Link href="/pantry">
            <button className="btn btn--outline" style={{ padding: "7px 16px", fontSize: 13 }}>Pantry</button>
          </Link>

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
        <div className="hero" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem" }}>
          <div>
            <h1 className="hero__title">Delicious recipes<br />for you</h1>
            <p className="hero__subtitle">Add what's in your kitchen and we'll find the perfect match.</p>
          </div>
          <img src="/cooking.jpg" alt="People cooking" style={{ width: 220, height: 220, objectFit: "contain", flexShrink: 0 }} />
        </div>

        <div className="search-bar">
          <input
            className="search-bar__input"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            onKeyDown={(e) => {if (e.key === "Enter") search()}}
            placeholder="Enter ingredients (e.g. chicken, garlic, tomatoes)"
          />
          <button className="btn btn--primary" style={{ padding: "7px 18px", fontSize: 13, flexShrink: 0 }} onClick={search}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {recipes.length > 0 && (
          <div>
            <p className="results-header__subtitle" style={{ marginBottom: "1rem" }}>Found {recipes.length} results</p>
            <div className="recipe-grid">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="card card--recipe">
                  <div className="recipe-card__image-wrap">
                    {recipe.image
                      ? <img className="recipe-card__image" src={recipe.image} alt={recipe.title} />
                      : <div style={{ width: "100%", height: "100%", background: "#f5f5f5" }} />
                    }
                  </div>
                  <div className="recipe-card__body">
                    <h3 className="recipe-card__title">{recipe.title}</h3>
                    {recipe.readyInMinutes && <p className="recipe-card__meta">{recipe.readyInMinutes} min</p>}
                    <div className="recipe-card__tags">
                      {recipe.usedIngredientCount !== undefined && (
                        <span className="chip chip--success" style={{ fontSize: 11, padding: "3px 10px" }}>{recipe.usedIngredientCount} owned</span>
                      )}
                      {recipe.missedIngredientCount !== undefined && recipe.missedIngredientCount > 0 && (
                        <span className="chip chip--danger" style={{ fontSize: 11, padding: "3px 10px" }}>+{recipe.missedIngredientCount} needed</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}