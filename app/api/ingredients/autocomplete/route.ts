import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const url = new URL(request.url)
    const query = url.searchParams.get("query")

    if(!query) {
        return NextResponse.json({ error: "Missing query" }, {status: 400})
    }

    const apiKey = process.env.SPOONACULAR_API_KEY
    const spoonacularUrl = `https://api.spoonacular.com/food/ingredients/autocomplete?query=${encodeURIComponent(query)}&number=7&metaInformation=true&apiKey=${apiKey}`

    try {
        const response = await fetch(spoonacularUrl)
        const data = await response.json()
        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ error: "Failed to fetch"}, {status: 500})
    }
}   