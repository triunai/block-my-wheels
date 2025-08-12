
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, rpcFunctions, type Incident, type ScanPageData } from '../supabaseClient'

export const useScanPageData = (token: string) => {
  return useQuery({
    queryKey: ['scanPage', token],
    queryFn: () => rpcFunctions.fetchScanPage(token),
    enabled: !!token,
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
      
      const { data, error } = await supabase
        .from('stickers')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!userId,
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
