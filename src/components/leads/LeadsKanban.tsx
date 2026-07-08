import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { Lead, LeadStatus } from '../../types';
import { SourceChip } from './LeadsTable';
import { formatDistanceToNow } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLead } from '../../api/leads';

const COLUMNS: { id: LeadStatus; label: string }[] = [
  { id: 'NEW', label: 'New' },
  { id: 'CONTACTED', label: 'Contacted' },
  { id: 'QUALIFIED', label: 'Qualified' },
  { id: 'PROPOSAL', label: 'Proposal' },
  { id: 'NEGOTIATION', label: 'Negotiation' },
  { id: 'WON', label: 'Won' },
  { id: 'LOST', label: 'Lost' }
];

export const LeadsKanban = ({ leads, onLeadClick }: { leads: Lead[], onLeadClick?: (lead: Lead) => void }) => {
  const queryClient = useQueryClient();

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: LeadStatus }) => updateLead(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      const previousLeads = queryClient.getQueryData<Lead[]>(['leads']);
      
      queryClient.setQueryData<Lead[]>(['leads'], old => {
        if (!old) return [];
        return old.map(l => l.id === id ? { ...l, status } : l);
      });

      return { previousLeads };
    },
    onError: (err, variables, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads'], context.previousLeads);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId as LeadStatus;
    
    updateLeadMutation.mutate({ id: draggableId, status: newStatus });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px] items-start">
        {COLUMNS.map(col => {
          const colLeads = leads.filter(l => l.status === col.id);
          
          return (
            <div key={col.id} className="w-[280px] shrink-0 bg-mist rounded-md flex flex-col max-h-full">
              <div className="flex items-center justify-between p-3 border-b border-line">
                <span className="font-semibold text-[13px] text-ink">{col.label}</span>
                <span className="bg-paper border border-line text-slate font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-full">
                  {colLeads.length}
                </span>
              </div>
              
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 flex flex-col gap-3 min-h-[150px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-accent/5' : ''
                    }`}
                  >
                    {colLeads.map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={(e) => {
                              // Don't trigger if it was a drag
                              if (!snapshot.isDragging && onLeadClick) {
                                onLeadClick(lead);
                              }
                            }}
                            className={`bg-paper border border-line rounded-md p-3 shadow-card cursor-grab active:cursor-grabbing hover:border-accent transition-colors ${
                              snapshot.isDragging ? 'rotate-2 shadow-modal z-50' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2 gap-2">
                              <div className="font-bold text-[13.5px] text-ink leading-tight">
                                {lead.first_name} {lead.last_name || ''}
                              </div>
                              <div className={`font-mono text-[11px] font-bold shrink-0 ${lead.score >= 80 ? 'text-status-won' : 'text-slate'}`}>
                                {lead.score}
                              </div>
                            </div>
                            <div className="mb-3">
                              <SourceChip source={lead.source} />
                            </div>
                            <div className="flex justify-between items-end border-t border-line pt-2.5 mt-2">
                              <div className="text-[11px] font-mono text-slate">
                                {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                              </div>
                              {lead.owner ? (
                                <div className="w-[22px] h-[22px] rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold" title={lead.owner.full_name}>
                                  {lead.owner.full_name.charAt(0)}
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate">Unassigned</span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
