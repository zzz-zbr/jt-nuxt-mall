export async function onRequestGet(context: { request: Request }) {
    const req = context.request;
    const cf = req.cf || {};
    // Extract IP from connecting headers
    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || "127.0.0.1";
    
    const info = {
        ip,
        country: cf.country || "UNKNOWN",
        region: cf.region || "UNKNOWN",
        city: cf.city || "UNKNOWN",
        postalCode: cf.postalCode || "UNKNOWN",
        continent: cf.continent || "UNKNOWN",
        timezone: cf.timezone || "UNKNOWN",
        lang: cf.lang || "UNKNOWN",
        isDev: false // Pages functions usually run in production or wrangler preview
    };
    
    return new Response(JSON.stringify(info), { 
        headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' // Optional: allow cross-origin
        } 
    });
}