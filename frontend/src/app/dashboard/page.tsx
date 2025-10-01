'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Target,
  Clock,
  TrendingUp,

  Upload,
  Shuffle,
  List,
  RotateCcw,
  Trash2,
  LogOut,
  User,
  ExternalLink,
  CheckCircle2,
  Circle,
  Sparkles,
  Code,
  Trophy,
  Zap,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore, useProblemsStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { apiService, type Problem } from '@/lib/api'
import { UploadModal } from '@/components/UploadModal'
import { ProblemsList } from '@/components/ProblemsList'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.6,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
}

const cardHoverVariants = {
  hover: {
    y: -4,
    transition: {
      duration: 0.2,
      ease: "easeOut" as const,
    },
  },
}

export default function DashboardPage() {
  const { user, logout, isHydrated } = useAuthStore()
  const { stats, problems, setProblems, setStats, setLoading, setError } = useProblemsStore()
  const router = useRouter()
  const [generatedProblems, setGeneratedProblems] = useState<Problem[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showProblemsList, setShowProblemsList] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [isLoading, setIsLoadingLocal] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setIsLoadingLocal(true)
      
      // Load problems and stats in parallel
      const [problemsResponse, statsResponse] = await Promise.all([
        apiService.getMyProblems(),
        apiService.getStats()
      ])

      if (problemsResponse.success) {
        setProblems(problemsResponse.data)
        
        // Load today's practice problems from localStorage
        const todaysPracticeIds = JSON.parse(localStorage.getItem('todaysPracticeProblems') || '[]')
        const todaysProblems = problemsResponse.data.filter(p => todaysPracticeIds.includes(p._id))
        setGeneratedProblems(todaysProblems)
      }

      if (statsResponse.success) {
        setStats(statsResponse.data)
      }
    } catch (error: unknown) {
      console.error('Failed to load dashboard data:', error)
      setError('Failed to load dashboard data')
      setMessage({ type: 'error', text: 'Failed to load dashboard data' })
    } finally {
      setLoading(false)
      setIsLoadingLocal(false)
    }
  }, [setLoading, setProblems, setStats, setError])

  useEffect(() => {
    // Wait for hydration before checking authentication
    if (!isHydrated) {
      return
    }

    // Check authentication after hydration
    if (!user) {
      router.push('/signin')
      return
    }

    // Set greeting based on time
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    // Load initial data
    loadDashboardData()
  }, [user, router, loadDashboardData, isHydrated])

  const handleLogout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      logout() // This now handles both cookie and store cleanup
      router.push('/signin')
    }
  }

  const generateProblems = async () => {
    try {
      setIsLoadingLocal(true)
      const response = await apiService.generateProblems()
      
      if (response.success) {
        // Instead of using temporary state, add generated problems to the main problems store
        // and mark them as "today's practice" by storing them in localStorage for the session
        const problemIds = response.data.map(p => p._id)
        localStorage.setItem('todaysPracticeProblems', JSON.stringify(problemIds))
        
        // Update the main problems store to ensure the generated problems are included
        await loadDashboardData()
        
        setMessage({ type: 'success', text: `Generated ${response.data.length} problems for you!` })
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to generate problems' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to generate problems' })
    } finally {
      setIsLoadingLocal(false)
    }
  }

  const handleUpload = async (file: File) => {
    try {
      await apiService.uploadProblems(file)
      setMessage({ type: 'success', text: 'Problems uploaded successfully!' })
      // Reload dashboard data
      await loadDashboardData()
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to upload problems'
      setMessage({ type: 'error', text: errorMsg })
      throw error // Re-throw to let UploadModal handle it
    }
  }

  const toggleProblemDone = async (problemId: string) => {
    try {
      await apiService.markAsDone(problemId)
      
      // Update the generated problems state immediately for better UX
      setGeneratedProblems(prev =>
        prev.map(p =>
          p._id === problemId ? { ...p, done: !p.done } : p
        )
      )
      
      // Reload dashboard data to update stats and main problems
      await loadDashboardData()
    } catch {
      setMessage({ type: 'error', text: 'Failed to update problem status' })
    }
  }

  const handleMarkProblemDone = async (problemId: string) => {
    try {
      await apiService.markAsDone(problemId)
      // Reload dashboard data
      await loadDashboardData()
      setMessage({ type: 'success', text: 'Problem marked as done!' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to update problem status' })
    }
  }

  const handleResetCycle = async () => {
    try {
      await apiService.resetCycle()
      setMessage({ type: 'success', text: 'Cycle reset successfully!' })
      await loadDashboardData()
    } catch {
      setMessage({ type: 'error', text: 'Failed to reset cycle' })
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete all problems? This action cannot be undone.')) {
      return
    }
    
    try {
      await apiService.deleteAllProblems()
      setMessage({ type: 'success', text: 'All problems deleted successfully!' })
      await loadDashboardData()
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete problems' })
    }
  }

  if (!isHydrated || (!user && isHydrated) || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // At this point, we know user exists due to the check above
  const currentUser = user!

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
            <header className="glass-effect sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-4 h-4 text-white" />
              </div>
                            <h1 className="text-xl font-bold text-white">DSA Tracker</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {currentUser.name} {currentUser.lName}
                </p>
                <p className="text-xs text-gray-400">{currentUser.email}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-200"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className={`px-6 py-3 rounded-lg shadow-lg backdrop-blur-sm ${
              message.type === 'success' 
                ? 'bg-emerald-500/90 text-white' 
                : 'bg-red-500/90 text-white'
            }`}>
              <div className="flex items-center gap-2">
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
                {message.text}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Welcome Section */}
          <motion.div variants={itemVariants} className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              {greeting}, {currentUser.name}! 👋
            </h2>
            <p className="text-gray-300">
              Ready to level up your DSA skills today?
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <motion.div variants={cardHoverVariants} whileHover="hover">
              <Card className="stats-card h-[140px]" style={{ '--card-gradient-start': 'rgb(59, 130, 246)', '--card-gradient-end': 'rgb(99, 102, 241)' } as React.CSSProperties}>
                <CardContent className="p-6 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-400 mb-2">
                        Total Problems
                      </p>
                      <p className="text-3xl font-bold text-white">
                        {stats.total}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                      <BarChart3 className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardHoverVariants} whileHover="hover">
              <Card className="stats-card h-[140px]" style={{ '--card-gradient-start': 'rgb(34, 197, 94)', '--card-gradient-end': 'rgb(16, 185, 129)' } as React.CSSProperties}>
                <CardContent className="p-6 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-400 mb-2">
                        Completed
                      </p>
                      <p className="text-3xl font-bold text-white">
                        {stats.completed}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                      <Trophy className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardHoverVariants} whileHover="hover">
              <Card className="stats-card h-[140px]" style={{ '--card-gradient-start': 'rgb(245, 158, 11)', '--card-gradient-end': 'rgb(251, 146, 60)' } as React.CSSProperties}>
                <CardContent className="p-6 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-400 mb-2">
                        Remaining
                      </p>
                      <p className="text-3xl font-bold text-white">
                        {stats.remaining}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                      <Target className="w-6 h-6 text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardHoverVariants} whileHover="hover">
              <Card className="stats-card h-[140px]" style={{ '--card-gradient-start': 'rgb(147, 51, 234)', '--card-gradient-end': 'rgb(168, 85, 247)' } as React.CSSProperties}>
                <CardContent className="p-6 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-400 mb-2">
                        Progress
                      </p>
                      <p className="text-3xl font-bold text-white">
                        {stats.progress}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                      <TrendingUp className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Action Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Quick Actions */}
            <Card className="supabase-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={generateProblems}
                  disabled={isLoading || stats.remaining === 0}
                  className="supabase-button-primary w-full h-12 font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  {stats.remaining === 0 ? 'No Problems Left' : 'Generate 5 Problems'}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadModal(true)}
                    className="supabase-button-secondary h-10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowProblemsList(true)}
                    disabled={stats.total === 0}
                    className="supabase-button-secondary h-10 disabled:opacity-50"
                  >
                    <List className="w-4 h-4 mr-2" />
                    View All ({stats.total})
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleResetCycle}
                    disabled={stats.completed === 0}
                    className="h-10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40 disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Cycle
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDeleteAll}
                    disabled={stats.total === 0}
                    className="h-10 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card className="supabase-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Progress Visualization */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Completion Rate</span>
                      <span className="font-medium text-white">{stats.progress}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.progress}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Stats Summary */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-emerald-400">{stats.completed}</p>
                      <p className="text-xs text-gray-400">Solved</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-amber-400">{stats.remaining}</p>
                      <p className="text-xs text-gray-400">Remaining</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-blue-400">{stats.total}</p>
                      <p className="text-xs text-gray-400">Total</p>
                    </div>
                  </div>

                  {/* Motivational Message */}
                  <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-lg border border-emerald-500/20">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {stats.progress >= 80 ? 'Excellent progress!' : 
                           stats.progress >= 50 ? 'Great work!' : 
                           stats.progress >= 20 ? 'Keep going!' : 
                           'Just getting started!'}
                        </p>
                        <p className="text-xs text-gray-300">
                          {stats.remaining > 0 ? `${stats.remaining} problems to go!` : 'All problems completed!'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Generated Problems */}
          <AnimatePresence>
            {generatedProblems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <Card className="supabase-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                        Today&apos;s Practice Problems
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          localStorage.removeItem('todaysPracticeProblems')
                          setGeneratedProblems([])
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        Clear
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {generatedProblems.map((problem, index) => (
                        <motion.div
                          key={problem._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-white/20"
                        >
                          <button
                            onClick={() => toggleProblemDone(problem._id)}
                            className="flex-shrink-0"
                          >
                            {problem.done ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-500 hover:text-gray-300" />
                            )}
                          </button>
                          <div className="flex-1">
                            <h4
                              className={`font-medium ${
                                problem.done
                                  ? 'text-gray-400 line-through'
                                  : 'text-white'
                              }`}
                            >
                              {problem.title}
                            </h4>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-gray-200"
                            onClick={() => window.open(problem.link, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Modals */}
      <UploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onUpload={handleUpload}
      />

      {/* Problems List Overlay */}
      <AnimatePresence>
        {showProblemsList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowProblemsList(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <ProblemsList
                problems={problems}
                onMarkDone={handleMarkProblemDone}
                onClose={() => setShowProblemsList(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  )
}