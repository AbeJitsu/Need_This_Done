import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { supabase } from '@/lib/supabase';

// ============================================================================
// Health Check Endpoint - /api/health
// ============================================================================
// What is a health check?
// A health check is like a doorbell for your application. External monitoring
// systems (load balancers, uptime monitors, Docker) call this endpoint to verify
// the app is alive and all critical systems are working.
//
// Returns:
// - 200 OK: Everything is working
// - 500 Server Error: Something is broken (specify what in the response)
//
// What it checks:
// - Is the app responding? (obviously, since we got here)
// - Is Redis accessible? (for sessions and caching)
// - Is Supabase accessible? (for the database)

export async function GET() {
  try {
    // ====================================================================
    // Check Redis Connectivity
    // ====================================================================
    // Redis is like the kitchen's order ticket board
    // If it's down, we can't track sessions or cache data
    // Ping it to make sure it's responsive

    let redisStatus = 'down';
    try {
      const pong = await redis.ping();
      redisStatus = pong === 'PONG' ? 'up' : 'unhealthy';
    } catch (error) {
      redisStatus = 'error';
      console.error('Redis health check failed:', error);
    }

    // ====================================================================
    // Check Supabase Connectivity
    // ====================================================================
    // Supabase is like the filing cabinet (database)
    // If it's down, users can't access their data
    // Try a simple query to verify connection

    let supabaseStatus = 'down';
    try {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .limit(1);

      supabaseStatus = error ? 'error' : 'up';
    } catch (error) {
      supabaseStatus = 'error';
      console.error('Supabase health check failed:', error);
    }

    // ====================================================================
    // Determine Overall Health
    // ====================================================================
    // If all critical services are up, the app is healthy
    // If anything is down, return 500 so monitoring knows to alert

    const isHealthy = redisStatus === 'up' && supabaseStatus === 'up';

    const response = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        redis: redisStatus,
        supabase: supabaseStatus,
        app: 'up',
      },
    };

    // ====================================================================
    // Return Response
    // ====================================================================
    // Use 200 for healthy, 500 for unhealthy
    // Monitoring systems watch for the status code

    return NextResponse.json(response, {
      status: isHealthy ? 200 : 500,
    });
  } catch (error) {
    // Unexpected error - something went really wrong
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
