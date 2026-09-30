"use client"

import { useEffect, useState, useMemo } from 'react'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Users,
  XCircle,
  Activity,
  Building2,
  Phone,
  Search,
  Download,
  Filter,
  Briefcase,
  SlidersHorizontal,
  Check,
  Send,
  MessageSquare,
  ExternalLink,
  Copy,
  CheckCheck,
  Mail,
  Link2,
  X,
  Radio,
  Archive,
  FileText,
  Eye,
  Globe,
  RotateCcw,
  Sparkles,
  MessageCircle,
  Share2,
  Trash2,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type AdminUser = {
  id: string
  name: string
  email: string
  phoneNumber: string | null
  investorStatus: string
  citizenship: string
  verificationStatus: 'pending verification' | 'not verified' | 'verified' | string
  createdAt: string | null
}

type AdminCommitment = {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone?: string | null
  investorStatus: string
  citizenship: string
  userVerificationStatus: string
  offeringId: string
  offeringTitle: string
  offeringStatus?: string
  type: 'interest' | 'commitment'
  amount: number | null
  status: 'active' | 'wire_received' | 'allocated' | 'cancelled' | string
  notes?: string
  createdAt: string | null
  updatedAt: string | null
}

type AdminFounderApplication = {
  id: string
  companyName: string
  founderName: string
  workEmail: string
  phoneNumber: string | null
  websiteUrl: string | null
  pitchDeckUrl: string | null
  stage: string
  targetRaiseAmount: string
  currentArr: string | null
  sector: string
  summary: string
  status: 'pending_review' | 'reviewed' | 'approved' | 'archived' | string
  createdAt: string | null
  updatedAt: string | null
}

type OfferingMetric = {
  offeringId: string
  title: string
  companyName: string
  roundName: string
  description: string
  targetAllocation: number
  minCheckSize: number
  valuation: string
  status: 'active' | 'closing_soon' | 'funded' | 'upcoming' | string
  category: string
  closingDate?: string
  closedAt?: string | Date
  closedMonthYear?: string
  committedCapital: number
  commitmentsCount: number
  interestsCount: number
  wiresReceivedCapital: number
  allocatedCapital: number
  percentFilled: number
  averageCheckSize: number
  isOversubscribed: boolean
  oversubscribedAmount: number
}

type BroadcastPreviewRecipient = {
  userId: string
  userName: string
  userEmail: string
  userPhone?: string | null
  hasValidPhone: boolean
  verificationStatus?: string
  type: 'commitment' | 'interest'
  amount?: number | null
  whatsAppLink?: string | null
}

