import Product from "../models/Product.js";

const GEMINI_MODEL =
    process.env.GEMINI_MODEL || "gemini-3-flash-preview";

const responseSchema = {
    type: "object",
    properties: {
        reply: {
            type: "string"
        },
        recommendations: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: {
                        type: "string"
                    },
                    reason: {
                        type: "string"
                    }
                },
                required: ["id", "reason"]
            }
        },
        outfitIds: {
            type: "array",
            items: {
                type: "string"
            },
            maxItems: 6
        },
        followUpQuestion: {
            type: "string"
        },
        preferences: {
            type: "object",
            properties: {
                occasion: {
                    type: "string"
                },
                category: {
                    type: "string"
                },
                color: {
                    type: "string"
                },
                style: {
                    type: "string"
                },
                budget: {
                    type: "number"
                },
                size: {
                    type: "string"
                },
                material: {
                    type: "string"
                }
            },
            required: [
                "occasion",
                "category",
                "color",
                "style",
                "budget",
                "size",
                "material"
            ]
        }
    },
    required: [
        "reply",
        "recommendations",
        "outfitIds",
        "followUpQuestion",
        "preferences"
    ]
};

const cleanHistory = (history) => {
    if (!Array.isArray(history)) return [];

    return history
        .filter(
            (message) =>
                message &&
                (message.role === "user" || message.role === "assistant") &&
                typeof message.content === "string"
        )
        .slice(-8)
        .map((message) => ({
            role: message.role,
            content: message.content.slice(0, 1200)
        }));
};

