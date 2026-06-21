// composables/useCustomFetch.ts
export const useCustomFetch = (url: string, options = {}) => {
  const config = useRuntimeConfig()
  
  return $fetch(url, {
    baseURL: config.public.apiBase,
    ...options
  })
}