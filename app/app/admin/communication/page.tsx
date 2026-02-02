'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Mail, Send, Plus, Eye } from 'lucide-react';
import Link from 'next/link';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  template_type: string;
  created_at: string;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  total_recipients: number;
  successfully_sent: number;
  opened: number;
  clicked: number;
  sent_at: string;
  email_templates: { name: string };
}

export default function CommunicationHubPage() {
  const { user, getToken } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'templates' | 'campaigns'>('campaigns');
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [showNewCampaign, setShowNewCampaign] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const token = await getToken();

        // Fetch templates
        const templatesRes = await fetch('/api/admin/email-templates', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (templatesRes.ok) {
          const data = await templatesRes.json();
          setTemplates(data.templates);
        }

        // Fetch campaigns
        const campaignsRes = await fetch('/api/admin/email-campaigns', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (campaignsRes.ok) {
          const data = await campaignsRes.json();
          setCampaigns(data.campaigns);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, getToken]);

  if (loading) {
    return <div className="py-12 text-center">Loading communication hub...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-8 h-8" />
            Communication Hub
          </h1>
          <p className="text-gray-600 mt-2">Create email templates and send targeted campaigns</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'campaigns'
              ? 'text-emerald-600 border-emerald-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Campaigns
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'templates'
              ? 'text-emerald-600 border-emerald-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Templates
        </button>
      </div>

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <button
            onClick={() => setShowNewCampaign(!showNewCampaign)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
          >
            <Plus className="w-5 h-5" />
            New Campaign
          </button>

          {showNewCampaign && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Campaign</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    placeholder="e.g., Spring Sale Promotion"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Template
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600">
                    <option>Choose a template...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Segment
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600">
                    <option>All Customers</option>
                    <option>High-Value Customers</option>
                    <option>New Signups (Last 30 Days)</option>
                    <option>Cart Abandoners</option>
                    <option>Inactive Customers</option>
                  </select>
                </div>

                <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition font-medium">
                  Create Campaign
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {campaigns.length > 0 ? (
              campaigns.map(campaign => (
                <div
                  key={campaign.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                      <p className="text-sm text-gray-600">{campaign.subject}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      campaign.status === 'sent'
                        ? 'bg-emerald-100 text-emerald-700'
                        : campaign.status === 'draft'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600">Recipients</p>
                      <p className="text-lg font-semibold text-gray-900">{campaign.total_recipients}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Sent</p>
                      <p className="text-lg font-semibold text-emerald-600">{campaign.successfully_sent}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Opens</p>
                      <p className="text-lg font-semibold text-blue-600">{campaign.opened || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Clicks</p>
                      <p className="text-lg font-semibold text-purple-600">{campaign.clicked || 0}</p>
                    </div>
                  </div>

                  {campaign.status === 'draft' && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition text-sm">
                      <Send className="w-4 h-4" />
                      Send Now
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-600">
                No campaigns yet. Create one to get started!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <button
            onClick={() => setShowNewTemplate(!showNewTemplate)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
          >
            <Plus className="w-5 h-5" />
            New Template
          </button>

          {showNewTemplate && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Template</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    placeholder="e.g., Promotional Banner"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    placeholder="e.g., Save 20% on your next order!"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview Text
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    placeholder="Brief preview shown in inbox"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HTML Content
                  </label>
                  <textarea
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-sm"
                    placeholder="Paste your HTML email template here..."
                  />
                </div>

                <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition font-medium">
                  Create Template
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {templates.length > 0 ? (
              templates.map(template => (
                <div
                  key={template.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.subject}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Created {new Date(template.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-600">
                No templates yet. Create one to get started!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex gap-4 pt-8 border-t border-gray-200">
        <Link href="/admin" className="text-gray-600 hover:text-gray-900">
          ← Back to Admin
        </Link>
      </div>
    </div>
  );
}
