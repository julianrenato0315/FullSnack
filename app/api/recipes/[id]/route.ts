import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const apiKey = process.env.SPOONACULAR_API_KEY

    try {
        const response = await fetch(
            `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&apiKey=${apiKey}`
        )
        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch recipe" }, { status: 500 })
    }
}
