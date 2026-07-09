import { useForm } from 'react-hook-form';
import { useOverlays } from '@/context/OverlaysContext';
import { useLeads } from '@/context/LeadsContext';
import { Modal } from '@/components/ui/Modal';
import { SOURCE_LABELS, OWNER_OPTIONS } from '@/lib/constants';
import type { LeadSource, LeadStatus, NewLeadInput } from '@/types/lead';

const SOURCE_OPTIONS = Object.keys(SOURCE_LABELS) as LeadSource[];
const STATUS_OPTIONS: LeadStatus[] = [
  'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST',
];

type FormValues = {
  firstName: string;
  lastName: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  owner: string;
};

const defaultValues: FormValues = {
  firstName: '',
  lastName: '',
  source: 'MANUAL_ENTRY',
  status: 'NEW',
  score: 70,
  owner: '',
};

// Ported from the #newLeadForm markup + initModal() submit handler in the
// original app.js, using react-hook-form for validation/state per the
// project's tech stack instead of manual DOM value reads.
export function NewLeadModal() {
  const { isNewLeadModalOpen, closeNewLeadModal } = useOverlays();
  const { addLead } = useLeads();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues });

  function handleClose() {
    reset(defaultValues);
    closeNewLeadModal();
  }

  function onSubmit(values: FormValues) {
    const input: NewLeadInput = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      source: values.source,
      status: values.status,
      score: Number(values.score) || 0,
      owner: values.owner,
    };
    addLead(input);
    handleClose();
  }

  return (
    <Modal isOpen={isNewLeadModalOpen} onClose={handleClose} title="Create New Lead">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="leadFirstName">First Name *</label>
            <input
              id="leadFirstName"
              type="text"
              placeholder="John"
              {...register('firstName', { required: true })}
            />
            {errors.firstName && <span className="form-error">First name is required</span>}
          </div>
          <div className="form-group">
            <label htmlFor="leadLastName">Last Name *</label>
            <input
              id="leadLastName"
              type="text"
              placeholder="Doe"
              {...register('lastName', { required: true })}
            />
            {errors.lastName && <span className="form-error">Last name is required</span>}
          </div>
          <div className="form-group">
            <label htmlFor="leadSource">Lead Source</label>
            <select id="leadSource" {...register('source')}>
              {SOURCE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {SOURCE_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="leadStatus">Status</label>
            <select id="leadStatus" {...register('status')}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="leadScore">Lead Score (0-100) *</label>
            <input
              id="leadScore"
              type="number"
              min={0}
              max={100}
              placeholder="80"
              {...register('score', { required: true, min: 0, max: 100 })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="leadOwner">Assign Representative</label>
            <select id="leadOwner" {...register('owner')}>
              <option value="">Unassigned</option>
              {OWNER_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create Lead
          </button>
        </div>
      </form>
    </Modal>
  );
}
