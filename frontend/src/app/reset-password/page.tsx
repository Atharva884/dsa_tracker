'use client'

import { Suspense, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { apiService, getErrorMessage } from '@/lib/api'

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

function ResetPasswordForm() {
  const token = useSearchParams().get('token') || ''
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== confirmPassword) return setError('Passwords do not match')

    setIsLoading(true)
    setError('')

    try {
      const response = await apiService.resetPassword(token, password)
      setSuccess(response.message)
      setTimeout(() => router.push('/signin'), 2000)
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Something went wrong. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          This reset link is invalid. Please request a new one.
        </div>
        <Link href="/forgot-password">
          <Button className="supabase-button-primary w-full h-12 font-medium rounded-lg">
            Request new link
          </Button>
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="p-4 bg-emerald-950/40 border border-emerald-800 rounded-lg text-emerald-300 text-sm text-center">
        {success} Redirecting...
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <motion.div
          className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {error}
          {error.includes('expired') && (
            <>
              {' '}
              <Link href="/forgot-password" className="underline font-medium">
                Request a new link
              </Link>
            </>
          )}
        </motion.div>
      )}

      {/* New Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-200">
          New password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            placeholder="Enter a new password"
            className="pl-10 pr-12 h-12 supabase-input"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-200">
          Confirm new password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              setError('')
            }}
            placeholder="Re-enter your new password"
            className="pl-10 h-12 supabase-input"
            required
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="supabase-button-primary w-full h-12 font-medium rounded-lg"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Resetting...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            Reset password
            <ArrowRight className="w-4 h-4" />
          </div>
        )}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(34,197,94,0.05),_transparent_50%),radial-gradient(circle_at_80%_20%,_rgba(34,197,94,0.05),_transparent_50%),radial-gradient(circle_at_40%_40%,_rgba(34,197,94,0.05),_transparent_50%)]" />

      <motion.div
        className="w-full max-w-md relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Set a new password</h1>
          <p className="text-gray-300">Choose a new password for your account</p>
        </motion.div>

        {/* Form */}
        <motion.div variants={itemVariants}>
          <Card className="supabase-card">
            <CardContent className="p-8">
              <Suspense fallback={null}>
                <ResetPasswordForm />
              </Suspense>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div className="text-center mt-8" variants={itemVariants}>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
