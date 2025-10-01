'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  ExternalLink,
  CheckCircle2,
  Circle,
  Calendar,
  Link as LinkIcon,
  X,
  ArrowLeft,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Problem } from '@/lib/api'

interface ProblemsListProps {
  problems: Problem[]
  onMarkDone: (problemId: string) => void
  onClose: () => void
}

export function ProblemsList({ problems, onMarkDone, onClose }: ProblemsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all')
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>(problems)

  useEffect(() => {
    let filtered = problems

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(problem =>
        problem.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (filter === 'completed') {
      filtered = filtered.filter(problem => problem.done)
    } else if (filter === 'pending') {
      filtered = filtered.filter(problem => !problem.done)
    }

    setFilteredProblems(filtered)
  }, [problems, searchTerm, filter])

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  const stats = {
    total: problems.length,
    completed: problems.filter(p => p.done).length,
    pending: problems.filter(p => !p.done).length,
  }

  return (
    <Card className="supabase-card shadow-2xl">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl text-white">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-auto text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            My Problems ({filteredProblems.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
            <p className="text-xs text-blue-300">Total</p>
          </div>
          <div className="text-center p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <p className="text-2xl font-bold text-emerald-400">{stats.completed}</p>
            <p className="text-xs text-emerald-300">Completed</p>
          </div>
          <div className="text-center p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            <p className="text-xs text-amber-300">Pending</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 supabase-input"
            />
          </div>
          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'completed', label: 'Done' },
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant="ghost"
                size="sm"
                onClick={() => setFilter(key as 'all' | 'completed' | 'pending')}
                className={`px-3 py-1 text-xs font-medium transition-colors rounded-md ${
                  filter === key
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="max-h-[500px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {filteredProblems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-400"
            >
              <Filter className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>No problems found</p>
              <p className="text-sm">Try adjusting your search or filter</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {filteredProblems.map((problem, index) => (
                <motion.div
                  key={problem._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className={`group p-4 rounded-lg border transition-all hover:shadow-md ${
                    problem.done
                      ? 'bg-emerald-500/10 border-emerald-500/20'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Status Button */}
                    <button
                      onClick={() => onMarkDone(problem._id)}
                      className="flex-shrink-0 transition-transform hover:scale-110"
                    >
                      {problem.done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-500 hover:text-gray-300" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`font-medium truncate ${
                          problem.done
                            ? 'text-emerald-400 line-through'
                            : 'text-white'
                        }`}
                      >
                        {problem.title}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">
                            {problem.link}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(problem.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* External Link */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(problem.link, '_blank')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}