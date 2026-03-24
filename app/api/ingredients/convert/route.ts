import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const url = new URL(request.url)
    const ingredientName = url.searchParams.get("ingredientName")
    const sourceAmount = url.searchParams.get("sourceAmount")
    const sourceUnit = url.searchParams.get("sourceUnit")
    const targetUnit = url.searchParams.get("targetUnit")

    if (!ingredientName || !sourceAmount || !sourceUnit || !targetUnit) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400})
    }

    const apiKey = process.env.SPOONACULAR_API_KEY
    const spoonacularUrl = `https://api.spoonacular.com/recipes/convert?ingredientName=${encodeURIComponent(ingredientName)}&sourceAmount=${sourceAmount}&sourceUnit=${encodeURIComponent(sourceUnit)}&targetUnit=${encodeURIComponent(targetUnit)}&apiKey=${apiKey}`

    try {
        const response = await fetch(spoonacularUrl)
        const data = await response.json()
        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ error: "Failed to convert" }, { status: 500 })
    }
}