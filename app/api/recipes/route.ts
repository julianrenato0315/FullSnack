import {NextResponse} from "next/server"

export async function GET(request: Request) {
    
    const url = new URL(request.url) 
    const searchParams = url.searchParams

    const ingredients = searchParams.get('ingredients')

    if (ingredients == null || ingredients == ""){
        return NextResponse.json({error: "Problem retrieving ingredients"},{status: 400})
    }

    const apiKey = process.env.SPOONACULAR_API_KEY

    let allRecipes = []
    let offset = 0
    const limit = 50
    const maxBatches = 20 // Prevent infinite loops

    // Keep fetching until we have at least 8 recipes with instructions
    for (let batch = 0; batch < maxBatches && allRecipes.length < 8; batch++) {
        const spoonacularUrl = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&number=${limit}&offset=${offset}&apiKey=${apiKey}`
        try {
            const response = await fetch(spoonacularUrl)
            const recipes = await response.json()

            if (!Array.isArray(recipes) || recipes.length === 0) {
                break // No more recipes available
            }

            // Filter recipes that have instructions
            for (const recipe of recipes) {
                if (allRecipes.length >= 8) break
                try {
                    const detailUrl = `https://api.spoonacular.com/recipes/${recipe.id}/information?includeNutrition=false&apiKey=${apiKey}`
                    const detailResponse = await fetch(detailUrl)
                    const detailData = await detailResponse.json()
                    if ((detailData.instructions && detailData.instructions.trim()) || (detailData.analyzedInstructions && detailData.analyzedInstructions.length > 0)) {
                        allRecipes.push(recipe)
                    }
                } catch (error) {
                    // Skip if detail fetch fails
                    continue
                }
                // Add small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 100))
            }

            offset += limit
            if (recipes.length < limit) break // No more pages
        } catch (error) {
            break // Stop on error
        }
    }

    return NextResponse.json(allRecipes)
}