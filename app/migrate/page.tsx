'use client'

import { useState } from 'react'
import { migrateLocalStorageToSupabase, backupLocalStorage, clearLocalStorageAfterMigration, MigrationResult } from '@/lib/migrate-to-supabase'
import { useRouter } from 'next/navigation'

export default function MigrationPage() {
  const router = useRouter()
  const [step, setStep] = useState<'backup' | 'migrate' | 'complete'>('backup')
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleBackup = () => {
    backupLocalStorage()
    setStep('migrate')
  }

  const handleMigrate = async () => {
    setIsLoading(true)
    try {
      const result = await migrateLocalStorageToSupabase()
      setMigrationResult(result)
      setStep('complete')
    } catch (error) {
      console.error('Migration error:', error)
      alert('Migration failed. Please check the console for details.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearAndContinue = () => {
    clearLocalStorageAfterMigration()
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Database Migration
        </h1>
        <p className="text-gray-600 mb-8">
          Migrate your data from localStorage to Supabase
        </p>

        {/* STEP 1: BACKUP */}
        {step === 'backup' && (
          <div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-3">
                ⚠️ Important: Backup Your Data
              </h2>
              <p className="text-blue-800 mb-4">
                Before migrating, we'll create a backup of all your current data.
                This backup will be downloaded as a JSON file.
              </p>
              <p className="text-sm text-blue-700">
                This ensures you can recover your data if anything goes wrong during migration.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Create Backup</h3>
                  <p className="text-sm text-gray-600">Download a JSON backup file</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Migrate to Supabase</h3>
                  <p className="text-sm text-gray-400">Transfer all data to database</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Clear localStorage</h3>
                  <p className="text-sm text-gray-400">Clean up old data</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleBackup}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Create Backup & Continue
            </button>
          </div>
        )}

        {/* STEP 2: MIGRATE */}
        {step === 'migrate' && (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-green-900 mb-3">
                ✅ Backup Created
              </h2>
              <p className="text-green-800 mb-2">
                Your backup has been downloaded. Keep this file safe!
              </p>
              <p className="text-sm text-green-700">
                Now we'll migrate your data to Supabase. This may take a few moments.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-sm">
                  ✓
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Backup Created</h3>
                  <p className="text-sm text-gray-600">File downloaded successfully</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Migrate to Supabase</h3>
                  <p className="text-sm text-gray-600">Ready to transfer data</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Clear localStorage</h3>
                  <p className="text-sm text-gray-400">Clean up old data</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleMigrate}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  Migrating...
                </>
              ) : (
                'Start Migration'
              )}
            </button>
          </div>
        )}

        {/* STEP 3: COMPLETE */}
        {step === 'complete' && migrationResult && (
          <div>
            {migrationResult.success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-green-900 mb-3">
                  🎉 Migration Complete!
                </h2>
                <p className="text-green-800 mb-4">
                  All your data has been successfully migrated to Supabase.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">{migrationResult.profilesMigrated}</div>
                    <div className="text-sm text-gray-600">Profiles</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">{migrationResult.projectsMigrated}</div>
                    <div className="text-sm text-gray-600">Projects</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">{migrationResult.topicsMigrated}</div>
                    <div className="text-sm text-gray-600">Topics</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-600">{migrationResult.scriptsMigrated}</div>
                    <div className="text-sm text-gray-600">Scripts</div>
                  </div>
                </div>

                {migrationResult.errors.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                    <p className="text-sm text-yellow-800 font-medium mb-2">
                      ⚠️ Some items encountered errors:
                    </p>
                    <ul className="text-xs text-yellow-700 list-disc list-inside space-y-1">
                      {migrationResult.errors.slice(0, 5).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                      {migrationResult.errors.length > 5 && (
                        <li>...and {migrationResult.errors.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-red-900 mb-3">
                  ❌ Migration Failed
                </h2>
                <p className="text-red-800 mb-4">
                  There were errors during migration. Your backup file is safe.
                </p>
                <div className="bg-white rounded p-3">
                  <p className="text-sm text-red-800 font-medium mb-2">Errors:</p>
                  <ul className="text-xs text-red-700 list-disc list-inside space-y-1">
                    {migrationResult.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {migrationResult.success && (
                <button
                  onClick={handleClearAndContinue}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Clear localStorage & Go to Dashboard
                </button>
              )}
              
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                {migrationResult.success ? 'Keep localStorage & Continue' : 'Return to Dashboard'}
              </button>
            </div>

            {migrationResult.success && (
              <p className="text-xs text-gray-500 text-center mt-4">
                You can keep localStorage data as a backup, or clear it to free up space.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
