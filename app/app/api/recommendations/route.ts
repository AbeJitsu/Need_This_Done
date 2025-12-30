import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// ============================================================================
// Product Recommendations API - /api/recommendations
// ============================================================================
// What: Returns personalized product recommendations
// Why: Increase conversions and average order value through relevant suggestions
// How: Combines user history, product similarities, and trending data
//
// Endpoints:
// - GET: Get recommendations (popular, trending, personalized, related)
// - POST: Record a product interaction (view, cart_add, purchase)

export const dynamic = 'force-dynamic';

// ============================================================================
// Types
// ============================================================================

interface Recommendation {
  product_id: string;
  score: number;
  reason: string;
}

type RecommendationType = 'popular' | 'trending' | 'personalized' | 'related' | 'bought_together';

// ============================================================================
// GET - Fetch Recommendations
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    // Get recommendation type
    const type = (searchParams.get('type') || 'popular') as RecommendationType;
    const productId = searchParams.get('product_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    let recommendations: Recommendation[] = [];

    switch (type) {
      case 'popular':
        recommendations = await getPopularProducts(supabase, limit);
        break;

      case 'trending':
        recommendations = await getTrendingProducts(supabase, limit);
        break;

      case 'personalized':
        if (user) {
          recommendations = await getPersonalizedRecommendations(supabase, user.id, limit);
        } else {
          // Fallback to popular for anonymous users
          recommendations = await getPopularProducts(supabase, limit);
        }
        break;

      case 'related':
      case 'bought_together':
        if (!productId) {
          return NextResponse.json(
            { error: 'product_id is required for related recommendations' },
            { status: 400 }
          );
        }
        recommendations = await getRelatedProducts(supabase, productId, type, limit);
        break;

      default:
        return NextResponse.json(
          { error: `Invalid recommendation type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      type,
      recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error('Recommendations GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Record Product Interaction
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();

    // Validate required fields
    if (!body.product_id) {
      return NextResponse.json(
        { error: 'product_id is required' },
        { status: 400 }
      );
    }

    const validTypes = ['view', 'cart_add', 'purchase', 'wishlist'];
    if (!body.interaction_type || !validTypes.includes(body.interaction_type)) {
      return NextResponse.json(
        { error: `interaction_type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    // Record the interaction
    const { data, error } = await supabase.rpc('record_product_interaction', {
      p_product_id: body.product_id,
      p_interaction_type: body.interaction_type,
      p_user_id: user?.id || null,
      p_session_id: body.session_id || null,
      p_variant_id: body.variant_id || null,
      p_source_page: body.source_page || null,
      p_referrer_product_id: body.referrer_product_id || null,
    });

    if (error) {
      console.error('Failed to record interaction:', error);
      return NextResponse.json(
        { error: 'Failed to record interaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      interaction_id: data,
    }, { status: 201 });
  } catch (error) {
    console.error('Recommendations POST error:', error);
    return NextResponse.json(
      { error: 'Failed to record interaction' },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

async function getPopularProducts(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  limit: number
): Promise<Recommendation[]> {
  const { data, error } = await supabase
    .from('popular_products')
    .select('product_id, total_interactions, purchase_count')
    .limit(limit);

  if (error) {
    console.error('Popular products query error:', error);
    return [];
  }

  return (data || []).map((item) => ({
    product_id: item.product_id,
    score: Number(item.total_interactions),
    reason: `${item.purchase_count} purchases this week`,
  }));
}

async function getTrendingProducts(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  limit: number
): Promise<Recommendation[]> {
  const { data, error } = await supabase
    .from('trending_products')
    .select('product_id, recent_count, trend_score')
    .limit(limit);

  if (error) {
    console.error('Trending products query error:', error);
    return [];
  }

  return (data || []).map((item) => ({
    product_id: item.product_id,
    score: Number(item.trend_score),
    reason: 'Trending today',
  }));
}

async function getPersonalizedRecommendations(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  limit: number
): Promise<Recommendation[]> {
  // Get products the user has interacted with
  const { data: userProducts } = await supabase
    .from('product_interactions')
    .select('product_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!userProducts || userProducts.length === 0) {
    // No history, return popular products
    return getPopularProducts(supabase, limit);
  }

  const viewedProductIds = userProducts.map((p) => p.product_id);

  // Get similar products to what they've viewed
  const { data: similar } = await supabase
    .from('product_similarities')
    .select('related_product_id, score, relationship_type')
    .in('product_id', viewedProductIds)
    .not('related_product_id', 'in', `(${viewedProductIds.join(',')})`)
    .order('score', { ascending: false })
    .limit(limit);

  if (!similar || similar.length === 0) {
    return getPopularProducts(supabase, limit);
  }

  return similar.map((item) => ({
    product_id: item.related_product_id,
    score: Number(item.score),
    reason: 'Based on your browsing history',
  }));
}

async function getRelatedProducts(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  productId: string,
  relationshipType: 'related' | 'bought_together',
  limit: number
): Promise<Recommendation[]> {
  const types = relationshipType === 'bought_together'
    ? ['bought_together']
    : ['bought_together', 'viewed_together', 'similar_category'];

  const { data, error } = await supabase
    .from('product_similarities')
    .select('related_product_id, score, relationship_type')
    .eq('product_id', productId)
    .in('relationship_type', types)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Related products query error:', error);
    return [];
  }

  return (data || []).map((item) => ({
    product_id: item.related_product_id,
    score: Number(item.score),
    reason: item.relationship_type === 'bought_together'
      ? 'Frequently bought together'
      : 'Customers also viewed',
  }));
}
