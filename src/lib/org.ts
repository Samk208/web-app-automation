export const DEMO_ORG_ID = process.env.NEXT_PUBLIC_DEMO_ORG_ID || '00000000-0000-0000-0000-000000000002';

export type OrgContext = {
    organization_id: string;
    role?: string | null;
};