type WhatsAppRosterItem = {
  userId?: string
  userName: string
  userEmail: string
  userPhone: string | null
  whatsAppLink: string | null
  emailStatus?: string
  verificationStatus?: string
  type?: 'commitment' | 'interest'
  amount?: number | null
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function formatDate(date: string | null) {
  if (!date) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

function formatVerificationStatus(status?: string) {
  if (!status || status === 'yet to be verified' || status === 'pending verification') {
    return 'Pending Verification'
  }
  if (status === 'verified') return 'Verified'
  if (status === 'not verified') return 'Not Verified'
  return status
}

function getVerificationBadgeClass(status?: string) {
  switch (status) {
    case 'verified':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
    case 'not verified':
      return 'bg-destructive/10 text-destructive border-destructive/30'
    case 'pending verification':
    case 'yet to be verified':
    default:
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
  }
}

function getCommitmentStatusBadgeClass(status?: string) {
  switch (status) {
    case 'allocated':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
    case 'wire_received':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
    case 'cancelled':
      return 'bg-destructive/10 text-destructive border-destructive/30'
    case 'active':
    default:
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  }
}

function getApplicationStatusBadgeClass(status?: string) {
  switch (status) {
    case 'approved':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
    case 'reviewed':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
    case 'archived':
      return 'bg-muted text-muted-foreground border-border'
    case 'pending_review':
    default:
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
  }
}

function formatApplicationStatus(status?: string) {
  switch (status) {
    case 'approved':
      return 'Approved / In Diligence'
    case 'reviewed':
      return 'Reviewed'
    case 'archived':
      return 'Archived / Passed'
    case 'pending_review':
    default:
      return 'Pending Review'
  }
}

function formatClosedMonthYearAdmin(deal: OfferingMetric): string {
  if (deal.closedMonthYear && deal.closedMonthYear !== 'Closed' && deal.closedMonthYear !== 'Open') {
    return deal.closedMonthYear
  }
  if (deal.closedAt) {
    try {
      const d = new Date(deal.closedAt)
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      }
    } catch {}
  }
  if (deal.closingDate && deal.closingDate !== 'Closed' && deal.closingDate !== 'Open') {
    const cleaned = deal.closingDate.replace(/\d+,\s*/, '').replace(/^\d{1,2}\s+/, '').trim()
    if (cleaned && cleaned !== 'Closed' && cleaned !== 'Open') return cleaned
  }
  if (deal.offeringId === 'scale-ai') return 'Jul 2026'
  if (deal.offeringId === 'xai') return 'Dec 2024'
  if (deal.offeringId === 'neuralink') return 'Nov 2024'
  return 'Closed'
}

const STAGES = [
  "Seed",
  "Series A",
  "Series B",
  "Series C+",
  "Pre-IPO",
  "Profitable Bootstrapped",
]

const DEFAULT_SECTORS = [
  "AI & Machine Learning",
  "Autonomous Agents & Robotics",
  "Enterprise Infrastructure",
  "Defense & Aerospace",
  "Fintech & Crypto",
  "Frontier Tech & Bio",
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'commitments' | 'users' | 'founder_applications'>('commitments')

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [userSearchQuery, setUserSearchQuery] = useState('')

  // Commitments state
  const [commitments, setCommitments] = useState<AdminCommitment[]>([])
  const [offerings, setOfferings] = useState<OfferingMetric[]>([])
  const [commitmentStats, setCommitmentStats] = useState({
    totalCommittedCapital: 0,
    totalCommitmentsCount: 0,
    totalInterestsCount: 0,
    totalWiresReceivedCapital: 0,
    totalAllocatedCapital: 0,
    activeOfferingsCount: 0,
  })
  const [isLoadingCommitments, setIsLoadingCommitments] = useState(true)
  const [commitmentError, setCommitmentError] = useState<string | null>(null)
  const [updatingCommitmentId, setUpdatingCommitmentId] = useState<string | null>(null)

  // Founder Applications state
  const [founderApplications, setFounderApplications] = useState<AdminFounderApplication[]>([])
  const [isLoadingApplications, setIsLoadingApplications] = useState(true)
  const [applicationError, setApplicationError] = useState<string | null>(null)
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null)
  const [appSearchQuery, setAppSearchQuery] = useState('')
  const [selectedApplication, setSelectedApplication] = useState<AdminFounderApplication | null>(null)

  // Multi-dimensional filter children for founder applications
  const [appStatusFilter, setAppStatusFilter] = useState<string>('all')
  const [appStageFilter, setAppStageFilter] = useState<string>('all')
  const [appSectorFilter, setAppSectorFilter] = useState<string>('all')
  const [appDeckFilter, setAppDeckFilter] = useState<'all' | 'has_deck' | 'no_deck'>('all')

  // Commitments Table View: Active vs Closed
  const [commitmentView, setCommitmentView] = useState<'active' | 'closed'>('active')

  // Commitments Table Filters
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<'all' | 'commitment' | 'interest'>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Broadcast Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false)
  const [broadcastOffering, setBroadcastOffering] = useState<OfferingMetric | null>(null)
  const [broadcastAudience, setBroadcastAudience] = useState<string>('interests_only')
  const [broadcastVerifiedOnly, setBroadcastVerifiedOnly] = useState<boolean>(false)
  const [thirdPartyUrl, setThirdPartyUrl] = useState('')
  const [broadcastSubject, setBroadcastSubject] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [previewRecipients, setPreviewRecipients] = useState<BroadcastPreviewRecipient[]>([])
  const [recipientSearchQuery, setRecipientSearchQuery] = useState('')
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false)
  const [emailBroadcastSuccess, setEmailBroadcastSuccess] = useState<string | null>(null)
  const [whatsAppBroadcastSuccess, setWhatsAppBroadcastSuccess] = useState<string | null>(null)
  const [copiedTemplate, setCopiedTemplate] = useState(false)
  const [openedWhatsAppUsers, setOpenedWhatsAppUsers] = useState<string[]>([])

  // Fetch Users
  useEffect(() => {
    let isActive = true
    async function loadUsers() {
      try {
        const response = await fetch('/api/admin/users', { cache: 'no-store' })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Unable to load users.')
        if (isActive) setUsers(data.users || [])
      } catch (error) {
        if (isActive) setUserError(error instanceof Error ? error.message : 'Unable to load users.')
      } finally {
        if (isActive) setIsLoadingUsers(false)
      }
    }
    loadUsers()
    return () => { isActive = false }
  }, [])

  // Fetch Commitments & Offerings
  useEffect(() => {
    let isActive = true
    async function loadCommitments() {
      try {
        const response = await fetch('/api/admin/commitments', { cache: 'no-store' })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Unable to load commitments.')
        if (isActive) {
          setCommitments(data.allCommitments || data.commitments || [])
          setOfferings(data.offerings || [])
          if (data.stats) setCommitmentStats(data.stats)
        }
      } catch (error) {
        if (isActive) setCommitmentError(error instanceof Error ? error.message : 'Unable to load commitments.')
      } finally {
        if (isActive) setIsLoadingCommitments(false)
      }
    }
    loadCommitments()
    return () => { isActive = false }
  }, [])

  // Fetch Founder Applications
  useEffect(() => {
    let isActive = true
    async function loadApplications() {
      try {
        const response = await fetch('/api/admin/company-applications', { cache: 'no-store' })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Unable to load company applications.')
        if (isActive) {
          setFounderApplications(data.applications || [])
        }
      } catch (error) {
        if (isActive) setApplicationError(error instanceof Error ? error.message : 'Unable to load applications.')
      } finally {
        if (isActive) setIsLoadingApplications(false)
      }
    }
    loadApplications()
    return () => { isActive = false }
  }, [])

  // Open Broadcast Modal
  async function handleOpenBroadcastModal(offering: OfferingMetric) {
    setBroadcastOffering(offering)
    setBroadcastSubject(`Priority Access: ${offering.title} SPV Subscription Portal`)
    setCustomMessage('')
    setBroadcastAudience('interests_only')
    setBroadcastVerifiedOnly(false)
    setEmailBroadcastSuccess(null)
    setWhatsAppBroadcastSuccess(null)
    setCopiedTemplate(false)
    setOpenedWhatsAppUsers([])
    setRecipientSearchQuery('')
    setPreviewRecipients([])
    setIsBroadcastModalOpen(true)
    setIsPreviewLoading(true)

    try {
      const linkRes = await fetch(`/api/admin/broadcast?offeringId=${offering.offeringId}&audience=interests_only&verifiedOnly=false`, { cache: 'no-store' })
      const linkData = await linkRes.json()
      if (linkRes.ok && linkData.thirdPartyUrl) {
        setThirdPartyUrl(linkData.thirdPartyUrl)
      } else {
        setThirdPartyUrl('')
      }
      if (linkRes.ok && linkData.recipients) {
        setPreviewRecipients(linkData.recipients || [])
      }
    } catch (err) {
      console.error('Error opening broadcast modal:', err)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  // Fetch preview when audience or verification filter changes
  async function fetchBroadcastPreview(offeringId: string, audience: string, verifiedOnly: boolean) {
    setIsPreviewLoading(true)
    try {
      const res = await fetch(`/api/admin/broadcast?offeringId=${offeringId}&audience=${audience}&verifiedOnly=${verifiedOnly}`, { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) {
        setPreviewRecipients(data.recipients || [])
        if (data.thirdPartyUrl && !thirdPartyUrl) {
          setThirdPartyUrl(data.thirdPartyUrl)
        }
      }
    } catch (err) {
      console.error('Failed to preview broadcast:', err)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  function handleAudienceChange(newAudience: string) {
    setBroadcastAudience(newAudience)
    if (broadcastOffering) {
      fetchBroadcastPreview(broadcastOffering.offeringId, newAudience, broadcastVerifiedOnly)
    }
  }

  function handleVerifiedToggle(checked: boolean) {
    setBroadcastVerifiedOnly(checked)
    if (broadcastOffering) {
      fetchBroadcastPreview(broadcastOffering.offeringId, broadcastAudience, checked)
    }
  }

  // Send Email Broadcast
  async function handleSendEmailBroadcast() {
    if (!broadcastOffering) return
    if (!thirdPartyUrl.trim()) {
      alert('Please enter a valid closing portal URL.')
      return
    }

    setIsSendingEmail(true)
    setEmailBroadcastSuccess(null)
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offeringId: broadcastOffering.offeringId,
          offeringTitle: broadcastOffering.title,
          targetAudience: broadcastAudience,
          verifiedOnly: broadcastVerifiedOnly,
          thirdPartyUrl: thirdPartyUrl.trim(),
          subject: broadcastSubject.trim(),
          customMessage: customMessage.trim(),
          sendEmail: true,
          sendWhatsApp: false,
          channel: 'email',
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch email broadcast.')
      setEmailBroadcastSuccess(`Successfully sent emails to ${data.emailsSent} investor(s)!`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Email broadcast failed.')
    } finally {
      setIsSendingEmail(false)
    }
  }

  // Log WhatsApp Broadcast
  async function handleLogWhatsAppBroadcast() {
    if (!broadcastOffering) return
    if (!thirdPartyUrl.trim()) {
      alert('Please enter a valid closing portal URL.')
      return
    }

    setIsSendingWhatsApp(true)
    setWhatsAppBroadcastSuccess(null)
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offeringId: broadcastOffering.offeringId,
          offeringTitle: broadcastOffering.title,
          targetAudience: broadcastAudience,
          verifiedOnly: broadcastVerifiedOnly,
          thirdPartyUrl: thirdPartyUrl.trim(),
          subject: broadcastSubject.trim(),
          customMessage: customMessage.trim(),
          sendEmail: false,
          sendWhatsApp: true,
          channel: 'whatsapp',
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to log WhatsApp broadcast.')
      setWhatsAppBroadcastSuccess(`WhatsApp broadcast activity logged for ${data.whatsappProcessed} recipient(s).`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'WhatsApp logging failed.')
    } finally {
      setIsSendingWhatsApp(false)
    }
  }

  function getWhatsAppBroadcastTemplate(userName?: string) {
    if (!broadcastOffering) return ''
    const greeting = userName ? `Dear ${userName},` : 'Hello,'
    const custom = customMessage.trim() ? `\n\n${customMessage.trim()}` : ''
    return `*Apex Krish Capital | Deal Subscription & Closing Portal*\n\n${greeting}\n\nYou are receiving this access link regarding your allocation/interest in *${broadcastOffering.title}*.\n\n👉 *Access Closing Portal:* ${thirdPartyUrl.trim() || '[Portal Link]'}${custom}\n\n_Confidential & Proprietary. For syndicate participants only._\nApex Krish Capital Syndicate Desk`
  }

  function handleCopyWhatsAppTemplate() {
    const text = getWhatsAppBroadcastTemplate()
    navigator.clipboard.writeText(text)
    setCopiedTemplate(true)
    setTimeout(() => setCopiedTemplate(false), 2500)
  }

  function handleOpenWhatsAppChat(recipient: BroadcastPreviewRecipient) {
    if (!recipient.userPhone) return
    const text = getWhatsAppBroadcastTemplate(recipient.userName)
    const cleanPhone = recipient.userPhone.replace(/[^\d+]/g, '').replace(/^\+/, '')
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
    setOpenedWhatsAppUsers((prev) => (prev.includes(recipient.userId) ? prev : [...prev, recipient.userId]))
  }

  // Verification status change
  async function handleStatusChange(userId: string, newStatus: string) {
    const previousUsers = [...users]
    setUsers((current) =>
      current.map((u) => (u.id === userId ? { ...u, verificationStatus: newStatus } : u))
    )
    setUpdatingUserId(userId)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, verificationStatus: newStatus }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update status.')

      setCommitments((prev) =>
        prev.map((c) => (c.userId === userId ? { ...c, userVerificationStatus: newStatus } : c))
      )
    } catch (err) {
      setUsers(previousUsers)
      alert(err instanceof Error ? err.message : 'Failed to update verification status.')
    } finally {
      setUpdatingUserId(null)
    }
  }

  // Commitment status change
  async function handleCommitmentStatusChange(commitmentId: string, newStatus: string) {
    const previousCommitments = [...commitments]
    setCommitments((current) => current.map((c) => (c.id === commitmentId ? { ...c, status: newStatus } : c)))
    setUpdatingCommitmentId(commitmentId)

    try {
      const response = await fetch('/api/admin/commitments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: commitmentId, status: newStatus }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update commitment status.')
    } catch (err) {
      setCommitments(previousCommitments)
      alert(err instanceof Error ? err.message : 'Failed to update commitment status.')
    } finally {
      setUpdatingCommitmentId(null)
    }
  }

  // Application status change
  async function handleApplicationStatusChange(applicationId: string, newStatus: string) {
    const previousApps = [...founderApplications]
    setFounderApplications((current) =>
      current.map((a) => (a.id === applicationId ? { ...a, status: newStatus } : a))
    )
    setUpdatingAppId(applicationId)

    try {
      const response = await fetch('/api/admin/company-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, status: newStatus }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update application status.')
    } catch (err) {
      setFounderApplications(previousApps)
      alert(err instanceof Error ? err.message : 'Failed to update application status.')
    } finally {
      setUpdatingAppId(null)
    }
  }

  // Admin: Delete Offering (Active or Closed)
  async function handleDeleteDeal(deal: OfferingMetric) {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete '${deal.title}'? This will remove it from active and past offerings across the entire site.`
    )
    if (!confirmDelete) return

    // Optimistically update offerings list
    const prevOfferings = [...offerings]
    setOfferings((prev) => prev.filter((o) => o.offeringId !== deal.offeringId))
    if (selectedOfferingId === deal.offeringId) {
      setSelectedOfferingId('all')
    }

    try {
      const res = await fetch(`/api/admin/offerings?offeringId=${encodeURIComponent(deal.offeringId)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to delete offering.')
      }

      // Re-fetch commitments data to update stats and table counts
      const refreshRes = await fetch('/api/admin/commitments', { cache: 'no-store' })
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        setOfferings(refreshData.offerings || [])
        if (refreshData.stats) setCommitmentStats(refreshData.stats)
        if (refreshData.allCommitments) setCommitments(refreshData.allCommitments)
      }
    } catch (err: any) {
      setOfferings(prevOfferings)
      alert(err.message || 'Failed to delete offering.')
    }
  }

  // Admin: Close Offering
  async function handleCloseDeal(deal: OfferingMetric) {
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    const confirmClose = window.confirm(
      `Are you sure you want to close '${deal.title}'? It will be marked as closed in ${nowStr} and moved to past offerings.`
    )
    if (!confirmClose) return

    // Optimistically update offerings list
    const prevOfferings = [...offerings]
    setOfferings((prev) =>
      prev.map((o) =>
        o.offeringId === deal.offeringId
          ? { ...o, status: 'closed', closedMonthYear: nowStr, closingDate: nowStr }
          : o
      )
    )

    try {
      const res = await fetch('/api/admin/offerings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offeringId: deal.offeringId,
          status: 'closed',
          pastStatusText: 'Funded & Closed',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to close offering.')
      }

      // Re-fetch commitments data to synchronize state
      const refreshRes = await fetch('/api/admin/commitments', { cache: 'no-store' })
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        setOfferings(refreshData.offerings || [])
        if (refreshData.stats) setCommitmentStats(refreshData.stats)
        if (refreshData.allCommitments) setCommitments(refreshData.allCommitments)
      }
    } catch (err: any) {
      setOfferings(prevOfferings)
      alert(err.message || 'Failed to close offering.')
    }
  }

  // Active vs Closed Commitments Count
  const activeCommitmentsCount = useMemo(() => {
    return commitments.filter((item) => {
      const deal = offerings.find((o) => o.offeringId === item.offeringId)
      return deal?.status === 'active' || deal?.status === 'closing_soon' || item.offeringStatus === 'active'
    }).length
  }, [commitments, offerings])

  const closedCommitmentsCount = useMemo(() => {
    return commitments.filter((item) => {
      const deal = offerings.find((o) => o.offeringId === item.offeringId)
      return deal?.status === 'closed' || deal?.status === 'funded' || deal?.status === 'archived' || item.offeringStatus === 'closed'
    }).length
  }, [commitments, offerings])

  // Filtered Commitments
  const filteredCommitments = useMemo(() => {
    return commitments.filter((item) => {
      const deal = offerings.find((o) => o.offeringId === item.offeringId)
      const isDealActive = deal?.status === 'active' || deal?.status === 'closing_soon' || item.offeringStatus === 'active'
      const isDealClosed = deal?.status === 'closed' || deal?.status === 'funded' || deal?.status === 'archived' || item.offeringStatus === 'closed'

      if (commitmentView === 'active' && !isDealActive) return false
      if (commitmentView === 'closed' && !isDealClosed) return false

      if (selectedOfferingId === 'active_only') {
        if (!isDealActive) return false
      } else if (selectedOfferingId === 'closed_only') {
        if (!isDealClosed) return false
      } else if (selectedOfferingId !== 'all' && item.offeringId !== selectedOfferingId) {
        return false
      }
      if (selectedType !== 'all' && item.type !== selectedType) return false
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const nameMatch = item.userName.toLowerCase().includes(query)
        const emailMatch = item.userEmail.toLowerCase().includes(query)
        const phoneMatch = item.userPhone ? item.userPhone.toLowerCase().includes(query) : false
        const offeringMatch = item.offeringTitle.toLowerCase().includes(query)
        const amountMatch = item.amount ? item.amount.toString().includes(query) : false
        if (!nameMatch && !emailMatch && !phoneMatch && !offeringMatch && !amountMatch) return false
      }
      return true
    })
  }, [commitments, offerings, commitmentView, selectedOfferingId, selectedType, selectedStatus, searchQuery])

  // Filtered Users
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return users
    const query = userSearchQuery.trim().toLowerCase()
    return users.filter((u) => {
      const nameMatch = u.name.toLowerCase().includes(query)
      const emailMatch = u.email.toLowerCase().includes(query)
      const phoneMatch = u.phoneNumber ? u.phoneNumber.toLowerCase().includes(query) : false
      const statusMatch = u.investorStatus.toLowerCase().includes(query)
      return nameMatch || emailMatch || phoneMatch || statusMatch
    })
  }, [users, userSearchQuery])

  // Distinct sectors from applications + defaults
  const availableSectors = useMemo(() => {
    const set = new Set<string>(DEFAULT_SECTORS)
    founderApplications.forEach((a) => {
      if (a.sector) set.add(a.sector)
    })
    return Array.from(set)
  }, [founderApplications])

  // Count active filters for applications
  const activeAppFiltersCount = useMemo(() => {
    let count = 0
    if (appStatusFilter !== 'all') count++
    if (appStageFilter !== 'all') count++
    if (appSectorFilter !== 'all') count++
    if (appDeckFilter !== 'all') count++
    return count
  }, [appStatusFilter, appStageFilter, appSectorFilter, appDeckFilter])

  const handleResetAllAppFilters = () => {
    setAppStatusFilter('all')
    setAppStageFilter('all')
    setAppSectorFilter('all')
    setAppDeckFilter('all')
    setAppSearchQuery('')
  }

  // Filtered Founder Applications with multi-dimensional filters
  const filteredFounderApplications = useMemo(() => {
    return founderApplications.filter((app) => {
      // 1. Status Filter
      if (appStatusFilter !== 'all' && app.status !== appStatusFilter) return false

      // 2. Stage Filter
      if (appStageFilter !== 'all' && app.stage.toLowerCase() !== appStageFilter.toLowerCase()) return false

      // 3. Sector Filter
      if (appSectorFilter !== 'all' && app.sector.toLowerCase() !== appSectorFilter.toLowerCase()) return false

      // 4. Deck Filter
      if (appDeckFilter === 'has_deck' && !app.pitchDeckUrl) return false
      if (appDeckFilter === 'no_deck' && app.pitchDeckUrl) return false

      // 5. Search query
      if (appSearchQuery.trim()) {
        const query = appSearchQuery.trim().toLowerCase()
        const compMatch = app.companyName.toLowerCase().includes(query)
        const founderMatch = app.founderName.toLowerCase().includes(query)
        const emailMatch = app.workEmail.toLowerCase().includes(query)
        const phoneMatch = app.phoneNumber ? app.phoneNumber.toLowerCase().includes(query) : false
        const stageMatch = app.stage.toLowerCase().includes(query)
        const sectorMatch = app.sector.toLowerCase().includes(query)
        const summaryMatch = app.summary.toLowerCase().includes(query)
        if (!compMatch && !founderMatch && !emailMatch && !phoneMatch && !stageMatch && !sectorMatch && !summaryMatch) {
          return false
        }
      }
      return true
    })
  }, [founderApplications, appStatusFilter, appStageFilter, appSectorFilter, appDeckFilter, appSearchQuery])

  // Export CSV
  function handleExportCSV() {
    if (filteredCommitments.length === 0) {
      alert('No commitments to export.')
      return
    }

    const headers = [
      'Investor Name',
      'Email',
      'Phone',
      'Accreditation',
      'Verification',
      'Offering',
      'Type',
      'Amount (USD)',
      'Status',
      'Date',
    ]

    const csvRows = filteredCommitments.map((c) => [
      `"${(c.userName || '').replace(/"/g, '""')}"`,
      `"${(c.userEmail || '').replace(/"/g, '""')}"`,
      `"${(c.userPhone || '').replace(/"/g, '""')}"`,
      `"${(c.investorStatus || '').replace(/"/g, '""')}"`,
      `"${(c.userVerificationStatus || '').replace(/"/g, '""')}"`,
      `"${(c.offeringTitle || '').replace(/"/g, '""')}"`,
      `"${c.type}"`,
      c.amount ? c.amount : 0,
      `"${c.status || 'active'}"`,
      `"${c.createdAt || ''}"`,
    ])

    const csvContent = [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `apex_krish_commitments_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Active / Closed Deals Count
  const activeDealsCount = useMemo(
    () => offerings.filter((o) => o.status === 'active' || o.status === 'closing_soon').length,
    [offerings]
  )
  const closedDealsCount = useMemo(
    () => offerings.filter((o) => o.status === 'funded' || o.status === 'archived' || o.status === 'closed').length,
    [offerings]
  )

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background pb-16 pt-24 sm:pt-28 font-sans">
      <div className="mx-auto w-full max-w-[1360px] px-4 sm:px-6 md:px-8 space-y-8">
        {/* HEADER SECTION (CLEAN & MINIMAL) */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Deal Management</h1>
            <p className="text-sm text-muted-foreground">
              Monitor active SPVs, wire allocations, investor accreditation, and founder syndicate applications.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-xs">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeDealsCount} Live SPV{activeDealsCount === 1 ? '' : 's'}</span>
            </div>
            {founderApplications.length > 0 && (
              <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary shadow-xs">
                <Building2 className="size-3.5" />
                <span>{founderApplications.length} Co Application{founderApplications.length === 1 ? '' : 's'}</span>
              </div>
            )}
          </div>
        </section>

        {/* DEAL CARDS SECTION */}
        <section className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {offerings.map((deal, idx) => {
              const isSelected = selectedOfferingId === deal.offeringId
              const isActive = deal.status === 'active' || deal.status === 'closing_soon'

              return (
                <div
                  key={`${deal.offeringId || idx}-${idx}`}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedOfferingId('all')
                    } else {
                      setSelectedOfferingId(deal.offeringId)
                      setCommitmentView(isActive ? 'active' : 'closed')
                    }
                  }}
                  className={cn(
                    'group relative rounded-2xl border p-4.5 transition-all cursor-pointer flex flex-col justify-between gap-4 shadow-xs',
                    isSelected
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                      : 'border-border bg-card hover:border-primary/40 hover:bg-muted/10'
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                          {deal.title}
                        </h3>
                        <span className="text-xs text-muted-foreground font-medium block mt-0.5">
                          {deal.valuation} • Cap ${deal.targetAllocation.toLocaleString()}
                          {!isActive && ` • Closed ${formatClosedMonthYearAdmin(deal)}`}
                        </span>
                      </div>

                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border shrink-0">
                          Closed • {formatClosedMonthYearAdmin(deal)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Committed: ${deal.committedCapital.toLocaleString()}</span>
                        <span className="text-foreground font-bold">{deal.percentFilled}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-foreground transition-all duration-500"
                          style={{ width: `${Math.min(deal.percentFilled, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-border/60 pt-2.5">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Wires In</span>
                        <strong className="text-foreground font-semibold">
                          ${deal.wiresReceivedCapital.toLocaleString()}
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground block text-[11px]">Allocated</span>
                        <strong className="text-foreground font-semibold">
                          ${deal.allocatedCapital.toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/60 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                      <span>{deal.commitmentsCount} LP{deal.commitmentsCount === 1 ? '' : 's'}</span>
                      <span>{deal.interestsCount} Interest{deal.interestsCount === 1 ? '' : 's'}</span>
                    </div>

                    {!isActive ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteDeal(deal)
                        }}
                        className="w-full h-8 text-xs font-semibold rounded-xl gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Delete Deal</span>
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5 w-full">
                        <Button
                          type="button"
                          size="sm"
                          variant="default"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenBroadcastModal(deal)
                          }}
                          className="flex-1 h-8 text-xs font-semibold rounded-xl gap-1.5 px-2.5 cursor-pointer shadow-xs"
                          title="Broadcast deal subscription portal link"
                        >
                          <Send className="size-3.5" />
                          <span className="truncate">Broadcast</span>
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCloseDeal(deal)
                          }}
                          className="h-8 text-xs font-semibold rounded-xl gap-1 px-2.5 cursor-pointer text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 border-amber-500/30 shrink-0"
                          title="Close this deal and move to Past Offerings"
                        >
                          <Archive className="size-3.5" />
                          <span>Close</span>
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteDeal(deal)
                          }}
                          className="h-8 size-8 p-0 flex items-center justify-center text-xs font-semibold rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 cursor-pointer shrink-0"
                          title="Permanently delete this offering"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* PRIMARY TABS: COMMITMENTS VS INVESTORS VS FOUNDER APPLICATIONS */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setActiveTab('commitments')
                setCommitmentView('active')
                setSelectedOfferingId('all')
              }}
              className={cn(
                'rounded-full px-4.5 py-2 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5',
                activeTab === 'commitments' && commitmentView === 'active'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Commitments ({activeCommitmentsCount})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('commitments')
                setCommitmentView('closed')
                setSelectedOfferingId('all')
              }}
              className={cn(
                'rounded-full px-4.5 py-2 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5',
                activeTab === 'commitments' && commitmentView === 'closed'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              )}
            >
              <Archive className="size-3 text-muted-foreground" />
              <span>Closed Deals Commitments ({closedCommitmentsCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={cn(
                'rounded-full px-4.5 py-2 text-xs font-semibold transition cursor-pointer',
                activeTab === 'users'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              )}
            >
              Investors ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('founder_applications')}
              className={cn(
                'rounded-full px-4.5 py-2 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5',
                activeTab === 'founder_applications'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              )}
            >
              <Building2 className="size-3.5 text-primary" />
              <span>Founder Applications ({founderApplications.length})</span>
            </button>
          </div>

          {activeTab === 'commitments' && (
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="h-9 rounded-full text-xs font-semibold gap-2 px-3.5"
            >
              <Download className="size-3.5 text-muted-foreground" />
              <span>Export {commitmentView === 'active' ? 'Active' : 'Closed'} CSV</span>
            </Button>
          )}
        </div>

        {/* TAB 1: COMMITMENTS & ALLOCATIONS */}
        {activeTab === 'commitments' && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search investor, email, phone, check amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-2 pl-9.5 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="w-[150px]">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="h-9.5 rounded-xl text-xs font-medium">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="wire_received">Wire Received</SelectItem>
                    <SelectItem value="allocated">Allocated</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
              {isLoadingCommitments ? (
                <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-5 animate-spin text-foreground" />
                  <span>Loading commitments...</span>
                </div>
              ) : commitmentError ? (
                <div className="p-8 text-center text-sm text-destructive">{commitmentError}</div>
              ) : filteredCommitments.length === 0 ? (
                <div className="p-12 text-center text-sm text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">
                    {commitmentView === 'active'
                      ? 'No active commitments found for live offerings.'
                      : 'No commitments in closed deals archive.'}
                  </p>
                  <p className="text-xs">
                    {commitmentView === 'active'
                      ? 'When investors express interest or commit to active deals, they will appear here.'
                      : 'Closed deal allocations are archived here when deals are funded and closed.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3.5">Investor</th>
                        <th className="px-5 py-3.5">{commitmentView === 'active' ? 'Active Offering' : 'Closed Deal'}</th>
                        <th className="px-5 py-3.5">Type &amp; Amount</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Verification</th>
                        <th className="px-5 py-3.5">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredCommitments.map((item) => {
                        const deal = offerings.find((o) => o.offeringId === item.offeringId);
                        const isClosedDeal = deal ? (deal.status === 'closed' || deal.status === 'funded' || deal.status === 'archived') : item.offeringStatus === 'closed';

                        return (
                          <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-5 py-4">
                              <div className="font-semibold text-foreground">{item.userName}</div>
                              <div className="text-xs text-muted-foreground">{item.userEmail}</div>
                              {item.userPhone && (
                                <div className="text-[11px] text-muted-foreground/80 flex items-center gap-1 mt-0.5">
                                  <Phone className="size-2.5" />
                                  <span>{item.userPhone}</span>
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <div className="font-medium text-foreground">{item.offeringTitle}</div>
                              {isClosedDeal && deal && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full mt-1 border border-border">
                                  Closed • {formatClosedMonthYearAdmin(deal)}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <div className="font-bold text-foreground">
                                {item.amount ? `$${item.amount.toLocaleString()}` : '—'}
                              </div>
                              <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                                {item.type}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="w-[145px]">
                                <Select
                                  value={item.status || 'active'}
                                  onValueChange={(val) => handleCommitmentStatusChange(item.id, val)}
                                  disabled={updatingCommitmentId === item.id}
                                >
                                  <SelectTrigger
                                    className={cn(
                                      'h-8 text-xs font-semibold rounded-full border',
                                      getCommitmentStatusBadgeClass(item.status)
                                    )}
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="text-xs">
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="wire_received">Wire Received</SelectItem>
                                    <SelectItem value="allocated">Allocated</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                                  getVerificationBadgeClass(item.userVerificationStatus)
                                )}
                              >
                                <span className="size-1.5 rounded-full bg-current" />
                                {formatVerificationStatus(item.userVerificationStatus)}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-muted-foreground text-xs font-medium">
                              {formatDate(item.createdAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* TAB 2: INVESTORS ROSTER */}
        {activeTab === 'users' && (
          <section className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search investor by name, email, phone..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2 pl-9.5 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
              {isLoadingUsers ? (
                <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-5 animate-spin text-foreground" />
                  <span>Loading investors...</span>
                </div>
              ) : userError ? (
                <div className="p-8 text-center text-sm text-destructive">{userError}</div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center text-sm text-muted-foreground">No investors found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3.5">Investor Name</th>
                        <th className="px-5 py-3.5">Email</th>
                        <th className="px-5 py-3.5">Phone</th>
                        <th className="px-5 py-3.5">Accreditation</th>
                        <th className="px-5 py-3.5">Verification Action</th>
                        <th className="px-5 py-3.5">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-4 font-semibold text-foreground">{user.name}</td>
                          <td className="px-5 py-4 text-muted-foreground">{user.email}</td>
                          <td className="px-5 py-4 text-muted-foreground">{user.phoneNumber || '—'}</td>
                          <td className="px-5 py-4">
                            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-muted text-xs font-semibold text-foreground border border-border/80">
                              {user.investorStatus}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="w-[170px]">
                              <Select
                                value={user.verificationStatus}
                                onValueChange={(val) => handleStatusChange(user.id, val)}
                                disabled={updatingUserId === user.id}
                              >
                                <SelectTrigger
                                  className={cn(
                                    'h-8 text-xs font-semibold rounded-full border',
                                    getVerificationBadgeClass(user.verificationStatus)
                                  )}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="text-xs">
                                  <SelectItem value="verified">
                                    <span className="flex items-center gap-1.5">
                                      <span className="size-1.5 rounded-full bg-emerald-500" />
                                      Verified
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="pending verification">
                                    <span className="flex items-center gap-1.5">
                                      <span className="size-1.5 rounded-full bg-amber-500" />
                                      Pending Verification
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="not verified">
                                    <span className="flex items-center gap-1.5">
                                      <span className="size-1.5 rounded-full bg-destructive" />
                                      Not Verified
                                    </span>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-muted-foreground text-xs font-medium">
                            {formatDate(user.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* TAB 3: FOUNDER & COMPANY APPLICATIONS */}
        {activeTab === 'founder_applications' && (
          <section className="space-y-4">
            {/* Top Search and Multi-Dimensional Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search company, founder, work email, stage, sector, thesis..."
                  value={appSearchQuery}
                  onChange={(e) => setAppSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-2 pl-9.5 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none shadow-xs"
                />
              </div>

              {/* Single Multi-Dimensional Filter Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-9.5 rounded-xl text-xs font-semibold gap-2 px-3.5 cursor-pointer transition-all border shadow-xs",
                      activeAppFiltersCount > 0
                        ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/15"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    )}
                  >
                    <Filter className="size-3.5" />
                    <span>Filters</span>
                    {activeAppFiltersCount > 0 && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                        {activeAppFiltersCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-80 sm:w-96 rounded-2xl border border-border bg-card/95 text-card-foreground p-4 shadow-2xl backdrop-blur-2xl space-y-4 font-sans"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-border/80">
                    <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-foreground">
                      <SlidersHorizontal className="size-3.5 text-primary" />
                      <span>Filter Applications</span>
                    </div>

                    {activeAppFiltersCount > 0 && (
                      <button
                        type="button"
                        onClick={handleResetAllAppFilters}
                        className="text-[11px] text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <RotateCcw className="size-3" />
                        <span>Reset All</span>
                      </button>
                    )}
                  </div>

                  {/* Child Filter 1: Status */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Review Status
                    </label>
                    <Select value={appStatusFilter} onValueChange={setAppStatusFilter}>
                      <SelectTrigger className="h-8.5 rounded-xl text-xs font-medium bg-background">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending_review">
                          <span className="flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-amber-500" />
                            Pending Review
                          </span>
                        </SelectItem>
                        <SelectItem value="reviewed">
                          <span className="flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-blue-500" />
                            Reviewed
                          </span>
                        </SelectItem>
                        <SelectItem value="approved">
                          <span className="flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Approved / In Diligence
                          </span>
                        </SelectItem>
                        <SelectItem value="archived">
                          <span className="flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-muted-foreground" />
                            Archived / Passed
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Child Filter 2: Company Stage */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Funding Stage
                    </label>
                    <Select value={appStageFilter} onValueChange={setAppStageFilter}>
                      <SelectTrigger className="h-8.5 rounded-xl text-xs font-medium bg-background">
                        <SelectValue placeholder="All Stages" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="all">All Stages</SelectItem>
                        {STAGES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Child Filter 3: Sector / Industry */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Sector / Conviction Area
                    </label>
                    <Select value={appSectorFilter} onValueChange={setAppSectorFilter}>
                      <SelectTrigger className="h-8.5 rounded-xl text-xs font-medium bg-background">
                        <SelectValue placeholder="All Sectors" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="all">All Sectors</SelectItem>
                        {availableSectors.map((sec) => (
                          <SelectItem key={sec} value={sec}>
                            {sec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Child Filter 4: Pitch Deck Attachment */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Pitch Deck / Materials
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setAppDeckFilter('all')}
                        className={cn(
                          "py-1.5 px-2 rounded-lg border text-center font-medium transition cursor-pointer text-[11px]",
                          appDeckFilter === 'all'
                            ? "bg-primary text-primary-foreground font-bold border-primary"
                            : "bg-background text-muted-foreground hover:text-foreground border-border"
                        )}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setAppDeckFilter('has_deck')}
                        className={cn(
                          "py-1.5 px-2 rounded-lg border text-center font-medium transition cursor-pointer text-[11px]",
                          appDeckFilter === 'has_deck'
                            ? "bg-primary text-primary-foreground font-bold border-primary"
                            : "bg-background text-muted-foreground hover:text-foreground border-border"
                        )}
                      >
                        Has Deck
                      </button>
                      <button
                        type="button"
                        onClick={() => setAppDeckFilter('no_deck')}
                        className={cn(
                          "py-1.5 px-2 rounded-lg border text-center font-medium transition cursor-pointer text-[11px]",
                          appDeckFilter === 'no_deck'
                            ? "bg-primary text-primary-foreground font-bold border-primary"
                            : "bg-background text-muted-foreground hover:text-foreground border-border"
                        )}
                      >
                        No Deck
                      </button>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Active Filter Tags Row (Dismissible) */}
            {activeAppFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-muted-foreground font-medium">Active filters:</span>

                {appStatusFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/25 text-primary text-[11px] font-semibold">
                    <span>Status: {formatApplicationStatus(appStatusFilter)}</span>
                    <button
                      type="button"
                      onClick={() => setAppStatusFilter('all')}
                      className="hover:bg-primary/20 rounded-full p-0.5 cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                {appStageFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/25 text-primary text-[11px] font-semibold">
                    <span>Stage: {appStageFilter}</span>
                    <button
                      type="button"
                      onClick={() => setAppStageFilter('all')}
                      className="hover:bg-primary/20 rounded-full p-0.5 cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                {appSectorFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/25 text-primary text-[11px] font-semibold">
                    <span>Sector: {appSectorFilter}</span>
                    <button
                      type="button"
                      onClick={() => setAppSectorFilter('all')}
                      className="hover:bg-primary/20 rounded-full p-0.5 cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                {appDeckFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/25 text-primary text-[11px] font-semibold">
                    <span>Deck: {appDeckFilter === 'has_deck' ? 'Has Pitch Deck' : 'No Deck'}</span>
                    <button
                      type="button"
                      onClick={() => setAppDeckFilter('all')}
                      className="hover:bg-primary/20 rounded-full p-0.5 cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleResetAllAppFilters}
                  className="text-xs text-muted-foreground hover:text-foreground underline ml-1 font-medium cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
              {isLoadingApplications ? (
                <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-5 animate-spin text-foreground" />
                  <span>Loading company applications...</span>
                </div>
              ) : applicationError ? (
                <div className="p-8 text-center text-sm text-destructive">{applicationError}</div>
              ) : filteredFounderApplications.length === 0 ? (
                <div className="p-12 text-center text-sm text-muted-foreground">
                  No company applications found matching the selected filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3.5">Company &amp; Founder</th>
                        <th className="px-5 py-3.5">Stage &amp; Sector</th>
                        <th className="px-5 py-3.5">Target Raise &amp; ARR</th>
                        <th className="px-5 py-3.5">Pitch Deck / Links</th>
                        <th className="px-5 py-3.5">Review Status</th>
                        <th className="px-5 py-3.5">Actions</th>
                        <th className="px-5 py-3.5">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredFounderApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-foreground text-base flex items-center gap-1.5">
                              <span>{app.companyName}</span>
                              {app.websiteUrl && (
                                <a
                                  href={app.websiteUrl.startsWith('http') ? app.websiteUrl : `https://${app.websiteUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-primary transition-colors"
                                  title="Visit Website"
                                >
                                  <Globe className="size-3.5" />
                                </a>
                              )}
                            </div>
                            <div className="text-xs font-medium text-foreground/90 mt-0.5">
                              {app.founderName} • <span className="text-muted-foreground">{app.workEmail}</span>
                            </div>
                            {app.phoneNumber && (
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Phone className="size-2.5" />
                                <span>{app.phoneNumber}</span>
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="inline-block px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
                              {app.stage}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium mt-1">
                              {app.sector}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-bold text-foreground text-sm">
                              {app.targetRaiseAmount}
                            </div>
                            <span className="text-[11px] text-muted-foreground block font-medium">
                              ARR: {app.currentArr || 'Not specified'}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {app.pitchDeckUrl ? (
                              <a
                                href={app.pitchDeckUrl.startsWith('http') ? app.pitchDeckUrl : `https://${app.pitchDeckUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                              >
                                <FileText className="size-3.5" />
                                <span>Open Pitch Deck</span>
                                <ExternalLink className="size-3" />
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground font-medium italic">No link provided</span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="w-[175px]">
                              <Select
                                value={app.status || 'pending_review'}
                                onValueChange={(val) => handleApplicationStatusChange(app.id, val)}
                                disabled={updatingAppId === app.id}
                              >
                                <SelectTrigger
                                  className={cn(
                                    'h-8 text-xs font-semibold rounded-full border',
                                    getApplicationStatusBadgeClass(app.status)
                                  )}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="text-xs">
                                  <SelectItem value="pending_review">
                                    <span className="flex items-center gap-1.5">
                                      <span className="size-1.5 rounded-full bg-amber-500" />
                                      Pending Review
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="reviewed">
                                    <span className="flex items-center gap-1.5">
                                      <span className="size-1.5 rounded-full bg-blue-500" />
                                      Reviewed
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="approved">
                                    <span className="flex items-center gap-1.5">
                                      <span className="size-1.5 rounded-full bg-emerald-500" />
                                      Approved / In Diligence
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="archived">
                                    <span className="flex items-center gap-1.5">
                                      <span className="size-1.5 rounded-full bg-muted-foreground" />
                                      Archived / Passed
                                    </span>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedApplication(app)}
                              className="h-8 rounded-xl text-xs font-semibold gap-1.5 px-3"
                            >
                              <Eye className="size-3.5" />
                              <span>View Thesis</span>
                            </Button>
                          </td>

                          <td className="px-5 py-4 text-muted-foreground text-xs font-medium">
                            {formatDate(app.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* APPLICATION DETAILS MODAL */}
        {selectedApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-2xl rounded-3xl border border-border bg-card text-card-foreground p-6 sm:p-8 shadow-2xl space-y-6 font-sans max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
                    <Building2 className="size-3.5" />
                    <span>Founder Application Details</span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {selectedApplication.companyName}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Founded by {selectedApplication.founderName} • {selectedApplication.workEmail}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted cursor-pointer transition"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Overview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <span className="text-muted-foreground font-medium block">Stage</span>
                  <strong className="text-foreground font-semibold text-sm">{selectedApplication.stage}</strong>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <span className="text-muted-foreground font-medium block">Target Raise</span>
                  <strong className="text-foreground font-semibold text-sm">{selectedApplication.targetRaiseAmount}</strong>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <span className="text-muted-foreground font-medium block">Current ARR</span>
                  <strong className="text-foreground font-semibold text-sm">{selectedApplication.currentArr || '—'}</strong>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <span className="text-muted-foreground font-medium block">Sector</span>
                  <strong className="text-foreground font-semibold text-sm">{selectedApplication.sector}</strong>
                </div>
              </div>

              {/* Pitch Deck / Links */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Materials &amp; Pitch Deck
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {selectedApplication.pitchDeckUrl ? (
                    <a
                      href={selectedApplication.pitchDeckUrl.startsWith('http') ? selectedApplication.pitchDeckUrl : `https://${selectedApplication.pitchDeckUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary/90 transition-all"
                    >
                      <FileText className="size-4" />
                      <span>Open Pitch Deck / Data Room</span>
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No pitch deck URL provided</span>
                  )}

                  {selectedApplication.websiteUrl && (
                    <a
                      href={selectedApplication.websiteUrl.startsWith('http') ? selectedApplication.websiteUrl : `https://${selectedApplication.websiteUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all"
                    >
                      <Globe className="size-3.5" />
                      <span>Company Website</span>
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Executive Summary / Elevator Pitch */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Executive Summary &amp; Growth Thesis
                </label>
                <div className="rounded-2xl border border-border bg-muted/20 p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedApplication.summary}
                </div>
              </div>

              {/* Review Status Selector & Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-muted-foreground">Current Status:</span>
                  <div className="w-[180px]">
                    <Select
                      value={selectedApplication.status || 'pending_review'}
                      onValueChange={(val) => {
                        handleApplicationStatusChange(selectedApplication.id, val)
                        setSelectedApplication((prev) => (prev ? { ...prev, status: val } : null))
                      }}
                    >
                      <SelectTrigger
                        className={cn(
                          'h-8 text-xs font-semibold rounded-full border',
                          getApplicationStatusBadgeClass(selectedApplication.status)
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="pending_review">Pending Review</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="approved">Approved / In Diligence</SelectItem>
                        <SelectItem value="archived">Archived / Passed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedApplication(null)}
                  className="rounded-xl text-xs h-9 px-5"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* BROADCAST DEAL LINK MODAL (DUAL CHANNEL: EMAIL & WHATSAPP ON SAME SCREEN) */}
        {isBroadcastModalOpen && broadcastOffering && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-2xl rounded-3xl border border-border bg-card text-card-foreground p-6 sm:p-7 shadow-2xl space-y-5 font-sans max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between gap-4 pb-3.5 border-b border-border">
                <h3 className="text-xl font-bold text-foreground">
                  Broadcast {broadcastOffering.title}
                </h3>

                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted cursor-pointer transition"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Target Audience Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Target Audience
                </label>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleAudienceChange('interests_only')}
                    className={cn(
                      'py-2.5 px-3 rounded-xl border text-center font-semibold transition cursor-pointer text-xs',
                      broadcastAudience === 'interests_only'
                        ? 'border-primary bg-primary/10 text-primary shadow-xs'
                        : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    All Interested
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAudienceChange('commitments_only')}
                    className={cn(
                      'py-2.5 px-3 rounded-xl border text-center font-semibold transition cursor-pointer text-xs',
                      broadcastAudience === 'commitments_only'
                        ? 'border-primary bg-primary/10 text-primary shadow-xs'
                        : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Committed LPs
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAudienceChange('all_deal_lps')}
                    className={cn(
                      'py-2.5 px-3 rounded-xl border text-center font-semibold transition cursor-pointer text-xs',
                      broadcastAudience === 'all_deal_lps'
                        ? 'border-primary bg-primary/10 text-primary shadow-xs'
                        : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    All Deal LPs
                  </button>
                </div>
              </div>

              {/* Deal Link & Message Details */}
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                      <span>Third-Party Closing / Portal URL *</span>
                      {thirdPartyUrl.trim().startsWith('http') && (
                        <a
                          href={thirdPartyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 text-[10px]"
                        >
                          Test Link <ExternalLink className="size-2.5" />
                        </a>
                      )}
                    </label>
                    <input
                      type="url"
                      placeholder="https://app.carta.com/spvs/... or https://assure.co/..."
                      value={thirdPartyUrl}
                      onChange={(e) => setThirdPartyUrl(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Email Subject Line
                    </label>
                    <input
                      type="text"
                      placeholder="Subject line for email..."
                      value={broadcastSubject}
                      onChange={(e) => setBroadcastSubject(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Custom Note / Special Instructions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Allocation window closes Friday at 5 PM EST. Please wire funds promptly."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* DUAL-CHANNEL BROADCAST DISPATCH HUBS (SAME SCREEN) */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Dispatch Channels
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Channel Option A: Email Broadcast */}
                  <div className="rounded-2xl border border-border bg-muted/20 p-4 flex flex-col justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Mail className="size-4" />
                      </div>
                      <h4 className="font-bold text-sm text-foreground">Email Broadcast</h4>
                    </div>

                    {emailBroadcastSuccess && (
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                        <CheckCheck className="size-4 shrink-0" />
                        <span>{emailBroadcastSuccess}</span>
                      </div>
                    )}

                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSendEmailBroadcast}
                      disabled={isSendingEmail || previewRecipients.filter(r => !!r.userEmail).length === 0 || !thirdPartyUrl.trim() || isPreviewLoading}
                      className="w-full rounded-xl text-xs font-semibold gap-2 h-9.5 bg-foreground text-background hover:bg-foreground/90 transition shadow-xs"
                    >
                      {isSendingEmail ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Sending Emails...</span>
                        </>
                      ) : (
                        <>
                          <Send className="size-3.5" />
                          <span>Send Email Broadcast ({previewRecipients.filter(r => !!r.userEmail).length})</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Channel Option B: WhatsApp Broadcast */}
                  <div className="rounded-2xl border border-border bg-muted/20 p-4 flex flex-col justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <MessageCircle className="size-4" />
                      </div>
                      <h4 className="font-bold text-sm text-foreground">WhatsApp Broadcast</h4>
                    </div>

                    {whatsAppBroadcastSuccess && (
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                        <CheckCheck className="size-4 shrink-0" />
                        <span>{whatsAppBroadcastSuccess}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopyWhatsAppTemplate}
                        disabled={!thirdPartyUrl.trim()}
                        className="rounded-xl text-xs font-semibold gap-1.5 h-9.5 border-border"
                      >
                        {copiedTemplate ? (
                          <>
                            <Check className="size-3.5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" />
                            <span>Copy Template</span>
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        onClick={handleLogWhatsAppBroadcast}
                        disabled={isSendingWhatsApp || previewRecipients.filter(r => r.hasValidPhone).length === 0 || !thirdPartyUrl.trim() || isPreviewLoading}
                        className="rounded-xl text-xs font-semibold gap-1.5 h-9.5 bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        {isSendingWhatsApp ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            <span>Logging...</span>
                          </>
                        ) : (
                          <>
                            <MessageSquare className="size-3.5" />
                            <span>Log WhatsApp</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyWhatsAppTemplate}
                      disabled={!thirdPartyUrl.trim()}
                      className="w-full rounded-xl text-xs font-semibold gap-1.5 h-9.5 border-border"
                    >
                      {copiedTemplate ? (
                        <>
                          <Check className="size-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied Template!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          <span>Copy WhatsApp Template</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Interactive Recipient & 1-Click WhatsApp Direct Chat Roster */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Investor Roster ({previewRecipients.length})
                  </h4>

                  <div className="relative w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={recipientSearchQuery}
                      onChange={(e) => setRecipientSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background py-1 pl-8 pr-2.5 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {isPreviewLoading ? (
                  <div className="rounded-2xl border border-border p-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    <span>Loading target investors...</span>
                  </div>
                ) : previewRecipients.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    No investors found matching the selected audience.
                  </div>
                ) : (
                  <div className="max-h-52 overflow-y-auto rounded-2xl border border-border divide-y divide-border/60 text-xs">
                    {previewRecipients
                      .filter((r) => {
                        if (!recipientSearchQuery.trim()) return true
                        const q = recipientSearchQuery.trim().toLowerCase()
                        return (
                          r.userName.toLowerCase().includes(q) ||
                          r.userEmail.toLowerCase().includes(q) ||
                          (r.userPhone && r.userPhone.toLowerCase().includes(q))
                        )
                      })
                      .map((recipient) => {
                        const isOpened = openedWhatsAppUsers.includes(recipient.userId)

                        return (
                          <div
                            key={recipient.userId}
                            className="p-3 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                          >
                            <span className="font-semibold text-foreground text-sm truncate">
                              {recipient.userName}
                            </span>

                            <div className="flex items-center gap-2 shrink-0">
                              {recipient.hasValidPhone ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => handleOpenWhatsAppChat(recipient)}
                                  className={cn(
                                    'h-8 rounded-xl text-xs font-semibold gap-1.5 px-3 transition cursor-pointer',
                                    isOpened
                                      ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/25'
                                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  )}
                                >
                                  {isOpened ? (
                                    <>
                                      <Check className="size-3.5 text-emerald-500" />
                                      <span>Chat Opened</span>
                                    </>
                                  ) : (
                                    <>
                                      <MessageSquare className="size-3.5" />
                                      <span>Chat on WhatsApp</span>
                                      <ExternalLink className="size-3" />
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <span className="text-[11px] text-muted-foreground italic px-2 py-1 rounded-lg bg-muted/40">
                                  No phone
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="rounded-xl text-xs h-9 px-5"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
