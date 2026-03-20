interface EmptyStateProps {
  icon: string
  title: string
  description: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-5xl mb-3">{icon}</div>
      <h3 className="text-gray-700 font-medium mb-1">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  )
}
