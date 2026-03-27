import { useActivitiesByAddress } from "@/hooks/use-activities";

export function useUserActivities(walletAddress: string, pageSize?: number) {
    return useActivitiesByAddress(walletAddress);
}
