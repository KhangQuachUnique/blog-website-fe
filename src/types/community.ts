export interface CommunitySettings {
    id: number;
    name: string;
    description: string;
    thumbnailUrl?: string | null;
    isPublic: boolean;
    requirePostApproval: boolean;
    requireMemberApproval: boolean;
    createdAt: string; 
    role: "ADMIN" | "MODERATOR" | "MEMBER" | "PENDING";
}