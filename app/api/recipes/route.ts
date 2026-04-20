import {NextResponse} from "next/server"

export async function GET(request: Request) {

    const url = new URL(request.url)
    const searchParams = url.searchParams

    const apiKey = process.env.SPOONACULAR_API_KEY

    if (searchParams.get('random') === 'true') {
        try {
            const response = await fetch(`https://api.spoonacular.com/recipes/random?number=1&apiKey=${apiKey}`)
            const data = await response.json()
            const recipe = data.recipes?.[0]
            if (!recipe) return NextResponse.json({ error: "No recipe found" }, { status: 404 })
            return NextResponse.json({ id: recipe.id })
        } catch (error) {
            return NextResponse.json({ error: "Failed to fetch random recipe" }, { status: 500 })
        }
    }

    const ingredients = searchParams.get('ingredients')

    if (ingredients == null || ingredients == ""){
        return NextResponse.json({error: "Problem retrieving ingredients"},{status: 400})
    }

    const spoonacularUrl = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=10&ranking=1&apiKey=${apiKey}`
    try {
        const response = await fetch(spoonacularUrl)
        const data = await response.json()
        return NextResponse.json(data)
    } catch (error){
        return NextResponse.json({error: "Failed to fetch recipes"}, {status: 500})
    }
}