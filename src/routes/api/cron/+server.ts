import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { API_SECRET_KEY } from '$env/static/private'

export const POST = (async ({ request }) => {
  const foo = await request.json()
  console.log(JSON.stringify(foo))
  return json({a: 1, b: 2, c: foo})
}) satisfies RequestHandler

export const GET = (({ request }) => {
  try {
    const auth = request.headers.get('Authorization')
    if (auth === `Bearer ${API_SECRET_KEY}`) {
      return json({a: 5, b: 6})
    }
  } catch (err: any) {
    throw error(500, err.message)
  }
}) satisfies RequestHandler

