export function FoundationCardSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 mb-4 animate-pulse">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
                {/* Logo skeleton */}
                <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-200 border-2 border-gray-300" />

                <div className="flex-1">
                    {/* Title skeleton */}
                    <div className="h-6 bg-gray-200 rounded-md mb-2 w-3/4" />
                    {/* Badge skeleton */}
                    <div className="inline-block h-6 bg-gray-200 rounded-full w-32" />
                </div>

                {/* Funding amount skeleton */}
                <div className="flex flex-col items-end gap-2">
                    <div className="h-14 w-32 bg-gray-200 rounded-lg" />
                </div>
            </div>

            {/* Description skeleton */}
            <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>

            {/* Match indicators grid skeleton */}
            <div className="space-y-4 mb-4">
                <div className="grid grid-cols-3 gap-3">
                    {/* Fits column */}
                    <div>
                        <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <div className="w-3 h-3 bg-gray-200 rounded-full mt-1" />
                                <div className="h-3 bg-gray-200 rounded w-full" />
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-3 h-3 bg-gray-200 rounded-full mt-1" />
                                <div className="h-3 bg-gray-200 rounded w-4/5" />
                            </div>
                        </div>
                    </div>

                    {/* Questions column */}
                    <div>
                        <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <div className="w-3 h-3 bg-gray-200 rounded-full mt-1" />
                                <div className="h-3 bg-gray-200 rounded w-full" />
                            </div>
                        </div>
                    </div>

                    {/* Mismatches column */}
                    <div>
                        <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <div className="w-3 h-3 bg-gray-200 rounded-full mt-1" />
                                <div className="h-3 bg-gray-200 rounded w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details button skeleton */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
                <div className="h-10 w-40 bg-gray-200 rounded-lg" />
            </div>
        </div>
    );
}

