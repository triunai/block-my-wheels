import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface AcknowledgeDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  etaMinutes: string
  onEtaChange: (value: string) => void
  onAcknowledge: () => void
  isPending: boolean
}

export function AcknowledgeDialog({
  isOpen,
  onOpenChange,
  etaMinutes,
  onEtaChange,
  onAcknowledge,
  isPending,
}: AcknowledgeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Acknowledge Incident</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Let the person know you're on your way to move your vehicle.
          </p>
          
          <div>
            <Label htmlFor="eta">Estimated arrival time (minutes)</Label>
            <Input
              id="eta"
              type="number"
              placeholder="e.g. 5"
              value={etaMinutes}
              onChange={(e) => onEtaChange(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={onAcknowledge}
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? 'Acknowledging...' : 'Acknowledge'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}