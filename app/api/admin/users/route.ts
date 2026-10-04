import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { dbConnect } from '@/lib/dbConnect'
import User from '@/models/user.model'
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

    // Ensure non-admin accounts like galagalavam@gmail.com are set to role 'user'
    await User.updateOne(
      { email: "galagalavam@gmail.com", role: "admin" },
      { $set: { role: "user" } }
    )

    const records = await User.find({ role: { $ne: 'admin' } })
      .select('name firstName middleName lastName email phoneNumber investorStatus citizenship verificationStatus createdAt')
      .sort({ createdAt: -1 })
      .lean()

    const users = records.map((user) => {
      const name =
        user.name?.trim() ||
        [user.firstName, user.middleName, user.lastName]
          .filter(Boolean)
          .join(' ') ||
        user.email.split('@')[0]

      const rawStatus = user.verificationStatus
      const verificationStatus =
        !rawStatus || rawStatus === 'yet to be verified' ? 'pending verification' : rawStatus

      return {
        id: user._id.toString(),
        name,
        email: user.email,
        phoneNumber: user.phoneNumber || null,
        investorStatus: user.investorStatus || 'Not Accredited',
        citizenship: user.citizenship || 'US',
        verificationStatus,
        createdAt: user.createdAt?.toISOString() || null,
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Failed to fetch admin users:', error)
    return NextResponse.json({ error: 'Unable to fetch users' }, { status: 500 })
  }
}

const ALLOWED_VERIFICATION_STATUSES = [
  'pending verification',
  'verified',
  'not verified',
]

export async function PATCH(req: NextRequest) {
  const { userId: authUserId, sessionClaims } = await auth()

  if (!authUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (sessionClaims?.metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { userId, verificationStatus } = body

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!verificationStatus || !ALLOWED_VERIFICATION_STATUSES.includes(verificationStatus)) {
      return NextResponse.json(
        {
          error: `Invalid verification status. Must be one of: ${ALLOWED_VERIFICATION_STATUSES.join(', ')}`,
        },
        { status: 400 }
      )
    }

    await dbConnect()

    const filter = mongoose.Types.ObjectId.isValid(userId)
      ? { _id: new mongoose.Types.ObjectId(userId) }
      : { _id: userId }

    const updatedUser = await User.findOneAndUpdate(
      filter,
      { $set: { verificationStatus } },
      { new: true, runValidators: true }
    ).select('verificationStatus email name')

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Record immutable audit log
    await logAdminAction({
      adminUserId: authUserId,
      adminEmail: (sessionClaims as any)?.email || undefined,
      action: "user_verification_status_updated",
      targetEntity: "user",
      targetId: userId,
      ipAddress: getClientIp(req),
      userAgent: req.headers.get("user-agent") || undefined,
      details: {
        targetUserEmail: updatedUser.email,
        targetUserName: updatedUser.name,
        newVerificationStatus: verificationStatus,
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id.toString(),
        verificationStatus: updatedUser.verificationStatus,
      },
    })
  } catch (error) {
    console.error('Failed to update verification status:', error)
    return NextResponse.json({ error: 'Unable to update verification status' }, { status: 500 })
  }
}

