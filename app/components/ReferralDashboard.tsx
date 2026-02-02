'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import { Copy, Share2, TrendingUp } from 'lucide-react';

interface ReferralData {
  referral: {
    id: string;
    referral_code: string;
    credit_balance: number;
    total_earned: number;
    total_referrals: number;
  };
  stats: {
    totalReferrals: number;
    completedReferrals: number;
    totalEarned: number;
  };
  referralUrl: string;
}

export function ReferralDashboard() {
  const { isAuthenticated } = useAuth();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchReferralData = async () => {
      try {
        const session = await getSession();
        if (!session?.access_token) {
          throw new Error('Not authenticated');
        }
        const token = session.access_token;
        const response = await fetch('/api/referrals/my-referral', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setReferralData(data);
        }
      } catch (error) {
        console.error('Error fetching referral data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [isAuthenticated]);

  if (loading) {
    return <div className="text-center py-8">Loading referral info...</div>;
  }

  if (!referralData) {
    return <div className="text-center py-8 text-gray-600">Unable to load referral data</div>;
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralData.referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Referral Program</h2>
        <p className="text-gray-600">
          Share your unique code and earn $10 credit for every successful referral
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="text-sm font-medium text-emerald-700 mb-1">Total Earned</div>
          <div className="text-3xl font-bold text-emerald-900">
            ${referralData.stats.totalEarned.toFixed(2)}
          </div>
          <div className="text-xs text-emerald-600 mt-2">
            {referralData.stats.totalReferrals} referrals
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-700 mb-1">Current Balance</div>
          <div className="text-3xl font-bold text-blue-900">
            ${referralData.referral.credit_balance.toFixed(2)}
          </div>
          <div className="text-xs text-blue-600 mt-2">
            Ready to use
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm font-medium text-purple-700 mb-1">Completed</div>
          <div className="text-3xl font-bold text-purple-900">
            {referralData.stats.completedReferrals}
          </div>
          <div className="text-xs text-purple-600 mt-2">
            Successful referrals
          </div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Your Referral Code
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralData.referral.referral_code}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded text-gray-900 font-mono font-semibold opacity-60 cursor-not-allowed"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 flex items-center gap-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                aria-label="Copy referral code"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Referral Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralData.referralUrl}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded text-gray-900 text-sm truncate opacity-60 cursor-not-allowed"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(referralData.referralUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label="Copy referral link"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          How It Works
        </h3>

        <ol className="space-y-3">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              1
            </span>
            <div>
              <p className="font-medium text-gray-900">Share Your Code</p>
              <p className="text-sm text-gray-600">
                Send your referral code or link to a friend
              </p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              2
            </span>
            <div>
              <p className="font-medium text-gray-900">Friend Signs Up</p>
              <p className="text-sm text-gray-600">
                They create an account using your code
              </p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              3
            </span>
            <div>
              <p className="font-medium text-gray-900">They Make a Purchase</p>
              <p className="text-sm text-gray-600">
                Your friend completes their first order
              </p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              4
            </span>
            <div>
              <p className="font-medium text-gray-900">Get $10 Credit</p>
              <p className="text-sm text-gray-600">
                The credit is added to your account and ready to use
              </p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}
