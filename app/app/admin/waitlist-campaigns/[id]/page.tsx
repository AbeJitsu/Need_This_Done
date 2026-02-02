'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Card from '@/components/Card';
import PageHeader from '@/components/PageHeader';
import { useToast } from '@/context/ToastContext';

interface Campaign {
  id: string;
  campaign_name: string;
  campaign_type: string;
  title: string;
  message?: string;
  discount_code?: string;
  discount_percent?: number;
  call_to_action_text: string;
  status: string;
  product_ids: string[];
  created_at: string;
  sent_at?: string;
}

interface Stats {
  total_recipients: number;
  sent: number;
  opened: number;
  clicked: number;
  purchased: number;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/waitlist-campaigns/${campaignId}`);
      if (!response.ok) throw new Error('Failed to fetch campaign');
      const data = await response.json();
      setCampaign(data.campaign);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  const handleSendCampaign = async () => {
    if (!campaign) return;

    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      showToast(`Cannot send campaign with status: ${campaign.status}`, 'error');
      return;
    }

    if (!confirm('Are you sure you want to send this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      setSending(true);
      const response = await fetch(
        `/api/admin/waitlist-campaigns/${campaignId}/send`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send campaign');
      }

      const result = await response.json();
      showToast(
        `Successfully sent to ${result.sent} recipients${result.failed > 0 ? ` (${result.failed} failed)` : ''}`,
        'success'
      );

      fetchCampaign();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to send campaign',
        'error'
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading..." />
        <Card className="p-8 text-center">
          <p className="text-gray-600">Loading campaign details...</p>
        </Card>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="space-y-6">
        <PageHeader title="Error" />
        <Card className="border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{error || 'Campaign not found'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title={campaign.campaign_name} />
        <div className="flex gap-2">
          {campaign.status === 'draft' || campaign.status === 'scheduled' ? (
            <Button
              variant="green"
              disabled={sending}
              onClick={handleSendCampaign}
            >
              {sending ? 'Sending...' : 'Send Campaign'}
            </Button>
          ) : null}
          <Button variant="blue" size="sm" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      {/* Campaign Info */}
      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600">Campaign Title</p>
            <p className="text-lg font-semibold text-gray-900">{campaign.title}</p>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600">Status</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">{campaign.status}</p>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600">Campaign Type</p>
            <p className="text-lg font-semibold text-gray-900">{campaign.campaign_type}</p>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600">Created</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(campaign.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {campaign.message && (
          <div className="mt-6 border-t pt-6">
            <p className="mb-2 text-sm font-medium text-gray-600">Message</p>
            <p className="text-gray-700">{campaign.message}</p>
          </div>
        )}

        {(campaign.discount_code || campaign.discount_percent) && (
          <div className="mt-6 border-t pt-6">
            <p className="mb-2 text-sm font-medium text-gray-600">Offer Details</p>
            <div className="space-y-2">
              {campaign.discount_percent && (
                <p className="text-gray-700">
                  Discount: <span className="font-semibold">{campaign.discount_percent}% off</span>
                </p>
              )}
              {campaign.discount_code && (
                <p className="text-gray-700">
                  Code: <span className="font-mono font-semibold">{campaign.discount_code}</span>
                </p>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Performance Stats */}
      {stats && stats.total_recipients > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Performance</h3>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <p className="text-sm text-gray-600">Total Recipients</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total_recipients}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.sent}</p>
              {stats.total_recipients > 0 && (
                <p className="text-xs text-gray-500">
                  {Math.round((stats.sent / stats.total_recipients) * 100)}%
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Opened</p>
              <p className="text-2xl font-bold text-blue-600">{stats.opened}</p>
              {stats.sent > 0 && (
                <p className="text-xs text-gray-500">
                  {Math.round((stats.opened / stats.sent) * 100)}% open rate
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Clicked</p>
              <p className="text-2xl font-bold text-purple-600">{stats.clicked}</p>
              {stats.sent > 0 && (
                <p className="text-xs text-gray-500">
                  {Math.round((stats.clicked / stats.sent) * 100)}% click rate
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Purchased</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.purchased}</p>
              {stats.sent > 0 && (
                <p className="text-xs text-gray-500">
                  {Math.round((stats.purchased / stats.sent) * 100)}% conversion
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {stats && stats.total_recipients === 0 && campaign.status !== 'sent' && (
        <Card className="border-amber-200 bg-amber-50 p-4">
          <p className="text-amber-800">
            No recipients found. Make sure you have waitlist members for the selected products.
          </p>
        </Card>
      )}
    </div>
  );
}
