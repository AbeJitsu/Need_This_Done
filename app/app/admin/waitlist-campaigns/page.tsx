'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import Card from '@/components/Card';
import PageHeader from '@/components/PageHeader';

interface Campaign {
  id: string;
  campaign_name: string;
  campaign_type: string;
  title: string;
  status: string;
  created_at: string;
  sent_at: string | null;
}

export default function WaitlistCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/waitlist-campaigns');
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      const data = await response.json();
      setCampaigns(data.campaigns);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'text-slate-600 bg-slate-100';
      case 'scheduled':
        return 'text-blue-600 bg-blue-100';
      case 'sending':
        return 'text-amber-600 bg-amber-100';
      case 'sent':
        return 'text-emerald-600 bg-emerald-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCampaignTypeLabel = (type: string) => {
    switch (type) {
      case 'targeted_offer':
        return 'Targeted Offer';
      case 'restock_alert':
        return 'Restock Alert';
      case 'exclusive_discount':
        return 'Exclusive Discount';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Waitlist Campaigns" />
        <Link href="/admin/waitlist-campaigns/new">
          <Button variant="green">Create Campaign</Button>
        </Link>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{error}</p>
        </Card>
      )}

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600">Loading campaigns...</p>
        </Card>
      ) : campaigns.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="mb-4 text-gray-600">No campaigns yet. Create your first one!</p>
          <Link href="/admin/waitlist-campaigns/new">
            <Button variant="green" size="sm">
              Create Campaign
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {campaign.campaign_name}
                    </h3>
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <p className="mb-3 text-gray-600">{campaign.title}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Type: {getCampaignTypeLabel(campaign.campaign_type)}</span>
                    <span>
                      Created: {new Date(campaign.created_at).toLocaleDateString()}
                    </span>
                    {campaign.sent_at && (
                      <span>
                        Sent: {new Date(campaign.sent_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <Link href={`/admin/waitlist-campaigns/${campaign.id}`}>
                  <Button variant="blue" size="sm">
                    View Details
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
