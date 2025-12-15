'use client';

import { useEffect, useState } from 'react';
import Button from './Button';
import Card from './Card';
import ProjectCard from './ProjectCard';
import ProjectDetailModal from './ProjectDetailModal';
import { useDashboard, LoadingSkeleton, ErrorDisplay } from '@/hooks/useDashboard';
import { headingColors, formInputColors, cardBgColors, dividerColors, statusBadgeColors } from '@/lib/colors';

// ============================================================================
// User Dashboard Component - View My Projects
// ============================================================================
// What: Displays only the logged-in user's projects.
// Why: Users need to track their submitted projects and updates.
// How: Uses shared useDashboard hook with user-specific endpoint.

export default function UserDashboard() {
  // ============================================================================
  // Shared Dashboard Logic
  // ============================================================================

  const {
    projects,
    loading,
    error,
    selectedProjectId,
    isModalOpen,
    handleOpenProject,
    handleCloseModal,
    handleProjectUpdate,
  } = useDashboard({
    endpoint: '/api/projects/mine',
    mockDataSlice: [0, 2], // Show 2 projects for user view in dev preview
  });

  // ============================================================================
  // Orders State
  // ============================================================================

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const response = await fetch('/api/user/orders');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load orders');
        }

        setOrders(data.orders || []);
      } catch (err) {
        setOrdersError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* ====================================================================
          Header
          ==================================================================== */}

      <div>
        <h1 className={`text-3xl font-bold ${headingColors.primary} mb-2`}>
          Your Projects
        </h1>
        <p className={formInputColors.helper}>
          Here&apos;s where things stand. Click any project for details.
        </p>
      </div>

      {/* ====================================================================
          Projects Grid or Empty State
          ==================================================================== */}

      {error ? (
        <ErrorDisplay message={error} />
      ) : loading ? (
        <LoadingSkeleton />
      ) : projects.length === 0 ? (
        <div className={`${cardBgColors.base} rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center`}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-2xl">📋</span>
          </div>
          <h2 className={`text-xl font-semibold ${headingColors.primary} mb-2`}>
            Nothing here yet
          </h2>
          <p className={`${formInputColors.helper} mb-2`}>
            When you&apos;re ready to get something done, we&apos;ll be here.
          </p>
          <p className={`${formInputColors.helper} text-sm mb-6`}>
            Your projects will show up right here so you can track progress and stay in the loop.
          </p>
          <Button variant="purple" href="/contact" size="md">
            Start a Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              email={project.email}
              service={project.service}
              status={project.status}
              createdAt={project.created_at}
              messagePreview={project.message.substring(0, 100)}
              commentCount={
                project.project_comments && project.project_comments.length > 0
                  ? project.project_comments[0].count
                  : 0
              }
              attachmentCount={
                project.attachments ? project.attachments.length : 0
              }
              onClick={() => handleOpenProject(project.id)}
            />
          ))}
        </div>
      )}

      {/* ====================================================================
          Additional Actions
          ==================================================================== */}

      {projects.length > 0 && (
        <div className="text-center">
          <p className={`${formInputColors.helper} mb-4`}>
            Have another project in mind?
          </p>
          <Button variant="blue" href="/contact" size="md">
            Start a New One
          </Button>
        </div>
      )}

      {/* ====================================================================
          My Orders Section
          ==================================================================== */}

      <div className={`mt-12 border-t ${dividerColors.border} pt-8`}>
        <div className="mb-6">
          <h2 className={`text-2xl font-bold ${headingColors.primary} mb-2`}>
            My Orders
          </h2>
          <p className={formInputColors.helper}>
            Your purchases and order history
          </p>
        </div>

        {ordersError ? (
          <ErrorDisplay message={ordersError} />
        ) : ordersLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className={formInputColors.helper}>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card hoverEffect="none">
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-2xl">🛍️</span>
              </div>
              <h3 className={`text-lg font-semibold ${headingColors.primary} mb-2`}>
                No orders yet
              </h3>
              <p className={`${formInputColors.helper} mb-6`}>
                When you make purchases, they&apos;ll appear here so you can track them.
              </p>
              <Button variant="purple" href="/shop" size="md">
                Browse Consultations
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id} hoverEffect="lift">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <p className={`font-semibold ${headingColors.primary}`}>
                        Order #{order.medusa_order_id?.slice(0, 8)}
                      </p>
                      <p className={`text-sm ${formInputColors.helper}`}>
                        {new Date(order.created_at).toLocaleDateString()} at{' '}
                        {new Date(order.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${headingColors.primary}`}>
                        ${(order.total / 100).toFixed(2)}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded mt-1 ${
                          order.status === 'completed'
                            ? statusBadgeColors.completed
                            : order.status === 'pending'
                            ? statusBadgeColors.pending
                            : statusBadgeColors.cancelled
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ====================================================================
          Project Detail Modal
          ==================================================================== */}

      {selectedProjectId && (
        <ProjectDetailModal
          projectId={selectedProjectId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdate={handleProjectUpdate}
        />
      )}
    </div>
  );
}
