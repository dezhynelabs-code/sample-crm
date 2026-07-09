import { useForm } from 'react-hook-form';
import { useOverlays } from '@/context/OverlaysContext';
import { useCampaigns } from '@/context/CampaignsContext';
import { Modal } from '@/components/ui/Modal';
import type { CampaignStatus, NewCampaignInput } from '@/types/campaign';

type FormValues = {
  name: string;
  subtitle: string;
  status: CampaignStatus;
  spend: number;
  leadsGen: number;
};

const defaultValues: FormValues = {
  name: '',
  subtitle: '',
  status: 'active',
  spend: 0,
  leadsGen: 0,
};

// Ported from the #newCampaignForm markup + initCampaigns() submit handler
// in the original app.js.
export function NewCampaignModal() {
  const { isNewCampaignModalOpen, closeNewCampaignModal } = useOverlays();
  const { addCampaign } = useCampaigns();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues });

  function handleClose() {
    reset(defaultValues);
    closeNewCampaignModal();
  }

  function onSubmit(values: FormValues) {
    const input: NewCampaignInput = {
      name: values.name.trim(),
      subtitle: values.subtitle.trim() || 'Manual Entry',
      status: values.status,
      spend: Number(values.spend) || 0,
      leadsGen: Number(values.leadsGen) || 0,
    };
    addCampaign(input);
    handleClose();
  }

  return (
    <Modal isOpen={isNewCampaignModalOpen} onClose={handleClose} title="Create New Campaign">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="campaignName">Campaign Name *</label>
            <input
              id="campaignName"
              type="text"
              placeholder="e.g. Meta Ads - Retargeting"
              {...register('name', { required: true })}
            />
            {errors.name && <span className="form-error">Campaign name is required</span>}
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="campaignSubtitle">Channel / Tracking Source</label>
            <input
              id="campaignSubtitle"
              type="text"
              placeholder="e.g. Meta Ads Integration"
              {...register('subtitle')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="campaignStatus">Status</label>
            <select id="campaignStatus" {...register('status')}>
              <option value="active">Active</option>
              <option value="ended">Ended</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="campaignSpend">Spend ($)</label>
            <input
              id="campaignSpend"
              type="number"
              min={0}
              step="0.01"
              placeholder="1000"
              {...register('spend')}
            />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="campaignLeadsGen">Leads Generated So Far</label>
            <input
              id="campaignLeadsGen"
              type="number"
              min={0}
              placeholder="50"
              {...register('leadsGen')}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create Campaign
          </button>
        </div>
      </form>
    </Modal>
  );
}
