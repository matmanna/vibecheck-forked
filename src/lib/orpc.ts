import { RPCLink } from '@orpc/client/fetch'
import { createORPCClient } from '@orpc/client'
import { RouterClient } from '@orpc/server'
import { router } from '@/server/api/orpc'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'

const link = new RPCLink({
  url: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api`,
  headers: async () => {
    if (typeof window !== 'undefined') {
      return {}
    }

    const { headers } = await import('next/headers')
    return Object.fromEntries(await headers())
  },
})




// Create a client for your router
export const client: RouterClient<typeof router> = createORPCClient(link)
export const orpc = createTanstackQueryUtils(client)

