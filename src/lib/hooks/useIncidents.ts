
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
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          sticker:stickers(*)
        `)
        .eq('sticker.driver_id', driverId)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Incident[]
    },
    enabled: !!driverId,
  })
}

export const useNotifyDriver = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ token, rage }: { token: string; rage?: number }) => 
      rpcFunctions.notifyDriver(token, rage),
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
    mutationFn: ({ plate, style }: { plate: string; style: string }) =>
      rpcFunctions.createSticker(plate, style),
  })
}
