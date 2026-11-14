import { getRequestURL, getRouterParam, proxyRequest } from 'h3'

export default defineEventHandler((event) => {
  const { paymentApiOrigin } = useRuntimeConfig(event)
  const id = encodeURIComponent(getRouterParam(event, 'id') || '')
  const target = new URL(`/api/payments/sep/callback/${id}`, paymentApiOrigin)
  target.search = getRequestURL(event).search
  return proxyRequest(event, target.href)
})
