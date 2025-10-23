import {Skeleton} from "@/components/ui/skeleton";

const ProfileLoading = () => {
  return (
    <div className="p-4 min-h-screen flex flex-col items-center">
      <div className="w-full">
        <div className="flex justify-between mb-4 space-x-2">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow">
          <div className="flex w-full justify-center gap-2 mb-6">
            <Skeleton className="h-10 w-32 rounded" />
            <Skeleton className="h-10 w-32 rounded" />
            <Skeleton className="h-10 w-32 rounded" />
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-3/4" />
            </div>
            <div className="flex justify-end mt-6">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileLoading;