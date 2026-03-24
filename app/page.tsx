"use client"
import {useState} from 'react'

type Recipe = {
  id: number
  title: string
}

function Page() {
  const [ingredients, setIngredients] = useState("")
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setIsLoading] = useState(false)

  async function search() {
    setIsLoading(true);
    const response = await fetch("/api/recipes?ingredients=" + ingredients);
    const data = await response.json()
    setRecipes(data)
    setIsLoading(false)
  }

  return (
    <div>
    <input value = {ingredients} onChange={(e) => setIngredients(e.target.value)} />
    <button onClick={search}>{loading ? "Searching ..." : "Search"}</button>
    {recipes.map((recipe) => (
      <div key={recipe.id}>{recipe.title}</div>
    ))}
    </div>
  )
}

export default Page