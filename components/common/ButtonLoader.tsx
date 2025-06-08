
// components/common/ButtonLoader.tsx
interface ButtonLoaderProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
}

export function ButtonLoader({ isLoading, children, loadingText }: ButtonLoaderProps) {
  if (isLoading) {
    return (
      <>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        {loadingText || 'Loading...'}
      </>
    )
  }
  
  return <>{children}</>
}