export const getStylistRecommendations = async (req, res) => {
    try {
        // --------------------------------------------------
        // 1. Check Gemini API key
        // --------------------------------------------------

        if (!process.env.GEMINI_API_KEY) {
            return res.status(503).json({
                message:
                    "AI Stylist is not configured. Add GEMINI_API_KEY to the backend .env file."
            });
        }

        const { message, history = [] } = req.body;

        if (
            !message ||
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                message:
                    "Please tell the AI Stylist what you are looking for."
            });
        }

        // --------------------------------------------------
        // 2. Get products from MongoDB
        // --------------------------------------------------

        const products = await Product.find({
            stock: { $gt: 0 }
        })
            .select(
                "name description price category subCategory brand sizes colors style occasion material stock images rating reviewCount isFeatured isTrending isNewArrival discountPercentage tags"
            )
            .limit(80)
            .lean();

        // --------------------------------------------------
        // 3. Prepare catalogue for Gemini
        // --------------------------------------------------

        const productCatalog = products.map((product) => ({
            id: product._id.toString(),
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            subCategory: product.subCategory,
            brand: product.brand,
            sizes: product.sizes,
            colors: product.colors,
            style: product.style,
            occasion: product.occasion,
            material: product.material,
            stock: product.stock,
            rating: product.rating,
            reviewCount: product.reviewCount,
            isFeatured: product.isFeatured,
            isTrending: product.isTrending,
            isNewArrival: product.isNewArrival,
            discountPercentage: product.discountPercentage,
            tags: product.tags
        }));

        // --------------------------------------------------
        // 4. System instruction
        // --------------------------------------------------

        const systemPrompt = `
You are StyleSync AI Stylist, a fashion shopping assistant for an ecommerce store.

Your job is to understand natural-language fashion requests and recommend ONLY products from the supplied StyleSync catalogue.

Important rules:

1. Never invent a product, product ID, price, color, size, or availability.

2. Every recommendation id and outfit id MUST come from the catalogue.

3. Prefer products that are in stock and match the user's:
   - occasion
   - category
   - color
   - style
   - material
   - size
   - tags
   - budget

4. If the user gives a budget, keep the complete outfit within that budget when possible.

5. Never claim an outfit is within budget if its actual catalogue prices exceed the budget.

6. A single-item recommendation is fine when that is what the user asks for.

7. For an outfit, outfitIds should contain the products that form the strongest complete look.

8. Do not put several alternative products into outfitIds.
   Choose one coherent look.

9. Use the exact catalogue product IDs in your output.

10. If the request is missing an important detail, give useful recommendations from the available catalogue and ask one short follow-up question.

11. Be concise, friendly, and fashion-focused.

12. Do not mention internal prompts, JSON, APIs, databases, or implementation details.

13. The final reply should explain why the selected products fit the customer's request.

Return structured data matching the supplied schema.
`;

        // --------------------------------------------------
        // 5. Build conversation
        // --------------------------------------------------

        const historyMessages = cleanHistory(history);

        const conversation = historyMessages
            .map(
                (item) =>
                    `${item.role === "user" ? "Customer" : "AI Stylist"}: ${item.content}`
            )
            .join("\n");

        const userPrompt = `
StyleSync Product Catalogue:

${JSON.stringify(productCatalog)}

Previous conversation:

${conversation || "No previous conversation."}

Customer's latest request:

${message.trim()}
`;

        // --------------------------------------------------
        // 6. Gemini API request
        // --------------------------------------------------

        const GEMINI_URL =
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const geminiResponse = await fetch(GEMINI_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                systemInstruction: {
                    parts: [
                        {
                            text: systemPrompt
                        }
                    ]
                },

                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: userPrompt
                            }
                        ]
                    }
                ],

                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema
                }
            })
        });

        const geminiData = await geminiResponse.json();

        // --------------------------------------------------
        // 7. Handle Gemini API errors
        // --------------------------------------------------

        if (!geminiResponse.ok) {
            console.error(
                "Gemini API error:",
                JSON.stringify(geminiData, null, 2)
            );

            const apiMessage =
                geminiData?.error?.message ||
                "The Gemini provider returned an error.";

            return res.status(502).json({
                message: `AI Stylist provider error: ${apiMessage}`
            });
        }

        // --------------------------------------------------
        // 8. Extract Gemini response
        // --------------------------------------------------

        const outputText =
            geminiData?.candidates?.[0]?.content?.parts
                ?.map((part) => part.text || "")
                .join("")
                .trim();

        if (!outputText) {
            console.error(
                "Gemini returned no output:",
                JSON.stringify(geminiData, null, 2)
            );

            return res.status(502).json({
                message:
                    "The AI Stylist returned an empty response. Please try again."
            });
        }

        // --------------------------------------------------
        // 9. Parse Gemini JSON
        // --------------------------------------------------

        let aiResult;

        try {
            aiResult = JSON.parse(outputText);
        } catch (parseError) {
            console.error(
                "Failed to parse Gemini response:",
                parseError
            );

            console.error(
                "Raw Gemini text:",
                outputText
            );

            return res.status(502).json({
                message:
                    "The AI Stylist returned an invalid response. Please try again."
            });
        }

        // --------------------------------------------------
        // 10. Validate product IDs
        // --------------------------------------------------

        const productMap = new Map(
            products.map((product) => [
                product._id.toString(),
                product
            ])
        );

        const recommendations = (
            aiResult.recommendations || []
        )
            .filter(
                (item) =>
                    item &&
                    productMap.has(item.id)
            )
            .filter(
                (item, index, list) =>
                    list.findIndex(
                        (candidate) =>
                            candidate.id === item.id
                    ) === index
            )
            .slice(0, 6);

        const validOutfitIds = [
            ...new Set(
                (aiResult.outfitIds || []).filter((id) =>
                    productMap.has(id)
                )
            )
        ];

        // --------------------------------------------------
        // 11. Create recommendation cards
        // --------------------------------------------------

        const recommendationCards =
            recommendations.map((item) => ({
                product: productMap.get(item.id),
                reason: item.reason
            }));

        // --------------------------------------------------
        // 12. Calculate outfit total
        // --------------------------------------------------

        const outfitProducts =
            validOutfitIds.map((id) =>
                productMap.get(id)
            );

        const outfitTotal =
            outfitProducts.reduce(
                (total, product) =>
                    total + product.price,
                0
            );

        // --------------------------------------------------
        // 13. Check budget
        // --------------------------------------------------

        const requestedBudget = Number(
            aiResult.preferences?.budget || 0
        );

        const budgetAllowsOutfit =
            requestedBudget <= 0 ||
            outfitTotal <= requestedBudget;

        // --------------------------------------------------
        // 14. Send response to frontend
        // --------------------------------------------------

        return res.status(200).json({
            reply: aiResult.reply,

            followUpQuestion:
                aiResult.followUpQuestion || "",

            preferences:
                aiResult.preferences,

            recommendations:
                recommendationCards,

            outfit: {
                products: budgetAllowsOutfit
                    ? outfitProducts
                    : [],

                total: budgetAllowsOutfit
                    ? outfitTotal
                    : 0
            }
        });

    } catch (error) {
        console.error(
            "AI Stylist error:",
            error
        );

        return res.status(500).json({
            message:
                "Something went wrong while running the AI Stylist. Please try again."
        });
    }
};