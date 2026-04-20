"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

type Ingredient = {
  id: number
  name: string
  amount: number
  unit: string
  original: string
}

type Step = {
  number: number
  step: string
}

type Recipe = {
  id: number
  title: string
  image?: string
  readyInMinutes?: number
  servings?: number
  summary?: string
  extendedIngredients?: Ingredient[]
  analyzedInstructions?: { steps: Step[] }[]
}

export default function RecipePage() {
  const { id } = useParams()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const res = await fetch(`/api/recipes/${id}`)
        const data = await res.json()
        if (data.error) {
          setError(true)
        } else {
          setRecipe(data)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchRecipe()
  }, [id])

  if (loading) {
    return (
      <div className="page-wrapper">
        <header className="header">
          <Link href="/" className="header__logo">
            <span className="header__logo-text">Full<span>Snack</span></span>
          </Link>
        </header>
        <main className="main-content">
          <p className="results-header__subtitle">Loading recipe...</p>
        </main>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="page-wrapper">
        <header className="header">
          <Link href="/" className="header__logo">
            <span className="header__logo-text">Full<span>Snack</span></span>
          </Link>
        </header>
        <main className="main-content">
          <div className="card card--empty">
            <p className="empty-state__title">Could not load this recipe.</p>
            <p className="empty-state__text">Something went wrong. Try going back and searching again.</p>
            <Link href="/"><button className="btn btn--primary">← Back to search</button></Link>
          </div>
        </main>
      </div>
    )
  }

  const steps = recipe.analyzedInstructions?.[0]?.steps ?? []
  const summary = recipe.summary?.replace(/<[^>]*>/g, "") ?? ""

  return (
    <div className="page-wrapper">
      <header className="header">
        <Link href="/" className="header__logo">
          <span className="header__logo-text">Full<span>Snack</span></span>
        </Link>
        <div className="header__user">
          <Link href="/"><button className="btn btn--outline btn--header">← Back to search</button></Link>
        </div>
      </header>

      <main className="main-content">

        {recipe.image && (
          <img
            src={recipe.image}
            alt={recipe.title}
            style={{ width: "100%", maxHeight: 400, objectFit: "cover", borderRadius: 14, marginBottom: "1.5rem" }}
          />
        )}

        <h1 className="hero__title" style={{ marginBottom: "0.5rem" }}>{recipe.title}</h1>

        <p className="hero__subtitle" style={{ marginBottom: "0.25rem" }}>
          {[recipe.readyInMinutes && `${recipe.readyInMinutes} min`, recipe.servings && `${recipe.servings} servings`].filter(Boolean).join(" · ")}
        </p>

        {summary && (
          <p className="hero__subtitle" style={{ marginBottom: "2rem" }}>{summary}</p>
        )}

        {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <span className="section-label">Ingredients</span>
            <ul style={{ listStyle: "disc", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {recipe.extendedIngredients.map((ing) => (
                <li key={ing.id} style={{ color: "var(--text)", fontSize: 14 }}>{ing.original}</li>
              ))}
            </ul>
          </div>
        )}

        {steps.length > 0 && (
          <div>
            <span className="section-label">Instructions</span>
            <ol style={{ listStyle: "none", paddingLeft: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
              {steps.map((step) => (
                <li key={step.number} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 600, minWidth: 20, flexShrink: 0 }}>{step.number}.</span>
                  <p style={{ color: "var(--text)", lineHeight: 1.6, margin: 0, fontSize: 14 }}>{step.step}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

      </main>
    </div>
  )
}
