import posts from './post/data'

export async function onRequestGet(context) {
    const { env, request } = context
    console.log('request', request);
    const db = env.jiatian
    const { results } = await db.prepare('SELECT * FROM aa').all();
    // if (!id) {
    //     return new Response('NOT found', {status: 404})
    // }
    // return Response.json(posts)
    return Response.json(results)
} 