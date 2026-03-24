"use client"
import {useState, useEffect} from 'react'
import { auth } from '../lib/firebase'
import { signOut, onAuthStateChanged, User } from 'firebase/auth'
import Link from 'next/link'

type Recipe = {
  id: number
  title: string
}

function Page() {
  const [ingredients, setIngredients] = useState("")
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  let searchLabel
  if (loading) {
    searchLabel = "Searching ..."
  } else {
    searchLabel = "Search"
  }

  let authSection
  if (user) {
    authSection = (
      <>
        <span>Logged in as: {user.email}</span>
        <button onClick={() => signOut(auth)}>Log out</button>
      </>
    )
  } else {
    authSection = (
      <>
        <Link href="/login"><button>Log in</button></Link>
        <Link href="/signup"><button>Sign up</button></Link>
      </>
    )
  }

  async function search() {
    setIsLoading(true)
    const response = await fetch("/api/recipes?ingredients=" + ingredients)
    const data = await response.json()
    setRecipes(data)
    setIsLoading(false)
  }

  return (
    <div>
      <div>
        {authSection}
      </div>

      <div style={{ textAlign: "center" }}>
        <p>Your saved dishes:</p>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <button>Chicken Caesar Salad</button>
          <button>Steak and Garlic Potatoes</button>
          <button>Spaghetti Carbonara</button>
          <button>Shrimp Tacos</button>
          <button>BBQ Pulled Pork Sandwich</button>
          <button>Margherita Pizza</button>
        </div>
      </div>

      <input value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
      <button onClick={search}>{searchLabel}</button>
      {recipes.map((recipe) => (
        <div key={recipe.id}>{recipe.title}</div>
      ))}
    </div>
  )
}

export default Page