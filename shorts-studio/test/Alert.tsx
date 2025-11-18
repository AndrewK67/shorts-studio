import { XCircle, CheckCircle, AlertCircle, Info } from 'lucide-react'

type AlertType = 'error' | 'success' | 'warning' | 'info'

interface AlertProps {
  type: AlertType
  title?: string
  message: string
  onClose?: () => void
}

export default function Alert({ type, title, message, onClose }: AlertProps) {
  const styles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      title: 'text-red-900',
      text: 'text-red-800',
      Icon: XCircle
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      title: 'text-green-900',
      text: 'text-green-800',
      Icon: CheckCircle
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-900',
      text: 'text-yellow-800',
      Icon: AlertCircle
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-900',
      text: 'text-blue-800',
      Icon: Info
    }
  }

  const style = styles[type]
  const Icon = style.Icon

  return (
    <div className={`${style.bg} ${style.border} border rounded-lg p-4`}>
      <div className="flex gap-3">
        <Icon className={`${style.icon} flex-shrink-0 mt-0.5`} size={20} />
        <div className="flex-1">
          {title && (
            <h3 className={`${style.title} font-semibold mb-1`}>{title}</h3>
          )}
          <p className={`${style.text} text-sm`}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${style.text} hover:opacity-70 transition-opacity flex-shrink-0`}
          >
            <XCircle size={20} />
          </button>
        )}
      </div>
    </div>
  )
}
