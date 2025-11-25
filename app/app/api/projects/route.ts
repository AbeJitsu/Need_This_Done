import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ============================================================================
// Projects API Route - /api/projects
// ============================================================================
// Handles project submissions from the contact form.
// POST: Creates a new project inquiry in the database.

interface ProjectSubmission {
  name: string;
  email: string;
  company?: string;
  service?: string;
  message: string;
}

export async function POST(request: Request) {
  try {
    const body: ProjectSubmission = await request.json();

    // ====================================================================
    // Validate Required Fields
    // ====================================================================

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!body.email || typeof body.email !== 'string' || body.email.trim().length === 0) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!body.message || typeof body.message !== 'string' || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Project details are required' },
        { status: 400 }
      );
    }

    // ====================================================================
    // Insert into Database
    // ====================================================================

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        company: body.company?.trim() || null,
        service: body.service?.trim() || null,
        message: body.message.trim(),
        status: 'submitted',
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to insert project:', error.message);

      // If table doesn't exist yet, return helpful error
      if (error.message.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Database not configured. Please run migrations.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to submit project. Please try again.' },
        { status: 500 }
      );
    }

    // ====================================================================
    // Success Response
    // ====================================================================

    return NextResponse.json({
      success: true,
      message: 'Project submitted successfully',
      projectId: project.id,
    });

  } catch (error) {
    console.error('Projects POST error:', error);

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
