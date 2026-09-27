import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import CompanyApplication from '@/models/company-application.model'
import { logAdminAction } from '@/lib/audit-logger'
import { getClientIp } from '@/lib/rate-limit'

export async function GET() {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (sessionClaims?.metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await dbConnect()

    const records = await CompanyApplication.find()
      .sort({ createdAt: -1 })
      .lean()

    const applications = records.map((app) => ({
      id: app._id.toString(),
      companyName: app.companyName,
      founderName: app.founderName,
      workEmail: app.workEmail,
      phoneNumber: app.phoneNumber || null,
      websiteUrl: app.websiteUrl || null,
      pitchDeckUrl: app.pitchDeckUrl || null,
      stage: app.stage || 'Series A',
      targetRaiseAmount: app.targetRaiseAmount,
      currentArr: app.currentArr || null,
      sector: app.sector || 'AI & Frontier Tech',
      summary: app.summary,
      status: app.status || 'pending_review',
      createdAt: app.createdAt?.toISOString() || null,
      updatedAt: app.updatedAt?.toISOString() || null,
    }))

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Failed to fetch company applications for admin:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load company applications' },
      { status: 500 }
    )
  }
}

const ALLOWED_STATUSES = ['pending_review', 'reviewed', 'approved', 'archived']

export async function PATCH(req: NextRequest) {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (sessionClaims?.metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { applicationId, status } = body

    if (!applicationId || typeof applicationId !== 'string') {
      return NextResponse.json({ error: 'Application ID is required.' }, { status: 400 })
    }

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    await dbConnect()

    const updated = await CompanyApplication.findByIdAndUpdate(
      applicationId,
      { $set: { status } },
      { new: true }
    ).lean()

    if (!updated) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 })
    }

    // Record immutable audit log
    await logAdminAction({
      adminUserId: userId,
      adminEmail: (sessionClaims as any)?.email || undefined,
      action: "founder_application_status_updated",
      targetEntity: "founder_application",
      targetId: applicationId,
      ipAddress: getClientIp(req),
      userAgent: req.headers.get("user-agent") || undefined,
      details: {
        companyName: updated.companyName,
        newStatus: status,
      },
    })

    return NextResponse.json({
      success: true,
      application: {
        id: updated._id.toString(),
        status: updated.status,
      },
    })
  } catch (error) {
    console.error('Failed to update company application status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update status' },
      { status: 500 }
    )
  }
}
