
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, rpcFunctions } from '../supabaseClient'
import { Incident, ScanPageData } from '../../interfaces/database'

export const useScanPageData = (token: string) => {
  return useQuery({
    queryKey: ['scanPage', token],
    queryFn: async () => {
      // Run periodic cleanup before fetching scan data
      const lastCleanup = localStorage.getItem('lastIncidentCleanup')
      const now = Date.now()
      const oneHour = 60 * 60 * 1000
      
      if (!lastCleanup || now - parseInt(lastCleanup) > oneHour) {
        try {
          console.log('[CLEANUP] Running incident cleanup before scan...')
          const cleanupResult = await rpcFunctions.cleanupOldIncidents()
          if (cleanupResult.success) {
            localStorage.setItem('lastIncidentCleanup', now.toString())
            console.log('[CLEANUP] Cleanup completed:', cleanupResult)
          }
        } catch (error) {
          console.warn('[CLEANUP] Cleanup failed, continuing with scan:', error)
        }
      }
      
      return rpcFunctions.fetchScanPage(token)
    },
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes cache (longer for scan pages)
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection (renamed from cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    refetchOnMount: false, // Don't refetch on component mount if data exists
    refetchOnReconnect: 'always', // Only refetch on reconnect if stale
    retry: 1, // Only retry once to fail fast
    retryDelay: 500, // Quick retry
  })
}

export const useDriverIncidents = (driverId?: string) => {
  return useQuery({
    queryKey: ['driverIncidents', driverId],
    queryFn: () => rpcFunctions.fetchDriverIncidents(driverId!),
    enabled: !!driverId,
  })
}

export const useNotifyDriver = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ token, rage }: { token: string; rage?: number }) => 
      rpcFunctions.notifyDriver(token, rage || 0),
    onSuccess: (_, { token }) => {
      queryClient.invalidateQueries({ queryKey: ['scanPage', token] })
    },
  })
}

export const useAckIncident = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ incidentId, etaMinutes }: { incidentId: string; etaMinutes?: number }) =>
      rpcFunctions.ackIncident(incidentId, etaMinutes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverIncidents'] })
    },
  })
}

export const useCreateSticker = () => {
  return useMutation({
    mutationFn: ({ plate, style, token, userId }: { plate: string; style: string; token?: string; userId?: string }) =>
      rpcFunctions.createSticker(plate, style, token, userId),
  })
}

// Hook for fetching user's sticker history
export const useUserStickers = (userId?: string) => {
  return useQuery({
    queryKey: ['userStickers', userId],
    queryFn: async () => {
      if (!userId) return []
      
      // 🚀 OPTIMIZED: Clean and fast stickers query
      try {
        const { data, error } = await supabase
          .from('stickers')
          .select('id, token, plate, style, status, created_at')
          .eq('owner_id', userId)
          .order('created_at', { ascending: false })
          .limit(20)
        
        if (error) {
          console.error('[STICKERS] Database error:', error)
          throw error
        }
        
        console.log(`[STICKERS] Successfully fetched ${data?.length || 0} stickers for user`)
        return data || []
      } catch (error) {
        console.error('[STICKERS] Query failed:', error)
        throw error
      }
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes cache (longer for better performance)
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if data exists
    retry: 1,
    retryDelay: 1000,
  })
}

// Hook for batch sticker creation
export const useBatchCreateStickers = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ plates, style }: { plates: string[]; style: string }) => {
      const results = []
      
      // Process stickers in parallel but with some delay to avoid overwhelming the system
      for (let i = 0; i < plates.length; i++) {
        const plate = plates[i]
        try {
          const result = await rpcFunctions.createSticker(plate, style)
          results.push({ plate, result, success: true })
        } catch (error) {
          results.push({ plate, error, success: false })
        }
        
        // Small delay between requests to be gentle on the system
        if (i < plates.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }
      
      return results
    },
    onSuccess: () => {
      // Invalidate sticker queries to refresh the history
      queryClient.invalidateQueries({ queryKey: ['userStickers'] })
    },
  })
}
