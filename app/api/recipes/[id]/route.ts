import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: "Missing recipe id" }, { status: 400 })
  }

  const apiKey = process.env.SPOONACULAR_API_KEY
  const spoonacularUrl = `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&apiKey=${apiKey}`

  try {
    const response = await fetch(spoonacularUrl)
    const data = await response.json()
    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Failed to fetch recipe details" }, { status: response.status })
    }
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch recipe details" }, { status: 500 })
  }
}
