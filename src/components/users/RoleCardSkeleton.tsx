import { Bone } from '@/components/shared/Shimmer';

export function RoleCardSkeleton() {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="gv-bone shrink-0" style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem' }} />
          <div className="space-y-2">
            <Bone w="8rem" h="0.875rem" />
            <Bone w="5.5rem" h="0.75rem" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="gv-bone" style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem' }} />
          <div className="gv-bone" style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem' }} />
        </div>
      </div>
      <div className="space-y-2 pt-1">
        <Bone w="95%" h="0.8rem" />
        <Bone w="70%" h="0.8rem" />
      </div>
    </div>
  );
}